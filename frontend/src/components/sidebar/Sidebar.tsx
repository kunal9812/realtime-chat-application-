'use client';
import { useEffect, useState } from 'react';
import { Room } from '@/lib/types';
import { roomsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import RoomItem from './RoomItem';
import CreateRoomModal from './CreateRoomModal';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomsApi.list().then(res => {
      setRooms(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-join all rooms on sidebar load
  const { socket } = useSocket({
    new_message: (msg: any) => {
      setRooms(prev => prev.map(r => {
        if (r.id === msg.roomId) {
          return { ...r, lastMessage: msg };
        }
        return r;
      }));
    },
    room_updated: (room: Room) => {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, ...room } : r));
    },
  });

  const handleRoomCreated = async (newRoom: Room) => {
    try {
      await roomsApi.join(newRoom.id);
    } catch { /* might already be member */ }
    setRooms(prev => [newRoom, ...prev]);
  };

  return (
    <div className="sidebar">
      {/* Header */}
      <div style={{
        padding: '0 16px',
        height: 'var(--header-height)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            💬
          </div>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
            ChatApp
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* User profile strip */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {user && <Avatar user={user} size="md" showPresence />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.username}
          </div>
          <div style={{ fontSize: 11, color: 'var(--online-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--online-color)', display: 'inline-block' }} />
            Online
          </div>
        </div>
      </div>

      {/* Rooms section */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '12px 16px 8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            Rooms
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            title="Create room"
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent-primary)', fontSize: 16, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,111,247,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-glass)';
            }}
          >
            +
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 58, borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(90deg, var(--bg-glass) 25%, var(--bg-glass-hover) 50%, var(--bg-glass) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
              No rooms yet. Create one!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0' }}>
              {rooms.map(room => (
                <RoomItem key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Logout */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-glass)',
        flexShrink: 0,
      }}>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--danger)', fontSize: 14,
            background: 'rgba(247,112,111,0.08)',
            border: '1px solid rgba(247,112,111,0.15)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(247,112,111,0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(247,112,111,0.08)';
          }}
        >
          <span>🚪</span> Sign out
        </button>
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}
