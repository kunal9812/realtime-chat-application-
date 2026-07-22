'use client';
import { useState, useRef, useEffect } from 'react';

const EMOJI_CATEGORIES = {
  '😀 Smileys': ['😀','😂','🥹','😊','😍','🤩','😎','🥳','😜','🤔','😏','😒','😔','😢','😭','😡','🤯','😱','🥺','😴','🤢','🤮','😷','🤧','🥶','🤑','😤','🙄','😬','🫠'],
  '❤️ Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💞','💓','💗','💖','💘','💝','❣️','💔','🫶','♥️'],
  '👍 Gestures': ['👍','👎','👌','✌️','🤞','🤟','🤙','👏','🙌','🤝','🫶','💪','🦾','🫵','☝️','🤜','🤛','✊','👊','🙏'],
  '🎉 Celebration': ['🎉','🎊','🎈','🎁','🎂','🎆','🎇','✨','🌟','⭐','🌠','🎯','🏆','🥇','🎖️','🥂','🍾','🎤','🎶','🎵'],
  '🔥 Popular': ['🔥','💯','⚡','🌈','🚀','💎','👑','🦋','🌸','🌺','🍕','🍔','☕','🎮','💻','📱','🎸','🌙','☀️','💫'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: 'above' | 'below';
}

export default function EmojiPicker({ onSelect, onClose, position = 'above' }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('😀 Smileys');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
  const filteredEmojis = search
    ? allEmojis.filter(e => e.includes(search))
    : EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES];

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        [position === 'above' ? 'bottom' : 'top']: '100%',
        left: 0,
        zIndex: 1000,
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px',
        width: 280,
        boxShadow: 'var(--shadow-glass)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Search emoji..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus
        style={{
          width: '100%', background: 'var(--bg-input)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          color: 'var(--text-primary)', fontSize: 13, outline: 'none',
          marginBottom: 10,
        }}
      />

      {/* Category tabs */}
      {!search && (
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
          {Object.keys(EMOJI_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0,
                background: activeCategory === cat ? 'var(--accent-primary)' : 'transparent',
                color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2,
        maxHeight: 180, overflowY: 'auto',
      }}>
        {filteredEmojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); onClose(); }}
            title={emoji}
            style={{
              fontSize: 20, padding: 4, borderRadius: 'var(--radius-sm)',
              transition: 'background var(--transition-fast)',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
