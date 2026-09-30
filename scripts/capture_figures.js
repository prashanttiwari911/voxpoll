require('dotenv').config();
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';
const evidenceDir = path.join(process.cwd(), 'public', 'screenshots', 'test-evidence');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

fs.mkdirSync(evidenceDir, { recursive: true });

async function upsertUser(email, name, age, address, role = 'USER') {
  return prisma.user.upsert({
    where: { email },
    update: { name, age, address, role },
    create: { email, name, age, address, role },
  });
}

async function createPoll(creatorId, question) {
  return prisma.poll.create({
    data: {
      creatorId,
      question,
      description: 'Temporary test-evidence fixture.',
      category: 'TECHNOLOGY',
      status: 'PUBLISHED',
      options: { create: [{ text: 'Yes' }, { text: 'No' }] },
    },
    include: { options: true },
  });
}

async function signIn(page, email, name, age, address, role = 'USER') {
  const csrfResponse = await page.request.get(`${baseUrl}/api/auth/csrf`);
  const { csrfToken } = await csrfResponse.json();
  const callbackResponse = await page.request.post(`${baseUrl}/api/auth/callback/credentials`, {
    form: {
      csrfToken,
      email,
      name,
      age: age == null ? '' : String(age),
      address: address || '',
      role,
      callbackUrl: `${baseUrl}/dashboard`,
      json: 'true',
    },
  });
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
  console.log('Auth diagnostic:', email, callbackResponse.status(), page.url(), (await page.locator('body').innerText()).slice(0, 180));
  await page.getByRole('heading', { name: new RegExp(`Hi, ${name.split(' ')[0]}`, 'i') }).waitFor({ timeout: 15000 });
}

async function confirmVote(page) {
  await page.locator('button[aria-pressed]').first().click();
  await page.getByRole('button', { name: 'Submit My Vote' }).click();
  await page.getByRole('button', { name: 'Confirm Vote' }).click();
}

