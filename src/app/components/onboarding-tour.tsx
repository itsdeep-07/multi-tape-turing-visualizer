import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles, Settings2, Grid3x3, Code, GitBranch, BarChart3 } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  hint?: string;
  position?: 'inside-top' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-config',
    title: 'Fully Customizable Configuration',
    description: 'Your control center! Choose a preset problem or go custom. Modify mode, tape count, alphabet, states, and start positions.',
    icon: <Settings2 className="h-5 w-5" />,
    accentColor: '#f43f5e',
    hint: '💡 Select a problem from the dropdown or set everything manually.',
  },
  {
    targetId: 'tour-tape',
    title: 'Live Tape Visualizer',
    description: 'Watch computation in real-time! The head glows as it moves. Use Play, Step, or Rewind controls below.',
    icon: <Grid3x3 className="h-5 w-5" />,
    accentColor: '#8b5cf6',
    hint: '💡 Keyboard: Space = Play/Pause, → = Step, ← = Step Back.',
  },
  {
    targetId: 'tour-add-transition',
    title: 'Add Transition Rules',
    description: 'Hit this button to define rules — pick states, read/write symbols, and head directions. The live table highlights active rules during execution.',
    icon: <Code className="h-5 w-5" />,
    accentColor: '#22d3ee',
    hint: '💡 Each rule is fully editable and deletable.',
  },
  {
    targetId: 'diagram',
    title: 'Dynamic State Diagram',
    description: 'Auto-generated graph that updates instantly when you modify transitions. Active state glows during execution.',
    icon: <GitBranch className="h-5 w-5" />,
    accentColor: '#10b981',
    hint: '💡 Add a transition and watch it appear on the graph!',
  },
  {
    targetId: 'performance',
    title: 'Live Race & Performance Graph',
    description: 'Experience the Live Efficiency Race! Watch Single-Tape battle against Multi-Tape architectures, and see the theoretical Triple-Threat complexity graph update dynamically.',
    icon: <BarChart3 className="h-5 w-5" />,
    accentColor: '#f59e0b',
    hint: '💡 Select a problem (like a^n b^n), hit Run Race, and watch the counters spin!',
    position: 'inside-top',
  },
];

const STORAGE_KEY = 'tm-visualizer-tour-seen';
const TOOLTIP_W = 360;

interface SpotlightRect { top: number; left: number; width: number; height: number; }

interface OnboardingTourProps {
  onStepChange?: (step: number) => void;
  onDismiss?: () => void;
}

