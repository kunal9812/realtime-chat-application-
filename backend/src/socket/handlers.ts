import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;

  socket.on('join_room', async (data: { roomId: string } | string) => {
    const roomId = typeof data === 'string' ? data : data.roomId;
    socket.join(roomId);

    // Mark user online
    await prisma.user.update({ where: { id: userId }, data: { isOnline: true } }).catch(() => {});

    // Reset unread count for this user in this room
    await prisma.roomMember.updateMany({
      where: { userId, roomId },
      data: { unreadCount: 0, lastRead: new Date() }
    }).catch(() => {});

    io.to(roomId).emit('user_online', { userId, roomId });
  });

  socket.on('leave_room', (data: { roomId: string } | string) => {
    const roomId = typeof data === 'string' ? data : data.roomId;
    socket.leave(roomId);
  });

  socket.on('send_message', async (data: { roomId: string; content: string; type?: string; tempId?: string }, callback?: Function) => {
    const { roomId, content, type = 'TEXT', tempId } = data;
    try {
      const message = await prisma.message.create({
        data: { content, type, senderId: userId, roomId },
        include: {
          sender: { select: { id: true, username: true, avatar: true, isOnline: true } },
          reads: true,
          reactions: true,
        }
      });

      // Increment unread for members not in room
      await prisma.roomMember.updateMany({
        where: { roomId, userId: { not: userId } },
        data: { unreadCount: { increment: 1 } }
      });

      // Broadcast to room — include tempId so sender can match optimistic message
      io.to(roomId).emit('new_message', { ...message, tempId });
      
      if (callback) callback({ success: true, message });
    } catch (error) {
      console.error('Send message error:', error);
      if (callback) callback({ error: 'Failed to send message' });
    }
  });

  socket.on('typing_start', (data: { roomId: string } | string) => {
    const roomId = typeof data === 'string' ? data : data.roomId;
    socket.to(roomId).emit('user_typing', { userId, roomId, username });
  });

  socket.on('typing_stop', (data: { roomId: string } | string) => {
    const roomId = typeof data === 'string' ? data : data.roomId;
    socket.to(roomId).emit('user_stopped_typing', { userId, roomId });
  });

  socket.on('mark_read', async (data: { roomId: string; messageId?: string }) => {
    try {
      // Get latest messages in room to mark as read
      const latestMessages = await prisma.message.findMany({
        where: { roomId: data.roomId, senderId: { not: userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true }
      });

      if (data.messageId) {
        await prisma.messageRead.upsert({
          where: { messageId_userId: { messageId: data.messageId, userId } },
          update: {},
          create: { messageId: data.messageId, userId }
        });
        io.to(data.roomId).emit('message_read', { messageId: data.messageId, userId, readAt: new Date().toISOString() });
      }

      // Reset unread count
      await prisma.roomMember.updateMany({
        where: { userId, roomId: data.roomId },
        data: { unreadCount: 0, lastRead: new Date() }
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  socket.on('add_reaction', async (data: { messageId: string; emoji: string }) => {
    try {
      const reaction = await prisma.reaction.upsert({
        where: { userId_messageId_emoji: { userId, messageId: data.messageId, emoji: data.emoji } },
        update: {},
        create: { userId, messageId: data.messageId, emoji: data.emoji },
        include: { user: { select: { id: true, username: true } } }
      });

      // Get message to find roomId for broadcasting
      const message = await prisma.message.findUnique({ where: { id: data.messageId }, select: { roomId: true } });
      if (message) {
        io.to(message.roomId).emit('reaction_added', {
          messageId: data.messageId,
          reaction: { ...reaction, id: reaction.id, emoji: reaction.emoji, userId, messageId: data.messageId }
        });
      }
    } catch (error) {
      console.error('Add reaction error:', error);
    }
  });

  socket.on('remove_reaction', async (data: { messageId: string; emoji: string }) => {
    try {
      await prisma.reaction.deleteMany({
        where: { userId, messageId: data.messageId, emoji: data.emoji }
      });

      const message = await prisma.message.findUnique({ where: { id: data.messageId }, select: { roomId: true } });
      if (message) {
        io.to(message.roomId).emit('reaction_removed', {
          messageId: data.messageId, userId, emoji: data.emoji,
          reactionId: `${userId}_${data.messageId}_${data.emoji}`
        });
      }
    } catch (error) {
      console.error('Remove reaction error:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() }
      });
      // Broadcast offline to all rooms
      const rooms = [...socket.rooms];
      rooms.forEach(room => {
        if (room !== socket.id) {
          io.to(room).emit('user_offline', { userId, lastSeen: new Date().toISOString() });
        }
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
};
