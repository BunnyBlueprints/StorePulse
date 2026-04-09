import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { ratingSchema } from '../validators';

const router = Router();

// Normal user: Submit a new rating
router.post('/', authenticate, requireRole(['NORMAL_USER']), async (req: AuthRequest, res) => {
    try {
        const data = ratingSchema.parse(req.body);
        
        // Check if rating already exists for this user and store
        const existing = await prisma.rating.findFirst({
            where: { userId: req.user!.id, storeId: data.storeId }
        });
        
        if (existing) {
            return res.status(400).json({ message: 'You have already rated this store. Please modify your existing rating.' });
        }

        const rating = await prisma.rating.create({
            data: {
                score: data.score,
                userId: req.user!.id,
                storeId: data.storeId
            }
        });

        // Update Average Rating of the Store
        await updateStoreAverageRating(data.storeId);
        
        res.status(201).json(rating);
    } catch (error: any) {
        res.status(400).json({ error: error.errors || error.message });
    }
});

// Normal user: Modify a rating
router.put('/:id', authenticate, requireRole(['NORMAL_USER']), async (req: AuthRequest, res) => {
    try {
        const { score } = req.body;
        if (!score || score < 1 || score > 5) {
             return res.status(400).json({ message: 'Invalid score' });
        }

        const ratingId = String(req.params.id);
        const rating = await prisma.rating.findUnique({ where: { id: ratingId } });

        if (!rating) return res.status(404).json({ message: 'Rating not found' });
        if (rating.userId !== req.user!.id) {
            return res.status(403).json({ message: 'Not authorized to modify this rating' });
        }

        const updatedRating = await prisma.rating.update({
            where: { id: ratingId },
            data: { score }
        });

        // Update Average Rating of the Store
        await updateStoreAverageRating(rating.storeId);

        res.json(updatedRating);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Store Owner: View ratings for their store
router.get('/store/my', authenticate, requireRole(['STORE_OWNER']), async (req: AuthRequest, res) => {
    try {
        // Find the store associated with this store owner
        const user = await prisma.user.findUnique({ where: { id: req.user!.id }});
        if (!user || !user.storeId) {
            return res.status(404).json({ message: 'You do not have a store assigned' });
        }

        const ratings = await prisma.rating.findMany({
            where: { storeId: user.storeId },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(ratings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

async function updateStoreAverageRating(storeId: string) {
    const aggregations = await prisma.rating.aggregate({
        _avg: { score: true },
        where: { storeId }
    });
    
    await prisma.store.update({
        where: { id: storeId },
        data: { averageRating: aggregations._avg.score || 0 }
    });
}

export default router;
