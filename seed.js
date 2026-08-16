const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database with demo data...');

  // Create users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      age: 28,
      address: 'New York',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      age: 34,
      address: 'California',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      age: 45,
      address: 'Texas',
    },
  });

  // Create Poll 1: Tech
  const techPoll = await prisma.poll.create({
    data: {
      question: 'What is your favorite programming language for modern web development in 2026?',
      description: 'Vote for the language you prefer the most when building modern web apps.',
      category: 'TECHNOLOGY',
      status: 'PUBLISHED',
      creatorId: alice.id,
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Closes in 7 days
      options: {
        create: [
          { text: 'TypeScript / JavaScript' },
          { text: 'Python' },
          { text: 'Go' },
          { text: 'Rust' },
        ],
      },
    },
    include: { options: true },
  });

  // Create Poll 2: Sports
  const sportsPoll = await prisma.poll.create({
    data: {
      question: 'Who will win the World Cup?',
      description: 'The upcoming World Cup is heavily debated. Who is your favorite?',
      category: 'SPORTS',
      status: 'PUBLISHED',
      creatorId: bob.id,
      closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      options: {
        create: [
          { text: 'Brazil' },
          { text: 'France' },
          { text: 'Argentina' },
          { text: 'Germany' },
        ],
      },
    },
    include: { options: true },
  });

  // Create Poll 3: Closed Poll
  const closedPoll = await prisma.poll.create({
    data: {
      question: 'Should remote work be the standard for tech companies?',
      description: 'This poll is now closed.',
      category: 'OTHER',
      status: 'CLOSED',
      creatorId: charlie.id,
      options: {
        create: [
          { text: 'Yes, full remote' },
          { text: 'Hybrid (2-3 days in office)' },
          { text: 'No, full office' },
        ],
      },
    },
    include: { options: true },
  });

  // Add Votes
  const users = [alice, bob, charlie];
  
  // Votes for Tech Poll
  await prisma.vote.create({ data: { userId: alice.id, pollId: techPoll.id, optionId: techPoll.options[0].id } });
  await prisma.vote.create({ data: { userId: bob.id, pollId: techPoll.id, optionId: techPoll.options[0].id } });
  await prisma.vote.create({ data: { userId: charlie.id, pollId: techPoll.id, optionId: techPoll.options[3].id } });
  
  // Votes for Sports Poll
  await prisma.vote.create({ data: { userId: alice.id, pollId: sportsPoll.id, optionId: sportsPoll.options[1].id } });
  await prisma.vote.create({ data: { userId: bob.id, pollId: sportsPoll.id, optionId: sportsPoll.options[0].id } });

  // Votes for Closed Poll
  await prisma.vote.create({ data: { userId: alice.id, pollId: closedPoll.id, optionId: closedPoll.options[0].id } });
  await prisma.vote.create({ data: { userId: bob.id, pollId: closedPoll.id, optionId: closedPoll.options[1].id } });
  await prisma.vote.create({ data: { userId: charlie.id, pollId: closedPoll.id, optionId: closedPoll.options[0].id } });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
