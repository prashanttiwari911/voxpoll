require('dotenv').config();
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';
const studioUrl = 'http://localhost:5555';
const outputDir = path.join(process.cwd(), 'public', 'screenshots');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const fixtureEmails = [];
const auditIds = [];

fs.mkdirSync(outputDir, { recursive: true });

async function createUser(key, name, age, address) {
  const email = `chapter7-${key}@voti.com`;
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, age, address, role: 'USER' },
    create: { email, name, age, address, role: 'USER' },
  });
  fixtureEmails.push(email);
  return user;
}

async function signIn(page, user) {
  const csrfResponse = await page.request.get(`${baseUrl}/api/auth/csrf`);
  const { csrfToken } = await csrfResponse.json();
  await page.request.post(`${baseUrl}/api/auth/callback/credentials`, {
    form: {
      csrfToken,
      email: user.email,
      name: user.name,
      age: String(user.age),
      address: user.address,
      role: 'USER',
      callbackUrl: `${baseUrl}/dashboard`,
      json: 'true',
    },
  });
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: new RegExp(`Hi, ${user.name.split(' ')[0]}`, 'i') }).waitFor({ timeout: 15000 });
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

function spreadsheetMarkup(csvText) {
  const rows = csvText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map(parseCsvLine);
  const headers = rows[0] ?? [];
  const records = rows.slice(1);
  const esc = (text) => String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const columnLetters = headers.map((_, index) => String.fromCharCode(65 + index));

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;background:#f3f4f6;color:#202124;font:13px Arial,sans-serif}
    .titlebar{height:48px;background:#fff;border-bottom:1px solid #dadce0;display:flex;align-items:center;padding:0 22px;gap:14px;font-size:16px;font-weight:600}
    .icon{width:25px;height:25px;background:#15803d;color:white;display:grid;place-items:center;font-weight:bold;border-radius:3px}
    .tabs{height:42px;background:#fff;border-bottom:1px solid #dadce0;padding:12px 22px;color:#5f6368}
    .toolbar{height:42px;background:#fff;border-bottom:1px solid #dadce0;padding:9px 22px;color:#5f6368}
    .sheet{padding:20px 22px;overflow:auto}.grid{border-collapse:collapse;background:white;min-width:1050px;box-shadow:0 1px 2px #0002}
    td,th{height:34px;border:1px solid #dadce0;padding:7px 12px;text-align:left;white-space:nowrap}
    .letters,.rownum{background:#f8f9fa;color:#5f6368;text-align:center;font-weight:400}.letters{height:28px}
    .header{background:#e8f0fe;font-weight:700;color:#174ea6}.rownum{width:44px}
    th:nth-child(2),td:nth-child(2){min-width:200px}th:nth-child(3),td:nth-child(3){min-width:90px}
    th:nth-child(4),td:nth-child(4){min-width:180px}th:nth-child(5),td:nth-child(5){min-width:220px}
    th:nth-child(6),td:nth-child(6){min-width:235px}
  </style></head><body>
    <div class="titlebar"><span class="icon">V</span><span>VoTI Poll Export</span></div>
    <div class="tabs">File　 Edit　 View　 Insert　 Format　 Data　 Tools　 Extensions　 Help</div>
    <div class="toolbar">voti_community_poll.csv　　A1　　fx　 ${esc(headers.join(' | '))}</div>
    <main class="sheet"><table class="grid"><thead><tr><th class="rownum"></th>${columnLetters.map((letter) => `<th class="letters">${letter}</th>`).join('')}</tr><tr><th class="rownum">1</th>${headers.map((header) => `<th class="header">${esc(header)}</th>`).join('')}</tr></thead>
      <tbody>${records.map((record, rowIndex) => `<tr><td class="rownum">${rowIndex + 2}</td>${headers.map((_, columnIndex) => `<td>${esc(record[columnIndex] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></main>
  </body></html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    const creator = await createUser('creator', 'Report Creator', 38, 'Delhi');
    const voters = await Promise.all([
      createUser('voter-01', 'Aarav Mehta', 19, 'Delhi'),
      createUser('voter-02', 'Diya Sharma', 31, 'Maharashtra'),
      createUser('voter-03', 'Kabir Rao', 52, 'Karnataka'),
      createUser('voter-04', 'Anaya Iyer', 27, 'Tamil Nadu'),
      createUser('voter-05', 'Ishaan Das', 42, 'West Bengal'),
      createUser('voter-06', 'Meera Nair', 63, 'Kerala'),
      createUser('voter-07', 'Rohan Singh', 23, 'Delhi'),
      createUser('voter-08', 'Sara Khan', 36, 'Maharashtra'),
    ]);

    const poll = await prisma.poll.create({
      data: {
        creatorId: creator.id,
        question: 'Which community improvement matters most?',
        description: 'A representative report poll with responses across choices, age groups, and locations.',
        category: 'OTHER',
        status: 'PUBLISHED',
        options: { create: [{ text: 'Public transport' }, { text: 'Healthcare access' }, { text: 'Digital services' }] },
      },
      include: { options: true },
    });

    await prisma.vote.createMany({
      data: voters.map((voter, index) => ({
        userId: voter.id,
        pollId: poll.id,
        optionId: poll.options[index % 3].id,
        createdAt: new Date(Date.now() - (8 - index) * 60_000),
      })),
    });

    const auditActions = [
      ['CREATE_POLL', 'Poll'],
      ['SUBMIT_VOTE', 'Poll'],
      ['UPDATE_PROFILE', 'User'],
      ['ADD_COMMENT', 'Comment'],
      ['ADMIN_SET_ROLE', 'User'],
      ['EXPORT_POLL', 'Poll'],
    ];
    for (const [index, [action, entity]] of auditActions.entries()) {
      const row = await prisma.auditLog.create({
        data: {
          userId: index === 4 ? creator.id : voters[index % voters.length].id,
          action,
          entity,
          entityId: poll.id,
          metadata: JSON.stringify({ source: 'chapter7-report-evidence' }),
          ipAddress: '127.0.0.1',
          createdAt: new Date(Date.now() - (auditActions.length - index) * 60_000),
        },
      });
      auditIds.push(row.id);
    }

    const appContext = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
    const creatorPage = await appContext.newPage();
    await signIn(creatorPage, creator);
    await creatorPage.goto(`${baseUrl}/polls/${poll.id}`, { waitUntil: 'networkidle' });
    await creatorPage.getByRole('heading', { name: 'Live Results' }).waitFor();
    await creatorPage.getByText('Votes by age group').waitFor();
    await creatorPage.getByText('Votes by location').waitFor();
    await creatorPage.screenshot({ path: path.join(outputDir, 'figure_7_2_poll_analytics_report.png'), fullPage: true });

    const csvResponse = await creatorPage.request.get(`${baseUrl}/api/polls/${poll.id}/export`);
    if (!csvResponse.ok()) throw new Error(`CSV export returned HTTP ${csvResponse.status()}`);
    const csvText = await csvResponse.text();
    const nonCommentLines = csvText.split(/\r?\n/).filter((line) => line && !line.startsWith('#'));
    const expectedHeader = 'Name,Age,Location,Choice,Response Time';
    if (nonCommentLines[0] !== expectedHeader || nonCommentLines.length !== voters.length + 1) {
      throw new Error(`Unexpected CSV output. Header=${nonCommentLines[0]}; dataRows=${nonCommentLines.length - 1}`);
    }
    fs.writeFileSync(path.join(outputDir, 'figure_7_1_poll_export.csv'), csvText, 'utf8');

    const spreadsheetPage = await browser.newPage({ viewport: { width: 1500, height: 900 } });
    await spreadsheetPage.setContent(spreadsheetMarkup(csvText));
    await spreadsheetPage.getByRole('columnheader', { name: 'Response Time' }).waitFor();
    await spreadsheetPage.screenshot({ path: path.join(outputDir, 'figure_7_1_csv_export.png'), fullPage: true });

    const studioPage = await browser.newPage({ viewport: { width: 1920, height: 1100 } });
    await studioPage.goto(studioUrl, { waitUntil: 'domcontentloaded' });
    await studioPage.getByRole('link', { name: 'AuditLog' }).click();
    await studioPage.getByText('SUBMIT_VOTE').first().waitFor({ timeout: 15000 });
    await studioPage.getByText('CREATE_POLL').first().waitFor();
    await studioPage.screenshot({ path: path.join(outputDir, 'figure_7_3_administration_audit_report.png'), fullPage: true });

    console.log(`Chapter 7 captures saved for poll ${poll.id}; ${voters.length} response rows verified in export.`);
  } finally {
    await browser.close();
    if (auditIds.length) await prisma.auditLog.deleteMany({ where: { id: { in: auditIds } } });
    if (fixtureEmails.length) await prisma.user.deleteMany({ where: { email: { in: fixtureEmails } } });
    await prisma.$disconnect();
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
