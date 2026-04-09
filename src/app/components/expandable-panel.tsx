import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';

interface ExpandablePanelProps {
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  /** Content rendered in the inline (collapsed) card */
  children: React.ReactNode;
  /** Content rendered inside the full-screen modal */
  expandedContent: React.ReactNode;
  /** Shown in the modal header */
  title: string;
  /** Optional dot-accent color class, e.g. 'bg-violet-400' */
  accentColor?: string;
}

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

export function ExpandablePanel({
  expanded,
  onExpand,
  onClose,
  children,
  expandedContent,
  title,
  accentColor = 'bg-violet-400',
}: ExpandablePanelProps) {
  /* Lock scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow = expanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [expanded]);

  /* Escape key to close */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <>
      {/* ── Inline card ── */}
      <div className="relative h-full flex flex-col rounded-2xl p-5" style={PANEL_STYLE}>
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>

        {/* Expand button — bottom-right corner */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={onExpand}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <Maximize2 size={11} />
          Expand
        </motion.button>
      </div>

      {/* ── Full-screen modal via portal ── */}
      {createPortal(
        <AnimatePresence>
          {expanded && (
            <>
              {/* Backdrop */}
              <motion.div
                key="ep-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={onClose}
                className="fixed inset-0 z-[9998]"
                style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
              />

              {/* Modal panel */}
              <motion.div
                key="ep-modal"
                initial={{ opacity: 0, scale: 0.86, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 18 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="fixed z-[9999] flex flex-col overflow-hidden rounded-2xl"
                style={{
                  inset: '2.5vh 2.5vw',
                  background: 'rgba(8,8,20,0.97)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                {/* Modal header */}
                <div
                  className="flex shrink-0 items-center justify-between px-6 py-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${accentColor}`} />
                    <span
                      className="text-sm font-semibold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {title}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.2)', boxShadow: '0 0 15px rgba(239,68,68,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#fca5a5',
                    }}
                  >
                    <X size={12} />
                    Close (Esc)
                  </motion.button>
                </div>

                {/* Modal body — scrollable */}
                <div className="flex-1 overflow-auto p-6">
                  {expandedContent}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}