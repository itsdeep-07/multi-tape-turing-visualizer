import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, RotateCcw, FastForward, Hexagon, Code, BarChart3, GitBranch, Layers, Grid3x3, Settings2, FlaskConical, ChevronRight, X } from 'lucide-react';
import { TuringMachine } from './utils/turing-machine';
import { TuringMachineConfig, Transition } from './types/turing-machine';
import { TapeVisualizer } from './components/tape-visualizer';
import { MultiHeadVisualizer } from './components/multi-head-visualizer';
import { StateDisplay } from './components/state-display';
import { TransitionTable } from './components/transition-table';
import { StateDiagram } from './components/state-diagram';
import { PerformanceComparison } from './components/performance-comparison';
import { TransitionEditor } from './components/transition-editor';
import { TransitionIndicator } from './components/transition-indicator';
import { LanguageTester, languagePresets } from './components/language-tester';
import { TagInput } from './components/tag-input';
import { OnboardingTour } from './components/onboarding-tour';

interface TMConfiguration {
  numTapes: number;
  mode: 'multi-tape' | 'multi-head';
  startPositions: number[];
  alphabet: string[];
  blankSymbol: string;
  states: string[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];
}

const glass: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

const speedToDelay = (speed: number) => Math.round(200 / speed);

type ViewMode = 'tour-transitions' | 'diagram' | 'performance' | 'languages';

