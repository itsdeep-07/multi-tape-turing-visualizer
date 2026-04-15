import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  allowSpaces?: boolean;
}

export function TagInput({ tags, onChange, placeholder = 'Add...', disabled = false, allowSpaces = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === ' ' && !allowSpaces) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const val = inputValue.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    if (disabled) return;
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 w-full px-3 py-2 text-base rounded outline-none transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onClick={(e) => {
        const input = (e.currentTarget as HTMLElement).querySelector('input');
         if(input) input.focus();
      }}
    >
      <AnimatePresence>
        {tags.map((tag, idx) => (
          <motion.div
            key={`${tag}-${idx}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, width: 0, margin: 0 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-semibold"
            style={{
              background: 'rgba(139,92,246,0.18)',
              color: '#c4b5fd',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <span>{tag}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(idx);
              }}
              disabled={disabled}
              className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag()}
        disabled={disabled}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent outline-none text-zinc-300 placeholder-zinc-600 shadow-none border-none focus:ring-0 focus:outline-none"
        style={{ fontFamily: "'JetBrains Mono', monospace", padding: 0 }}
      />
    </div>
  );
}
