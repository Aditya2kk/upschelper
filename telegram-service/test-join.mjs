import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { Api } from 'telegram/tl/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  );

  await client.connect();
  console.log('✅ Connected to Telegram!');

  const inviteHash = '23eZ5sMHedExZTNl';
  console.log('Checking invite hash:', inviteHash);

  let targetEntity = null;

  try {
    const checkRes = await client.invoke(new Api.messages.CheckChatInvite({ hash: inviteHash }));
    console.log('CheckChatInvite result:', checkRes.className);
    if (checkRes.title) console.log('Title:', checkRes.title);
    if (checkRes.chat) {
      console.log('Chat in CheckInvite:', checkRes.chat.title, checkRes.chat.id);
      targetEntity = checkRes.chat;
    }
  } catch (e) {
    console.log('CheckChatInvite note:', e.message);
  }

  try {
    const joinRes = await client.invoke(new Api.messages.ImportChatInvite({ hash: inviteHash }));
    console.log('ImportChatInvite success:', joinRes.className);
    if (joinRes.chats && joinRes.chats.length > 0) {
      targetEntity = joinRes.chats[0];
    }
  } catch (e) {
    console.log('ImportChatInvite note:', e.message);
  }

  const dialogs = await client.getDialogs({ limit: 30 });
  console.log('\n📜 Recent Dialogs:');
  for (const d of dialogs) {
    console.log(`- Title: "${d.title}" | ID: ${d.id} | Type: ${d.entity?.className} | Username: ${d.entity?.username || 'none'}`);
    if (d.title && d.title.toLowerCase().includes('hindu')) {
      targetEntity = d.entity;
    }
  }

  if (targetEntity) {
    console.log('\n🎯 Found Target Entity:', targetEntity.title, 'ID:', targetEntity.id);
    const messages = await client.getMessages(targetEntity, { limit: 10 });
    console.log(`Fetched ${messages.length} recent messages from target:`);
    for (const msg of messages) {
      const fileAttr = msg.media?.document?.attributes?.find(a => a instanceof Api.DocumentAttributeFilename);
      console.log(`- Msg #${msg.id} [${new Date(msg.date * 1000).toISOString().split('T')[0]}]: ${fileAttr?.fileName || msg.message?.substring(0, 40) || '(no text)'}`);
    }
  }

  await client.disconnect();
}

main().catch(console.error);
