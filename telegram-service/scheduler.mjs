/**
 * Continuous / Scheduled newspaper fetcher.
 * Polls the Telegram channel every 20 minutes continuously all day.
 * Whenever a new edition is uploaded at ANY hour, it downloads and deploys it immediately.
 * 
 * Usage: npm start
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Interval in minutes (Default: 20 minutes)
const INTERVAL_MINUTES = parseInt(process.env.POLL_INTERVAL_MINUTES || '20', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

async function runFetchAndPush() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📰 Telegram Newspaper Auto-Sync & Push`);
  console.log(`Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log(`${'═'.repeat(60)}`);

  try {
    const { execSync } = await import('child_process');
    execSync('node sync-and-push.mjs', {
      cwd: __dirname,
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(`⚠️ Cycle finished: ${err.message}`);
  }
}

async function main() {
  console.log(`\n📰 UPSC NewsHub — Continuous Telegram Newspaper Daemon`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Pipelines: Multi-Channel Ingestion & Deduplication Active`);
  console.log(`Interval:  Every ${INTERVAL_MINUTES} minutes (Continuous all day)`);
  console.log(`${'─'.repeat(60)}\n`);

  // Run initial cycle immediately
  console.log('🚀 Running initial sync & push cycle...');
  await runFetchAndPush();

  console.log(`\n⏰ Next check in ${INTERVAL_MINUTES} minutes.`);
  console.log('🔄 Daemon is active in background. Press Ctrl+C to stop.\n');

  // Continuous polling loop
  setInterval(async () => {
    await runFetchAndPush();
    console.log(`\n⏰ Next check in ${INTERVAL_MINUTES} minutes.`);
  }, INTERVAL_MS);
}

main().catch(console.error);

