'use client';
import { useEffect, useRef } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';

export const useSocket = (events: Record<string, (...args: any[]) => void>) => {
  const { socket, isConnected } = useSocketContext();
  // Use a ref so event handlers don't cause infinite re-renders
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!socket) return;

    // Create stable wrappers that delegate to the latest handler
    const wrappers: Record<string, (...args: any[]) => void> = {};
    Object.keys(eventsRef.current).forEach(event => {
      wrappers[event] = (...args: any[]) => eventsRef.current[event]?.(...args);
      socket.on(event, wrappers[event]);
    });

    return () => {
      Object.keys(wrappers).forEach(event => {
        socket.off(event, wrappers[event]);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { socket, isConnected };
};
