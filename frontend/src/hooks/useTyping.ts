'use client';
import { useState, useCallback, useRef } from 'react';
import { TypingUser } from '@/lib/types';
import { useSocket } from './useSocket';

export const useTyping = (roomId: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket } = useSocket({
    user_typing: (user: TypingUser) => {
      if (user.roomId === roomId) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === user.userId)) return [...prev, user];
          return prev;
        });
      }
    },
    user_stopped_typing: (data: { userId: string, roomId: string }) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    }
  });

  const emitTyping = useCallback(() => {
    if (!socket) return;
    socket.emit('typing_start', { roomId });
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId });
    }, 1500);
  }, [socket, roomId]);

  return { typingUsers, emitTyping };
};
