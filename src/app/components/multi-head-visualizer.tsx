import { motion, AnimatePresence } from 'motion/react';
import { TapeState } from '../types/turing-machine';
import { useEffect, useState, useRef } from 'react';

const glass: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

interface MultiHeadVisualizerProps {
  tape: TapeState;
  heads: number[];
  blankSymbol: string;
  isActive: boolean;
  mode: 'multi-tape' | 'multi-head';
  currentState?: string;
}

const headColors = [
  '#22d3ee', // cyan
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#fbbf24', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#f97316', // orange
  '#06b6d4', // sky
  '#a855f7', // purple
  '#14b8a6', // teal
];

const CELL_W = 48;
const CELL_GAP = 4;
const CELL_SLOT = CELL_W + CELL_GAP;
const HALF_CELL = CELL_W / 2;
const CONTAINER_PX = 12;

export function MultiHeadVisualizer({
  tape,
  heads,
  blankSymbol,
  isActive,
  mode,
  currentState,
}: MultiHeadVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cellsMap = tape.cells instanceof Map ? tape.cells : new Map<number, string>(Object.entries(tape.cells as any).map(([k,v]) => [Number(k), v as string]));

  const minHead = heads.length > 0 ? Math.min(...heads) : 0;
  const maxHead = heads.length > 0 ? Math.max(...heads) : 0;
  
  // Create a rendering window that binds all heads, minimum 22 cells wide.
  const minPosition = Math.min(0, minHead - 6);
  const maxPosition = Math.max(22, maxHead + 12);

  const cells: { position: number; symbol: string }[] = [];
  for (let i = minPosition; i <= maxPosition; i++) {
    cells.push({ position: i, symbol: cellsMap.get(i) ?? blankSymbol });
  }

  // Calculate center of mass for xTranslate
  const targetFocus = heads.length > 0 ? (minHead + maxHead) / 2 : 0;
  const headIdx = targetFocus - minPosition;
  const xTranslate = containerWidth / 2 - CONTAINER_PX - headIdx * CELL_SLOT - HALF_CELL;

  return (
    <div style={glass} className="p-4 space-y-3">
      {/* Label row */}
      <div className="flex items-center gap-2.5 px-1">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {mode === 'multi-head' ? 'Shared Multi-Head Tape' : 'Tape'}
        </span>
        {isActive && (
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        )}
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          · {cellsMap.size} stored cells
        </span>
      </div>

      {/* Tape track */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl px-3 py-4"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset' }}
      >
        {/* Scrolling row */}
        <div className="relative pt-6">
          <motion.div
            className="flex gap-1"
            animate={{ x: xTranslate }}
            transition={{ type: 'spring', stiffness: 140, damping: 22 }}
          >
            <AnimatePresence mode="popLayout">
              {cells.map((cell) => {
                const headsOnCell = heads.map((pos, idx) => pos === cell.position ? idx : -1).filter(idx => idx !== -1);
                const isEmpty = cell.symbol === blankSymbol;
                const hasHeads = headsOnCell.length > 0;
                const primaryColor = hasHeads ? headColors[headsOnCell[0] % headColors.length] : 'transparent';

                return (
                  <motion.div
                    key={`shared-p${cell.position}`}
                    className="relative flex w-12 h-12 flex-shrink-0 flex-col items-center justify-center rounded-lg group overflow-visible cursor-crosshair"
                    style={{
                      border: hasHeads ? `2px solid ${primaryColor}b3` : '1px solid rgba(255,255,255,0.05)',
                      background: hasHeads ? `${primaryColor}1a` : 'rgba(255,255,255,0.03)',
                      boxShadow: hasHeads ? `0 0 20px ${primaryColor}66, inset 0 0 10px ${primaryColor}33` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                      opacity: isEmpty && !hasHeads ? 0.4 : 1,
                      transform: hasHeads ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.1s ease-out, border 0.1s ease-out, background 0.1s ease-out, box-shadow 0.1s ease-out',
                    }}
                    whileHover={{ scale: 1.15, borderColor: 'rgba(139, 92, 246, 0.8)', boxShadow: '0 0 25px rgba(139, 92, 246, 0.6), inset 0 0 15px rgba(139, 92, 246, 0.3)', zIndex: 10 }}
                  >
                    {/* Hover scanline effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                       <motion.div className="w-full h-[150%]" style={{ background: `linear-gradient(to bottom, transparent 0%, rgba(34,211,238,0.3) 50%, transparent 100%)` }} animate={{ y: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} />
                    </div>
                    
                    {/* Heads Overlapping Stacked Needles */}
                    {hasHeads && (
                      <div className="absolute bottom-[100%] mb-1 flex flex-col-reverse items-center z-10 w-full" style={{ gap: '2px' }}>
                        {headsOnCell.map((hIdx, hRank) => {
                           const c = headColors[hIdx % headColors.length];
                           return (
                             <motion.div key={`head-${hIdx}`} className="flex flex-col items-center" style={{ zIndex: 20 - hRank }}>
                               <motion.div animate={isActive ? { y: [0, -3, 0], filter: [`drop-shadow(0 0 4px ${c})`, `drop-shadow(0 0 10px ${c})`, `drop-shadow(0 0 4px ${c})`] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
                                 className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent" style={{ borderTopColor: c }} />
                               <span className="text-[9px] font-bold mt-[1px] bg-black/60 px-1 rounded backdrop-blur-md border" style={{ color: c, borderColor: `${c}40`, fontFamily: "'JetBrains Mono', monospace" }}>
                                 H{hIdx + 1}
                               </span>
                             </motion.div>
                           );
                        })}
                      </div>
                    )}

                    {/* Symbol */}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${cell.position}-${cell.symbol}`}
                        initial={{ scale: 0.2, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.2, opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="leading-none"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: hasHeads ? primaryColor : 'rgba(255,255,255,0.8)', textShadow: hasHeads ? `0 0 8px ${primaryColor}80` : 'none' }}
                      >
                        {isEmpty ? '∅' : cell.symbol}
                      </motion.span>
                    </AnimatePresence>

                    {/* Position index inside cell */}
                    <div className="absolute bottom-0.5 left-0 right-0 text-center leading-none" style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: hasHeads ? primaryColor : 'rgba(255,255,255,0.15)', fontWeight: hasHeads ? 700 : 400 }}>
                      {cell.position}
                    </div>


                    {/* Head pulse background */}
                    {hasHeads && (
                      <motion.div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: `${primaryColor}26` }} animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-2">
        {heads.map((pos, idx) => {
          const c = headColors[idx % headColors.length];
          return (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded border" style={{ background: `${c}15`, borderColor: `${c}33` }}>
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: c, color: c }} />
              <span className="text-[10px] font-semibold" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>
                H{idx + 1}: {pos}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
