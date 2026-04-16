import { useMemo } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';

const glass: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 16,
};

interface PerformanceData {
  id: string;
  inputSize: number;
  singleTape: number;
  multiTape: number;
  multiHead: number;
}

interface PerformanceComparisonProps {
  numTapes: number;
  currentSteps: number;
  mode: 'multi-tape' | 'multi-head';
}

export function PerformanceComparison({ numTapes, currentSteps, mode }: PerformanceComparisonProps) {
  // Dynamic complexity calculation based on tape count
  const data = useMemo(() => {
    const result: PerformanceData[] = [];
    for (let i = 1; i <= 10; i++) {
      const n = i * 5;

      // Single tape: Realistic quadratic behavior
      const singleTape = Math.round(Math.pow(n, 2) * 0.8 + n * 2);

      // Multi-Tape: O(n) + High Coordination Overhead based on tape count
      const mtOverhead = 1 + (0.15 * numTapes);
      const multiTape = Math.round(n * mtOverhead * 4);

      // Multi-Head: O(n) + Low Coordination Overhead
      const mhOverhead = 1 + (0.05 * numTapes);
      const multiHead = Math.round(n * mhOverhead * 4);

      result.push({
        id: `perf-${i}`,
        inputSize: n,
        singleTape,
        multiTape,
        multiHead
      });
    }
    return result;
  }, [numTapes]);

  // Calculate theoretical complexity notation
  const getComplexityNotation = () => {
    if (numTapes === 1) {
      return 'O(n²)';
    }
    const overhead = mode === 'multi-head'
      ? (1 + 0.1 * numTapes).toFixed(2)
      : (1 + 0.15 * numTapes).toFixed(2);
    return `O(${overhead}n)`;
  };

  const speedupRatio = useMemo(() => {
    // Calculate average speedup from data
    const avgSingle = data.reduce((sum, d) => sum + d.singleTape, 0) / data.length;
    const avgMulti = data.reduce((sum, d) => sum + d.multiTape, 0) / data.length;
    return (avgSingle / avgMulti).toFixed(1);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="px-3 py-2 rounded-lg"
          style={{
            ...glass,
            background: 'rgba(10,12,24,0.95)',
          }}
        >
          <p className="text-xs text-white/60 mb-1">Input Size: {label}</p>
          <p className="text-xs text-rose-400">Single-Tape (O(n²)): {payload[0].value} steps</p>
          <p className="text-xs text-cyan-400">Multi-Tape (O(n)): {payload[1].value} steps</p>
          <p className="text-xs text-violet-400">Multi-Head (O(n)): {payload[2].value} steps</p>
          <div className="mt-2 pt-2 border-t border-white/10 text-xs font-semibold text-white/70">
            Speedup vs Single-Tape:
            <br/><span className="text-cyan-400">Tapes: {(payload[0].value / payload[1].value).toFixed(1)}x</span>
            <span className="mx-2 opacity-30">|</span>
            <span className="text-violet-400">Heads: {(payload[0].value / payload[2].value).toFixed(1)}x</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={glass} className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Performance Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-2 py-1 rounded text-[10px] font-bold"
            style={{ background: 'rgba(34,211,238,0.18)', color: '#67e8f9' }}
          >
            {numTapes} {mode === 'multi-head' ? 'Heads' : 'Tapes'}
          </motion.div>
          <div
            className="px-2 py-1 rounded text-[10px] font-bold"
            style={{ background: 'rgba(139,92,246,0.18)', color: '#c4b5fd' }}
          >
            {mode === 'multi-head' ? 'Multi-Head' : 'Multi-Tape'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(244,63,94,0.08)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Single-Tape</span>
          </div>
          <div className="text-xl font-bold text-rose-400">O(n²)</div>
          <div className="text-[10px] text-white/30 mt-1">Quadratic time</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(34,211,238,0.08)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">{mode === 'multi-head' ? 'Multi-Head' : 'Multi-Tape'}</span>
          </div>
          <div className="text-xl font-bold text-cyan-400">{getComplexityNotation()}</div>
          <div className="text-[10px] text-white/30 mt-1">
            {numTapes === 1 ? 'Quadratic' : `~${speedupRatio}x faster`}
          </div>
        </div>
      </div>

      {/* Current Execution Stats */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="h-3 w-3 text-violet-400" />
          <span className="text-[10px] text-white/50 uppercase tracking-wider">Current Execution</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Steps executed:</span>
          <span className="text-lg font-bold text-violet-400">{currentSteps}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              key="xaxis"
              dataKey="inputSize"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            />
            <YAxis
              key="yaxis"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              label={{ value: 'Steps', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            />
            <Tooltip key="tooltip" content={<CustomTooltip />} />
            <Legend
              key="legend"
              wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', paddingTop: '20px' }}
              iconType="circle"
            />
            <Line
              key="single-tape-line"
              type="monotone"
              dataKey="singleTape"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={{ fill: '#f43f5e', r: 3 }}
              name="Single-Tape"
              isAnimationActive={false}
            />
            <Line
              key="multi-tape-line"
              type="monotone"
              dataKey="multiTape"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ fill: '#22d3ee', r: 3 }}
              name="Multi-Tape"
              isAnimationActive={false}
            />
            <Line
              key="multi-head-line"
              type="monotone"
              dataKey="multiHead"
              stroke="#a78bfa"
              strokeWidth={3}
              dot={{ fill: '#a78bfa', r: 3 }}
              name="Multi-Head"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Efficiency Note */}
      <div className="mt-4 p-2.5 rounded-lg border border-cyan-500/20" style={{ background: 'rgba(34,211,238,0.05)' }}>
        <p className="text-[10px] text-cyan-400/80 leading-relaxed">
          <span className="font-bold">Dynamic Complexity:</span> With {numTapes} {mode === 'multi-head' ? 'head(s)' : 'tape(s)'},
          complexity is {getComplexityNotation()} vs single-tape O(n²). {mode === 'multi-head'
            ? 'Multi-head machines have lower coordination overhead than multi-tape.'
            : 'More tapes provide parallelism but add coordination overhead.'}
          {numTapes > 1 && ` Current configuration achieves ~${speedupRatio}x theoretical speedup.`}
        </p>
      </div>
    </div>
  );
}
