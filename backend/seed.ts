import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create System Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@storepulse.com' },
        update: {},
        create: {
            email: 'admin@storepulse.com',
            name: 'System Administrator',
            password: hashedPassword,
            address: '123 Admin Lane, Admin City, 10001',
            role: 'SYSTEM_ADMIN'
        }
    });
    console.log(`Created System Admin: ${admin.email}`);
    
    // Create some Normal Users
    const userPass = await bcrypt.hash('User@123', 10);
    const userA = await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
            email: 'alice@example.com',
            name: 'Alice Johnson Alice Johnson', // 20+ chars
            password: userPass,
            address: '456 Normal St. Wonderland',
            role: 'NORMAL_USER'
        }
    });
    console.log(`Created Normal User: ${userA.email}`);

    // Create Store Owner User
    const ownerPass = await bcrypt.hash('Owner@123', 10);
    const ownerA = await prisma.user.upsert({
        where: { email: 'owner@example.com' },
        update: {},
        create: {
            email: 'owner@example.com',
            name: 'Store Owner Bob Owner Bob', // 20+ chars
            password: ownerPass,
            address: '789 Owner Blvd, Commerce City',
            role: 'STORE_OWNER'
        }
    });
    
    // Create Store and Link
    const store = await prisma.store.upsert({
        where: { email: 'store@example.com' },
        update: {},
        create: {
            name: 'Awesome Bob Store',
            email: 'store@example.com',
            address: '789 Central Ave, Store City'
        }
    });
    
    // Link store to owner
    await prisma.user.update({
        where: { id: ownerA.id },
        data: { storeId: store.id }
    });
    console.log(`Created Store: ${store.name} and Owner: ${ownerA.email}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
