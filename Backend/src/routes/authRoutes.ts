import { Router } from 'express';
import { prisma } from '../prisma';
import { userSignupSchema, loginSchema, passwordUpdateSchema } from '../validators';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

router.post('/signup', async (req, res) => {
  try {
    const data = userSignupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword, role: 'NORMAL_USER' }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
});

router.put('/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = passwordUpdateSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(data.oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect old password' });

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
});

export default router;