async function captureMissingSecretStartup(browser) {
  const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'voti-missing-secret-'));
  const outputPath = path.join(evidenceDir, 'figure_5_7_tc36_missing_nextauth_secret.txt');
  for (const name of ['src', 'public']) {
    fs.cpSync(path.join(process.cwd(), name), path.join(isolatedRoot, name), { recursive: true });
  }
  for (const name of ['package.json', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'next-env.d.ts']) {
    fs.copyFileSync(path.join(process.cwd(), name), path.join(isolatedRoot, name));
  }
  fs.symlinkSync(path.join(process.cwd(), 'node_modules'), path.join(isolatedRoot, 'node_modules'), 'junction');

  let output = '';
  let child;
  try {
    const childEnv = { ...process.env };
    delete childEnv.NEXTAUTH_SECRET;
    child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run dev -- --port 3011 --webpack'], {
      cwd: isolatedRoot,
      env: childEnv,
      windowsHide: true,
    });
    child.stdout.on('data', (chunk) => { output += chunk.toString(); });
    child.stderr.on('data', (chunk) => { output += chunk.toString(); });

    const deadline = Date.now() + 45000;
    while (Date.now() < deadline && !/Missing required environment variables: NEXTAUTH_SECRET/i.test(output)) {
      try {
        await fetch('http://localhost:3011/', { signal: AbortSignal.timeout(1000) });
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (child.exitCode !== null) break;
    }

    if (!/Missing required environment variables: NEXTAUTH_SECRET/i.test(output)) {
      throw new Error(`Expected missing-secret startup failure; captured output:\n${output}`);
    }

    fs.writeFileSync(outputPath, output, 'utf8');
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const escaped = output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    await page.setContent(`<html><body style="margin:0;background:#111;color:#d8dee9;font:14px Consolas,monospace"><header style="padding:12px 18px;background:#202124;color:#fff">PowerShell | npm run dev (NEXTAUTH_SECRET unset)</header><pre style="white-space:pre-wrap;padding:20px;line-height:1.45">${escaped}</pre></body></html>`);
    await page.screenshot({ path: path.join(evidenceDir, 'figure_5_7_tc36_missing_nextauth_secret.png'), fullPage: true });
    await page.close();
  } finally {
    if (child && child.exitCode === null) {
      try {
        await new Promise((resolve) => {
          const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
          killer.on('close', resolve);
          killer.on('error', resolve);
        });
      } catch {}
    }
    const modulesLink = path.join(isolatedRoot, 'node_modules');
    if (fs.existsSync(modulesLink)) fs.unlinkSync(modulesLink);
    fs.rmSync(isolatedRoot, { recursive: true, force: true });
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

  try {
    const owner = await upsertUser('tc-evidence-owner@voti.com', 'Evidence Owner', 34, 'Delhi');
    const voter = await upsertUser('tc-evidence-voter@voti.com', 'Evidence Voter', 31, 'Karnataka');
    const incomplete = await upsertUser('tc-evidence-incomplete@voti.com', 'Incomplete Voter', null, null);
    const rateUser = await upsertUser('tc-evidence-rate@voti.com', 'Rate Limit User', 27, 'Kerala');
    const commentUser = await upsertUser('tc-evidence-comment@voti.com', 'Comment Evidence User', 26, 'Goa');

    const duplicatePoll = await createPoll(owner.id, 'TC-14: duplicate vote evidence poll');
    const profilePoll = await createPoll(owner.id, 'TC-04: incomplete profile evidence poll');
    const editPoll = await createPoll(owner.id, 'TC-09: locked edit evidence poll');
    const commentPoll = await createPoll(owner.id, 'TC-23: sentiment service fallback evidence poll');

    await prisma.vote.create({ data: { userId: voter.id, pollId: editPoll.id, optionId: editPoll.options[0].id } });
    await prisma.poll.createMany({
      data: Array.from({ length: 5 }, (_, index) => ({
        creatorId: rateUser.id,
        question: `TC-08 rate limit fixture ${index + 1}`,
        category: 'TECHNOLOGY',
        status: 'PUBLISHED',
      })),
    });

    const duplicateTab = await context.newPage();
    await signIn(duplicateTab, voter.email, voter.name, voter.age, voter.address);
    await duplicateTab.goto(`${baseUrl}/polls/${duplicatePoll.id}`, { waitUntil: 'networkidle' });
    await prisma.vote.create({ data: { userId: voter.id, pollId: duplicatePoll.id, optionId: duplicatePoll.options[0].id } });
    await confirmVote(duplicateTab);
    await duplicateTab.getByText(/already voted/i).waitFor({ timeout: 10000 });
    await duplicateTab.screenshot({ path: path.join(evidenceDir, 'figure_5_1_tc14_duplicate_vote.png'), fullPage: true });

    const profileContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const profileTab = await profileContext.newPage();
    await signIn(profileTab, incomplete.email, incomplete.name, null, null);
    await prisma.user.update({ where: { id: incomplete.id }, data: { age: null, address: null } });
    await profileTab.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle' });
    await profileTab.getByText(/Profile Incomplete/i).waitFor();
    await profileTab.screenshot({ path: path.join(evidenceDir, 'figure_5_2_tc04_profile_required.png'), fullPage: true });

    const editContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const editTab = await editContext.newPage();
    await signIn(editTab, owner.email, owner.name, owner.age, owner.address);
    await editTab.goto(`${baseUrl}/polls/${editPoll.id}`, { waitUntil: 'networkidle' });
    await editTab.getByText(/editing is locked to preserve data integrity/i).waitFor();
    await editTab.screenshot({ path: path.join(evidenceDir, 'figure_5_3_tc09_edit_locked.png'), fullPage: true });

    const rateContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const rateTab = await rateContext.newPage();
    await signIn(rateTab, rateUser.email, rateUser.name, rateUser.age, rateUser.address);
    await rateTab.goto(`${baseUrl}/polls/new`, { waitUntil: 'networkidle' });
    await rateTab.getByPlaceholder(/Which subject is most exciting/i).fill('TC-08 sixth poll creation rate limit');
    await rateTab.getByPlaceholder('Option 1').fill('First choice');
    await rateTab.getByPlaceholder('Option 2').fill('Second choice');
    await rateTab.getByRole('button', { name: 'Create Poll' }).click();
    await rateTab.getByText(/Too many polls created recently/i).waitFor({ timeout: 10000 });
    await rateTab.screenshot({ path: path.join(evidenceDir, 'figure_5_4_tc08_rate_limit.png'), fullPage: true });

    const memberContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const memberTab = await memberContext.newPage();
    await signIn(memberTab, commentUser.email, commentUser.name, commentUser.age, commentUser.address);
    await memberTab.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
    await memberTab.waitForURL(`${baseUrl}/`, { timeout: 10000 });
    await memberTab.screenshot({ path: path.join(evidenceDir, 'figure_5_5_tc28_non_admin_redirect.png'), fullPage: true });

    const commentContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const commentTab = await commentContext.newPage();
    await signIn(commentTab, commentUser.email, commentUser.name, commentUser.age, commentUser.address);
    await commentTab.goto(`${baseUrl}/polls/${commentPoll.id}`, { waitUntil: 'networkidle' });
    await commentTab.locator('#comment-input').fill('This comment is retained when sentiment analysis is unavailable.');
    await commentTab.locator('#comment-submit-btn').click();
    await commentTab.getByText('This comment is retained when sentiment analysis is unavailable.').waitFor();
    await commentTab.waitForTimeout(2600);
    const persistedComment = await prisma.comment.findFirst({
      where: { pollId: commentPoll.id, text: 'This comment is retained when sentiment analysis is unavailable.' },
      select: { sentimentLabel: true, sentimentScore: true },
    });
    if (!persistedComment || persistedComment.sentimentLabel !== null || persistedComment.sentimentScore !== null) {
      throw new Error(`TC-23 comment persistence/sentiment check failed: ${JSON.stringify(persistedComment)}`);
    }
    await commentTab.screenshot({ path: path.join(evidenceDir, 'figure_5_6_tc23_comment_no_sentiment.png'), fullPage: true });

    await captureMissingSecretStartup(browser);

    console.log(`Captured seven test-evidence figures in ${evidenceDir}`);
    console.log(`Poll fixtures: duplicate=${duplicatePoll.id}; profile=${profilePoll.id}; edit=${editPoll.id}; comment=${commentPoll.id}`);
  } finally {
    await browser.close();
    await prisma.user.deleteMany({ where: { email: { startsWith: 'tc-evidence-' } } });
    await prisma.$disconnect();
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
