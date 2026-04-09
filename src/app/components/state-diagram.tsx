import { motion } from 'motion/react';
import { TuringMachineConfig, Transition } from '../types/turing-machine';
import { useMemo, useState } from 'react';
import { ExpandablePanel } from './expandable-panel';

interface StateDiagramProps {
  config: TuringMachineConfig;
  currentState: string;
  lastTransition?: Transition | null;
}

/* ─── Layout helpers ─────────────────────────────────────────────────── */

interface Point { x: number; y: number }

function computeBFSLayout(
  states: string[],
  transitions: Transition[],
  initialState: string,
  acceptStates: string[],
  rejectStates: string[],
  viewW: number,
  viewH: number,
): Map<string, Point> {
  const haltingSet = new Set([...acceptStates, ...rejectStates]);

  /* BFS layers: initial → intermediates → halting */
  const layers: string[][] = [];
  const visited = new Set<string>();

  // seed
  const seed = states.includes(initialState) ? initialState : states[0];
  let frontier = [seed];
  visited.add(seed);

  while (frontier.length > 0) {
    layers.push(frontier);
    const next: string[] = [];
    for (const s of frontier) {
      const nexts = [
        ...new Set(
          transitions
            .filter(t => t.currentState === s && !visited.has(t.nextState) && !haltingSet.has(t.nextState))
            .map(t => t.nextState)
        ),
      ];
      for (const n of nexts) { visited.add(n); next.push(n); }
    }
    frontier = next;
  }

  // Remaining non-halting states not yet visited
  const unreachable = states.filter(s => !visited.has(s) && !haltingSet.has(s));
  if (unreachable.length > 0) { layers.push(unreachable); unreachable.forEach(s => visited.add(s)); }

  // Halting states always last layer
  const haltingLayer = states.filter(s => haltingSet.has(s));
  if (haltingLayer.length > 0) layers.push(haltingLayer);

  const allLayers = layers.filter(l => l.length > 0);
  const numL = allLayers.length;

  const padX = 160;
  const padY = 160;
  const usableW = viewW - padX * 2;
  const usableH = viewH - padY * 2;

  const pos = new Map<string, Point>();
  allLayers.forEach((layer, li) => {
    const x = numL <= 1 ? viewW / 2 : padX + (li / (numL - 1)) * usableW;
    layer.forEach((s, si) => {
      const y = layer.length <= 1 ? viewH / 2 : padY + (si / (layer.length - 1)) * usableH;
      pos.set(s, { x, y });
    });
  });

  return pos;
}

function nodeRadius(label: string, isCurrent: boolean): number {
  const base = Math.max(32, Math.ceil(label.length * 4.5) + 18);
  return isCurrent ? base + 6 : base;
}

/* Quadratic bezier path between two nodes, offset to node boundary */
function getEdgePath(
  fp: Point, tp: Point,
  fr: number, tr: number,
  curvature: number,
): { path: string; cpX: number; cpY: number; sx: number; sy: number; ex: number; ey: number } {
  const dx = tp.x - fp.x;
  const dy = tp.y - fp.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist; // unit along edge
  const ny = dy / dist;
  const px = -ny;       // perpendicular
  const py = nx;

  const sx = fp.x + nx * (fr + 2);
  const sy = fp.y + ny * (fr + 2);
  const ex = tp.x - nx * (tr + 6);
  const ey = tp.y - ny * (tr + 6);

  const midX = (sx + ex) / 2 + px * curvature;
  const midY = (sy + ey) / 2 + py * curvature;

  return {
    path: `M ${sx} ${sy} Q ${midX} ${midY}, ${ex} ${ey}`,
    cpX: midX, cpY: midY,
    sx, sy, ex, ey,
  };
}

/* Self-loop arc above/below a node */
function getSelfLoopPath(x: number, y: number, r: number): string {
  const hw = r * 0.9;
  const h = r * 2.4;
  return `M ${x - hw} ${y - r + 4}
          C ${x - hw * 2.2} ${y - r - h},
            ${x + hw * 2.2} ${y - r - h},
            ${x + hw} ${y - r + 4}`;
}

