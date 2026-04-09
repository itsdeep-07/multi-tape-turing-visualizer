import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, ArrowRight } from 'lucide-react';
import { Transition } from '../types/turing-machine';

const glass: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

interface TransitionEditorProps {
  transitions: Transition[];
  numTapes: number;
  states: string[];
  alphabet: string[];
  blankSymbol: string;
  onChange: (transitions: Transition[]) => void;
  isRunning: boolean;
}

export function TransitionEditor({
  transitions,
  numTapes,
  states,
  alphabet,
  blankSymbol,
  onChange,
  isRunning,
}: TransitionEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTransition, setNewTransition] = useState<Partial<Transition>>({
    currentState: states[0] || 'q0',
    readSymbols: Array(numTapes).fill(blankSymbol),
    nextState: states[0] || 'q0',
    writeSymbols: Array(numTapes).fill(blankSymbol),
    moveDirections: Array(numTapes).fill('R'),
  });

  const addTransition = () => {
    if (
      newTransition.currentState &&
      newTransition.nextState &&
      newTransition.readSymbols &&
      newTransition.writeSymbols &&
      newTransition.moveDirections
    ) {
      onChange([...transitions, newTransition as Transition]);
      setNewTransition({
        currentState: states[0] || 'q0',
        readSymbols: Array(numTapes).fill(blankSymbol),
        nextState: states[0] || 'q0',
        writeSymbols: Array(numTapes).fill(blankSymbol),
        moveDirections: Array(numTapes).fill('R'),
      });
      setIsAdding(false);
    }
  };

  const removeTransition = (index: number) => {
    onChange(transitions.filter((_, i) => i !== index));
  };

  const tapeAlphabet = [...alphabet, blankSymbol];

  return (
    <div style={glass} className="p-4 max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 pb-2"
        style={{ background: 'linear-gradient(180deg, rgba(2,1,8,0.95) 0%, rgba(2,1,8,0.8) 100%)' }}>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-violet-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Transition Rules
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(139,92,246,0.16)', color: '#c4b5fd' }}>
            {transitions.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-300 hover:scale-[1.05]"
          style={{
            background: isAdding ? 'rgba(244,63,94,0.18)' : 'rgba(34,211,238,0.18)',
            border: isAdding ? '1px solid rgba(244,63,94,0.4)' : '1px solid rgba(34,211,238,0.4)',
            color: isAdding ? '#fb7185' : '#67e8f9',
          }}
        >
          {isAdding ? 'Cancel' : <><Plus className="h-3 w-3" /> Add</>}
        </button>
      </div>

      {/* Add New Transition Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 p-3 rounded-lg overflow-hidden"
            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}
          >
            <div className="space-y-3">
              {/* Current State → Next State */}
              <div className="flex items-center gap-2">
                <select
                  value={newTransition.currentState}
                  onChange={(e) => setNewTransition({ ...newTransition, currentState: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs rounded-md outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cffafe',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ArrowRight className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                <select
                  value={newTransition.nextState}
                  onChange={(e) => setNewTransition({ ...newTransition, nextState: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs rounded-md outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cffafe',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Tape Operations */}
              {Array.from({ length: numTapes }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] text-white/40 w-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    T{idx + 1}:
                  </span>
                  <select
                    value={newTransition.readSymbols?.[idx]}
                    onChange={(e) => {
                      const read = [...(newTransition.readSymbols || [])];
                      read[idx] = e.target.value;
                      setNewTransition({ ...newTransition, readSymbols: read });
                    }}
                    className="flex-1 px-2 py-1 text-[10px] rounded outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#a1a1aa',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {tapeAlphabet.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ArrowRight className="h-2.5 w-2.5 text-white/20 flex-shrink-0" />
                  <select
                    value={newTransition.writeSymbols?.[idx]}
                    onChange={(e) => {
                      const write = [...(newTransition.writeSymbols || [])];
                      write[idx] = e.target.value;
                      setNewTransition({ ...newTransition, writeSymbols: write });
                    }}
                    className="flex-1 px-2 py-1 text-[10px] rounded outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#a1a1aa',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {tapeAlphabet.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={newTransition.moveDirections?.[idx]}
                    onChange={(e) => {
                      const move = [...(newTransition.moveDirections || [])];
                      move[idx] = e.target.value as 'L' | 'R' | 'N';
                      setNewTransition({ ...newTransition, moveDirections: move });
                    }}
                    className="w-12 px-1 py-1 text-[10px] rounded outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#a1a1aa',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <option value="L">L</option>
                    <option value="R">R</option>
                    <option value="N">N</option>
                  </select>
                </div>
              ))}

              {/* Save Button */}
              <button
                onClick={addTransition}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(34,211,238,0.2)',
                  border: '1px solid rgba(34,211,238,0.5)',
                  color: '#67e8f9',
                }}
              >
                <Save className="h-3 w-3" />
                Save Transition
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Transitions */}
      <div className="space-y-2">
        {transitions.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-2.5 rounded-lg group hover:bg-white/[0.02] transition-all duration-300"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded" style={{ background: 'rgba(139,92,246,0.16)', color: '#c4b5fd' }}>
                  {t.currentState}
                </span>
                <ArrowRight className="h-3 w-3 text-violet-400/50" />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded" style={{ background: 'rgba(34,211,238,0.16)', color: '#67e8f9' }}>
                  {t.nextState}
                </span>
              </div>
              <button
                onClick={() => removeTransition(idx)}
                disabled={isRunning}
                className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-300 hover:bg-rose-500/20"
              >
                <Trash2 className="h-3 w-3 text-rose-400" />
              </button>
            </div>
            <div className="space-y-1">
              {t.readSymbols.map((read, tIdx) => (
                <div key={tIdx} className="flex items-center gap-2 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className="text-white/30 w-8">T{tIdx + 1}:</span>
                  <span className="text-white/60">{read}</span>
                  <ArrowRight className="h-2 w-2 text-white/20" />
                  <span className="text-cyan-400">{t.writeSymbols[tIdx]}</span>
                  <span className="text-violet-400 ml-auto">{t.moveDirections[tIdx]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {transitions.length === 0 && !isAdding && (
        <div className="text-center py-8 text-white/30 text-sm">
          No transitions defined. Click "Add" to create one.
        </div>
      )}
    </div>
  );
}
