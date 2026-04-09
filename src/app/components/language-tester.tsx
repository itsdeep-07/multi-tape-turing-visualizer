import { useState } from 'react';
import { motion } from 'motion/react';
import { FlaskConical, CheckCircle2, XCircle, Info, BookOpen, Wand2 } from 'lucide-react';
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

interface LanguagePreset {
  id: string;
  name: string;
  notation: string;
  description: string;
  grammarType: 'Regular' | 'CFG' | 'CSG';
  numTapes: number;
  alphabet: string[];
  states: string[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];
  transitions: Transition[];
  testCases: Array<{ input: string; shouldAccept: boolean; description: string }>;
}

const languagePresets: LanguagePreset[] = [
  {
    id: 'anbn',
    name: 'a^n b^n',
    notation: 'L = { a^n b^n | n ≥ 1 }',
    description: 'Equal number of a\'s followed by equal number of b\'s',
    grammarType: 'CFG',
    numTapes: 2,
    alphabet: ['a', 'b'],
    states: ['q0', 'q1', 'qaccept', 'qreject'],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'X'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'q1', readSymbols: ['b', 'X'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['R', 'L'] },
      { currentState: 'q1', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q1', readSymbols: ['_', 'X'], nextState: 'qreject', writeSymbols: ['_', 'X'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: 'ab', shouldAccept: true, description: 'n=1' },
      { input: 'aabb', shouldAccept: true, description: 'n=2' },
      { input: 'aab', shouldAccept: false, description: 'Unequal a and b' },
    ],
  },
  {
    id: 'palindrome',
    name: 'Palindrome',
    notation: 'L = { w w^R | w ∈ {a,b}* }',
    description: 'Strings that read the same forwards and backwards',
    grammarType: 'CFG',
    numTapes: 2,
    alphabet: ['a', 'b'],
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'qaccept', 'qreject'],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'q0', writeSymbols: ['b', 'b'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'q1', writeSymbols: ['_', '_'], moveDirections: ['L', 'N'] },
      { currentState: 'q1', readSymbols: ['a', '_'], nextState: 'q1', writeSymbols: ['a', '_'], moveDirections: ['L', 'N'] },
      { currentState: 'q1', readSymbols: ['b', '_'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['L', 'N'] },
      { currentState: 'q1', readSymbols: ['_', '_'], nextState: 'q2', writeSymbols: ['_', '_'], moveDirections: ['R', 'L'] },
      { currentState: 'q2', readSymbols: ['a', 'a'], nextState: 'q2', writeSymbols: ['a', 'a'], moveDirections: ['N', 'L'] },
      { currentState: 'q2', readSymbols: ['b', 'b'], nextState: 'q2', writeSymbols: ['b', 'b'], moveDirections: ['N', 'L'] },
      { currentState: 'q2', readSymbols: ['a', '_'], nextState: 'q3', writeSymbols: ['a', '_'], moveDirections: ['N', 'R'] },
      { currentState: 'q2', readSymbols: ['b', '_'], nextState: 'q3', writeSymbols: ['b', '_'], moveDirections: ['N', 'R'] },
      { currentState: 'q2', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q3', readSymbols: ['a', 'a'], nextState: 'q4', writeSymbols: ['a', 'X'], moveDirections: ['R', 'L'] },
      { currentState: 'q3', readSymbols: ['b', 'b'], nextState: 'q4', writeSymbols: ['b', 'X'], moveDirections: ['R', 'L'] },
      { currentState: 'q3', readSymbols: ['_', 'X'], nextState: 'qaccept', writeSymbols: ['_', 'X'], moveDirections: ['N', 'N'] },
      { currentState: 'q4', readSymbols: ['a', 'X'], nextState: 'q4', writeSymbols: ['a', 'X'], moveDirections: ['N', 'L'] },
      { currentState: 'q4', readSymbols: ['b', 'X'], nextState: 'q4', writeSymbols: ['b', 'X'], moveDirections: ['N', 'L'] },
      { currentState: 'q4', readSymbols: ['a', 'a'], nextState: 'q3', writeSymbols: ['a', 'a'], moveDirections: ['N', 'N'] },
      { currentState: 'q4', readSymbols: ['b', 'b'], nextState: 'q3', writeSymbols: ['b', 'b'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: 'aba', shouldAccept: true, description: 'Odd palindrome' },
      { input: 'abba', shouldAccept: true, description: 'Even palindrome' },
      { input: 'abb', shouldAccept: false, description: 'Not palindrome' },
    ],
  },
  {
    id: 'anbncn',
    name: 'a^n b^n c^n',
    notation: 'L = { a^n b^n c^n | n ≥ 1 }',
    description: 'Equal number of a\'s, b\'s, and c\'s (Context Sensitive Grammar)',
    grammarType: 'CSG',
    numTapes: 2,
    alphabet: ['a', 'b', 'c'],
    states: ['q0', 'qr1', 'q1', 'qr2', 'q2', 'qaccept', 'qreject'],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'qr1', writeSymbols: ['b', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'qr1', readSymbols: ['b', 'a'], nextState: 'qr1', writeSymbols: ['b', 'a'], moveDirections: ['N', 'L'] },
      { currentState: 'qr1', readSymbols: ['b', '_'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['N', 'R'] },
      { currentState: 'q1', readSymbols: ['b', 'a'], nextState: 'q1', writeSymbols: ['b', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q1', readSymbols: ['c', '_'], nextState: 'qr2', writeSymbols: ['c', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'qr2', readSymbols: ['c', 'a'], nextState: 'qr2', writeSymbols: ['c', 'a'], moveDirections: ['N', 'L'] },
      { currentState: 'qr2', readSymbols: ['c', '_'], nextState: 'q2', writeSymbols: ['c', '_'], moveDirections: ['N', 'R'] },
      { currentState: 'q2', readSymbols: ['c', 'a'], nextState: 'q2', writeSymbols: ['c', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q2', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      
      // Explicit rejections (if unequal amounts, machine halts in non-accept state naturally, but defining some handles fails faster)
      { currentState: 'q1', readSymbols: ['b', '_'], nextState: 'qreject', writeSymbols: ['b', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q1', readSymbols: ['c', 'a'], nextState: 'qreject', writeSymbols: ['c', 'a'], moveDirections: ['N', 'N'] },
      { currentState: 'q2', readSymbols: ['c', '_'], nextState: 'qreject', writeSymbols: ['c', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q2', readSymbols: ['_', 'a'], nextState: 'qreject', writeSymbols: ['_', 'a'], moveDirections: ['N', 'N'] }
    ],
    testCases: [
      { input: 'abc', shouldAccept: true, description: 'n=1' },
      { input: 'aabbcc', shouldAccept: true, description: 'n=2' },
      { input: 'aabbc', shouldAccept: false, description: 'Unequal c' },
      { input: 'aabcc', shouldAccept: false, description: 'Unequal b' },
      { input: 'a', shouldAccept: false, description: 'Incomplete' },
    ],
  }
];

interface LanguageTesterProps {
  onLoadPreset: (preset: LanguagePreset) => void;
}

export function LanguageTester({ onLoadPreset }: LanguageTesterProps) {
  const [customPattern, setCustomPattern] = useState('');

  const handleGenerateCustom = () => {
    if (!customPattern) return;
    
    try {
      const generated = compileSimplePatternToTM(customPattern);
      
      const customPreset: LanguagePreset = {
        id: `custom-${Date.now()}`,
        name: `Custom Pattern`,
        notation: `Matches: ${customPattern}`,
        description: 'Auto-generated Turing Machine from your pattern input.',
        grammarType: 'Regular',
        numTapes: generated.numTapes,
        alphabet: generated.alphabet,
        states: generated.states,
        initialState: generated.states[0],
        acceptStates: ['qaccept'],
        rejectStates: ['qreject'],
        transitions: generated.transitions,
        testCases: [
          { input: generated.testInput[0], shouldAccept: true, description: 'Auto-generated valid test string' }
        ]
      };
      
      onLoadPreset(customPreset);
      setCustomPattern('');
    } catch (e) {
      console.error(e);
      alert("Invalid pattern. Try a simple sequence like 'a*b' or '10*1'.");
    }
  };

  return (
    <div style={glass} className="p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-violet-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Language Testing
          </span>
        </div>
      </div>

      {/* Custom Generator Input Area */}
      <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">
          Custom Pattern Generator
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            placeholder="e.g. a*b*c or 01*0"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleGenerateCustom}
            disabled={!customPattern}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-violet-300 bg-violet-500/20 border border-violet-500/30 hover:bg-violet-500/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Wand2 className="h-3 w-3" />
            Generate
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 p-3 rounded-lg border border-cyan-500/20" style={{ background: 'rgba(34,211,238,0.05)' }}>
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-cyan-400/90 leading-relaxed mb-1">
              <span className="font-bold">Formal Language Classification:</span>
            </p>
            <ul className="text-[9px] text-cyan-400/70 space-y-0.5 ml-2">
              <li>• <span className="text-emerald-400">Regular:</span> Can be recognized by finite automata (DFA/NFA)</li>
              <li>• <span className="text-yellow-400">CFG:</span> Context-Free Grammar, requires stack (PDA)</li>
              <li>• <span className="text-rose-400">CSG:</span> Context-Sensitive, requires Turing Machine</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Language Presets */}
      <div className="space-y-3">
        {languagePresets.map((preset) => (
          <motion.div
            key={preset.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-xl cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={() => onLoadPreset(preset)}
          >
            {/* Preset Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">{preset.name}</h3>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-bold"
                    style={{
                      background:
                        preset.grammarType === 'Regular'
                          ? 'rgba(16,185,129,0.15)'
                          : preset.grammarType === 'CFG'
                          ? 'rgba(234,179,8,0.15)'
                          : 'rgba(244,63,94,0.15)',
                      color:
                        preset.grammarType === 'Regular'
                          ? '#10b981'
                          : preset.grammarType === 'CFG'
                          ? '#eab308'
                          : '#f43f5e',
                    }}
                  >
                    {preset.grammarType}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-mono">{preset.notation}</p>
              </div>
              <div className="text-[9px] text-white/40 font-semibold">
                {preset.numTapes} Tape{preset.numTapes > 1 ? 's' : ''}
              </div>
            </div>

            {/* Description */}
            <p className="text-[10px] text-white/60 mb-3">{preset.description}</p>

            {/* Test Cases Preview */}
            <div className="space-y-1.5">
              <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Test Cases:</div>
              {preset.testCases.slice(0, 3).map((testCase, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[10px] p-1.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  {testCase.shouldAccept ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                  )}
                  <code className="font-mono text-violet-300">{testCase.input}</code>
                  <span className="text-white/40 text-[9px]">— {testCase.description}</span>
                </div>
              ))}
            </div>

            {/* Load Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-3 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(34,211,238,0.2) 100%)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#c4b5fd',
              }}
            >
              Load Configuration
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}