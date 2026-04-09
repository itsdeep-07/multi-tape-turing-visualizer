import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Info, Wand2 } from 'lucide-react';
import { TMConfiguration } from './configuration-panel';
import { Transition } from '../types/turing-machine';
import { compileSimplePatternToTM } from '../utils/regex-compiler';

const glass: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

interface LanguageTestPanelProps {
  config: TMConfiguration;
  onApplyLanguage: (newConfig: TMConfiguration, transitions: Transition[], testInput: string[]) => void;
  isRunning: boolean;
}

interface LanguagePreset {
  name: string;
  description: string;
  pattern: string;
  numTapes: number;
  mode: 'multi-tape' | 'multi-head';
  alphabet: string[];
  states: string[];
  transitions: Transition[];
  testInput: string[];
}

const languagePresets: LanguagePreset[] = [
  {
    name: 'Copy String (a^n → a^n a^n)',
    description: 'Copies input from tape 1 to tape 2',
    pattern: 'a^n → a^n a^n',
    numTapes: 2,
    mode: 'multi-tape',
    alphabet: ['a', 'b'],
    states: ['q0', 'q1', 'q2', 'qaccept', 'qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'q0', writeSymbols: ['b', 'b'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
    ],
    testInput: ['aaabbb', ''],
  },
  {
    name: 'Palindrome Check',
    description: 'Checks if input is a palindrome',
    pattern: 'w = w^R',
    numTapes: 2,
    mode: 'multi-tape',
    alphabet: ['a', 'b', '0', '1'],
    states: ['q0', 'q1', 'q2', 'qaccept', 'qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'q0', writeSymbols: ['b', 'b'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'q1', writeSymbols: ['_', '_'], moveDirections: ['L', 'L'] },
      { currentState: 'q1', readSymbols: ['a', 'a'], nextState: 'q1', writeSymbols: ['a', 'a'], moveDirections: ['L', 'L'] },
      { currentState: 'q1', readSymbols: ['b', 'b'], nextState: 'q1', writeSymbols: ['b', 'b'], moveDirections: ['L', 'L'] },
      { currentState: 'q1', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
    ],
    testInput: ['abba', ''],
  },
  {
    name: 'a^n b^n c^n',
    description: 'Recognizes language {a^n b^n c^n | n ≥ 0}',
    pattern: 'a^n b^n c^n',
    numTapes: 3,
    mode: 'multi-tape',
    alphabet: ['a', 'b', 'c', 'X', 'Y', 'Z'],
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'qaccept', 'qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_', '_'], nextState: 'q1', writeSymbols: ['X', 'a', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q1', readSymbols: ['a', '_', '_'], nextState: 'q1', writeSymbols: ['a', 'a', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q1', readSymbols: ['b', '_', '_'], nextState: 'q2', writeSymbols: ['Y', 'b', '_'], moveDirections: ['R', 'N', 'R'] },
      { currentState: 'q2', readSymbols: ['b', '_', '_'], nextState: 'q2', writeSymbols: ['b', 'b', 'b'], moveDirections: ['R', 'N', 'R'] },
      { currentState: 'q2', readSymbols: ['c', '_', '_'], nextState: 'q3', writeSymbols: ['Z', '_', 'c'], moveDirections: ['R', 'N', 'R'] },
      { currentState: 'q3', readSymbols: ['c', '_', '_'], nextState: 'q3', writeSymbols: ['c', '_', 'c'], moveDirections: ['R', 'N', 'R'] },
      { currentState: 'q3', readSymbols: ['_', '_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_', '_'], moveDirections: ['N', 'N', 'N'] },
    ],
    testInput: ['aaabbbccc', '', ''],
  },
  {
    name: 'Multi-Head: String Reversal',
    description: 'Reverse string using 2 heads on 1 tape',
    pattern: 'w → w^R',
    numTapes: 2,
    mode: 'multi-head',
    alphabet: ['a', 'b', '0', '1'],
    states: ['q0', 'q1', 'q2', 'qaccept', 'qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', '_'], moveDirections: ['R', 'N'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'q0', writeSymbols: ['b', '_'], moveDirections: ['R', 'N'] },
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'q1', writeSymbols: ['_', '_'], moveDirections: ['L', 'R'] },
      { currentState: 'q1', readSymbols: ['a', '_'], nextState: 'q1', writeSymbols: ['a', 'a'], moveDirections: ['L', 'R'] },
      { currentState: 'q1', readSymbols: ['b', '_'], nextState: 'q1', writeSymbols: ['b', 'b'], moveDirections: ['L', 'R'] },
      { currentState: 'q1', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
    ],
    testInput: ['abba'],
  },
];

