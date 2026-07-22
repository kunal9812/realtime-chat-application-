import { Router } from 'express';
import { prisma } from '../lib/prisma';
import authMiddleware from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json({ users: [] });
    
    const users = await prisma.user.findMany({
      where: {
        username: { contains: query },
        id: { not: req.userId }
      },
      select: { id: true, username: true, avatar: true, bio: true },
      take: 20
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, username: true, avatar: true, bio: true, isOnline: true, lastSeen: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/profile', async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { bio, avatar },
      select: { id: true, username: true, avatar: true, bio: true }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
