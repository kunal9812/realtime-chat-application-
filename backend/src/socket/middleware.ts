import { Socket } from 'socket.io';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) return next(new Error('User not found'));
    
    socket.data.userId = user.id;
    socket.data.username = user.username;
    
    // Mark online
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true }
    });
    
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};
