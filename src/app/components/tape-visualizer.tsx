import { motion, AnimatePresence } from 'motion/react';
import { TapeState } from '../types/turing-machine';
import { useEffect, useState, useRef } from 'react';

interface TapeVisualizerProps {
  tape: TapeState;
  tapeIndex: number;
  blankSymbol: string;
  isActive?: boolean;
  currentState?: string;
}

const CELL_W = 48;
const CELL_GAP = 4;
const CELL_SLOT = CELL_W + CELL_GAP;
const HALF_CELL = CELL_W / 2;
const CONTAINER_PX = 12;

export function TapeVisualizer({
  tape,
  tapeIndex,
  blankSymbol,
  isActive = true,
  currentState,
}: TapeVisualizerProps) {
  const minPosition = Math.min(0, tape.headPosition - 6);
  const maxPosition = Math.max(22, tape.headPosition + 12);

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

  const [changedCells, setChangedCells] = useState<Set<number>>(new Set());
  const prevCellsRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    const cellsMap =
      tape.cells instanceof Map
        ? tape.cells
        : new Map(
            Object.entries(tape.cells as Record<string, string>).map(([k, v]) => [Number(k), v])
          );

    const changed = new Set<number>();
    cellsMap.forEach((val, pos) => {
      const prev = prevCellsRef.current.get(pos);
      if (prev !== undefined && prev !== val) changed.add(pos);
    });
    prevCellsRef.current.forEach((val, pos) => {
      if (!cellsMap.has(pos) && val !== blankSymbol) changed.add(pos);
    });

    if (changed.size > 0) {
      setChangedCells(changed);
      setTimeout(() => setChangedCells(new Set()), 900);
    }
    prevCellsRef.current = new Map(cellsMap);
  }, [tape.cells, tape.headPosition, blankSymbol]);

  const cellsMap =
    tape.cells instanceof Map
      ? tape.cells
      : new Map(
          Object.entries(tape.cells as Record<string, string>).map(([k, v]) => [Number(k), v])
        );

  const cells: { position: number; symbol: string }[] = [];
  for (let i = minPosition; i <= maxPosition; i++) {
    cells.push({ position: i, symbol: cellsMap.get(i) ?? blankSymbol });
  }

  const headIdx = tape.headPosition - minPosition;
  const xTranslate = containerWidth / 2 - CONTAINER_PX - headIdx * CELL_SLOT - HALF_CELL;

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-center gap-2.5 px-1">
        <span
          className="w-14 text-xs font-semibold"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Tape {tapeIndex + 1}
        </span>
        {isActive && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
        )}
        <span
          className="text-xs"
          style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          head@<span style={{ color: '#34d399' }}>{tape.headPosition}</span>
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          · {cellsMap.size} cells
        </span>
      </div>

      {/* Tape track */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl px-3 py-2"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
        }}
      >
        {/* HEAD indicator — centred */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
                    <div className="flex flex-col items-center">
            <motion.div
              className="leading-none"
              style={{ fontSize: 14, color: '#22d3ee', filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.8))' }}
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              ▼
            </motion.div>
            <div
              className="rounded px-1.5 py-px font-bold leading-none"
              style={{
                fontSize: 9,
                background: 'rgba(34,211,238,0.15)',
                border: '1px solid rgba(34,211,238,0.5)',
                color: '#22d3ee',
                letterSpacing: '0.08em',
                boxShadow: '0 0 8px rgba(34,211,238,0.3)',
              }}
            >
              HEAD
            </div>
          </div>
        </div>

        {/* Scrolling row */}
        <div className="relative mt-8">
          <motion.div
            className="flex gap-1"
            animate={{ x: xTranslate }}
            transition={{ type: 'tween', duration: 0.1, ease: 'linear' }}
          >
            <AnimatePresence mode="popLayout">
              {cells.map((cell) => {
                const isHead = cell.position === tape.headPosition;
                const isChanged = changedCells.has(cell.position);
                const isEmpty = cell.symbol === blankSymbol;

                return (
                  <motion.div
                    key={`t${tapeIndex}-p${cell.position}`}
                    layout
                    className="relative flex w-12 h-12 flex-shrink-0 flex-col items-center justify-center rounded-lg group overflow-hidden cursor-crosshair"
                    style={{
                      border: isHead
                        ? '2px solid rgba(34,211,238,0.7)'
                        : isChanged
                        ? '2px solid rgba(244,63,94,0.6)'
                        : '1px solid rgba(255,255,255,0.05)',
                      background: isHead
                        ? 'rgba(34,211,238,0.1)'
                        : isChanged
                        ? 'rgba(244,63,94,0.15)'
                        : 'rgba(255,255,255,0.03)',
                      boxShadow: isHead
                        ? '0 0 20px rgba(34,211,238,0.4), inset 0 0 10px rgba(34,211,238,0.2)'
                        : isChanged
                        ? '0 0 15px rgba(244,63,94,0.3)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                      opacity: isEmpty ? 0.4 : 1,
                    }}
                    whileHover={{ 
                      scale: 1.15,
                      borderColor: 'rgba(139, 92, 246, 0.8)',
                      boxShadow: '0 0 25px rgba(139, 92, 246, 0.6), inset 0 0 15px rgba(139, 92, 246, 0.3)',
                      zIndex: 10,
                      transition: { duration: 0.2, type: 'spring', stiffness: 300 }
                    }}
                    animate={{ scale: isHead ? 1.1 : isChanged ? 1.05 : 1, opacity: isEmpty ? 0.4 : 1 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  >
                    {/* Hover scanline effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                       <motion.div 
                         className="w-full h-[150%]"
                         style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(34,211,238,0.3) 50%, transparent 100%)' }}
                         animate={{ y: ['-100%', '100%'] }}
                         transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                       />
                    </div>
                    
                    {/* Symbol */}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${cell.position}-${cell.symbol}`}
                        initial={{ scale: 0.2, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.2, opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="leading-none"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 16,
                          fontWeight: 700,
                          color: isHead ? '#cffafe' : isChanged ? '#ffe4e6' : 'rgba(255,255,255,0.8)',
                          textShadow: isHead ? '0 0 8px rgba(34,211,238,0.5)' : isChanged ? '0 0 8px rgba(244,63,94,0.5)' : 'none'
                        }}
                      >
                        {cell.symbol}
                      </motion.span>
                    </AnimatePresence>

                    {/* Position index inside cell */}
                    <div
                      className="absolute bottom-0.5 left-0 right-0 text-center leading-none"
                      style={{
                        fontSize: 9,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isHead ? 'rgba(34,211,238,0.8)' : 'rgba(255,255,255,0.15)',
                        fontWeight: isHead ? 700 : 400,
                      }}
                    >
                      {cell.position}
                    </div>

                    {/* Current state below head cell */}
                    {isHead && currentState && (
                      <div
                        className="absolute -bottom-6 left-0 right-0 text-center leading-none"
                        style={{
                          fontSize: 10,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: '#c4b5fd',
                          fontWeight: 700,
                        }}
                      >
                        {currentState}
                      </div>
                    )}

                    {/* Write-flash ring */}
                    {isChanged && (
                      <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-rose-500"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.4 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    )}

                    {/* Head pulse */}
                    {isHead && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgba(34,211,238,0.15)' }}
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
