'use client';
import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import EmojiPicker from '@/components/ui/EmojiPicker';

interface MessageInputProps {
  onSend: (content: string, type?: 'TEXT' | 'IMAGE') => void;
  onTyping: () => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const autoGrow = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    autoGrow();
    onTyping();
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;
    setSending(true);
    onSend(trimmed, 'TEXT');
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSend(reader.result, 'IMAGE');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const charCount = text.length;
  const nearLimit = charCount > 900;

  return (
    <div style={{ padding: '12px 20px 20px', flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: '8px 8px 8px 16px',
        boxShadow: 'var(--shadow-glass)',
        transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
      }}
        onFocus={() => { }}
      >
        {/* Left action buttons */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {/* Emoji button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowEmoji(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: '50%', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: showEmoji ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
              title="Emoji"
            >
              😀
            </button>
            {showEmoji && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, zIndex: 100 }}>
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmoji(false)}
                  position="above"
                />
              </div>
            )}
          </div>

          {/* Image upload */}
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: 36, height: 36, borderRadius: '50%', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', transition: 'all var(--transition-fast)',
            }}
            title="Send image"
          >
            📎
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </div>

        {/* Textarea */}
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            disabled={disabled || sending}
            maxLength={1000}
            rows={1}
            style={{
              width: '100%',
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.5,
              resize: 'none', overflow: 'hidden',
              fontFamily: 'inherit',
              padding: '8px 0',
            }}
          />
          {nearLimit && (
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              fontSize: 11, color: charCount > 980 ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              {charCount}/1000
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled || sending}
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: text.trim()
              ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
              : 'var(--bg-glass)',
            border: text.trim() ? 'none' : '1px solid var(--border-glass)',
            color: text.trim() ? 'white' : 'var(--text-muted)',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all var(--transition-spring)',
            boxShadow: text.trim() ? 'var(--shadow-glow)' : 'none',
            transform: text.trim() ? 'scale(1)' : 'scale(0.92)',
            cursor: text.trim() ? 'pointer' : 'default',
          }}
        >
          {sending ? '⏳' : '➤'}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
        Press <kbd style={{ background: 'var(--bg-glass)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>Enter</kbd> to send · <kbd style={{ background: 'var(--bg-glass)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>Shift+Enter</kbd> for newline
      </p>
    </div>
  );
}
