'use client';
import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '@/lib/api';
import { Message } from '@/lib/types';
import { useSocket } from './useSocket';
import { useAuth } from '@/contexts/AuthContext';

export const useMessages = (roomId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesApi.getHistory(roomId);
      // Backend returns { messages: [...], nextCursor } with messages already oldest-first
      const msgs: Message[] = res.data.messages || res.data || [];
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchMessages();
  }, [roomId, fetchMessages]);

  const { socket } = useSocket({
    new_message: (msg: Message & { tempId?: string }) => {
      if (msg.roomId === roomId) {
        setMessages(prev => {
          // Replace optimistic message if tempId matches, otherwise add new
          const hasTemp = prev.some(m => m.tempId && m.tempId === msg.tempId);
          if (hasTemp) {
            return prev.map(m => m.tempId === msg.tempId
              ? { ...msg, isPending: false, tempId: undefined }
              : m
            );
          }
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, { ...msg, isPending: false }];
        });
      }
    },
    reaction_added: (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          const reactions = m.reactions || [];
          return { ...m, reactions: [...reactions, data.reaction] };
        }
        return m;
      }));
    },
    reaction_removed: (data: { messageId: string; userId: string; emoji: string }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          const reactions = (m.reactions || []).filter(r => !(r.userId === data.userId && r.emoji === data.emoji));
          return { ...m, reactions };
        }
        return m;
      }));
    },
    message_read: (data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          const reads = m.reads || [];
          return { ...m, reads: [...reads, { id: Date.now().toString(), messageId: data.messageId, userId: data.userId, readAt: new Date().toISOString() }] };
        }
        return m;
      }));
    }
  });

  const sendMessage = async (content: string, type: 'TEXT' | 'IMAGE' = 'TEXT') => {
    if (!socket || !user) return;
    const tempId = Date.now().toString();
    const tempMsg: Message = {
      id: tempId,
      tempId,
      content,
      type,
      senderId: user.id,
      roomId,
      createdAt: new Date().toISOString(),
      sender: user,
      isPending: true
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    socket.emit('send_message', { roomId, content, type, tempId }, (res: any) => {
      if (res.error) {
        setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, isPending: false, isFailed: true } : m));
      }
    });
  };

  return { messages, loading, sendMessage };
};
