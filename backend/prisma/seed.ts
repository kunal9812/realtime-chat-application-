import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.reaction.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const alice = await prisma.user.create({
    data: {
      username: 'alice',
      email: 'alice@demo.com',
      passwordHash,
      avatar: '👩',
      bio: 'Alice in Wonderland'
    }
  });

  const bob = await prisma.user.create({
    data: {
      username: 'bob',
      email: 'bob@demo.com',
      passwordHash,
      avatar: '👨',
      bio: 'Builder Bob'
    }
  });

  const roomsData = [
    { name: 'General 💬', emoji: '💬', wallpaper: 'gradient-1' },
    { name: 'Design 🎨', emoji: '🎨', wallpaper: 'gradient-2' },
    { name: 'Random 🎲', emoji: '🎲', wallpaper: 'gradient-3' }
  ];

  for (const r of roomsData) {
    const room = await prisma.room.create({
      data: {
        name: r.name,
        emoji: r.emoji,
        wallpaper: r.wallpaper,
        type: 'GROUP',
        members: {
          create: [
            { userId: alice.id },
            { userId: bob.id }
          ]
        }
      }
    });

    for (let i = 0; i < 5; i++) {
      const sender = i % 2 === 0 ? alice : bob;
      await prisma.message.create({
        data: {
          content: `Seed message ${i + 1} in ${r.name} from ${sender.username}`,
          senderId: sender.id,
          roomId: room.id,
          type: 'TEXT'
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
