'use client';
import { Message } from '@/lib/types';
import { useState, useRef } from 'react';
import Avatar from '@/components/ui/Avatar';
import EmojiPicker from '@/components/ui/EmojiPicker';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';

interface MessageBubbleProps {
  message: Message;
  isGrouped: boolean; // same sender as previous message
  currentUserId: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ReadReceipt({ reads }: { reads?: { userId: string }[]; }) {
  const count = reads?.length ?? 0;
  if (count === 0) return <span style={{ fontSize: 11, opacity: 0.6 }}>✓</span>;
  return <span style={{ fontSize: 11, color: 'var(--accent-secondary)' }}>✓✓</span>;
}

export default function MessageBubble({ message, isGrouped, currentUserId }: MessageBubbleProps) {
  const { user } = useAuth();
  const { socket } = useSocket({});
  const isMe = message.senderId === currentUserId;
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (message.type === 'SYSTEM') {
    return (
      <div style={{ textAlign: 'center', margin: '8px 0', animation: 'fadeIn 0.3s ease' }}>
        <span style={{
          fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic',
          background: 'var(--bg-glass)', padding: '4px 14px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)',
        }}>
          {message.content}
        </span>
      </div>
    );
  }

  const handleReaction = (emoji: string) => {
    if (!socket) return;
    const myReaction = message.reactions?.find(r => r.userId === user?.id && r.emoji === emoji);
    if (myReaction) {
      socket.emit('remove_reaction', { messageId: message.id, emoji });
    } else {
      socket.emit('add_reaction', { messageId: message.id, emoji });
    }
    setShowEmojiPicker(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // Group reactions by emoji
  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || []);
    acc[r.emoji].push(r.userId);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        marginBottom: isGrouped ? 2 : 12,
        animation: 'messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingLeft: isMe ? 60 : 0,
        paddingRight: isMe ? 0 : 60,
        position: 'relative',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Sender info row */}
      {!isMe && !isGrouped && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, marginLeft: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>
            {message.sender?.username}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row' }}>
        {/* Avatar — only for received, first in group */}
        {!isMe && (
          <div style={{ width: 36, visibility: isGrouped ? 'hidden' : 'visible', flexShrink: 0 }}>
            <Avatar user={message.sender} size="md" />
          </div>
        )}

        {/* Bubble */}
        <div style={{ position: 'relative' }}>
          {/* Hover action bar */}
          {showActions && (
            <div style={{
              position: 'absolute',
              [isMe ? 'left' : 'right']: '100%',
              top: '50%', transform: 'translateY(-50%)',
              display: 'flex', gap: 4,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 6px',
              marginLeft: isMe ? undefined : 8,
              marginRight: isMe ? 8 : undefined,
              boxShadow: 'var(--shadow-glass)',
              zIndex: 10,
              animation: 'fadeIn 0.15s ease',
            }}>
              <button onClick={() => setShowEmojiPicker(v => !v)} style={{ fontSize: 14, padding: '2px 4px', borderRadius: 6 }} title="React">😄</button>
              <button onClick={handleCopy} style={{ fontSize: 14, padding: '2px 4px', borderRadius: 6 }} title="Copy">📋</button>
              {isMe && (
                <button
                  onClick={() => socket?.emit('delete_message', { messageId: message.id })}
                  style={{ fontSize: 14, padding: '2px 4px', borderRadius: 6, color: 'var(--danger)' }}
                  title="Delete"
                >🗑️</button>
              )}
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '110%', [isMe ? 'right' : 'left']: 0 }}>
                  <EmojiPicker onSelect={handleReaction} onClose={() => setShowEmojiPicker(false)} position="above" />
                </div>
              )}
            </div>
          )}

          {/* Main bubble */}
          <div style={{
            padding: message.type === 'IMAGE' ? '6px' : '10px 14px',
            borderRadius: isMe
              ? (isGrouped ? '18px 18px 4px 18px' : '18px 18px 4px 18px')
              : (isGrouped ? '18px 18px 18px 4px' : '18px 18px 18px 4px'),
            background: isMe
              ? 'linear-gradient(135deg, var(--bubble-sent-from), var(--bubble-sent-to))'
              : 'var(--bubble-received)',
            border: isMe ? 'none' : '1px solid var(--border-glass)',
            backdropFilter: isMe ? undefined : 'blur(10px)',
            color: isMe ? 'white' : 'var(--text-primary)',
            maxWidth: 420,
            opacity: message.isPending ? 0.6 : 1,
            transition: 'opacity var(--transition-base)',
            boxShadow: isMe ? '0 4px 14px rgba(124,111,247,0.25)' : undefined,
            cursor: message.type === 'IMAGE' ? 'zoom-in' : undefined,
            wordBreak: 'break-word',
          }}
            onClick={() => message.type === 'IMAGE' && setShowLightbox(true)}
          >
            {message.type === 'IMAGE' ? (
              <img
                src={message.content}
                alt="shared image"
                style={{
                  maxWidth: 280, maxHeight: 200, borderRadius: 10,
                  display: 'block', objectFit: 'cover',
                }}
              />
            ) : (
              <span style={{ fontSize: 15, lineHeight: 1.5 }}>{message.content}</span>
            )}
          </div>

          {/* Timestamp + read receipt */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            marginTop: 2,
            justifyContent: isMe ? 'flex-end' : 'flex-start',
            opacity: 0.6,
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(message.createdAt)}</span>
            {isMe && <ReadReceipt reads={message.reads} />}
            {message.isFailed && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠ Failed</span>}
          </div>
        </div>
      </div>

      {/* Reactions */}
      {Object.keys(groupedReactions).length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4,
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          paddingLeft: isMe ? 0 : 44,
        }}>
          {Object.entries(groupedReactions).map(([emoji, userIds]) => {
            const iMine = userIds.includes(user?.id || '');
            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                style={{
                  fontSize: 13, padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: iMine ? 'rgba(124,111,247,0.2)' : 'var(--bg-glass)',
                  border: `1px solid ${iMine ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                  color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  animation: 'reactionPop 0.3s var(--transition-spring)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                }}
              >
                {emoji} <span style={{ fontSize: 11 }}>{userIds.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && message.type === 'IMAGE' && (
        <div
          onClick={() => setShowLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={message.content}
            alt="Preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}
