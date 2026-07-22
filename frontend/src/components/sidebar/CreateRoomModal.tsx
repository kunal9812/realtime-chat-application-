'use client';
import { useState } from 'react';
import { roomsApi } from '@/lib/api';
import { Room } from '@/lib/types';

const WALLPAPERS = [
  { id: 'gradient-1', label: 'Violet Dream', value: 'linear-gradient(135deg, #7c6ff7, #5b8af5)' },
  { id: 'gradient-2', label: 'Sunset', value: 'linear-gradient(135deg, #f7706f, #f5a623)' },
  { id: 'gradient-3', label: 'Ocean', value: 'linear-gradient(135deg, #23d18b, #5b8af5)' },
  { id: 'gradient-4', label: 'Midnight', value: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'gradient-5', label: 'Rose', value: 'linear-gradient(135deg, #f7706f, #7c6ff7)' },
  { id: 'gradient-6', label: 'Aurora', value: 'linear-gradient(135deg, #23d18b, #7c6ff7)' },
];

const POPULAR_EMOJIS = ['💬','🎨','🎲','🚀','⚡','🌟','🎯','🎮','🔥','💎','🌈','🎵'];

interface CreateRoomModalProps {
  onClose: () => void;
  onCreated: (room: Room) => void;
}

export default function CreateRoomModal({ onClose, onCreated }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💬');
  const [wallpaper, setWallpaper] = useState('gradient-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await roomsApi.create({ name: name.trim(), description: description.trim(), emoji, wallpaper });
      onCreated(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: 32,
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-glass)',
        animation: 'messageSlideIn 0.25s ease',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Create Room</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 20 }}>×</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(247,112,111,0.1)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Emoji picker row */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Room Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POPULAR_EMOJIS.map(e => (
                <button
                  key={e} type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    fontSize: 22, width: 40, height: 40, borderRadius: 10,
                    background: emoji === e ? 'rgba(124,111,247,0.2)' : 'var(--bg-glass)',
                    border: `1px solid ${emoji === e ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Room Name *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Design Team"
              required maxLength={50}
              style={{
                width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-glass)',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', outline: 'none', fontSize: 14,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
            <input
              type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What's this room for?"
              maxLength={100}
              style={{
                width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-glass)',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', outline: 'none', fontSize: 14,
              }}
            />
          </div>

          {/* Wallpaper */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Color Theme</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {WALLPAPERS.map(w => (
                <button
                  key={w.id} type="button"
                  onClick={() => setWallpaper(w.id)}
                  title={w.label}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: w.value,
                    border: wallpaper === w.id ? '3px solid white' : '3px solid transparent',
                    boxShadow: wallpaper === w.id ? '0 0 0 2px var(--accent-primary)' : 'none',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={loading || !name.trim()}
            className="btn-primary"
            style={{ marginTop: 4 }}
          >
            {loading ? 'Creating…' : `${emoji} Create Room`}
          </button>
        </form>
      </div>
    </div>
  );
}
