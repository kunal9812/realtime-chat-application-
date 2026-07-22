import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, avatar: '👤' }
    });
    
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });
    
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken(decoded.userId);
    
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { isOnline: false, lastSeen: new Date() }
    });
    res.clearCookie('accessToken');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, email: true, avatar: true, bio: true, isOnline: true, lastSeen: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Return user directly so frontend can do res.data directly
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

