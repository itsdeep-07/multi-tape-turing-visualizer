import { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';

interface TapeInputEditorProps {
  tapeInputs: string[];
  numTapes: number;
  onUpdate: (tapeInputs: string[]) => void;
  disabled?: boolean;
}

const btnStyle = (variant: 'ghost' | 'emerald' | 'danger', disabled = false): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4,
    borderRadius: 8, padding: '4px 10px',
    fontSize: 11, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', border: '1px solid',
    fontFamily: "'Inter', sans-serif",
    opacity: disabled ? 0.4 : 1,
  };
  if (variant === 'emerald') return { ...base, background: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.4)', color: '#6ee7b7' };
  if (variant === 'danger') return { ...base, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' };
  return { ...base, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' };
};

export function TapeInputEditor({
  tapeInputs,
  numTapes,
  onUpdate,
  disabled = false,
}: TapeInputEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<string[]>(tapeInputs);

  useEffect(() => { setEditValues(tapeInputs); }, [tapeInputs]);

  const handleSave = () => { onUpdate(editValues); setIsEditing(false); };
  const handleCancel = () => { setEditValues(tapeInputs); setIsEditing(false); };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="shrink-0 text-xs font-semibold"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Initial Tapes:
      </span>

      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
        {Array.from({ length: numTapes }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.3)' }}
            >
              T{idx + 1}
            </span>
            {isEditing ? (
              <input
                value={editValues[idx] ?? ''}
                onChange={(e) => {
                  const next = [...editValues];
                  next[idx] = e.target.value;
                  setEditValues(next);
                }}
                placeholder="(empty)"
                className="w-28 rounded-lg px-2.5 py-1 text-xs outline-none"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  color: '#e4e4e7',
                  fontSize: 12,
                }}
              />
            ) : (
              <span
                className="rounded-lg px-2.5 py-1 text-xs"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a1a1aa',
                }}
              >
                {tapeInputs[idx] || '(empty)'}
              </span>
            )}
          </div>
        ))}
      </div>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          disabled={disabled}
          style={btnStyle('ghost', disabled)}
        >
          <Edit2 size={11} />
          Edit
        </button>
      ) : (
        <div className="flex gap-1.5">
          <button onClick={handleSave} style={btnStyle('emerald')}>
            <Save size={11} />
            Save
          </button>
          <button onClick={handleCancel} style={btnStyle('danger')}>
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  );
}