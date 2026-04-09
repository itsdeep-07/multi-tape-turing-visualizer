import { motion } from 'motion/react';
import { TapeState } from '../types/turing-machine';

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

export function MultiHeadVisualizer({
  tape,
  heads,
  blankSymbol,
  isActive,
  mode,
  currentState,
}: MultiHeadVisualizerProps) {
  const visibleRange = 15;
  const minPos = Math.min(...heads) - Math.floor(visibleRange / 2);
  const maxPos = minPos + visibleRange;

  const cells = [];
  for (let i = minPos; i < maxPos; i++) {
    const symbol = tape.cells.get(i) || blankSymbol;
    const headsOnCell = heads.map((pos, idx) => (pos === i ? idx : -1)).filter((idx) => idx !== -1);

    cells.push(
      <div key={i} className="relative flex flex-col items-center">
        {/* Heads above cell */}
        {headsOnCell.length > 0 && (
          <div className="flex gap-1 mb-1">
            {headsOnCell.map((headIdx) => (
              <motion.div
                key={headIdx}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={
                    isActive
                      ? {
                          y: [0, -3, 0],
                          filter: [
                            `drop-shadow(0 0 8px ${headColors[headIdx]})`,
                            `drop-shadow(0 0 15px ${headColors[headIdx]})`,
                            `drop-shadow(0 0 8px ${headColors[headIdx]})`,
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent"
                  style={{ borderTopColor: headColors[headIdx] }}
                />
                <span
                  className="text-[8px] font-bold mt-0.5"
                  style={{ color: headColors[headIdx], fontFamily: "'JetBrains Mono', monospace" }}
                >
                  H{headIdx + 1}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cell */}
        <motion.div
          whileHover={{ scale: 1.08, y: -2 }}
          className="relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-300"
          style={{
            background:
              headsOnCell.length > 0
                ? `linear-gradient(135deg, ${headColors[headsOnCell[0]]}15 0%, ${headColors[headsOnCell[0]]}08 100%)`
                : 'rgba(255,255,255,0.02)',
            border:
              headsOnCell.length > 0
                ? `1.5px solid ${headColors[headsOnCell[0]]}80`
                : '1px solid rgba(255,255,255,0.06)',
            boxShadow:
              headsOnCell.length > 0
                ? `0 0 20px ${headColors[headsOnCell[0]]}40, inset 0 1px 0 rgba(255,255,255,0.1)`
                : '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color:
                headsOnCell.length > 0
                  ? headColors[headsOnCell[0]]
                  : symbol === blankSymbol
                  ? 'rgba(255,255,255,0.15)'
                  : '#a1a1aa',
            }}
          >
            {symbol}
          </span>

          {/* Multiple heads indicator */}
          {headsOnCell.length > 1 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ background: headColors[headsOnCell[1]], color: '#000' }}>
              {headsOnCell.length}
            </div>
          )}
        </motion.div>

        {/* Position label */}
        <span
          className="text-[8px] mt-1"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: headsOnCell.length > 0 ? headColors[headsOnCell[0]] : 'rgba(255,255,255,0.2)',
          }}
        >
          {i}
        </span>

        {/* Current state below first head cell */}
        {headsOnCell.includes(0) && currentState && (
          <div
            className="text-[9px] mt-1 font-bold"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#c4b5fd',
            }}
          >
            {currentState}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={glass} className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-1 w-1 rounded-full bg-cyan-400" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/32">
          {mode === 'multi-head' ? 'Multi-Head Tape' : 'Shared Tape'}
        </span>
        <div className="flex gap-1 ml-auto">
          {heads.map((_, idx) => (
            <div
              key={idx}
              className="w-2 h-2 rounded-full"
              style={{ background: headColors[idx] }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
        {cells}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {heads.map((pos, idx) => (
          <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${headColors[idx]}15` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: headColors[idx] }} />
            <span className="text-[9px] font-semibold" style={{ color: headColors[idx], fontFamily: "'JetBrains Mono', monospace" }}>
              Head {idx + 1}: pos {pos}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
