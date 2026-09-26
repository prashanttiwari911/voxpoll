require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Mike', 'Sarah', 'David', 'Laura', 'Tom', 'Emma', 'Daniel', 'Olivia', 'James', 'Sophia', 'Matthew', 'Isabella', 'Joshua', 'Mia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const locations = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];
const genders = ['MALE', 'FEMALE', 'OTHER'];
const occupations = ['Software Engineer', 'Teacher', 'Doctor', 'Designer', 'Student', 'Manager', 'Analyst', 'Writer', 'Artist', 'Lawyer'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Seeding 100 dummy users...');
  
  const usersToCreate = [];
  for (let i = 0; i < 100; i++) {
    const fName = getRandomItem(firstNames);
    const lName = getRandomItem(lastNames);
    usersToCreate.push({
      email: `demo_user_${i}_${Date.now()}@example.com`,
      name: `${fName} ${lName}`,
      age: Math.floor(Math.random() * 50) + 18, // Ages 18 to 67
      address: getRandomItem(locations),
      gender: getRandomItem(genders),
      occupation: getRandomItem(occupations),
      role: 'USER'
    });
  }

  // Insert users
  await prisma.user.createMany({
    data: usersToCreate
  });

  // Fetch the newly created users
  const newUsers = await prisma.user.findMany({
    orderBy: { id: 'desc' },
    take: 100
  });

  console.log(`Created ${newUsers.length} users.`);

  // Get all polls
  const polls = await prisma.poll.findMany({
    include: { options: true }
  });

  console.log(`Found ${polls.length} polls. Generating votes...`);

  let voteCount = 0;
  for (const poll of polls) {
    if (poll.options.length === 0) continue;

    // Decide how many users will vote on this poll (70% - 100% of the 100 users)
    const numVoters = Math.floor(newUsers.length * (Math.random() * 0.3 + 0.7));
    
    // Shuffle the new users array
    const shuffledUsers = [...newUsers].sort(() => 0.5 - Math.random());
    const voters = shuffledUsers.slice(0, numVoters);

    const votesData = [];
    for (const voter of voters) {
      // Pick a random option
      const option = getRandomItem(poll.options);
      
      votesData.push({
        userId: voter.id,
        pollId: poll.id,
        optionId: option.id
      });
    }

    try {
      // Adding votes
      await prisma.vote.createMany({
        data: votesData,
        // In case the poll allows multi-choice, this handles potential uniqueness safely
      });
      voteCount += votesData.length;
    } catch (e) {
      console.log(`Error adding votes for poll ${poll.id}:`, e.message);
    }
  }

  console.log(`Successfully added ${voteCount} votes! Check out the dashboard to see the rich analytics.`);
  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
