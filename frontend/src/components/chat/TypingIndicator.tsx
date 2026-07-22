'use client';
import { TypingUser } from '@/lib/types';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const label = typingUsers.length === 1
    ? `${typingUsers[0].username} is typing`
    : typingUsers.length === 2
    ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
    : 'Several people are typing';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 24px 8px',
      animation: 'messageSlideIn 0.3s ease',
    }}>
      {/* Dots bubble */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'var(--bubble-received)',
        border: '1px solid var(--border-glass)',
        backdropFilter: 'blur(10px)',
        padding: '10px 14px',
        borderRadius: '18px 18px 18px 4px',
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--text-muted)',
              animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {label}...
      </span>
    </div>
  );
}
