'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Room } from '@/lib/types';

interface RoomItemProps {
  room: Room;
}

function timeAgo(iso?: string) {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  if (diff < 60_000) return 'now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
  return `${Math.floor(diff / 86400_000)}d`;
}

export default function RoomItem({ room }: RoomItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${room.id}`;

  return (
    <Link
      href={`/chat/${room.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        background: isActive ? 'var(--bg-glass-hover)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        animation: 'slideInRight 0.3s ease',
        position: 'relative',
      }}
        onMouseEnter={e => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-glass)';
        }}
        onMouseLeave={e => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        {/* Room emoji box */}
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: isActive
            ? 'linear-gradient(135deg, var(--accent-primary)33, var(--accent-secondary)33)'
            : 'var(--bg-tertiary)',
          border: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
          transition: 'all var(--transition-base)',
        }}>
          {room.emoji || '💬'}
        </div>

        {/* Room info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: 14, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {room.name}
            </span>
            {room.lastMessage && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                {timeAgo(room.lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: 12, color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: 160,
            }}>
              {room.lastMessage
                ? (room.lastMessage.type === 'IMAGE' ? '📷 Image' : room.lastMessage.content)
                : room.description || 'No messages yet'}
            </span>
            {(room.unreadCount ?? 0) > 0 && (
              <span style={{
                background: 'var(--accent-primary)',
                color: 'white', fontSize: 11, fontWeight: 700,
                padding: '2px 7px', borderRadius: 'var(--radius-full)',
                marginLeft: 8, flexShrink: 0,
                animation: 'reactionPop 0.3s var(--transition-spring)',
              }}>
                {room.unreadCount! > 99 ? '99+' : room.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
