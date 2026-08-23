/**
 * Scheduled newspaper fetcher.
 * Runs the fetch-newspapers script on a cron schedule.
 * 
 * Default: Every day at 6:30 AM IST (1:00 AM UTC)
 * Usage: npm start
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const CRON = process.env.FETCH_CRON || '30 1 * * *'; // 6:30 AM IST (UTC+5:30)

function parseCron(expr) {
  const [min, hour] = expr.split(' ').map(Number);
  return { min, hour };
}

async function runFetch() {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📰 Scheduled Fetch — ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`${'═'.repeat(50)}`);

  try {
    const { fetchNewspapers } = await import('./fetch-newspapers.mjs');
    const result = await fetchNewspapers();
    if (result.success) {
      console.log(`✅ Scheduled fetch completed. ${result.newCount} new PDFs.`);
    } else {
      console.log(`⚠️ Fetch completed with issues: ${result.error}`);
    }
  } catch (err) {
    console.error(`❌ Scheduled fetch failed: ${err.message}`);
  }
}

function scheduleNext() {
  const now = new Date();
  const { min, hour } = parseCron(CRON);
  
  const next = new Date(now);
  next.setUTCHours(hour, min, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  const delay = next.getTime() - now.getTime();
  const hours = Math.floor(delay / 3600000);
  const mins = Math.floor((delay % 3600000) / 60000);

  console.log(`⏰ Next fetch at: ${next.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST (in ${hours}h ${mins}m)`);

  setTimeout(async () => {
    await runFetch();
    scheduleNext(); // Schedule the next one
  }, delay);
}

async function main() {
  console.log(`\n📰 UPSC NewsHub — Telegram Newspaper Scheduler`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`Channel: @${process.env.TELEGRAM_CHANNEL || 'abvcdsdf'}`);
  console.log(`Schedule: ${CRON}`);
  console.log(`${'─'.repeat(50)}\n`);

  // Run immediately on start
  console.log('🚀 Running initial fetch...');
  await runFetch();

  // Then schedule daily
  scheduleNext();
  
  console.log('\n🔄 Scheduler is running. Press Ctrl+C to stop.\n');
}

main().catch(console.error);