function App() {
  const [tmConfig, setTmConfig] = useState<TMConfiguration>({
    numTapes: 1,
    mode: 'multi-tape',
    startPositions: [0],
    alphabet: ['0', '1'],
    blankSymbol: '_',
    states: ['q0', 'qaccept', 'qreject'],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
  });

  const [transitions, setTransitions] = useState<Transition[]>([]);

  const [tapeInputs, setTapeInputs] = useState<string[]>(['']);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [showConfig, setShowConfig] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<string>('custom');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tourActiveRef = useRef(false);

  const [machine, setMachine] = useState<TuringMachine>(() => {
    const config: TuringMachineConfig = {
      numTapes: tmConfig.numTapes,
      mode: tmConfig.mode,
      states: tmConfig.states,
      alphabet: tmConfig.alphabet,
      tapeAlphabet: [...tmConfig.alphabet, tmConfig.blankSymbol],
      blankSymbol: tmConfig.blankSymbol,
      initialState: tmConfig.initialState,
      acceptStates: tmConfig.acceptStates,
      rejectStates: tmConfig.rejectStates,
      transitions,
      startPositions: tmConfig.startPositions,
    };
    return new TuringMachine(config, tapeInputs);
  });
  const [machineState, setMachineState] = useState(machine.getState());

  useEffect(() => {
    const config: TuringMachineConfig = {
      numTapes: tmConfig.numTapes,
      mode: tmConfig.mode,
      states: tmConfig.states,
      alphabet: tmConfig.alphabet,
      tapeAlphabet: [...tmConfig.alphabet, tmConfig.blankSymbol],
      blankSymbol: tmConfig.blankSymbol,
      initialState: tmConfig.initialState,
      acceptStates: tmConfig.acceptStates,
      rejectStates: tmConfig.rejectStates,
      transitions,
      startPositions: tmConfig.startPositions,
    };
    const newMachine = new TuringMachine(config, tapeInputs);
    setMachine(newMachine);
    setMachineState(newMachine.getState());
    setIsRunning(false);
  }, [tmConfig, transitions, tapeInputs]);

  const handlePlay = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStep = () => {
    machine.step();
    setMachineState(machine.getState());
  };
  const handleStepBack = () => {
    machine.stepBack();
    setMachineState(machine.getState());
  };
  const handleReset = () => {
    machine.reset(tapeInputs);
    setMachineState(machine.getState());
    setIsRunning(false);
  };

  const handleLoadPreset = (preset: any) => {
    setTmConfig({
      numTapes: preset.numTapes,
      mode: preset.mode,
      startPositions: Array(preset.numTapes).fill(0),
      alphabet: preset.alphabet,
      blankSymbol: '_',
      states: preset.states,
      initialState: preset.initialState,
      acceptStates: preset.acceptStates,
      rejectStates: preset.rejectStates,
    });
    setTransitions(preset.transitions);
    const testCase = preset.testCases[0];
    const newTapeInputs = Array(preset.numTapes).fill('');
    if (testCase?.inputs) {
      testCase.inputs.forEach((val: string, i: number) => {
        if (i < preset.numTapes) newTapeInputs[i] = val;
      });
    } else if (testCase?.input) {
      newTapeInputs[0] = testCase.input;
    }
    setTapeInputs(newTapeInputs);
  };

  const handleCustomReset = () => {
    setSelectedProblem('custom');
    setTmConfig({
      numTapes: 1,
      mode: 'multi-tape',
      startPositions: [0],
      alphabet: ['0', '1'],
      blankSymbol: '_',
      states: ['q0', 'qaccept', 'qreject'],
      initialState: 'q0',
      acceptStates: ['qaccept'],
      rejectStates: ['qreject'],
    });
    setTransitions([]);
    setTapeInputs(['']);
  };

  const handleSelectProblem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === 'custom') {
      handleCustomReset();
    } else {
      const preset = languagePresets.find(p => p.id === id);
      if (preset) {
        setSelectedProblem(id);
        handleLoadPreset(preset);
      }
    }
    setShowConfig(true);
  };

  useEffect(() => {
    if (isRunning) {
      const delay = speedToDelay(speed);
      intervalRef.current = setInterval(() => {
        const canContinue = machine.step();
        setMachineState(machine.getState());
        if (!canContinue) setIsRunning(false);
      }, delay);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speed, machine]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (machineState.isHalted) return;
        if (isRunning) {
          handlePause();
        } else {
          handlePlay();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (machine.canStepBack()) {
          handleStepBack();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!machineState.isHalted) {
          handleStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, machineState.isHalted, machine]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sectionItems = [
    { id: 'tour-transitions' as ViewMode, icon: Code, label: 'Transition Graph' },
    { id: 'diagram' as ViewMode, icon: GitBranch, label: 'State Diagram' },
    { id: 'performance' as ViewMode, icon: BarChart3, label: 'Performance' },
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col relative bg-[#020108]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' }}>
        <motion.div animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <motion.div animate={{ x: [-50, 50, -50], y: [-50, 50, -50], scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-30 blur-[100px]" style={{ background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)' }} />
        <motion.div animate={{ x: [50, -50, 50], y: [50, -50, 50], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/3 -right-60 h-[700px] w-[700px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 flex shrink-0 items-center justify-between border-b px-6 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'linear-gradient(180deg, rgba(2,1,8,0.9) 0%, rgba(2,1,8,0.4) 100%)', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center gap-4">
          <Hexagon className="h-7 w-7 text-violet-400" />
          <div>
            <h1 className="text-lg font-bold text-white">Multi-Tape <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #0ea5e9)' }}>Turing Machine</span></h1>
            <span className="text-[11px] text-white/40">Educational Visualizer</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] px-5 py-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" style={{ opacity: isRunning ? 1 : 0.2 }} />
            <span className="text-sm font-semibold text-zinc-300 uppercase">{isRunning ? 'Running' : 'Idle'}</span>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <div className="relative z-10 flex flex-1 min-h-0 flex-col">

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Config Panel */}
          <div id="tour-config" className="shrink-0 overflow-hidden">
            <div className="p-4 border-b relative" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(2,1,8,0.3)' }}>
                  
              {/* Persistent Header: Problem & Toggle */}
              <div className="flex items-center gap-6" style={{ borderBottom: showConfig ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: showConfig ? '16px' : '0', marginBottom: showConfig ? '16px' : '0', transition: 'all 0.3s' }}>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-white/40 whitespace-nowrap">Problem:</label>
                  <select 
                    value={selectedProblem} 
                    onChange={handleSelectProblem}
                    disabled={isRunning}
                    className="bg-zinc-900 border border-white/20 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-100 outline-none focus:border-white/50 min-w-[300px] transition-all hover:bg-zinc-800 cursor-pointer"
                  >
                    <option value="custom" className="bg-zinc-900 text-white">Custom (Empty Reset)</option>
                    {languagePresets.map(p => (
                      <option key={p.id} value={p.id} className="bg-zinc-900 text-white">[{p.mode.toUpperCase()}] {p.name} — {p.notation}</option>
                    ))}
                  </select>
                </div>
                
                <button onClick={() => {
                  setShowConfig(!showConfig);
                }} className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-white/10 text-white/50 hover:text-white group`}>
                  {showConfig ? (
                    <><span className="text-xs font-bold uppercase tracking-wider">Collapse</span> <X className="h-5 w-5 group-hover:scale-110 transition-transform text-rose-400" /></>
                  ) : (
                    <><span className="text-xs font-bold uppercase tracking-wider">Customize</span> <Settings2 className="h-5 w-5 group-hover:scale-110 transition-transform" /></>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {showConfig && (
                  <motion.div initial={false} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-4 gap-3">
                    {/* Mode */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Mode</label>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          if (isRunning) return;
                          setTmConfig({ ...tmConfig, mode: 'multi-tape' });
                        }} disabled={isRunning}
                          className="flex-1 px-4 text-sm font-semibold rounded transition-all hover:scale-105 disabled:opacity-50 min-h-[42px]"
                          style={{ background: tmConfig.mode === 'multi-tape' ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)', color: tmConfig.mode === 'multi-tape' ? '#67e8f9' : 'rgba(255,255,255,0.5)' }}>
                          Multi-Tape
                        </button>
                        <button onClick={() => {
                          if (isRunning) return;
                          setTmConfig({ ...tmConfig, mode: 'multi-head' });
                          setTapeInputs(Array(tmConfig.numTapes).fill('')); // Hard reset for UI consistency
                        }} disabled={isRunning}
                          className="flex-1 px-4 text-sm font-semibold rounded transition-all hover:scale-105 disabled:opacity-50 min-h-[42px]"
                          style={{ background: tmConfig.mode === 'multi-head' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', color: tmConfig.mode === 'multi-head' ? '#c4b5fd' : 'rgba(255,255,255,0.5)' }}>
                          Multi-Head
                        </button>
                      </div>
                    </div>

                    {/* Num Tapes */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Count</label>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          if (isRunning || tmConfig.numTapes <= 1) return;
                          setTmConfig({ ...tmConfig, numTapes: tmConfig.numTapes - 1, startPositions: tmConfig.startPositions.slice(0, -1) });
                          setTapeInputs(tapeInputs.slice(0, -1));
                        }} disabled={isRunning || tmConfig.numTapes <= 1}
                          className="w-[42px] flex items-center justify-center rounded font-bold transition-all hover:scale-110 disabled:opacity-30 text-base min-h-[42px]"
                          style={{ background: 'rgba(244,63,94,0.18)', color: '#fb7185' }}>−</button>
                        <div className="flex-1 flex items-center justify-center rounded font-bold text-base min-h-[42px]" style={{ background: 'rgba(34,211,238,0.1)', color: '#67e8f9', fontFamily: "'JetBrains Mono', monospace" }}>{tmConfig.numTapes}</div>
                        <button onClick={() => {
                          if (isRunning || tmConfig.numTapes >= 10) return;
                          setTmConfig({ ...tmConfig, numTapes: tmConfig.numTapes + 1, startPositions: [...tmConfig.startPositions, 0] });
                        }} disabled={isRunning || tmConfig.numTapes >= 10}
                          className="w-[42px] flex items-center justify-center rounded font-bold transition-all hover:scale-110 disabled:opacity-30 text-base min-h-[42px]"
                          style={{ background: 'rgba(34,211,238,0.18)', color: '#67e8f9' }}>+</button>
                      </div>
                    </div>

                    {/* Alphabet */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Alphabet</label>
                      <TagInput tags={tmConfig.alphabet} onChange={(tags) => setTmConfig({ ...tmConfig, alphabet: tags })} disabled={isRunning} />
                    </div>

                    {/* Blank Symbol */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Blank Symbol</label>
                      <input type="text" value={tmConfig.blankSymbol} onChange={(e) => !isRunning && e.target.value.length <= 1 && setTmConfig({ ...tmConfig, blankSymbol: e.target.value || '_' })} disabled={isRunning} maxLength={1}
                        className="w-full px-4 text-base rounded outline-none text-center min-h-[42px]" style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }} />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {/* All States */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">All States</label>
                      <TagInput tags={tmConfig.states} onChange={(tags) => setTmConfig({ ...tmConfig, states: tags })} disabled={isRunning} />
                    </div>

                    {/* Initial State */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Initial State</label>
                      <input type="text" value={tmConfig.initialState} onChange={(e) => {
                        if (isRunning) return;
                        setTmConfig({ ...tmConfig, initialState: e.target.value.trim() });
                      }} disabled={isRunning}
                        className="w-full px-4 text-base rounded outline-none min-h-[42px]" style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }} />
                    </div>

                    {/* Accept States */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Accept States</label>
                      <TagInput tags={tmConfig.acceptStates} onChange={(tags) => setTmConfig({ ...tmConfig, acceptStates: tags })} disabled={isRunning} />
                    </div>

                    {/* Reject States */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Reject States</label>
                      <TagInput tags={tmConfig.rejectStates} onChange={(tags) => setTmConfig({ ...tmConfig, rejectStates: tags })} disabled={isRunning} />
                    </div>
                  </div>

                  {/* Start Positions */}
                  <div className="mt-3 space-y-1.5">
                    <label className="text-sm font-semibold uppercase tracking-wider text-white/40">Start Positions (per {tmConfig.mode === 'multi-tape' ? 'tape' : 'head'})</label>
                    <div className="flex gap-2">
                      {tmConfig.startPositions.map((pos, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-sm text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{idx + 1}:</span>
                          <input type="number" value={pos} onChange={(e) => {
                            const newPos = [...tmConfig.startPositions];
                            newPos[idx] = parseInt(e.target.value) || 0;
                            setTmConfig({ ...tmConfig, startPositions: newPos });
                          }} disabled={isRunning} className="w-20 px-4 text-base rounded outline-none text-center min-h-[42px]"
                            style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Main Area */}
          <div 
            className="flex-1 min-h-0 px-4 pb-4 pt-4 space-y-3 overflow-y-auto"
            data-main-scroll
            style={{ scrollbarWidth: 'thin' }}
            onScroll={(e) => {
              if (showConfig && e.currentTarget.scrollTop > 50 && !tourActiveRef.current) {
                setShowConfig(false);
              }
            }}
          >
            {/* Inputs */}
            <div style={glass} className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-semibold uppercase tracking-widest text-white/40">Input Strings</span>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(tmConfig.numTapes, 4)}, 1fr)` }}>
                {Array.from({ length: tmConfig.numTapes }).map((_, idx) => {
                  const val = tapeInputs[idx] || '';
                  const isInvalid = [...val].some(c => !tmConfig.alphabet.includes(c) && c !== tmConfig.blankSymbol);
                  return (
                  <div key={idx}>
                    <label className="text-sm text-white/40 mb-1.5 flex items-center justify-between font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span>{tmConfig.mode === 'multi-tape' ? `Tape ${idx + 1}` : `Head ${idx + 1}`}</span>
                      {isInvalid && <span className="text-rose-400 text-xs">Invalid symbol</span>}
                    </label>
                    <input type="text" value={val} onChange={(e) => {
                      const newInputs = [...tapeInputs];
                      newInputs[idx] = e.target.value;
                      setTapeInputs(newInputs);
                    }} disabled={isRunning} placeholder="empty" className="w-full px-4 py-3 text-base rounded-lg outline-none"
                      style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.05)', border: isInvalid ? '1px solid rgba(244,63,94,0.6)' : '1px solid rgba(255,255,255,0.08)', color: isInvalid ? '#fb7185' : '#a1a1aa' }} />
                  </div>
                )})}
              </div>
            </div>

            {/* Tapes */}
            <div id="tour-tape" style={glass} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Grid3x3 className="h-5 w-5 text-violet-400" />
                  <span className="text-sm font-semibold uppercase tracking-widest text-white/40">{tmConfig.mode === 'multi-head' ? 'Multi-Head Tape' : 'Tape State'}</span>
                </div>
              </div>

              <TransitionIndicator transition={machineState.lastTransition} blankSymbol={tmConfig.blankSymbol} isHalted={machineState.isHalted} isAccepted={machineState.isAccepted} />

              {tmConfig.mode === 'multi-head' ? (
                <MultiHeadVisualizer tape={machineState.tapes[0]} heads={machineState.tapes.map((t) => t.headPosition)} blankSymbol={tmConfig.blankSymbol} isActive={!machineState.isHalted} mode={tmConfig.mode} currentState={machineState.currentState} />
              ) : (
                <div className="space-y-4">
                  {machineState.tapes.map((tape, idx) => (
                    <TapeVisualizer key={idx} tape={tape} tapeIndex={idx} blankSymbol={tmConfig.blankSymbol} isActive={!machineState.isHalted} currentState={machineState.currentState} />
                  ))}
                </div>
              )}

              {/* Status below tapes */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <StateDisplay machineState={machineState} acceptStates={tmConfig.acceptStates} rejectStates={tmConfig.rejectStates} />
              </div>
            </div>

            {/* Controls */}
            <div style={glass} className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleStepBack} disabled={!machine.canStepBack()} className="flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                    <SkipBack className="h-5 w-5" />Prev
                  </button>
                  {isRunning ? (
                    <button onClick={handlePause} className="flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all hover:scale-105"
                      style={{ background: 'rgba(244,63,94,0.18)', border: '1px solid rgba(244,63,94,0.4)', color: '#fb7185' }}>
                      <Pause className="h-5 w-5" />Pause
                    </button>
                  ) : (
                    <button onClick={handlePlay} disabled={machineState.isHalted} className="flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-30"
                      style={{ background: 'rgba(34,211,238,0.18)', border: '1px solid rgba(34,211,238,0.4)', color: '#67e8f9' }}>
                      <Play className="h-5 w-5" />Play
                    </button>
                  )}
                  <button onClick={handleStep} disabled={machineState.isHalted} className="flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-30"
                    style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
                    <FastForward className="h-5 w-5" />Next
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                    <RotateCcw className="h-5 w-5" />Reset
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/60 uppercase font-semibold">Speed</span>
                  <input type="range" min="0.1" max="1" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-32" />
                  <span className="text-base text-cyan-400 font-semibold w-12">{speed.toFixed(1)}x</span>
                </div>
              </div>
            </div>

            {/* Horizontal Section Menu */}
            <div style={glass} className="px-6 py-4">
              <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="flex items-center gap-2.5 px-6 py-3 rounded-lg text-base font-semibold transition-all hover:scale-[1.03] whitespace-nowrap"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Static Single Page Flow instead of Tabs */}
            <div className="space-y-6 pb-20">
                <div id="tour-transitions" className="scroll-mt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <TransitionEditor transitions={transitions} numTapes={tmConfig.numTapes} states={tmConfig.states} alphabet={[...tmConfig.alphabet]} blankSymbol={tmConfig.blankSymbol} onChange={setTransitions} isRunning={isRunning} />
                    <TransitionTable transitions={transitions} currentState={machineState.currentState} lastTransition={machineState.lastTransition} numTapes={tmConfig.numTapes} blankSymbol={tmConfig.blankSymbol} />
                  </div>
                </div>

                <div id="diagram" className="scroll-mt-6">
                  <StateDiagram config={{ numTapes: tmConfig.numTapes, states: tmConfig.states, alphabet: tmConfig.alphabet, tapeAlphabet: [...tmConfig.alphabet, tmConfig.blankSymbol],
                    blankSymbol: tmConfig.blankSymbol, initialState: tmConfig.initialState, acceptStates: tmConfig.acceptStates, rejectStates: tmConfig.rejectStates, transitions }}
                    currentState={machineState.currentState} lastTransition={machineState.lastTransition} />
                </div>

                <div id="performance" className="scroll-mt-6">
                  <PerformanceComparison numTapes={tmConfig.numTapes} currentSteps={machineState.stepCount} mode={tmConfig.mode} />
                </div>
            </div>
          </div>
        </div>
      </div>
      <OnboardingTour
        onStepChange={(step) => {
          tourActiveRef.current = true;
          if (step === 0) setShowConfig(true);
        }}
        onDismiss={() => { 
          setShowConfig(true);
          // Ensure we scroll back to the top so the config panel is visible and doesn't auto-collapse
          const sc = document.querySelector('[data-main-scroll]');
          if (sc) {
            sc.scrollTo({ top: 0, behavior: 'smooth' });
            // Wait for scroll to finish before re-enabling auto-collapse
            setTimeout(() => { tourActiveRef.current = false; }, 800);
          } else {
            tourActiveRef.current = false;
          }
        }}
      />
    </div>
  );
}

export default App;
