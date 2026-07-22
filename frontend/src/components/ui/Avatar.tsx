'use client';
import { User } from '@/lib/types';

interface AvatarProps {
  user: Partial<User> & { username: string; avatar?: string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
}

const sizes = { sm: 28, md: 36, lg: 48, xl: 56 };
const fontSizes = { sm: 12, md: 15, lg: 22, xl: 26 };

export default function Avatar({ user, size = 'md', showPresence = false }: AvatarProps) {
  const px = sizes[size];
  const fs = fontSizes[size];

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <div style={{
        width: px, height: px,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fs, fontWeight: 700, color: 'white',
        boxShadow: user.isOnline && showPresence ? '0 0 0 2px var(--bg-secondary)' : undefined,
        transition: 'box-shadow var(--transition-base)',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        {user.avatar || user.username?.charAt(0).toUpperCase()}
      </div>
      {showPresence && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size === 'sm' ? 8 : size === 'md' ? 10 : 12,
          height: size === 'sm' ? 8 : size === 'md' ? 10 : 12,
          borderRadius: '50%',
          background: user.isOnline ? 'var(--online-color)' : 'var(--text-muted)',
          border: '2px solid var(--bg-secondary)',
          animation: user.isOnline ? 'presencePulse 2s ease-in-out infinite' : undefined,
        }} />
      )}
    </div>
  );
}
