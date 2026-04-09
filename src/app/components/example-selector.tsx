import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Example } from '../types/turing-machine';
import { Check, ChevronDown, Layers2 } from 'lucide-react';

interface ExampleSelectorProps {
  examples: Example[];
  currentExample: Example | null;
  onSelect: (example: Example) => void;
}

export function ExampleSelector({ examples, currentExample, onSelect }: ExampleSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (example: Example) => {
    onSelect(example);
    setOpen(false);
  };

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Toggle bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ background: open ? 'rgba(255,255,255,0.03)' : 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? 'rgba(255,255,255,0.03)' : 'transparent')}
      >
        <div className="flex items-center gap-2.5">
          <Layers2 className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <span className="text-sm font-semibold text-zinc-200">Example Programs</span>
          {currentExample && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span className="text-sm font-medium text-emerald-400">{currentExample.name}</span>
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
              >
                {currentExample.config.numTapes}T · {currentExample.config.states.length}S
              </span>
            </>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </motion.div>
      </button>

      {/* Collapsible grid */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="examples-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="grid gap-2 p-4 pt-2 md:grid-cols-2 lg:grid-cols-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {examples.map((example) => {
                const isSelected = currentExample?.name === example.name;
                return (
                  <button
                    key={example.name}
                    onClick={() => handleSelect(example)}
                    className="flex items-start justify-between rounded-xl px-3.5 py-3 text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isSelected ? '0 0 16px rgba(16,185,129,0.08) inset' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-zinc-100">{example.name}</span>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                        >
                          {example.config.numTapes}T
                        </span>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                        >
                          {example.config.states.length}S
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {example.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
