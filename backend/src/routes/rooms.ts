import { Router } from 'express';
import { prisma } from '../lib/prisma';
import authMiddleware from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { type: 'GROUP' },
          { members: { some: { userId: req.userId } }, type: 'DM' }
        ]
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatar: true, isOnline: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, username: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Reshape: add lastMessage, return array directly
    const shaped = rooms.map(r => ({
      ...r,
      lastMessage: r.messages[0] || null,
      messages: undefined,
    }));

    res.json(shaped);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { name, description, emoji, wallpaper } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    
    const room = await prisma.room.create({
      data: {
        name,
        description,
        emoji,
        wallpaper,
        type: 'GROUP',
        members: {
          create: { userId: req.userId! }
        }
      }
    });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.roomId },
      include: {
        members: { include: { user: { select: { id: true, username: true, avatar: true, isOnline: true } } } }
      }
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:roomId/join', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    const member = await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: req.userId!, roomId: req.params.roomId } },
      update: {},
      create: { userId: req.userId!, roomId: req.params.roomId }
    });
    res.json({ member });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/dm', async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: 'Target user ID required' });
    
    // Check existing DM
    const existingRoom = await prisma.room.findFirst({
      where: {
        type: 'DM',
        AND: [
          { members: { some: { userId: req.userId } } },
          { members: { some: { userId: targetUserId } } }
        ]
      },
      include: { members: { include: { user: { select: { id: true, username: true, avatar: true } } } } }
    });
    
    if (existingRoom) {
      return res.json({ room: existingRoom });
    }
    
    const newRoom = await prisma.room.create({
      data: {
        name: 'DM',
        type: 'DM',
        members: {
          create: [{ userId: req.userId! }, { userId: targetUserId }]
        }
      },
      include: { members: { include: { user: { select: { id: true, username: true, avatar: true } } } } }
    });
    res.json({ room: newRoom });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
