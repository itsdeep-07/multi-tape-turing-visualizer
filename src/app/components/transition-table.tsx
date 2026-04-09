import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { Transition } from '../types/turing-machine';
import { Zap, Search } from 'lucide-react';
import { ExpandablePanel } from './expandable-panel';

interface TransitionTableProps {
  transitions: Transition[];
  currentState: string;
  lastTransition: Transition | null | undefined;
  numTapes: number;
  blankSymbol: string;
}

export function TransitionTable({
  transitions,
  currentState,
  lastTransition,
  numTapes,
  blankSymbol,
}: TransitionTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('');

  // Refs for auto-scroll
  const scrollRef     = useRef<HTMLDivElement>(null);
  const activeRowRef  = useRef<HTMLTableRowElement>(null);

  const fmt = (s: string) => (s === blankSymbol ? '∅' : s);

  const isExactMatch = (t: Transition) => {
    if (!lastTransition) return false;
    return (
      t.currentState === lastTransition.currentState &&
      t.nextState === lastTransition.nextState &&
      t.readSymbols.every((s, i) => s === lastTransition.readSymbols[i]) &&
      t.writeSymbols.every((s, i) => s === lastTransition.writeSymbols[i]) &&
      t.moveDirections.every((d, i) => d === lastTransition.moveDirections[i])
    );
  };

  const isStateMatch = (t: Transition) => !isExactMatch(t) && t.currentState === currentState;

  // Auto-scroll the active row into view whenever lastTransition changes
  useEffect(() => {
    const rowEl = activeRowRef.current;
    const scrollEl = scrollRef.current;
    if (!rowEl || !scrollEl) return;

    const rowTop    = rowEl.offsetTop;
    const rowBottom = rowTop + rowEl.offsetHeight;
    const visTop    = scrollEl.scrollTop;
    const visBottom = visTop + scrollEl.clientHeight;

    const isVisible = rowTop >= visTop + 4 && rowBottom <= visBottom - 4;
    if (!isVisible) {
      scrollEl.scrollTo({
        top: rowTop - scrollEl.clientHeight / 2 + rowEl.offsetHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [lastTransition]);

  const filteredTransitions = filter.trim()
    ? transitions.filter(t =>
        t.currentState.toLowerCase().includes(filter.toLowerCase()) ||
        t.nextState.toLowerCase().includes(filter.toLowerCase()) ||
        t.readSymbols.some(s => fmt(s).includes(filter)) ||
        t.writeSymbols.some(s => fmt(s).includes(filter))
      )
    : transitions;

  // ── Table rows renderer ──────────────────────────────────────────────────
  const renderRows = (rows: Transition[], large?: boolean) =>
    rows.map((t, idx) => {
      const exact = isExactMatch(t);
      const state = isStateMatch(t);
      return (
        <motion.tr
          key={idx}
          ref={exact ? (activeRowRef as React.RefObject<HTMLTableRowElement>) : undefined}
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
          style={{
            background: exact
              ? 'rgba(34,211,238,0.12)'
              : state
              ? 'rgba(139,92,246,0.08)'
              : 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            boxShadow: exact ? '0 0 0 1px rgba(34,211,238,0.25) inset' : 'none',
            transition: 'background 0.2s',
            cursor: 'default'
          }}
        >
          {/* State */}
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className="rounded-md px-2 py-0.5"
                style={{
                  background: exact
                    ? 'rgba(34,211,238,0.2)'
                    : state
                    ? 'rgba(139,92,246,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  color: exact ? '#cffafe' : state ? '#ddd6fe' : '#a1a1aa',
                }}
              >
                {t.currentState}
              </span>
              {exact && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Zap className="h-3 w-3 text-cyan-400" />
                </motion.div>
              )}
            </div>
          </td>

          {/* Read */}
          <td className="px-3 py-2.5">
            <div className="flex flex-wrap gap-1">
              {t.readSymbols.map((s, i) => (
                <span
                  key={i}
                  className="rounded px-1.5 py-0.5"
                  style={{
                    background: exact ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
                    color: exact ? '#67e8f9' : '#d4d4d8',
                  }}
                >
                  {fmt(s)}
                </span>
              ))}
            </div>
          </td>

          {/* Arrow */}
          <td className="px-2 py-2.5 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            →
          </td>

          {/* Next state */}
          <td className="px-3 py-2.5">
            <span
              className="rounded-md px-2 py-0.5"
              style={{
                color: exact ? '#cffafe' : '#a1a1aa',
                background: exact ? 'rgba(34,211,238,0.15)' : 'transparent',
              }}
            >
              {t.nextState}
            </span>
          </td>

          {/* Write */}
          <td className="px-3 py-2.5">
            <div className="flex flex-wrap gap-1">
              {t.writeSymbols.map((s, i) => (
                <span
                  key={i}
                  className="rounded px-1.5 py-0.5"
                  style={{
                    background: exact ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.08)',
                    color: exact ? '#cffafe' : '#67e8f9',
                  }}
                >
                  {fmt(s)}
                </span>
              ))}
            </div>
          </td>

          {/* Move */}
          <td className="px-3 py-2.5">
            <div className="flex gap-1">
              {t.moveDirections.map((dir, i) => (
                <span
                  key={i}
                  className="rounded px-1.5 py-0.5 font-semibold"
                  style={{
                    background:
                      dir === 'L' ? 'rgba(139,92,246,0.2)'
                      : dir === 'R' ? 'rgba(244,63,94,0.2)'
                      : 'rgba(34,211,238,0.15)',
                    color:
                      dir === 'L' ? '#ddd6fe'
                      : dir === 'R' ? '#fecdd3'
                      : '#67e8f9',
                  }}
                >
                  {dir}
                </span>
              ))}
            </div>
          </td>
        </motion.tr>
      );
    });

  // ── Shared table shell ───────────────────────────────────────────────────
  const TableShell = ({
    rows,
    fill,
    large,
    containerRef,
  }: {
    rows: Transition[];
    fill?: boolean;
    large?: boolean;
    containerRef?: React.RefObject<HTMLDivElement>;
  }) => (
    <div
      className={`overflow-hidden rounded-xl ${fill ? 'flex-1 min-h-0 flex flex-col' : ''}`}
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        ref={fill ? containerRef : undefined}
        className={fill ? 'flex-1 overflow-y-auto' : 'max-h-[280px] overflow-y-auto'}
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
      >
        <table
          className="w-full"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: large ? 13 : 11, borderCollapse: 'separate', borderSpacing: 0 }}
        >
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr
              style={{
                background: 'rgba(18,19,34,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              {['State', 'Read', '→', 'Next', 'Write', 'Move'].map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2 text-left ${i === 2 ? 'text-center' : ''}`}
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontWeight: 600,
                    fontSize: large ? 11 : 9,
                    background: 'rgba(18,19,34,0.98)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  {i === 1 || i === 4 ? (
                    <div className="flex flex-col">
                      <span>{h}</span>
                      <span className="mt-0.5 text-[8px] opacity-40">
                        {Array.from({ length: numTapes }).map((_, j) => `T${j + 1}`).join(', ')}
                      </span>
                    </div>
                  ) : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows(rows, large)}</tbody>
        </table>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-xs"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            <Search size={18} className="mb-2 opacity-40" />
            No transitions match &ldquo;{filter}&rdquo;
          </div>
        )}
      </div>
    </div>
  );

  const Header = () => (
    <div className="mb-3 flex shrink-0 items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-indigo-400" />
        <h3 className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          Transition Table
        </h3>
        <span
          className="rounded-md px-2 py-0.5 text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
        >
          {transitions.length} rules
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-cyan-400" />
          Fired
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-violet-400" />
          Current
        </div>
      </div>
    </div>
  );

  return (
    <ExpandablePanel
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onClose={() => setExpanded(false)}
      title="Transition Table"
      accentColor="bg-indigo-400"
      expandedContent={
        <div className="flex h-full flex-col gap-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <div
              className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Search size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter by state or symbol…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
                style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif" }}
              />
              {filter && (
                <button onClick={() => setFilter('')} className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="rounded px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {filteredTransitions.length} / {transitions.length}
              </span>
            </div>
          </div>
          <TableShell rows={filteredTransitions} fill large />
        </div>
      }
    >
      <Header />
      <TableShell rows={transitions} fill containerRef={scrollRef} />
    </ExpandablePanel>
  );
}