export function LanguageTestPanel({ config, onApplyLanguage, isRunning }: LanguageTestPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [customPattern, setCustomPattern] = useState('');

  const handleApplyPreset = (preset: LanguagePreset, idx: number) => {
    const newConfig: TMConfiguration = {
      ...config,
      numTapes: preset.numTapes,
      mode: preset.mode,
      alphabet: preset.alphabet,
      states: preset.states,
      startPositions: Array(preset.numTapes).fill(0),
    };
    onApplyLanguage(newConfig, preset.transitions, preset.testInput);
    setSelectedPreset(idx);
  };

  const handleGenerateCustom = () => {
    if (!customPattern || isRunning) return;
    
    try {
      const generated = compileSimplePatternToTM(customPattern);
      const newConfig: TMConfiguration = {
        ...config,
        numTapes: generated.numTapes,
        mode: 'multi-tape',
        alphabet: generated.alphabet,
        states: generated.states,
        startPositions: [0],
      };
      
      onApplyLanguage(newConfig, generated.transitions, generated.testInput);
      setSelectedPreset(null);
    } catch (e) {
      console.error("Failed to generate TM from pattern", e);
      alert("Invalid pattern. Try something simple like 'a*b' or '10*1'");
    }
  };

  return (
    <div style={glass} className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Language Tests & Generator
          </span>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 rounded-lg transition-all duration-300 hover:bg-white/5"
        >
          <Info className="h-3.5 w-3.5 text-white/40" />
        </button>
      </div>

      {showInfo && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-2.5 rounded-lg text-[10px] text-white/60 leading-relaxed bg-cyan-400/10 border border-cyan-400/20"
        >
          <span className="font-bold text-cyan-400">Custom Generator:</span> Type a simple pattern like <code className="text-violet-300">a*b*c</code> or <code className="text-violet-300">01*0</code> and the app will generate a 1-Tape Turing Machine that accepts it.
        </motion.div>
      )}

      {/* Custom Generator Input Area */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">
          Custom Pattern Generator
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            placeholder="e.g. a*b*c or 01*0"
            disabled={isRunning}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleGenerateCustom}
            disabled={isRunning || !customPattern}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-violet-300 bg-violet-500/20 border border-violet-500/30 hover:bg-violet-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Wand2 className="h-3 w-3" />
            Generate
          </button>
        </div>
      </div>

      {/* Existing Presets Grid */}
      <div className="grid grid-cols-2 gap-2">
        {languagePresets.map((preset, idx) => (
          <motion.button
            key={idx}
            onClick={() => !isRunning && handleApplyPreset(preset, idx)}
            disabled={isRunning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden p-3 rounded-xl text-left transition-all duration-300 disabled:opacity-50"
            style={{
              background:
                selectedPreset === idx
                  ? 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(139,92,246,0.15) 100%)'
                  : 'rgba(255,255,255,0.03)',
              border:
                selectedPreset === idx
                  ? '1px solid rgba(244,63,94,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs font-bold text-white/80 mb-0.5">{preset.name}</div>
                  <div className="text-[9px] text-white/40">{preset.description}</div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                    style={{
                      background: 'rgba(34,211,238,0.15)',
                      color: '#67e8f9',
                    }}
                  >
                    {preset.numTapes}T
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                    style={{
                      background: preset.mode === 'multi-tape' ? 'rgba(34,211,238,0.15)' : 'rgba(139,92,246,0.15)',
                      color: preset.mode === 'multi-tape' ? '#67e8f9' : '#c4b5fd',
                    }}
                  >
                    {preset.mode === 'multi-tape' ? 'MT' : 'MH'}
                  </span>
                </div>
              </div>

              {/* Pattern */}
              <div
                className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#a1a1aa',
                }}
              >
                {preset.pattern}
              </div>

              {/* Apply Button */}
              <div className="mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-300 group-hover:bg-white/5">
                <Play className="h-3 w-3 text-rose-400" />
                <span className="text-rose-400">Load & Test</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}