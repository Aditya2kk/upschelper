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
  console.log(`Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log(`${'═'.repeat(60)}\n`);

  try {
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
    execSync('git push origin main', { cwd: ROOT_DIR, stdio: 'inherit' });

    console.log(`\n🎉 SUCCESS! Today's newspapers (${todayStr}) pushed to GitHub.`);
    console.log('⚡ Vercel will deploy the updated library in ~30 seconds.');
  } catch (err) {
    console.error(`\n❌ Error during sync and push: ${err.message}`);
    process.exit(1);
  }
}

main();
