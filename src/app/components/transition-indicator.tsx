import { motion, AnimatePresence } from 'motion/react';
import { Transition } from '../types/turing-machine';
import { ArrowLeft, ArrowRight, Minus, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface TransitionIndicatorProps {
  transition: Transition | null;
  blankSymbol: string;
  isHalted?: boolean;
  isAccepted?: boolean;
}

const fmt = (s: string, blank: string) => (s === blank ? '∅' : s);

function DirBadge({ dir }: { dir: string }) {
  const cfg =
    dir === 'L'
      ? { icon: <ArrowLeft className="h-3.5 w-3.5" />, label: 'L', style: { background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' } }
      : dir === 'R'
      ? { icon: <ArrowRight className="h-3.5 w-3.5" />, label: 'R', style: { background: 'rgba(244,63,94,0.18)', border: '1px solid rgba(244,63,94,0.35)', color: '#fda4af' } }
      : { icon: <Minus className="h-3.5 w-3.5" />, label: 'N', style: { background: 'rgba(113,113,122,0.18)', border: '1px solid rgba(113,113,122,0.3)', color: '#a1a1aa' } };

  return (
    <span
      className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm font-semibold"
      style={cfg.style}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function PipeArrow() {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1">
      <div className="h-px w-6 bg-white/10" />
      <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
        <path d="M0 4h12M9 1l3 3-3 3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
      {children}
    </div>
  );
}

export function TransitionIndicator({
  transition,
  blankSymbol,
  isHalted,
  isAccepted,
}: TransitionIndicatorProps) {
  return (
    <div className="relative min-h-[88px]">
      <AnimatePresence mode="wait">

        {/* ── Halted banner ── */}
        {isHalted && (
          <motion.div
            key="halted"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center gap-3 rounded-xl px-5 py-4"
            style={
              isAccepted
                ? { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }
                : { background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }
            }
          >
            {isAccepted ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-violet-400" />
                <span className="font-semibold text-violet-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Machine halted — input accepted
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-rose-400" />
                <span className="font-semibold text-rose-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Machine halted — input rejected
                </span>
              </>
            )}
          </motion.div>
        )}

        {/* ── No transition yet ── */}
        {!isHalted && !transition && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <span className="text-sm text-zinc-600">Awaiting first transition…</span>
          </motion.div>
        )}

        {/* ── Active transition pipeline ── */}
        {!isHalted && transition && (
          <motion.div
            key={`${transition.currentState}-${transition.readSymbols.join('')}-${transition.nextState}-${transition.writeSymbols.join('')}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(34,211,238,0.06) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow: '0 0 24px rgba(139,92,246,0.06) inset',
            }}
          >
            {/* Flash pulse on new transition */}
            <motion.div
              key={`flash-${transition.currentState}-${transition.readSymbols.join('')}`}
              initial={{ opacity: 0.18 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.12)' }}
            />

            <div className="flex flex-wrap items-center gap-1.5">

              {/* FIRED label */}
              <div className="mr-1 flex items-center gap-1.5 rounded-lg px-2 py-1"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <Zap className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400">FIRED</span>
              </div>

              {/* FROM state */}
              <div className="flex flex-col">
                <SectionLabel>from</SectionLabel>
                <motion.span
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  className="rounded-lg px-3 py-1.5 font-mono font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: 'rgba(139,92,246,0.2)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    color: '#c4b5fd',
                    fontSize: '15px',
                  }}
                >
                  {transition.currentState}
                </motion.span>
              </div>

              <PipeArrow />

              {/* READ */}
              <div className="flex flex-col">
                <SectionLabel>read</SectionLabel>
                <div className="flex gap-1.5">
                  {transition.readSymbols.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>T{i + 1}</span>
                      <span
                        className="rounded-lg px-2.5 py-1.5 font-mono font-semibold"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#f4f4f5',
                          fontSize: '14px',
                        }}
                      >
                        {fmt(s, blankSymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <PipeArrow />

              {/* WRITE */}
              <div className="flex flex-col">
                <SectionLabel>write</SectionLabel>
                <div className="flex gap-1.5">
                  {transition.writeSymbols.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold" style={{ color: 'rgba(34,211,238,0.3)' }}>T{i + 1}</span>
                      <span
                        className="rounded-lg px-2.5 py-1.5 font-mono font-semibold"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          background: 'rgba(34,211,238,0.12)',
                          border: '1px solid rgba(34,211,238,0.3)',
                          color: '#cffafe',
                          fontSize: '14px',
                        }}
                      >
                        {fmt(s, blankSymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <PipeArrow />

              {/* MOVE */}
              <div className="flex flex-col">
                <SectionLabel>move</SectionLabel>
                <div className="flex gap-1.5">
                  {transition.moveDirections.map((dir, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>T{i + 1}</span>
                      <DirBadge dir={dir} />
                    </div>
                  ))}
                </div>
              </div>

              <PipeArrow />

              {/* TO state */}
              <div className="flex flex-col">
                <SectionLabel>to</SectionLabel>
                <motion.span
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  className="rounded-lg px-3 py-1.5 font-mono font-bold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: 'rgba(34,211,238,0.18)',
                    border: '1px solid rgba(34,211,238,0.4)',
                    color: '#67e8f9',
                    fontSize: '15px',
                  }}
                >
                  {transition.nextState}
                </motion.span>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