export function OnboardingTour({ onStepChange, onDismiss }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => { setIsActive(true); onStepChange?.(0); }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    setIsActive(false);
    setReady(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    onDismiss?.();
  }, [onDismiss]);

  const goTo = useCallback((next: number) => {
    setReady(false);
    setCurrentStep(next);
    onStepChange?.(next);
  }, [onStepChange]);

  const goNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) goTo(currentStep + 1);
    else dismiss();
  }, [currentStep, dismiss, goTo]);

  const goBack = useCallback(() => {
    if (currentStep > 0) goTo(currentStep - 1);
  }, [currentStep, goTo]);

  // CORE: scroll element to top → measure → show tooltip below it
  useEffect(() => {
    if (!isActive) return;
    setReady(false);

    const stepDef = TOUR_STEPS[currentStep];
    const el = document.getElementById(stepDef.targetId);
    if (!el) { setSpotlight(null); return; }

    // SCROLL: Dynamically find the scroll container and jump to it with an offset
    const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      if (!node || node === document.body) return null;
      if (node.scrollHeight > node.clientHeight && window.getComputedStyle(node).overflowY !== 'visible') {
        return node;
      }
      return getScrollParent(node.parentElement);
    };

    const sc = getScrollParent(el);

    if (sc) {
      const elTop = el.getBoundingClientRect().top;
      const scTop = sc.getBoundingClientRect().top;
      sc.scrollTo({
        top: sc.scrollTop + (elTop - scTop) - 24, // 24px breathing room from top
        behavior: 'smooth'
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    }

    // MEASURE after scroll completes (give 600ms)
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const pad = 8;
      const sr: SpotlightRect = {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      };
      setSpotlight(sr);

      let ttTop = sr.top + sr.height + 10;
      let ttLeft = sr.left + sr.width / 2 - TOOLTIP_W / 2;

      if (stepDef.position === 'inside-top') {
        ttTop = sr.top + 40; // Float right inside the top of the border box
      } else if (sr.width < 120) {
        // For tiny elements (like the + button), shift tooltip to the right side
        ttLeft = sr.left + sr.width + 12;
        ttTop = sr.top;
      }

      // Clamp so it never goes off screen horizontally
      ttLeft = Math.max(8, Math.min(ttLeft, window.innerWidth - TOOLTIP_W - 8));
      
      // If bottom positioning pushes it off screen, dynamically snap it to inside-top fallback
      const MAX_TOOLTIP_HEIGHT = 220;
      if (ttTop + MAX_TOOLTIP_HEIGHT > window.innerHeight) {
        ttTop = Math.max(8, window.innerHeight - MAX_TOOLTIP_HEIGHT - 8);
      }

      setTooltipPos({ top: ttTop, left: ttLeft });
      setReady(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  // Keyboard
  useEffect(() => {
    if (!isActive) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isActive, goNext, goBack, dismiss]);

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {!isActive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => { goTo(0); setIsActive(true); }}
          className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(244,63,94,0.25) 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            color: '#c4b5fd',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(139,92,246,0.3)',
          }}
        >
          <Sparkles className="h-4 w-4" />
          Tour
        </motion.button>
      )}

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998]"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
          >
            {/* Overlay with cutout */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                <mask id="tour-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {spotlight && (
                    <motion.rect
                      initial={false}
                      animate={{ x: spotlight.left, y: spotlight.top, width: spotlight.width, height: spotlight.height }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      rx="12" fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask="url(#tour-mask)" style={{ pointerEvents: 'auto' }} onClick={dismiss} />
            </svg>

            {/* Glow border */}
            {spotlight && (
              <motion.div
                initial={false}
                animate={{ top: spotlight.top, left: spotlight.left, width: spotlight.width, height: spotlight.height }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="absolute rounded-xl pointer-events-none"
                style={{ border: `2px solid ${step.accentColor}88`, boxShadow: `0 0 20px ${step.accentColor}44` }}
              />
            )}

            {/* Tooltip — BELOW the highlighted section */}
            <AnimatePresence>
              {ready && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute z-[9999]"
                  style={{ top: tooltipPos.top, left: tooltipPos.left, width: TOOLTIP_W, maxWidth: 'calc(100vw - 16px)', pointerEvents: 'auto' }}
                >
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(160deg, rgba(18,14,30,0.97) 0%, rgba(8,6,16,0.97) 100%)',
                      border: `1px solid ${step.accentColor}44`,
                      boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 24px ${step.accentColor}10`,
                      backdropFilter: 'blur(32px)',
                    }}
                  >
                    {/* Progress */}
                    <div className="h-[3px] w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div className="h-full" initial={false} animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }} style={{ background: step.accentColor }} />
                    </div>

                    <div className="px-4 py-3">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: `${step.accentColor}20`, color: step.accentColor }}>
                            {step.icon}
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${step.accentColor}aa` }}>{currentStep + 1}/{TOUR_STEPS.length}</span>
                            <h3 className="text-[13px] font-bold text-white leading-tight">{step.title}</h3>
                          </div>
                        </div>
                        <button onClick={dismiss} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                      </div>

                      <p className="text-[11.5px] text-white/50 leading-relaxed mb-1.5">{step.description}</p>

                      {step.hint && (
                        <div className="px-2 py-1 rounded mb-2.5 text-[10.5px]" style={{ background: `${step.accentColor}0c`, border: `1px solid ${step.accentColor}18`, color: `${step.accentColor}bb` }}>
                          {step.hint}
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <button onClick={dismiss} className="text-[10px] font-semibold text-white/20 hover:text-white/50 uppercase tracking-wider">Skip</button>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 mr-1.5">
                            {TOUR_STEPS.map((_, i) => (
                              <motion.div key={i} className="rounded-full" animate={{ width: i === currentStep ? 14 : 4, height: 4, background: i === currentStep ? step.accentColor : i < currentStep ? `${step.accentColor}55` : 'rgba(255,255,255,0.1)' }} transition={{ duration: 0.3 }} />
                            ))}
                          </div>
                          <button onClick={goBack} disabled={currentStep === 0} className="flex items-center gap-0.5 px-2 py-1 rounded text-[11px] font-semibold disabled:opacity-15" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                            <ChevronLeft className="h-3 w-3" />Back
                          </button>
                          <button onClick={goNext} className="flex items-center gap-0.5 px-3 py-1 rounded text-[11px] font-bold" style={{ background: `${step.accentColor}22`, border: `1px solid ${step.accentColor}55`, color: step.accentColor }}>
                            {currentStep === TOUR_STEPS.length - 1 ? '🎉 Done' : 'Next'}{currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
