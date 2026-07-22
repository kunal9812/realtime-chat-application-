'use client';
import { Message } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function MessageList({ messages, loading, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distFromBottom < 80;
    setIsAtBottom(atBottom);
    setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    setShowScrollBtn(false);
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        {/* Shimmer placeholders */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            width: `${50 + i * 10}%`, height: 44, borderRadius: 18,
            background: 'linear-gradient(90deg, var(--bg-glass) 25%, var(--bg-glass-hover) 50%, var(--bg-glass) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start',
          }} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 56 }}>💬</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 }}>No messages yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Say hello and start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%', overflowY: 'auto',
          padding: '20px 20px 8px',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {messages.map((msg, index) => {
          const prev = messages[index - 1];
          const showDateSep = !prev || !isSameDay(prev.createdAt, msg.createdAt);
          const isGrouped = !showDateSep && prev &&
            prev.senderId === msg.senderId &&
            prev.type !== 'SYSTEM' &&
            msg.type !== 'SYSTEM' &&
            (new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) < 5 * 60 * 1000;

          return (
            <div key={msg.id || msg.tempId}>
              {showDateSep && (
                <div style={{ textAlign: 'center', margin: '16px 0 12px', position: 'relative' }}>
                  <span style={{
                    fontSize: 12, color: 'var(--text-muted)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    backdropFilter: 'blur(10px)',
                    padding: '3px 14px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isGrouped={!!isGrouped}
                currentUserId={currentUserId}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'absolute', bottom: 16, right: 24,
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            border: 'none', cursor: 'pointer',
            animation: 'fadeIn 0.2s ease',
            transition: 'transform var(--transition-spring)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ↓
        </button>
      )}
    </div>
  );
}
