import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type UserInput = {
    email: string;
    name: string;
    password: string;
    address: string;
    role: 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';
};

const createUser = async (input: UserInput) => {
    const password = await bcrypt.hash(input.password, 10);
    return prisma.user.upsert({
        where: { email: input.email },
        update: { name: input.name, address: input.address, role: input.role, password },
        create: { ...input, password }
    });
};

const createStore = async (input: { name: string; email: string; address: string; ownerId?: string }) => (
    prisma.store.upsert({
        where: { email: input.email },
        update: { name: input.name, address: input.address, ownerId: input.ownerId },
        create: input
    })
);

const createRating = async (userId: string, storeId: string, score: number) => {
    const existing = await prisma.rating.findFirst({ where: { userId, storeId } });
    if (existing) {
        return prisma.rating.update({ where: { id: existing.id }, data: { score } });
    }
    return prisma.rating.create({ data: { userId, storeId, score } });
};

async function main() {
    console.log('Seeding MongoDB Atlas with demo data...');

    const admin = await createUser({
        email: 'admin@storepulse.com',
        name: 'System Administrator',
        password: 'Admin@123',
        address: '123 Admin Lane, Admin City, 10001',
        role: 'SYSTEM_ADMIN'
    });

    const normalUsers = await Promise.all([
        createUser({ email: 'alice@example.com', name: 'Alice Johnson Alice Johnson', password: 'User@123', address: '456 Normal St. Wonderland', role: 'NORMAL_USER' }),
        createUser({ email: 'ben@example.com', name: 'Benjamin Carter Normal User', password: 'User@123', address: '18 Market Road, Pune', role: 'NORMAL_USER' }),
        createUser({ email: 'charlie@example.com', name: 'Charlie Rodriguez Customer', password: 'User@123', address: '72 Lake View Avenue, Delhi', role: 'NORMAL_USER' }),
        createUser({ email: 'diana@example.com', name: 'Diana Williams Shopper', password: 'User@123', address: '9 Garden Street, Bengaluru', role: 'NORMAL_USER' }),
        createUser({ email: 'emily@example.com', name: 'Emily Thompson Reviewer', password: 'User@123', address: '44 Sunrise Boulevard, Mumbai', role: 'NORMAL_USER' })
    ]);

    const owners = await Promise.all([
        createUser({ email: 'owner@example.com', name: 'Store Owner Bob Owner Bob', password: 'Owner@123', address: '789 Owner Blvd, Commerce City', role: 'STORE_OWNER' }),
        createUser({ email: 'owner.maya@example.com', name: 'Maya Patel Store Manager', password: 'Owner@123', address: '21 Business Park, Hyderabad', role: 'STORE_OWNER' }),
        createUser({ email: 'owner.liam@example.com', name: 'Liam Anderson Shop Owner', password: 'Owner@123', address: '63 Riverside Road, Chennai', role: 'STORE_OWNER' })
    ]);

    const stores = await Promise.all([
        createStore({ name: 'Awesome Bob Store', email: 'store@example.com', address: '789 Central Ave, Store City', ownerId: owners[0].id }),
        createStore({ name: 'Maya Market Collective', email: 'maya.market@example.com', address: '21 Business Park, Hyderabad', ownerId: owners[1].id }),
        createStore({ name: 'Liam & Co. Essentials', email: 'liam.essentials@example.com', address: '63 Riverside Road, Chennai', ownerId: owners[2].id }),
        createStore({ name: 'Green Basket Grocers', email: 'green.basket@example.com', address: '12 Orchard Lane, Kolkata' }),
        createStore({ name: 'The Corner Coffee Lab', email: 'corner.coffee@example.com', address: '5 Station Road, Jaipur' }),
        createStore({ name: 'Urban Thread Boutique', email: 'urban.thread@example.com', address: '88 Fashion Street, Mumbai' })
    ]);

    const ratings = [
        [normalUsers[0], stores[0], 5], [normalUsers[1], stores[0], 4], [normalUsers[2], stores[0], 5],
        [normalUsers[3], stores[1], 4], [normalUsers[4], stores[1], 5], [normalUsers[0], stores[1], 4],
        [normalUsers[1], stores[2], 3], [normalUsers[2], stores[2], 4], [normalUsers[3], stores[2], 4],
        [normalUsers[4], stores[3], 5], [normalUsers[0], stores[3], 4], [normalUsers[2], stores[4], 5],
        [normalUsers[3], stores[4], 5], [normalUsers[1], stores[5], 3], [normalUsers[4], stores[5], 4]
    ] as const;

    for (const [user, store, score] of ratings) {
        await createRating(user.id, store.id, score);
    }

    for (const store of stores) {
        const aggregate = await prisma.rating.aggregate({ _avg: { score: true }, where: { storeId: store.id } });
        await prisma.store.update({ where: { id: store.id }, data: { averageRating: aggregate._avg.score || 0 } });
    }

    console.log(`Seeded ${1 + normalUsers.length + owners.length} users, ${stores.length} stores, and ${ratings.length} ratings.`);
    console.log(`Admin: ${admin.email} / Admin@123`);
    console.log('Normal users: alice@example.com, ben@example.com, charlie@example.com, diana@example.com, emily@example.com / User@123');
    console.log('Store owners: owner@example.com, owner.maya@example.com, owner.liam@example.com / Owner@123');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
