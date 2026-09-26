const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // 1. Create a System / Admin User
  let systemUser = await prisma.user.findUnique({ where: { email: 'system@voti.com' } });
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@voti.com',
        name: 'System Auto-Seed',
        role: 'ADMIN',
        age: 30,
        address: 'Delhi',
      },
    });
    console.log('Created System Admin User.');
  }

  // 2. Create sample polls
  const pollCount = await prisma.poll.count();
  if (pollCount === 0) {
    await prisma.poll.create({
      data: {
        creatorId: systemUser.id,
        question: "What is your primary programming language for 2026?",
        description: "Let's see what the community is focusing on this year.",
        category: "Technology",
        status: "PUBLISHED",
        isMultipleChoice: false,
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        options: {
          create: [
            { text: "TypeScript / JavaScript" },
            { text: "Python" },
            { text: "Rust" },
            { text: "Go" },
          ],
        },
      },
    });

    await prisma.poll.create({
      data: {
        creatorId: systemUser.id,
        question: "How many days a week do you prefer working from the office?",
        category: "Work & Life",
        status: "PUBLISHED",
        isMultipleChoice: true,
        maxChoices: 2,
        options: {
          create: [
            { text: "Fully Remote (0 Days)" },
            { text: "1-2 Days" },
            { text: "3-4 Days" },
            { text: "Fully On-site (5 Days)" },
          ],
        },
      },
    });
    console.log('Created 2 sample polls.');
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
