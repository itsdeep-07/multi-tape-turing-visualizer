import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ChevronDown } from 'lucide-react';

export function InfoPanel() {
  const [open, setOpen] = useState(false);

  const legends = [
    { color: '#34d399', label: 'Green cell', desc: 'current head position' },
    { color: '#fbbf24', label: 'Amber cell', desc: 'just written' },
    { color: '#818cf8', label: 'Blue row', desc: 'current state transitions' },
    { color: '#a1a1aa', label: 'L / R / N', desc: 'Left / Right / No-move' },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <motion.button
        whileHover={{ backgroundColor: 'rgba(99,102,241,0.1)' }}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-5 py-3 text-left transition-colors"
      >
        <Info className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-400">
          About Multi-Tape Turing Machines
        </span>
        <motion.div
          className="ml-auto"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-indigo-400/50" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="info-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="space-y-3 px-5 pb-4 pt-3"
              style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}
            >
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Multi-tape Turing machines allow more efficient computation — each tape has an
                independent read/write head that moves simultaneously in a single step.
                They are equivalent in power to single-tape TMs but can be exponentially more efficient.
              </p>
              <div className="flex flex-wrap gap-3">
                {legends.map(({ color, label, desc }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span className="font-semibold" style={{ color }}>{label}</span>
                      {' '}= {desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
