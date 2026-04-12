import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { storeSchema } from '../validators';

const router = Router();
type UserRatingRecord = Awaited<ReturnType<typeof prisma.rating.findMany>>[number];
type StoreRecord = Awaited<ReturnType<typeof prisma.store.findMany>>[number];

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { name, email, address, sortField, sortOrder } = req.query;
  const where: any = {};
  if (name) where.name = { contains: String(name), mode: 'insensitive' };
  if (email) where.email = { contains: String(email), mode: 'insensitive' };
  if (address) where.address = { contains: String(address), mode: 'insensitive' };
  
  const orderBy: any = {};
  if (sortField) {
      orderBy[String(sortField)] = sortOrder === 'desc' ? 'desc' : 'asc';
  } else {
      orderBy.createdAt = 'desc';
  }

  try {
    const stores = await prisma.store.findMany({ where, orderBy });
    
    // If Normal User, fetch their ratings for these stores
    if (req.user?.role === 'NORMAL_USER') {
        const userRatings = await prisma.rating.findMany({
            where: { userId: req.user.id }
        });
        const ratingMap = new Map<string, { id: string; score: number }>();
        userRatings.forEach((rating: UserRatingRecord) => ratingMap.set(rating.storeId, { id: rating.id, score: rating.score }));
        
        const storesWithUserRating = stores.map((store: StoreRecord) => ({
            ...store,
            myRating: ratingMap.get(store.id)?.score || null,
            myRatingId: ratingMap.get(store.id)?.id || null
        }));
        return res.json(storesWithUserRating);
    }
    
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Add Store
router.post('/', authenticate, requireRole(['SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { ownerId, ...data } = req.body;
    const storeData = storeSchema.parse(data);
    
    const existing = await prisma.store.findUnique({ where: { email: storeData.email } });
    if (existing) return res.status(400).json({ message: 'Store email already exists' });

    let store;
    if (ownerId) {
        // Find owner and ensure they don't have a store already
        const owner = await prisma.user.findUnique({ where: { id: ownerId } });
        if (!owner || owner.role !== 'STORE_OWNER') {
            return res.status(400).json({ message: 'Invalid owner ID. Must be a STORE_OWNER.' });
        }
        
        store = await prisma.store.create({
            data: storeData
        });
        
        await prisma.user.update({
            where: { id: ownerId },
            data: { storeId: store.id }
        });
    } else {
        store = await prisma.store.create({ data: storeData });
    }
    
    res.status(201).json(store);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
});

export default router;
