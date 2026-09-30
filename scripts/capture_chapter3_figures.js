require('dotenv').config();
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';
const outputDir = path.join(process.cwd(), 'public', 'screenshots');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

fs.mkdirSync(outputDir, { recursive: true });

async function createUser(index, name, age, address) {
  const email = `figure3-evidence-${index}@voti.com`;
  return prisma.user.upsert({
    where: { email },
    update: { name, age, address, role: 'USER' },
    create: { email, name, age, address, role: 'USER' },
  });
}

async function createPoll(creatorId, question, description, category, options) {
  return prisma.poll.create({
    data: {
      creatorId,
      question,
      description,
      category,
      status: 'PUBLISHED',
      options: { create: options.map((text) => ({ text })) },
    },
    include: { options: true },
  });
}

async function signIn(page, email, name, age, address) {
  const csrfResponse = await page.request.get(`${baseUrl}/api/auth/csrf`);
  const { csrfToken } = await csrfResponse.json();
  await page.request.post(`${baseUrl}/api/auth/callback/credentials`, {
    form: {
      csrfToken,
      email,
      name,
      age: String(age),
      address,
      role: 'USER',
      callbackUrl: `${baseUrl}/dashboard`,
      json: 'true',
    },
  });
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: new RegExp(`Hi, ${name.split(' ')[0]}`, 'i') }).waitFor({ timeout: 15000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const createdEmails = [];

  try {
    const owner = await createUser('owner', 'Figure Owner', 39, 'Delhi');
    createdEmails.push(owner.email);

    const demographicVoters = await Promise.all([
      createUser('voter-a', 'Figure Voter A', 19, 'Delhi'),
      createUser('voter-b', 'Figure Voter B', 33, 'Maharashtra'),
      createUser('voter-c', 'Figure Voter C', 52, 'Karnataka'),
      createUser('voter-d', 'Figure Voter D', 27, 'Tamil Nadu'),
    ]);
    createdEmails.push(...demographicVoters.map((user) => user.email));

    const viewer = await createUser('viewer', 'Figure Viewer', 44, 'Kerala');
    createdEmails.push(viewer.email);

    await createPoll(owner.id, 'Which public service should improve first?', 'Choose the service that would make the biggest difference in your community.', 'POLITICS', ['Public transport', 'Healthcare access', 'Digital services']);
    await createPoll(owner.id, 'What helps you learn a new skill?', 'A community poll about learning preferences.', 'EDUCATION', ['Short lessons', 'Hands-on practice', 'Group study']);
    await createPoll(owner.id, 'Which feature should we build next?', 'Tell us what would make online polls more useful.', 'TECHNOLOGY', ['Better analytics', 'More sharing options', 'Accessibility tools']);

    const resultsPoll = await createPoll(
      owner.id,
      'Which feature would make community polls more useful?',
      'We are planning the next round of improvements. Choose the feature you would value most.',
      'TECHNOLOGY',
      ['Live result charts', 'Regional insights', 'Poll sharing tools'],
    );

    await prisma.vote.createMany({
      data: demographicVoters.map((user, index) => ({
        userId: user.id,
        pollId: resultsPoll.id,
        optionId: index < 3 ? resultsPoll.options[0].id : resultsPoll.options[1].id,
      })),
    });

    const desktopList = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
    await desktopList.goto(baseUrl, { waitUntil: 'networkidle' });
    await desktopList.locator('#explore').scrollIntoViewIfNeeded();
    await desktopList.screenshot({ path: path.join(outputDir, 'figure_3_1_poll_list_desktop.png') });

    const mobileList = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
    await mobileList.goto(baseUrl, { waitUntil: 'networkidle' });
    await mobileList.locator('#explore').scrollIntoViewIfNeeded();
    await mobileList.screenshot({ path: path.join(outputDir, 'figure_3_2_poll_list_mobile_375px.png') });

    const detailContext = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    const detailPage = await detailContext.newPage();
    await signIn(detailPage, viewer.email, viewer.name, viewer.age, viewer.address);
    await detailPage.goto(`${baseUrl}/polls/${resultsPoll.id}`, { waitUntil: 'networkidle' });
    await detailPage.getByRole('heading', { name: 'Cast Your Ballot' }).waitFor();
    await detailPage.screenshot({ path: path.join(outputDir, 'figure_3_3_poll_detail_voting_form.png'), fullPage: true });

    await detailPage.locator('button[aria-pressed]').nth(1).click();
    await detailPage.getByRole('button', { name: 'Submit My Vote' }).click();
    await detailPage.getByRole('button', { name: 'Confirm Vote' }).click();
    await detailPage.getByText('You voted on this poll! Here are the live results.').waitFor({ timeout: 15000 });
    await detailPage.getByRole('heading', { name: 'Live Results' }).waitFor();
    await detailPage.screenshot({ path: path.join(outputDir, 'figure_3_4_live_standings_after_vote.png'), fullPage: true });

    await detailPage.getByRole('button', { name: 'Age' }).click();
    await detailPage.getByText('Responses by Age Group').waitFor();
    await detailPage.screenshot({ path: path.join(outputDir, 'figure_3_5a_demographics_age.png'), fullPage: true });

    await detailPage.getByRole('button', { name: 'Region' }).click();
    await detailPage.getByText('Geographic Distribution').waitFor();
    await detailPage.screenshot({ path: path.join(outputDir, 'figure_3_5b_demographics_region.png'), fullPage: true });

    const presenterContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const presenterPage = await presenterContext.newPage();
    await signIn(presenterPage, owner.email, owner.name, owner.age, owner.address);
    await presenterPage.goto(`${baseUrl}/polls/${resultsPoll.id}`, { waitUntil: 'networkidle' });
    await presenterPage.getByRole('button', { name: 'Present' }).click();
    await presenterPage.getByText('Join the poll at').waitFor();
    await presenterPage.locator('svg').filter({ has: presenterPage.locator('rect') }).last().waitFor();
    await presenterPage.screenshot({ path: path.join(outputDir, 'figure_3_14_presenter_mode.png'), fullPage: true });

    console.log('Captured Figures 3.1–3.5 and Figure 3.14 in public/screenshots.');
    console.log(`Results poll: ${resultsPoll.id}`);
  } finally {
    await browser.close();
    if (createdEmails.length) {
      await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
    }
    await prisma.$disconnect();
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
