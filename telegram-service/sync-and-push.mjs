/**
 * Automated Telegram Newspaper Sync & GitHub Push
 * 
 * 1. Connects to Telegram and downloads today's latest newspaper PDFs
 * 2. Generates updated manifest.json
 * 3. Automatically commits & pushes to GitHub so Vercel deploys today's papers live
 * 
 * Usage: node sync-and-push.mjs
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📰 UPSC NewsHub — Daily Newspaper Sync & Push`);
  try {
    // Step 0: Keep-Alive Ping for Render Backend
    try {
      const https = await import('https');
      https.get('https://upsc-newshub-backend.onrender.com/api/auth/health', (res) => {
        console.log(`⚡ Render Backend Keep-Alive: HTTP ${res.statusCode} (Instance Warm)`);
      }).on('error', () => {});
    } catch (_) {}

    // Step 1: Run fetch script
    console.log('📡 Step 1/3: Fetching latest newspaper PDFs from Telegram...');
    const { fetchNewspapers } = await import('./fetch-newspapers.mjs');
    const result = await fetchNewspapers();

    console.log(`\n📊 Fetch Result: ${result.newCount || 0} new PDFs downloaded.`);

    // Step 2: Check git status
    console.log('\n🔍 Step 2/3: Checking for updated newspaper files...');
    const status = execSync('git status --porcelain frontend/public/newspapers', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });

    if (!status.trim()) {
      console.log('✅ Newspapers and manifest.json are already up to date on GitHub.');
      return;
    }

    console.log('📦 Changes detected in frontend/public/newspapers:');
    console.log(status);

    // Step 3: Git add, commit, and push
    console.log('🚀 Step 3/3: Committing and pushing to GitHub for Vercel deployment...');
    const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    execSync('git add frontend/public/newspapers', { cwd: ROOT_DIR, stdio: 'inherit' });
    execSync(`git commit -m "chore(newspapers): auto-sync daily editions for ${todayStr}"`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });

    // Pull latest before pushing to avoid rejected non-fast-forward updates
    try {
      execSync('git pull --rebase origin main', { cwd: ROOT_DIR, stdio: 'inherit' });
    } catch (_) {}

    // Push with retry mechanism
    let pushed = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📤 Pushing updates to GitHub (Attempt ${attempt}/3)...`);
        execSync('git push origin main', { cwd: ROOT_DIR, stdio: 'inherit' });
        pushed = true;
        break;
      } catch (pushErr) {
        console.warn(`⚠️ Push attempt ${attempt} failed: ${pushErr.message}. Retrying in 4s...`);
        execSync('timeout /t 4 /nobreak >nul 2>&1 || sleep 4', { cwd: ROOT_DIR, stdio: 'ignore' });
      }
    }

    if (!pushed) {
      throw new Error('Failed to push to GitHub after 3 attempts.');
    }

    console.log(`\n🎉 SUCCESS! Today's newspapers (${todayStr}) pushed to GitHub.`);
    console.log('⚡ Vercel will deploy the updated library in ~30 seconds.');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error during sync and push: ${err.message}`);
    process.exit(1);
  }
}

main();
