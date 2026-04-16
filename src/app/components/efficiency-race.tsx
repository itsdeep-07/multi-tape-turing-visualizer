import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, RotateCcw, FastForward, Medal } from 'lucide-react';
import { TuringMachine } from '../utils/turing-machine';
import { Transition, TuringMachineConfig } from '../types/turing-machine';
import { TapeVisualizer } from './tape-visualizer';
import { MultiHeadVisualizer } from './multi-head-visualizer';
import { languagePresets } from './language-tester';

const glass = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

// --- Single Tape Rules (Palindrome) ---
const stAlphabet = ['0', '1'];
const stStates = ['q0', 'q_scan_0', 'q_scan_1', 'q_check_0', 'q_check_1', 'q_return', 'qaccept', 'qreject'];
const singleTapeTransitions: Transition[] = [
  { currentState: 'q0', readSymbols: ['0'], nextState: 'q_scan_0', writeSymbols: ['_'], moveDirections: ['R'] },
  { currentState: 'q0', readSymbols: ['1'], nextState: 'q_scan_1', writeSymbols: ['_'], moveDirections: ['R'] },
  { currentState: 'q0', readSymbols: ['_'], nextState: 'qaccept', writeSymbols: ['_'], moveDirections: ['N'] },

  { currentState: 'q_scan_0', readSymbols: ['0'], nextState: 'q_scan_0', writeSymbols: ['0'], moveDirections: ['R'] },
  { currentState: 'q_scan_0', readSymbols: ['1'], nextState: 'q_scan_0', writeSymbols: ['1'], moveDirections: ['R'] },
  { currentState: 'q_scan_0', readSymbols: ['_'], nextState: 'q_check_0', writeSymbols: ['_'], moveDirections: ['L'] },

  { currentState: 'q_scan_1', readSymbols: ['0'], nextState: 'q_scan_1', writeSymbols: ['0'], moveDirections: ['R'] },
  { currentState: 'q_scan_1', readSymbols: ['1'], nextState: 'q_scan_1', writeSymbols: ['1'], moveDirections: ['R'] },
  { currentState: 'q_scan_1', readSymbols: ['_'], nextState: 'q_check_1', writeSymbols: ['_'], moveDirections: ['L'] },

  { currentState: 'q_check_0', readSymbols: ['0'], nextState: 'q_return', writeSymbols: ['_'], moveDirections: ['L'] },
  { currentState: 'q_check_0', readSymbols: ['1'], nextState: 'qreject', writeSymbols: ['1'], moveDirections: ['N'] },
  { currentState: 'q_check_0', readSymbols: ['_'], nextState: 'qaccept', writeSymbols: ['_'], moveDirections: ['N'] }, 

  { currentState: 'q_check_1', readSymbols: ['1'], nextState: 'q_return', writeSymbols: ['_'], moveDirections: ['L'] },
  { currentState: 'q_check_1', readSymbols: ['0'], nextState: 'qreject', writeSymbols: ['0'], moveDirections: ['N'] },
  { currentState: 'q_check_1', readSymbols: ['_'], nextState: 'qaccept', writeSymbols: ['_'], moveDirections: ['N'] },

  { currentState: 'q_return', readSymbols: ['0'], nextState: 'q_return', writeSymbols: ['0'], moveDirections: ['L'] },
  { currentState: 'q_return', readSymbols: ['1'], nextState: 'q_return', writeSymbols: ['1'], moveDirections: ['L'] },
  { currentState: 'q_return', readSymbols: ['_'], nextState: 'q0', writeSymbols: ['_'], moveDirections: ['R'] },
];

