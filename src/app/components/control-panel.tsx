import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Zap, ZapOff } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  isHalted: boolean;
  canStepBack: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  borderRadius: 8,
  padding: '5px 12px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: "'Inter', sans-serif",
  border: '1px solid',
};

export function ControlPanel({
  isRunning,
  isHalted,
  canStepBack,
  speed,
  onPlay,
  onPause,
  onStep,
  onStepBack,
  onReset,
  onSpeedChange,
}: ControlPanelProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">

      {/* ── Playback group ── */}
      <div
        className="flex items-center gap-1 rounded-xl p-1 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Step Back */}
        <motion.button
          whileHover={(!isRunning && canStepBack) ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 10px rgba(255,255,255,0.2)' } : {}}
          whileTap={(!isRunning && canStepBack) ? { scale: 0.95 } : {}}
          onClick={onStepBack}
          disabled={isRunning || !canStepBack}
          title="Step backward"
          style={{
            ...btnBase,
            background: !isRunning && canStepBack ? 'rgba(255,255,255,0.07)' : 'transparent',
            borderColor: !isRunning && canStepBack ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: !isRunning && canStepBack ? '#d4d4d8' : 'rgba(255,255,255,0.2)',
          }}
        >
          <SkipBack size={13} />
          Back
        </motion.button>

        {/* Play / Pause */}
        {!isRunning ? (
          <motion.button
            whileHover={!isHalted ? { scale: 1.05, backgroundColor: 'rgba(34,211,238,0.3)', boxShadow: '0 0 20px rgba(34,211,238,0.5)' } : {}}
            whileTap={!isHalted ? { scale: 0.95 } : {}}
            onClick={onPlay}
            disabled={isHalted}
            style={{
              ...btnBase,
              background: isHalted ? 'rgba(34,211,238,0.07)' : 'rgba(34,211,238,0.2)',
              borderColor: isHalted ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.45)',
              color: isHalted ? 'rgba(103,232,249,0.35)' : '#67e8f9',
              boxShadow: isHalted ? 'none' : '0 0 15px rgba(34,211,238,0.25)',
            }}
          >
            <Play size={13} />
            Play
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(217,70,239,0.3)', boxShadow: '0 0 20px rgba(217,70,239,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            style={{
              ...btnBase,
              background: 'rgba(217,70,239,0.2)',
              borderColor: 'rgba(217,70,239,0.45)',
              color: '#f0abfc',
              boxShadow: '0 0 15px rgba(217,70,239,0.25)',
            }}
          >
            <Pause size={13} />
            Pause
          </motion.button>
        )}

        {/* Step Forward */}
        <motion.button
          whileHover={(!isRunning && !isHalted) ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 10px rgba(255,255,255,0.2)' } : {}}
          whileTap={(!isRunning && !isHalted) ? { scale: 0.95 } : {}}
          onClick={onStep}
          disabled={isRunning || isHalted}
          title="Step forward"
          style={{
            ...btnBase,
            background: !isRunning && !isHalted ? 'rgba(255,255,255,0.07)' : 'transparent',
            borderColor: !isRunning && !isHalted ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: !isRunning && !isHalted ? '#d4d4d8' : 'rgba(255,255,255,0.2)',
          }}
        >
          <SkipForward size={13} />
          Step
        </motion.button>

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.2)', boxShadow: '0 0 15px rgba(239,68,68,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          style={{
            ...btnBase,
            background: 'rgba(239,68,68,0.1)',
            borderColor: 'rgba(239,68,68,0.25)',
            color: '#fca5a5',
          }}
        >
          <RotateCcw size={13} />
          Reset
        </motion.button>
      </div>

      {/* ── Divider ── */}
      <div className="h-7 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* ── Speed ── */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Speed</span>
        <input
          type="range"
          min={0.1}
          max={1.0}
          step={0.1}
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="h-1.5 w-20 cursor-pointer"
          style={{ accentColor: '#22d3ee' }}
        />
        <motion.span
          key={speed}
          initial={{ scale: 1.15, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-9 text-right font-mono text-xs font-semibold text-zinc-300"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {speed.toFixed(1)}×
        </motion.span>
      </div>

    </div>
  );
}