/* Bezier midpoint at t=0.5 */
function bezierMid(sx: number, sy: number, cpX: number, cpY: number, ex: number, ey: number): Point {
  return {
    x: 0.25 * sx + 0.5 * cpX + 0.25 * ex,
    y: 0.25 * sy + 0.5 * cpY + 0.25 * ey,
  };
}

/* ─── Label formatting ───────────────────────────────────────────────── */

function fmtTransition(t: Transition, blank: string): string {
  const r = t.readSymbols.map(s => (s === blank ? '∅' : s)).join(',');
  const w = t.writeSymbols.map(s => (s === blank ? '∅' : s)).join(',');
  const d = t.moveDirections.join('');
  return `${r}→${w}/${d}`;
}

/* Helper to check if two transitions match */
function transitionsMatch(t1: Transition | null | undefined, t2: Transition): boolean {
  if (!t1) return false;
  return (
    t1.currentState === t2.currentState &&
    t1.nextState === t2.nextState &&
    t1.readSymbols.length === t2.readSymbols.length &&
    t1.readSymbols.every((s, i) => s === t2.readSymbols[i]) &&
    t1.writeSymbols.every((s, i) => s === t2.writeSymbols[i]) &&
    t1.moveDirections.every((d, i) => d === t2.moveDirections[i])
  );
}

/* ─── Edge data ──────────────────────────────────────────────────────── */

interface EdgeData {
  from: string;
  to: string;
  transitions: Transition[];
  isSelfLoop: boolean;
  curvature: number; // positive = above, negative = below
}

function buildEdges(
  transitions: Transition[],
  hasBidir: (a: string, b: string) => boolean,
): EdgeData[] {
  const map = new Map<string, { from: string; to: string; trans: Transition[] }>();
  for (const t of transitions) {
    const k = `${t.currentState}||${t.nextState}`;
    if (!map.has(k)) map.set(k, { from: t.currentState, to: t.nextState, trans: [] });
    map.get(k)!.trans.push(t);
  }
  const result: EdgeData[] = [];
  map.forEach(({ from, to, trans }) => {
    const isSelf = from === to;
    const bidir = !isSelf && hasBidir(from, to) && hasBidir(to, from);
    // Both edges in a bidir pair use curvature = +60.
    // The perpendicular vector in getEdgePath is "left of travel direction",
    // which is automatically opposite for A→B vs B→A, so they arc to opposite sides.
    const curve = isSelf ? 0 : bidir ? 60 : 22;
    result.push({ from, to, transitions: trans, isSelfLoop: isSelf, curvature: curve });
  });
  return result;
}

/* ─── SVG diagram content ────────────────────────────────────────────── */

interface DiagramSVGProps {
  config: TuringMachineConfig;
  currentState: string;
  lastTransition?: Transition | null;
  expanded: boolean;
}

