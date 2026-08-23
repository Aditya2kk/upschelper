/**
 * One-time authentication script for Telegram MTProto.
 * Run this once: npm run auth
 * It will prompt for your phone number and verification code,
 * then output a SESSION STRING to put in your .env file.
 */
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { createInterface } from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

if (!apiId || !apiHash) {
  console.error('\n❌ Missing TELEGRAM_API_ID or TELEGRAM_API_HASH in .env');
  console.error('   Get them from: https://my.telegram.org/apps\n');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('\n🔐 Telegram Authentication Setup');
  console.log('================================\n');

  const client = new TelegramClient(
    new StringSession(''),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );

  await client.start({
    phoneNumber: async () => await ask('📱 Enter your phone number (with country code, e.g. +91XXXXXXXXXX): '),
    password: async () => await ask('🔑 Enter your 2FA password (if enabled, or press Enter): '),
    phoneCode: async () => await ask('📨 Enter the verification code sent to your Telegram: '),
    onError: (err) => console.error('Error:', err.message),
  });

  const session = client.session.save();
  
  console.log('\n✅ Authentication successful!\n');
  console.log('📋 Copy the following SESSION STRING and paste it into your .env file:\n');
  console.log('─'.repeat(60));
  console.log(`TELEGRAM_SESSION=${session}`);
  console.log('─'.repeat(60));
  console.log('\n💡 Add this to your telegram-service/.env file.\n');

  // Quick test: try to access the channel
  const channel = process.env.TELEGRAM_CHANNEL || 'abvcdsdf';
  try {
    const entity = await client.getEntity(channel);
    console.log(`✅ Channel access verified: "${entity.title}" (@${channel})`);
    console.log(`   Subscribers: ${entity.participantsCount || 'N/A'}\n`);
  } catch (err) {
    console.log(`⚠️  Could not verify channel @${channel}: ${err.message}\n`);
  }

  await client.disconnect();
  rl.close();
}

main().catch(console.error);
