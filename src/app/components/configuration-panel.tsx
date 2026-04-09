import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Plus, Trash2, ChevronDown, Zap, Target } from 'lucide-react';

export interface TMConfiguration {
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

interface ConfigurationPanelProps {
  config: TMConfiguration;
  onChange: (config: TMConfiguration) => void;
  isRunning: boolean;
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

export function ConfigurationPanel({ config, onChange, isRunning }: ConfigurationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const updateConfig = (updates: Partial<TMConfiguration>) => {
    if (!isRunning) {
      onChange({ ...config, ...updates });
    }
  };

  return (
    <div style={glass} className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 transition-all duration-300 hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 360 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Settings className="h-4 w-4 text-violet-400" />
          </motion.div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Configuration
          </span>
          <div className="flex items-center gap-1.5 ml-3">
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(34,211,238,0.18)', color: '#67e8f9' }}
            >
              {config.numTapes}T
            </span>
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{ background: 'rgba(139,92,246,0.16)', color: '#c4b5fd' }}
            >
              {config.mode === 'multi-tape' ? 'MT' : 'MH'}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-white/30" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Tab Selector */}
              <div className="flex gap-2 mb-4 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <button
                  onClick={() => setActiveTab('basic')}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300"
                  style={{
                    background: activeTab === 'basic' ? 'rgba(139,92,246,0.2)' : 'transparent',
                    color: activeTab === 'basic' ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  <Zap className="inline h-3 w-3 mr-1.5" />
                  Basic
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300"
                  style={{
                    background: activeTab === 'advanced' ? 'rgba(139,92,246,0.2)' : 'transparent',
                    color: activeTab === 'advanced' ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  <Target className="inline h-3 w-3 mr-1.5" />
                  Advanced
                </button>
              </div>

              {/* Basic Tab */}
              {activeTab === 'basic' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Number of Tapes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Number of Tapes
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={config.numTapes}
                      onChange={(e) => {
                        const n = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                        const newStartPositions = Array.from({ length: n }, (_, i) => config.startPositions[i] ?? 0);
                        updateConfig({ numTapes: n, startPositions: newStartPositions });
                      }}
                      disabled={isRunning}
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  {/* Mode Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateConfig({ mode: 'multi-tape' })}
                        disabled={isRunning}
                        className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: config.mode === 'multi-tape' ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                          border: config.mode === 'multi-tape' ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: config.mode === 'multi-tape' ? '#67e8f9' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        Multi-Tape
                      </button>
                      <button
                        onClick={() => updateConfig({ mode: 'multi-head' })}
                        disabled={isRunning}
                        className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: config.mode === 'multi-head' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                          border: config.mode === 'multi-head' ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: config.mode === 'multi-head' ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        Multi-Head
                      </button>
                    </div>
                  </div>

                  {/* Starting Positions */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Starting Positions
                    </label>
                    <div className="space-y-1.5">
                      {Array.from({ length: config.numTapes }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-white/40 w-12" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {config.mode === 'multi-tape' ? `Tape ${idx + 1}:` : `Head ${idx + 1}:`}
                          </span>
                          <input
                            type="number"
                            value={config.startPositions[idx] ?? 0}
                            onChange={(e) => {
                              const newPositions = [...config.startPositions];
                              newPositions[idx] = parseInt(e.target.value) || 0;
                              updateConfig({ startPositions: newPositions });
                            }}
                            disabled={isRunning}
                            className="flex-1 px-2 py-1 text-xs rounded-md outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#a1a1aa',
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Alphabet */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Alphabet (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={config.alphabet.join(', ')}
                      onChange={(e) => {
                        const alphabet = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        updateConfig({ alphabet });
                      }}
                      disabled={isRunning}
                      placeholder="0, 1, a, b"
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  {/* Blank Symbol */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Blank Symbol
                    </label>
                    <input
                      type="text"
                      value={config.blankSymbol}
                      onChange={(e) => updateConfig({ blankSymbol: e.target.value || '_' })}
                      disabled={isRunning}
                      maxLength={1}
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  {/* States */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      States (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={config.states.join(', ')}
                      onChange={(e) => {
                        const states = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        updateConfig({ states });
                      }}
                      disabled={isRunning}
                      placeholder="q0, q1, qaccept, qreject"
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  {/* Initial State */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Initial State
                    </label>
                    <input
                      type="text"
                      value={config.initialState}
                      onChange={(e) => updateConfig({ initialState: e.target.value })}
                      disabled={isRunning}
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  {/* Accept States */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Accept States
                    </label>
                    <input
                      type="text"
                      value={config.acceptStates.join(', ')}
                      onChange={(e) => {
                        const acceptStates = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        updateConfig({ acceptStates });
                      }}
                      disabled={isRunning}
                      placeholder="qaccept"
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  {/* Reject States */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Reject States
                    </label>
                    <input
                      type="text"
                      value={config.rejectStates.join(', ')}
                      onChange={(e) => {
                        const rejectStates = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        updateConfig({ rejectStates });
                      }}
                      disabled={isRunning}
                      placeholder="qreject"
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cffafe',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