function DiagramSVG({ config, currentState, lastTransition, expanded }: DiagramSVGProps) {
  const uid = expanded ? 'ex' : 'cm';
  const viewW = expanded ? 1400 : 1200;
  const viewH = expanded ? 800 : 700;

  const positions = useMemo(
    () =>
      computeBFSLayout(
        config.states, config.transitions, config.initialState,
        config.acceptStates, config.rejectStates, viewW, viewH,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, viewW, viewH],
  );

  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [tooltipEdge, setTooltipEdge] = useState<{ key: string; x: number; y: number } | null>(null);

  /* Node data */
  const nodes = config.states.map(id => {
    const p = positions.get(id) ?? { x: viewW / 2, y: viewH / 2 };
    return {
      id, x: p.x, y: p.y,
      isInitial: id === config.initialState,
      isAccept: config.acceptStates.includes(id),
      isReject: config.rejectStates.includes(id),
      isCurrent: id === currentState,
      r: nodeRadius(id, id === currentState),
    };
  });
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  /* Bidirectionality helper */
  const edgePairSet = new Set(
    config.transitions.map(t => `${t.currentState}||${t.nextState}`)
  );
  const hasBidir = (a: string, b: string) => edgePairSet.has(`${a}||${b}`);

  /* Edges */
  const edges = useMemo(
    () => buildEdges(config.transitions, hasBidir),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.transitions],
  );

  /* Node styling */
  const nodeFill = (n: typeof nodes[0]) => {
    if (n.isCurrent) return 'rgba(34,211,238,0.2)';
    if (n.isAccept) return 'rgba(139,92,246,0.2)';
    if (n.isReject) return 'rgba(244,63,94,0.2)';
    return 'rgba(63,63,70,0.4)';
  };
  const nodeStroke = (n: typeof nodes[0]) => {
    if (n.isCurrent) return '#22d3ee';
    if (n.isAccept) return '#a78bfa';
    if (n.isReject) return '#fb7185';
    return '#52525b';
  };

  const arrowId = (active: boolean) => `url(#arr-${uid}-${active ? 'act' : 'std'})`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewW} ${viewH}`}
      style={{ overflow: 'visible', display: 'block', minHeight: expanded ? 580 : 380, width: '100%', height: 'auto' }}
    >
      <defs>
        {/* Standard arrow */}
        <marker id={`arr-${uid}-std`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#52525b" />
        </marker>
        {/* Active arrow (cyan) */}
        <marker id={`arr-${uid}-act`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" />
        </marker>
        {/* Hover arrow */}
        <marker id={`arr-${uid}-hov`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#71717a" />
        </marker>
        {/* Glow filter */}
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feComponentTransfer in="blur" result="glow">
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Draw edges first (behind nodes) ── */}
      {edges.map(edge => {
        const fn = nodeMap.get(edge.from);
        const tn = nodeMap.get(edge.to);
        if (!fn || !tn) return null;

        // Check if this edge contains the lastTransition
        const containsLastTransition = lastTransition && edge.transitions.some(t => transitionsMatch(lastTransition, t));
        const isActive = containsLastTransition;
        const ek = `${edge.from}||${edge.to}`;
        const isHov = hoveredEdge === ek;

        const stroke = isActive ? '#22d3ee' : isHov ? '#a1a1aa' : '#3f3f46';
        const strokeW = isActive || isHov ? 2.5 : 1.5;
        const arrowMarker = isActive ? arrowId(true) : isHov ? `url(#arr-${uid}-hov)` : arrowId(false);

        /* ── Self-loop ── */
        if (edge.isSelfLoop) {
          const loopPath = getSelfLoopPath(fn.x, fn.y, fn.r);
          const lx = fn.x;
          const ly = fn.y - fn.r * 2.6;
          const labels = edge.transitions.map(t => fmtTransition(t, config.blankSymbol));
          const displayLabel = expanded || labels.length <= 4
            ? labels.join('\n')
            : labels.slice(0, 3).join('\n') + `\n(+${labels.length - 3} more)`;
          const lineCount = displayLabel.split('\n').length;
          const lblH = lineCount * 13 + 8;
          const lblW = Math.max(...displayLabel.split('\n').map(l => l.length)) * 6.2 + 10;

          return (
            <g
              key={ek}
              onMouseEnter={() => { setHoveredEdge(ek); setTooltipEdge({ key: ek, x: lx, y: ly - lblH - 8 }); }}
              onMouseLeave={() => { setHoveredEdge(null); setTooltipEdge(null); }}
              style={{ cursor: 'default' }}
            >
              <path d={loopPath} fill="none" stroke="transparent" strokeWidth="14" />
              <path
                d={loopPath}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeW}
                markerEnd={arrowMarker}
                filter={isActive ? `url(#glow-${uid})` : undefined}
              />
              {/* Label */}
              <rect
                x={lx - lblW / 2} y={ly - lblH / 2}
                width={lblW} height={lblH} rx="6"
                fill="rgba(6,6,16,0.95)"
                stroke={isActive ? 'rgba(34,211,238,0.5)' : isHov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}
                strokeWidth="1.5"
              />
              {displayLabel.split('\n').map((line, i) => (
                <text
                  key={i}
                  x={lx}
                  y={ly - (lineCount - 1) * 6.5 + i * 13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: expanded ? 10.5 : 9,
                    fill: isActive ? '#cffafe' : isHov ? '#e4e4e7' : 'rgba(255,255,255,0.4)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: isActive ? 600 : 400,
                    pointerEvents: 'none',
                  }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        }

        /* ── Regular edge ── */
        const { path, cpX, cpY, sx, sy, ex, ey } = getEdgePath(
          { x: fn.x, y: fn.y }, { x: tn.x, y: tn.y },
          fn.r, tn.r, edge.curvature,
        );
        const mid = bezierMid(sx, sy, cpX, cpY, ex, ey);
        // Label: offset in the +perpendicular direction (same side as the curve's bulge)
        const dx = tn.x - fn.x; const dy2 = tn.y - fn.y;
        const d = Math.sqrt(dx * dx + dy2 * dy2) || 1;
        const pxv = -dy2 / d; // perpendicular unit vector (left of edge travel direction)
        const pyv = dx / d;
        const labelOffset = 14;
        const lx = mid.x + pxv * labelOffset;
        const ly = mid.y + pyv * labelOffset;

        const labels = edge.transitions.map(t => fmtTransition(t, config.blankSymbol));
        const displayLabel = expanded || labels.length <= 4
          ? labels.join('\n')
          : labels.slice(0, 3).join('\n') + `\n(+${labels.length - 3} more)`;
        const lineCount = displayLabel.split('\n').length;
        const lblW = Math.max(...displayLabel.split('\n').map(l => l.length)) * (expanded ? 6.2 : 5.4) + 10;
        const lblH = lineCount * 13 + 6;

        return (
          <g
            key={ek}
            onMouseEnter={() => { setHoveredEdge(ek); setTooltipEdge({ key: ek, x: lx, y: ly }); }}
            onMouseLeave={() => { setHoveredEdge(null); setTooltipEdge(null); }}
            style={{ cursor: 'default' }}
          >
            {/* Wide invisible hit area */}
            <path d={path} fill="none" stroke="transparent" strokeWidth="16" />
            {/* Visible edge */}
            <path
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeW}
              markerEnd={arrowMarker}
              filter={isActive ? `url(#glow-${uid})` : undefined}
            />
            {/* Label background + text */}
            <rect
              x={lx - lblW / 2} y={ly - lblH / 2}
              width={lblW} height={lblH} rx="6"
              fill="rgba(6,6,16,0.95)"
              stroke={isActive ? 'rgba(34,211,238,0.5)' : isHov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}
              strokeWidth="1.5"
            />
            {displayLabel.split('\n').map((line, i) => (
              <text
                key={i}
                x={lx}
                y={ly - (lineCount - 1) * 6.5 + i * 13}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: expanded ? 10.5 : 9,
                  fill: isActive ? '#cffafe' : isHov ? '#e4e4e7' : 'rgba(255,255,255,0.4)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: isActive ? 600 : 400,
                  pointerEvents: 'none',
                }}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* ── Draw nodes on top of edges ── */}
      {nodes.map((node, idx) => (
        <g key={node.id}>
          {/* Initial state arrow */}
          {node.isInitial && (
            <line
              x1={node.x - node.r - 46}
              y1={node.y}
              x2={node.x - node.r - 5}
              y2={node.y}
              stroke="#52525b"
              strokeWidth="2"
              markerEnd={arrowId(false)}
            />
          )}

          {/* Current-state pulse ring */}
          {node.isCurrent && (
            <motion.circle
              cx={node.x} cy={node.y} r={node.r + 10}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              fill="none" stroke="#34d399" strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}

          {/* Accept double ring */}
          {node.isAccept && (
            <circle
              cx={node.x} cy={node.y} r={node.r + 6}
              fill="none"
              stroke={nodeStroke(node)}
              strokeWidth="1.5"
              strokeOpacity="0.55"
            />
          )}

          {/* Main circle */}
          <motion.circle
            cx={node.x} cy={node.y} r={node.r}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            fill={nodeFill(node)}
            fillOpacity={node.isCurrent ? 0.28 : 0.15}
            stroke={nodeStroke(node)}
            strokeWidth={node.isCurrent ? 2.5 : 1.8}
            filter={node.isCurrent ? `url(#glow-${uid})` : undefined}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, filter: `url(#glow-${uid})` }}
            transition={{ type: 'spring', stiffness: 240, damping: 18, delay: idx * 0.04 }}
          />

          {/* State label */}
          <text
            x={node.x} y={node.y}
            textAnchor="middle" dominantBaseline="middle"
            style={{
              fontSize: expanded ? 17 : 15,
              fontWeight: 700,
              fill: node.isCurrent ? '#ecfdf5' : 'rgba(255,255,255,0.88)',
              fontFamily: "'JetBrains Mono', monospace",
              pointerEvents: 'none',
            }}
          >
            {node.id}
          </text>
        </g>
      ))}

      {/* ── Hover tooltip (expanded mode) ── */}
      {expanded && tooltipEdge && (() => {
        const ek = tooltipEdge.key;
        const edge = edges.find(e => `${e.from}||${e.to}` === ek);
        if (!edge || edge.transitions.length <= 1) return null;
        const lines = edge.transitions.map(t => fmtTransition(t, config.blankSymbol));
        const w = Math.max(...lines.map(l => l.length)) * 6.8 + 20;
        const h = lines.length * 17 + 14;
        return (
          <g>
            <rect
              x={tooltipEdge.x - w / 2} y={tooltipEdge.y - h - 4}
              width={w} height={h} rx="6"
              fill="rgba(20,20,40,0.97)"
              stroke="rgba(99,102,241,0.4)"
              strokeWidth="1"
            />
            {lines.map((l, i) => (
              <text
                key={i}
                x={tooltipEdge.x}
                y={tooltipEdge.y - h - 4 + 14 + i * 17}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 11, fill: '#a5b4fc', fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none' }}
              >
                {l}
              </text>
            ))}
          </g>
        );
      })()}
    </svg>
  );
}

/* ─── Public component ───────────────────────────────────────────────── */

export function StateDiagram({ config, currentState, lastTransition }: StateDiagramProps) {
  const [expanded, setExpanded] = useState(false);

  const legends = [
    { color: '#22d3ee', label: 'Current' },
    { color: '#a78bfa', label: 'Accept' },
    { color: '#fb7185', label: 'Reject' },
    { color: '#71717a', label: 'Normal' },
  ];

  return (
    <ExpandablePanel
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onClose={() => setExpanded(false)}
      title="State Diagram"
      accentColor="bg-violet-400"
      expandedContent={
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-4">
            {legends.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
            <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Hover edges to see all transitions · ∅ = blank
            </span>
          </div>
          <div
            className="flex-1 overflow-hidden rounded-xl"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <DiagramSVG config={config} currentState={currentState} lastTransition={lastTransition} expanded={true} />
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Format: read→write/move per tape · BFS layout from initial state
          </p>
        </div>
      }
    >
      {/* Header */}
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            State Diagram
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {legends.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Diagram — fills remaining height */}
      <div
        className="flex-1 min-h-0 overflow-auto rounded-xl"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', minHeight: 400 }}
      >
        <DiagramSVG config={config} currentState={currentState} lastTransition={lastTransition} expanded={false} />
      </div>

      {/* Footer */}
      <p className="mt-2 shrink-0 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        BFS layout · read→write/move · Hover edges for details · click Expand for full view
      </p>
    </ExpandablePanel>
  );
}