'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useTyping } from '@/hooks/useTyping';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { roomsApi } from '@/lib/api';
import { Room, RoomMember } from '@/lib/types';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import TypingIndicator from '@/components/chat/TypingIndicator';
import MessageInput from '@/components/chat/MessageInput';

export default function ChatRoomPage() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const router = useRouter();
  const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomLoading, setRoomLoading] = useState(true);

  const { messages, loading: messagesLoading, sendMessage } = useMessages(roomIdStr);
  const { typingUsers, emitTyping } = useTyping(roomIdStr);
  const { socket } = useSocket({
    user_online: (data: { userId: string }) => {
      setMembers(prev => prev.map(m =>
        m.userId === data.userId ? { ...m, user: { ...m.user, isOnline: true } } : m
      ));
    },
    user_offline: (data: { userId: string }) => {
      setMembers(prev => prev.map(m =>
        m.userId === data.userId ? { ...m, user: { ...m.user, isOnline: false } } : m
      ));
    },
  });

  const fetchRoom = useCallback(async () => {
    if (!roomIdStr) return;
    try {
      const res = await roomsApi.get(roomIdStr);
      const roomData = res.data.room || res.data;
      setRoom(roomData);
      setMembers(roomData.members || []);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        router.push('/chat');
      }
    } finally {
      setRoomLoading(false);
    }
  }, [roomIdStr, router]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!socket || !roomIdStr) return;
    socket.emit('join_room', { roomId: roomIdStr });
    socket.emit('mark_read', { roomId: roomIdStr });

    return () => {
      socket.emit('leave_room', { roomId: roomIdStr });
    };
  }, [socket, roomIdStr]);

  const handleSend = (content: string, type: 'TEXT' | 'IMAGE' = 'TEXT') => {
    sendMessage(content, type);
  };

  if (roomLoading) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, color: 'var(--text-muted)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid var(--border-glass)',
          borderTop: '3px solid var(--accent-primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 14 }}>Loading room…</span>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ChatHeader room={room} members={members} />

      {/* Wallpaper hint bar */}
      {room.wallpaper && room.wallpaper !== 'gradient-1' && (
        <div style={{
          height: 3, flexShrink: 0,
          background: room.wallpaper.startsWith('gradient') ? undefined : room.wallpaper,
          backgroundImage: room.wallpaper.startsWith('linear') ? room.wallpaper : undefined,
        }} />
      )}

      <MessageList
        messages={messages}
        loading={messagesLoading}
        currentUserId={user?.id || ''}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput
        onSend={handleSend}
        onTyping={emitTyping}
      />
    </div>
  );
}