// --- Single Tape Rules (a^n b^n) ---
const anbnSTTransitions: Transition[] = [
  { currentState: 'q0', readSymbols: ['a'], nextState: 'q_scan_a', writeSymbols: ['X'], moveDirections: ['R'] },
  { currentState: 'q0', readSymbols: ['Y'], nextState: 'q_check_done', writeSymbols: ['Y'], moveDirections: ['R'] },
  { currentState: 'q0', readSymbols: ['_'], nextState: 'qaccept', writeSymbols: ['_'], moveDirections: ['N'] },

  { currentState: 'q_scan_a', readSymbols: ['a'], nextState: 'q_scan_a', writeSymbols: ['a'], moveDirections: ['R'] },
  { currentState: 'q_scan_a', readSymbols: ['Y'], nextState: 'q_scan_a', writeSymbols: ['Y'], moveDirections: ['R'] },
  { currentState: 'q_scan_a', readSymbols: ['b'], nextState: 'q_rewind', writeSymbols: ['Y'], moveDirections: ['L'] },

  { currentState: 'q_rewind', readSymbols: ['a'], nextState: 'q_rewind', writeSymbols: ['a'], moveDirections: ['L'] },
  { currentState: 'q_rewind', readSymbols: ['Y'], nextState: 'q_rewind', writeSymbols: ['Y'], moveDirections: ['L'] },
  { currentState: 'q_rewind', readSymbols: ['X'], nextState: 'q0', writeSymbols: ['X'], moveDirections: ['R'] },

  { currentState: 'q_check_done', readSymbols: ['Y'], nextState: 'q_check_done', writeSymbols: ['Y'], moveDirections: ['R'] },
  { currentState: 'q_check_done', readSymbols: ['_'], nextState: 'qaccept', writeSymbols: ['_'], moveDirections: ['N'] },
];

