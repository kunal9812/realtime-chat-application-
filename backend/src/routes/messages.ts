import { Router } from 'express';
import { prisma } from '../lib/prisma';
import authMiddleware from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;
    const cursor = req.query.cursor as string;
    
    const messages = await prisma.message.findMany({
      where: { roomId },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        reads: true,
        reactions: true
      }
    });
    
    let nextCursor: string | undefined = undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }
    
    res.json({ messages: messages.reverse(), nextCursor });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:messageId', async (req, res) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.messageId } });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.senderId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
    
    await prisma.message.update({
      where: { id: req.params.messageId },
      data: { content: 'Message deleted', type: 'SYSTEM' }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
