'use client';
import { Room, RoomMember } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

interface ChatHeaderProps {
  room: Room;
  members: RoomMember[];
}

export default function ChatHeader({ room, members }: ChatHeaderProps) {
  const onlineMembers = members.filter(m => m.user?.isOnline);
  const maxAvatars = 4;

  return (
    <div style={{
      height: 'var(--header-height)', flexShrink: 0,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 10,
    }}>
      {/* Room info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--accent-primary)22, var(--accent-secondary)22)',
          border: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {room.emoji || '💬'}
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {room.name}
          </h2>
          {room.description && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{room.description}</p>
          )}
        </div>
      </div>

      {/* Right side: member info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Online count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--online-color)',
            boxShadow: '0 0 6px var(--online-glow)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {onlineMembers.length} online
          </span>
        </div>

        {/* Member avatars */}
        {members.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {members.slice(0, maxAvatars).map((member, i) => (
              <div
                key={member.id}
                style={{ marginLeft: i === 0 ? 0 : -10, zIndex: maxAvatars - i }}
                title={member.user?.username}
              >
                <Avatar user={member.user} size="sm" showPresence />
              </div>
            ))}
            {members.length > maxAvatars && (
              <div style={{
                marginLeft: -10, zIndex: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600,
              }}>
                +{members.length - maxAvatars}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
