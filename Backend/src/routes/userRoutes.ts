import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { userCreateSchema } from '../validators';
import bcrypt from 'bcryptjs';

const router = Router();

// System Admin specific routes
router.use(authenticate, requireRole(['SYSTEM_ADMIN']));

router.get('/', async (req, res) => {
  const { name, email, address, role, sortField, sortOrder } = req.query;
  const where: any = {};
  if (name) where.name = { contains: String(name) };
  if (email) where.email = { contains: String(email) };
  if (address) where.address = { contains: String(address) };
  if (role) where.role = String(role);
  
  const orderBy: any = {};
  if (sortField) {
      orderBy[String(sortField)] = sortOrder === 'desc' ? 'desc' : 'asc';
  } else {
      orderBy.createdAt = 'desc';
  }

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
          id: true, name: true, email: true, address: true, role: true, store: { select: { averageRating: true } }
      }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = userCreateSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true }
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
});

router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalStores = await prisma.store.count();
        const totalRatings = await prisma.rating.count();
        res.json({ totalUsers, totalStores, totalRatings });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
