import { motion } from 'motion/react';
import { Layers, Target } from 'lucide-react';

const glass: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

interface ModeSelectorProps {
  mode: 'multi-tape' | 'multi-head';
  numTapes: number;
  onModeChange: (mode: 'multi-tape' | 'multi-head') => void;
  onNumTapesChange: (num: number) => void;
  isRunning: boolean;
}

export function ModeSelector({ mode, numTapes, onModeChange, onNumTapesChange, isRunning }: ModeSelectorProps) {
  return (
    <div style={glass} className="p-4">
      <div className="flex items-center justify-between gap-6">
        {/* Mode Selection */}
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Machine Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => !isRunning && onModeChange('multi-tape')}
              disabled={isRunning}
              className="flex-1 group relative overflow-hidden px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{
                background:
                  mode === 'multi-tape'
                    ? 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.1) 100%)'
                    : 'rgba(255,255,255,0.03)',
                border:
                  mode === 'multi-tape'
                    ? '1.5px solid rgba(34,211,238,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {mode === 'multi-tape' && (
                <motion.div
                  layoutId="modeIndicator"
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300"
                  style={{
                    background: mode === 'multi-tape' ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Layers
                    className="h-5 w-5"
                    style={{ color: mode === 'multi-tape' ? '#22d3ee' : 'rgba(255,255,255,0.4)' }}
                  />
                </div>
                <div className="text-left">
                  <div
                    className="text-sm font-bold"
                    style={{ color: mode === 'multi-tape' ? '#67e8f9' : 'rgba(255,255,255,0.6)' }}
                  >
                    Multi-Tape
                  </div>
                  <div className="text-[10px] text-white/40">Multiple independent tapes</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => !isRunning && onModeChange('multi-head')}
              disabled={isRunning}
              className="flex-1 group relative overflow-hidden px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{
                background:
                  mode === 'multi-head'
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.1) 100%)'
                    : 'rgba(255,255,255,0.03)',
                border:
                  mode === 'multi-head'
                    ? '1.5px solid rgba(139,92,246,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {mode === 'multi-head' && (
                <motion.div
                  layoutId="modeIndicator"
                  className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300"
                  style={{
                    background: mode === 'multi-head' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Target
                    className="h-5 w-5"
                    style={{ color: mode === 'multi-head' ? '#8b5cf6' : 'rgba(255,255,255,0.4)' }}
                  />
                </div>
                <div className="text-left">
                  <div
                    className="text-sm font-bold"
                    style={{ color: mode === 'multi-head' ? '#c4b5fd' : 'rgba(255,255,255,0.6)' }}
                  >
                    Multi-Head
                  </div>
                  <div className="text-[10px] text-white/40">Multiple heads on one tape</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Number of Tapes/Heads */}
        <div className="w-48 space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Number of {mode === 'multi-tape' ? 'Tapes' : 'Heads'}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => !isRunning && numTapes > 1 && onNumTapesChange(numTapes - 1)}
              disabled={isRunning || numTapes <= 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg font-bold transition-all duration-300 hover:scale-110 disabled:opacity-30"
              style={{
                background: 'rgba(244,63,94,0.18)',
                border: '1px solid rgba(244,63,94,0.4)',
                color: '#fb7185',
              }}
            >
              −
            </button>
            <div
              className="flex-1 flex items-center justify-center h-8 rounded-lg font-bold text-lg"
              style={{
                background: 'rgba(34,211,238,0.1)',
                border: '1px solid rgba(34,211,238,0.3)',
                color: '#67e8f9',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {numTapes}
            </div>
            <button
              onClick={() => !isRunning && numTapes < 10 && onNumTapesChange(numTapes + 1)}
              disabled={isRunning || numTapes >= 10}
              className="flex items-center justify-center w-8 h-8 rounded-lg font-bold transition-all duration-300 hover:scale-110 disabled:opacity-30"
              style={{
                background: 'rgba(34,211,238,0.18)',
                border: '1px solid rgba(34,211,238,0.4)',
                color: '#67e8f9',
              }}
            >
              +
            </button>
          </div>
          <div className="text-[9px] text-white/30 text-center">Range: 1-10</div>
        </div>
      </div>
    </div>
  );
}
