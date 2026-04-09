import { motion, AnimatePresence } from 'motion/react';
import { MachineState } from '../types/turing-machine';
import { CheckCircle2, XCircle, Timer } from 'lucide-react';

interface StateDisplayProps {
  machineState: MachineState;
  acceptStates: string[];
  rejectStates: string[];
}

export function StateDisplay({ machineState, acceptStates, rejectStates }: StateDisplayProps) {
  const isAccept = acceptStates.includes(machineState.currentState);
  const isReject = rejectStates.includes(machineState.currentState);

  const stateStyle = isAccept
    ? { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', color: '#c4b5fd', glow: 'rgba(139,92,246,0.25)' }
    : isReject
    ? { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.4)', color: '#fda4af', glow: 'rgba(244,63,94,0.2)' }
    : { bg: 'rgba(34,211,238,0.15)', border: 'rgba(34,211,238,0.4)', color: '#67e8f9', glow: 'rgba(34,211,238,0.2)' };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">

      {/* State label + pill */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>State</span>
        <motion.div
          key={machineState.currentState}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="relative"
        >
          {/* Glow behind pill */}
          <div
            className="absolute inset-0 rounded-lg blur-md"
            style={{ background: stateStyle.glow }}
          />
          <div
            className="relative rounded-lg px-3.5 py-1.5"
            style={{
              background: stateStyle.bg,
              border: `1px solid ${stateStyle.border}`,
              fontFamily: "'JetBrains Mono', monospace",
              color: stateStyle.color,
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {machineState.currentState}
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Step counter */}
      <div className="flex items-center gap-2">
        <Timer className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Step</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={machineState.stepCount}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="font-mono font-semibold text-white"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}
          >
            {machineState.stepCount}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Halted badge */}
      <AnimatePresence>
        {machineState.isHalted && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, x: -8 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={
              machineState.isAccepted
                ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)' }
                : { background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)' }
            }
          >
            {machineState.isAccepted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400">ACCEPTED</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-rose-400">REJECTED</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