// --- Multi-Head Rules (a^n b^n) ---
const anbnMHTransitions: Transition[] = [
  { currentState: 'q0_setup', readSymbols: ['a', 'a'], nextState: 'q0_setup', writeSymbols: ['a', 'a'], moveDirections: ['N', 'R'] },
  { currentState: 'q0_setup', readSymbols: ['a', 'b'], nextState: 'q1_compare', writeSymbols: ['a', 'b'], moveDirections: ['N', 'N'] },
  { currentState: 'q0_setup', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
  
  { currentState: 'q1_compare', readSymbols: ['a', 'b'], nextState: 'q1_compare', writeSymbols: ['a', 'b'], moveDirections: ['R', 'R'] },
  { currentState: 'q1_compare', readSymbols: ['b', '_'], nextState: 'qaccept', writeSymbols: ['b', '_'], moveDirections: ['N', 'N'] },
];

export function EfficiencyRace() {
  const [activeProblem, setActiveProblem] = useState<'palindrome' | 'anbn'>('palindrome');
  const [inputStr, setInputStr] = useState('11000011');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(0.8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Machine Refs
  const stMachineRef = useRef<TuringMachine | null>(null);
  const mtMachineRef = useRef<TuringMachine | null>(null);
  const mhMachineRef = useRef<TuringMachine | null>(null);

  // Display States
  const [stState, setStState] = useState<any>(null);
  const [mtState, setMtState] = useState<any>(null);
  const [mhState, setMhState] = useState<any>(null);

  const initMachines = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (activeProblem === 'palindrome') {
      // --- Single Tape Config ---
      const stConfig: TuringMachineConfig = {
        numTapes: 1, mode: 'multi-tape', states: stStates, alphabet: stAlphabet,
        tapeAlphabet: ['0', '1', '_'], blankSymbol: '_', initialState: 'q0',
        acceptStates: ['qaccept'], rejectStates: ['qreject'], transitions: singleTapeTransitions, startPositions: [0]
      };
      stMachineRef.current = new TuringMachine(stConfig, [inputStr]);
      setStState(stMachineRef.current.getState());

      // --- Multi Tape Config ---
      const mtPreset = languagePresets.find(p => p.id === 'palindrome')!;
      const mtTransitions = mtPreset.transitions.map(t => ({
        ...t,
        readSymbols: t.readSymbols.map(s => s === 'a' ? '0' : s === 'b' ? '1' : s),
        writeSymbols: t.writeSymbols.map(s => s === 'a' ? '0' : s === 'b' ? '1' : s),
      }));
      const mtConfig: TuringMachineConfig = {
        numTapes: 2, mode: 'multi-tape', states: mtPreset.states, alphabet: ['0', '1'],
        tapeAlphabet: ['0', '1', '_'], blankSymbol: '_', initialState: mtPreset.initialState,
        acceptStates: mtPreset.acceptStates, rejectStates: mtPreset.rejectStates, transitions: mtTransitions, startPositions: [0, 0]
      };
      mtMachineRef.current = new TuringMachine(mtConfig, [inputStr, '']);
      setMtState(mtMachineRef.current.getState());

      // --- Multi Head Config ---
      const mhPreset = languagePresets.find(p => p.id === 'palindrome_multihead')!;
      const mhConfig: TuringMachineConfig = {
        numTapes: 2, mode: 'multi-head', states: mhPreset.states, alphabet: ['0', '1'],
        tapeAlphabet: ['0', '1', '_'], blankSymbol: '_', initialState: mhPreset.initialState,
        acceptStates: mhPreset.acceptStates, rejectStates: mhPreset.rejectStates, transitions: mhPreset.transitions, startPositions: [0, 0]
      };
      mhMachineRef.current = new TuringMachine(mhConfig, [inputStr, inputStr]); 
      setMhState(mhMachineRef.current.getState());
    } else {
      // --- a^n b^n ---

      const stConfig: TuringMachineConfig = {
        numTapes: 1, mode: 'multi-tape', states: ['q0', 'q_scan_a', 'q_scan_b', 'q_rewind', 'q_check_done', 'qaccept', 'qreject'], alphabet: ['a', 'b'],
        tapeAlphabet: ['a', 'b', 'X', 'Y', '_'], blankSymbol: '_', initialState: 'q0',
        acceptStates: ['qaccept'], rejectStates: ['qreject'], transitions: anbnSTTransitions, startPositions: [0]
      };
      stMachineRef.current = new TuringMachine(stConfig, [inputStr]);
      setStState(stMachineRef.current.getState());

      const mtPreset = languagePresets.find(p => p.id === 'anbn')!;
      const mtConfig: TuringMachineConfig = {
        numTapes: 2, mode: 'multi-tape', states: mtPreset.states, alphabet: ['a', 'b'],
        tapeAlphabet: ['a', 'b', 'X', 'Y', '_'], blankSymbol: '_', initialState: mtPreset.initialState,
        acceptStates: mtPreset.acceptStates, rejectStates: mtPreset.rejectStates, transitions: mtPreset.transitions, startPositions: [0, 0]
      };
      mtMachineRef.current = new TuringMachine(mtConfig, [inputStr, '']);
      setMtState(mtMachineRef.current.getState());

      const mhConfig: TuringMachineConfig = {
        numTapes: 2, mode: 'multi-head', states: ['q0_setup', 'q1_compare', 'qaccept', 'qreject'], alphabet: ['a', 'b'],
        tapeAlphabet: ['a', 'b', '_'], blankSymbol: '_', initialState: 'q0_setup',
        acceptStates: ['qaccept'], rejectStates: ['qreject'], transitions: anbnMHTransitions, startPositions: [0, 0]
      };
      mhMachineRef.current = new TuringMachine(mhConfig, [inputStr, inputStr]); 
      setMhState(mhMachineRef.current.getState());
    }
  };

  useEffect(() => {
    initMachines();
  }, [inputStr, activeProblem]);

  const handleStep = () => {
    let activecount = 0;
    if (stMachineRef.current && !stMachineRef.current.getState().isHalted) {
      stMachineRef.current.step();
      setStState(stMachineRef.current.getState());
      activecount++;
    }
    if (mtMachineRef.current && !mtMachineRef.current.getState().isHalted) {
      mtMachineRef.current.step();
      setMtState(mtMachineRef.current.getState());
      activecount++;
    }
    if (mhMachineRef.current && !mhMachineRef.current.getState().isHalted) {
      mhMachineRef.current.step();
      setMhState(mhMachineRef.current.getState());
      activecount++;
    }
    return activecount > 0;
  };

  useEffect(() => {
    if (isRunning) {
      const delay = Math.round(200 / speed);
      intervalRef.current = setInterval(() => {
        const hasMore = handleStep();
        if (!hasMore) setIsRunning(false);
      }, delay);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, speed]);

  const StatusBadge = ({ stateObj }: { stateObj: any }) => {
    if (!stateObj) return null;
    if (stateObj.isAccepted) return <span className="text-emerald-400 font-bold ml-2">Accepted!</span>;
    if (stateObj.isHalted) return <span className="text-rose-400 font-bold ml-2">Rejected</span>;
    return <span className="text-white/40 ml-2">Running...</span>;
  };

  return (
    <div style={glass} className="overflow-hidden mb-6">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between" style={{ background: 'rgba(2,1,8,0.3)' }}>
        <div className="flex items-center gap-3">
          <Medal className="h-5 w-5 text-rose-400" />
          <span className="text-sm font-semibold uppercase tracking-widest text-white/40">Live Efficiency Race</span>
          <div className="ml-4 flex gap-2">
            <button 
              onClick={() => { setActiveProblem('palindrome'); setInputStr('11000011'); }}
              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${activeProblem === 'palindrome' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
            >
              Palindrome Checker
            </button>
            <button 
              onClick={() => { setActiveProblem('anbn'); setInputStr('aaaaabbbbb'); }}
              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${activeProblem === 'anbn' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
            >
              a^n b^n
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={inputStr} 
            onChange={(e) => {
              const regex = activeProblem === 'palindrome' ? /[^01]/g : /[^ab]/g;
              const val = e.target.value.replace(regex, '');
              setInputStr(val);
            }}
            disabled={isRunning}
            className="w-48 px-3 py-1.5 text-sm rounded bg-black/40 border border-white/10 text-white font-mono outline-none focus:border-white/30"
            placeholder={activeProblem === 'palindrome' ? "e.g. 10101" : "e.g. aabb"}
          />
        </div>
      </div>

      <div className="p-6 grid gap-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
        
        {/* Single Tape */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/20">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center gap-6 shrink-0">
              <h3 className="font-bold text-white/80">Single-Tape Implementation</h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Total Steps</span>
                <div className="text-xl font-bold font-mono text-rose-400 bg-rose-500/10 px-3 py-0.5 rounded-md border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">{stState?.stepCount || 0}</div>
              </div>
            </div>
            <div className="w-24 text-right shrink-0"><StatusBadge stateObj={stState} /></div>
          </div>
          {stState && <TapeVisualizer tape={stState.tapes[0]} tapeIndex={0} blankSymbol="_" isActive={!stState.isHalted} currentState={stState.currentState} />}
        </div>

        {/* Multi Tape */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/20">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center gap-6 shrink-0">
              <h3 className="font-bold text-white/80">Multi-Tape Implementation <span className="text-cyan-400 text-xs ml-1">(2 Tapes)</span></h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Total Steps</span>
                <div className="text-xl font-bold font-mono text-cyan-400 bg-cyan-500/10 px-3 py-0.5 rounded-md border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]">{mtState?.stepCount || 0}</div>
              </div>
            </div>
            <div className="w-24 text-right shrink-0"><StatusBadge stateObj={mtState} /></div>
          </div>
          {mtState && mtState.tapes.map((t: any, i: number) => (
             <div key={i} className="mb-2 last:mb-0">
               <TapeVisualizer tape={t} tapeIndex={i} blankSymbol="_" isActive={!mtState.isHalted} currentState={mtState.currentState} />
             </div>
          ))}
        </div>

        {/* Multi Head */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/20">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center gap-6 shrink-0">
              <h3 className="font-bold text-white/80">Multi-Head Implementation <span className="text-violet-400 text-xs ml-1">(2 Heads)</span></h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Total Steps</span>
                <div className="text-xl font-bold font-mono text-violet-400 bg-violet-500/10 px-3 py-0.5 rounded-md border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">{mhState?.stepCount || 0}</div>
              </div>
            </div>
            <div className="w-24 text-right shrink-0"><StatusBadge stateObj={mhState} /></div>
          </div>
          {mhState && <MultiHeadVisualizer tape={mhState.tapes[0]} heads={mhState.tapes.map((t: any) => t.headPosition)} blankSymbol="_" isActive={!mhState.isHalted} mode={"multi-head"} currentState={mhState.currentState} />}
        </div>

      </div>

      {/* Unified Controls */}
      <div className="p-4 border-t border-white/[0.04] bg-black/40 flex items-center justify-between">
        <div className="flex gap-2">
          {isRunning ? (
            <button onClick={() => setIsRunning(false)} className="px-5 py-2 rounded bg-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/30 transition flex items-center gap-2 text-sm"><Pause className="w-4 h-4"/> Pause</button>
          ) : (
             <button onClick={() => setIsRunning(true)} className="px-5 py-2 rounded bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30 transition flex items-center gap-2 text-sm"><Play className="w-4 h-4"/> Run Race</button>
          )}
          <button onClick={handleStep} disabled={isRunning} className="px-5 py-2 rounded bg-white/5 text-white/70 font-bold hover:bg-white/10 transition flex items-center gap-2 text-sm disabled:opacity-30"><FastForward className="w-4 h-4"/> Step</button>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <button onClick={initMachines} className="px-5 py-2 rounded bg-white/5 text-white/70 font-bold hover:bg-white/10 transition flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4"/> Reset</button>
        </div>
        <div className="flex items-center gap-4 px-4">
          <span className="text-xs font-bold text-white/40 uppercase">Speed</span>
          <input type="range" min="0.1" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-24" />
        </div>
      </div>
    </div>
  );
}
