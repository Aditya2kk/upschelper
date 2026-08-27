/**
 * Multi-Channel Telegram Newspaper PDF Fetcher & Smart Deduplicator
 * 
 * Features:
 * - Scans MULTIPLE Telegram channels configured in channels.json
 * - Smart Deduplication: If the same newspaper edition (e.g. Indian Express Delhi 26-08-2026)
 *   is uploaded to multiple channels, it picks ONLY ONE copy and skips duplicates.
 * - Extracts date, newspaper name, edition, language automatically.
 * - Outputs clean manifest.json for frontend library.
 * 
 * Usage: npm run fetch
 */
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { Api } from 'telegram/tl/index.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Config ───────────────────────────────────────────────
const API_ID = parseInt(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;
const SESSION = process.env.TELEGRAM_SESSION;
const MESSAGE_LIMIT = parseInt(process.env.FETCH_MESSAGE_LIMIT || '200');
const OUTPUT_DIR = path.resolve(__dirname, process.env.PDF_OUTPUT_DIR || '../frontend/public/newspapers');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const CHANNELS_PATH = path.join(__dirname, 'channels.json');

// ─── Channel Loading ──────────────────────────────────────
export function getActiveChannels() {
  if (fs.existsSync(CHANNELS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHANNELS_PATH, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        return data.filter(c => c.active !== false);
      }
    } catch (_) {}
  }
  return [
    {
      id: 'default',
      name: 'Official National e-Paper Channel',
      username: process.env.TELEGRAM_CHANNEL || 'newspaper_channel',
      url: `https://t.me/${process.env.TELEGRAM_CHANNEL || 'newspaper_channel'}`,
      active: true,
    }
  ];
}

// ─── Today's date (IST) ──────────────────────────────────
function getTodayIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split('T')[0]; // YYYY-MM-DD
}

const TODAY = getTodayIST();

// ─── Newspaper detection patterns ─────────────────────────
const NEWSPAPER_PATTERNS = [
  { regex: /\b(th[\._]|the\s*hindu)\b/i, name: 'The Hindu', language: 'English' },
  { regex: /\b(ie[\._]|indian\s*express)\b/i, name: 'Indian Express', language: 'English' },
  { regex: /hindustan\s*times/i, name: 'Hindustan Times', language: 'English' },
  { regex: /times\s*of\s*india/i, name: 'Times of India', language: 'English' },
  { regex: /economic\s*times/i, name: 'Economic Times', language: 'English' },
  { regex: /mint/i, name: 'Livemint', language: 'English' },
  { regex: /business\s*standard/i, name: 'Business Standard', language: 'English' },
  { regex: /telegraph/i, name: 'The Telegraph', language: 'English' },
  { regex: /deccan\s*(herald|chronicle)/i, name: 'Deccan Herald', language: 'English' },
  { regex: /financial\s*express/i, name: 'Financial Express', language: 'English' },
  { regex: /the\s*pioneer/i, name: 'The Pioneer', language: 'English' },
  { regex: /the\s*statesman/i, name: 'The Statesman', language: 'English' },
  { regex: /dainik\s*jagran/i, name: 'Dainik Jagran', language: 'Hindi' },
  { regex: /dainik\s*bhaskar/i, name: 'Dainik Bhaskar', language: 'Hindi' },
  { regex: /amar\s*ujala/i, name: 'Amar Ujala', language: 'Hindi' },
  { regex: /navbharat\s*times/i, name: 'Navbharat Times', language: 'Hindi' },
  { regex: /jansatta/i, name: 'Jansatta', language: 'Hindi' },
  { regex: /pib|press\s*information/i, name: 'PIB Bulletin', language: 'English' },
  { regex: /yojana/i, name: 'Yojana Magazine', language: 'English' },
  { regex: /kurukshetra/i, name: 'Kurukshetra Magazine', language: 'English' },
  { regex: /pratiyogita\s*darpan/i, name: 'Pratiyogita Darpan', language: 'Hindi' },
  { regex: /editorial/i, name: 'Editorial Compilation', language: 'English' },
  { regex: /gist|summary|compilation|current\s*affairs/i, name: 'Current Affairs Compilation', language: 'English' },
];

// ─── Edition detection ────────────────────────────────────
const EDITION_PATTERNS = [
  { regex: /(?:^|[^a-z])(delhi|dl|del)(?:[^a-z]|$)/i, edition: 'Delhi' },
  { regex: /(?:^|[^a-z])(international|intl|inter)(?:[^a-z]|$)/i, edition: 'International' },
  { regex: /(?:^|[^a-z])(mumbai|bom)(?:[^a-z]|$)/i, edition: 'Mumbai' },
  { regex: /(?:^|[^a-z])(bangalore|bengaluru|blr)(?:[^a-z]|$)/i, edition: 'Bangalore' },
  { regex: /(?:^|[^a-z])(chennai|mas)(?:[^a-z]|$)/i, edition: 'Chennai' },
  { regex: /(?:^|[^a-z])(kolkata|cal)(?:[^a-z]|$)/i, edition: 'Kolkata' },
  { regex: /(?:^|[^a-z])(hyderabad|hyd)(?:[^a-z]|$)/i, edition: 'Hyderabad' },
  { regex: /(?:^|[^a-z])(chandigarh|chd)(?:[^a-z]|$)/i, edition: 'Chandigarh' },
  { regex: /(?:^|[^a-z])(pune)(?:[^a-z]|$)/i, edition: 'Pune' },
  { regex: /(?:^|[^a-z])(ahmedabad)(?:[^a-z]|$)/i, edition: 'Ahmedabad' },
  { regex: /(?:^|[^a-z])(jaipur)(?:[^a-z]|$)/i, edition: 'Jaipur' },
  { regex: /(?:^|[^a-z])(lucknow)(?:[^a-z]|$)/i, edition: 'Lucknow' },
  { regex: /(?:^|[^a-z])(patna)(?:[^a-z]|$)/i, edition: 'Patna' },
  { regex: /(?:^|[^a-z])(bhopal)(?:[^a-z]|$)/i, edition: 'Bhopal' },
  { regex: /(?:^|[^a-z])(national)(?:[^a-z]|$)/i, edition: 'National' },
  { regex: /(?:^|[^a-z])(hd)(?:[^a-z]|$)/i, edition: 'HD' },
  { regex: /(?:^|[^a-z])(city)(?:[^a-z]|$)/i, edition: 'City' },
];

function detectNewspaper(caption, filename) {
  const text = `${caption} ${filename}`;
  for (const p of NEWSPAPER_PATTERNS) {
    if (p.regex.test(text)) {
      return { name: p.name, language: p.language };
    }
  }
  return null;
}

function detectEdition(caption, filename) {
  const text = `${caption} ${filename}`;
  for (const p of EDITION_PATTERNS) {
    if (p.regex.test(text)) {
      return p.edition;
    }
  }
  return null;
}

function extractDateFromText(text) {
  if (!text) return null;

  // Pattern 1: DD~MM~YYYY, DD-MM-YYYY, DD_MM_YYYY, DD.MM.YYYY, DD MM YYYY
  const dmyMatch = text.match(/(\d{1,2})[~_\-\.\s](\d{1,2})[~_\-\.\s](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    if (Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31 && Number(year) >= 2024 && Number(year) <= 2035) {
      return `${year}-${month}-${day}`;
    }
  }

  // Pattern 2: YYYY-MM-DD, YYYY_MM_DD, YYYY.MM.DD
  const ymdMatch = text.match(/(\d{4})[~_\-\.\s](\d{1,2})[~_\-\.\s](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    if (Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31 && Number(year) >= 2024 && Number(year) <= 2035) {
      return `${year}-${month}-${day}`;
    }
  }

  // Pattern 3: Month name with day and year (e.g. 26 Aug 2026, 26-August-2026, Aug 26 2026)
  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  };
  const namedMatch = text.match(/(\d{1,2})[~_\-\.\s]*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[~_\-\.\s]*(\d{4})/i);
  if (namedMatch) {
    const day = namedMatch[1].padStart(2, '0');
    const month = monthNames[namedMatch[2].toLowerCase()];
    const year = namedMatch[3];
    if (month && Number(day) >= 1 && Number(day) <= 31) return `${year}-${month}-${day}`;
  }

  // Pattern 4: Month name first (e.g. August 26, 2026)
  const namedMatchFirst = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[~_\-\.\s]*(\d{1,2})[~_\-\.\s,]+(\d{4})/i);
  if (namedMatchFirst) {
    const month = monthNames[namedMatchFirst[1].toLowerCase()];
    const day = namedMatchFirst[2].padStart(2, '0');
    const year = namedMatchFirst[3];
    if (month && Number(day) >= 1 && Number(day) <= 31) return `${year}-${month}-${day}`;
  }

  // Pattern 5: 8-digit contiguous DDMMYYYY (e.g. 26082026)
  const ddmmyyyyMatch = text.match(/\b(\d{2})(\d{2})(202[4-9]|203[0-5])\b/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1];
    const month = ddmmyyyyMatch[2];
    const year = ddmmyyyyMatch[3];
    if (Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

function sanitizeFilename(name) {
  return name.replace(/[^\w\.\-\s]/g, '').replace(/\s+/g, '-').trim();
}

function formatDisplayDate(isoDate) {
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

// ─── Deduplication Key Generator ──────────────────────────
function getDeduplicationKey(newspaperName, edition, editionDate) {
  const normName = newspaperName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normEdition = (edition || 'main').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${normName}_${normEdition}_${editionDate}`;
}

// ─── Main Fetch Function ──────────────────────────────────
export async function fetchNewspapers() {
  if (!API_ID || !API_HASH || !SESSION) {
    console.error('❌ Missing TELEGRAM_API_ID, TELEGRAM_API_HASH, or TELEGRAM_SESSION in .env');
    return { success: false, error: 'Missing Telegram API credentials' };
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load existing manifest
  let manifest = { lastFetch: null, totalPapers: 0, newspapers: [] };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch (e) {
      console.log('⚠️ Could not parse existing manifest, initializing fresh.');
    }
  }

  // Populate deduplication tracking set from existing manifest
  const seenEditions = new Set();
  const existingMsgIds = new Set();

  for (const n of manifest.newspapers) {
    existingMsgIds.add(n.telegramMsgId);
    const key = getDeduplicationKey(n.title.split('—')[0].trim(), n.title.includes('—') ? n.title.split('—')[1].replace('Edition', '').trim() : '', n.editionDate);
    seenEditions.add(key);
  }

  // Existing files on disk
  const existingFiles = new Set(
    fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.pdf')).map(f => f.toLowerCase())
  );

  const channels = getActiveChannels();

  console.log(`\n${'═'.repeat(65)}`);
  console.log(`📰 UPSC NewsHub — Multi-Channel Telegram Ingestion & Deduplicator`);  console.log(`📡 Connecting to Telegram Client...`);
  const client = new TelegramClient(
    new StringSession(SESSION),
    API_ID,
    API_HASH,
    { connectionRetries: 5, timeout: 30 }
  );

  await client.connect();
  console.log(`✅ Connected to Telegram successfully.\n`);

  // Fetch dialogs to resolve private invite chats and numeric channel IDs
  const dialogs = await client.getDialogs({ limit: 50 });

  let totalPdfsFound = 0;
  let newDownloaded = 0;
  let alreadyExisting = 0;
  let duplicatesSkipped = 0;
  let olderSkipped = 0;
  let downloadFailed = 0;
  let todayPdfsFound = 0;
  let todayPdfsDownloaded = 0;
  const downloadedEntries = [];

  // Iterate over each configured channel
  for (const ch of channels) {
    const inviteHash = ch.inviteHash || (ch.url && ch.url.includes('+') ? ch.url.split('+')[1].replace('/', '') : null);
    
    // Auto-join private invite links if needed
    if (inviteHash) {
      try {
        await client.invoke(new Api.messages.CheckChatInvite({ hash: inviteHash }));
      } catch (_) {}
      try {
        await client.invoke(new Api.messages.ImportChatInvite({ hash: inviteHash }));
      } catch (_) {}
    }

    // Resolve channel target entity (ID, Dialog entity, or public handle)
    let channelTarget = null;
    const targetRaw = String(ch.username || ch.channelId || ch.url || '');

    for (const d of dialogs) {
      const cleanDialogId = String(d.id).replace('-100', '').replace('-', '');
      const cleanTargetRaw = targetRaw.replace('-100', '').replace('-', '').replace('@', '');
      if (cleanDialogId === cleanTargetRaw || (d.entity?.username && d.entity.username.toLowerCase() === cleanTargetRaw.toLowerCase())) {
        channelTarget = d.entity;
        break;
      }
      if (inviteHash && d.title && (d.title.toLowerCase().includes('excellence') || d.title.toLowerCase().includes('hindu'))) {
        channelTarget = d.entity;
        break;
      }
    }

    if (!channelTarget) {
      channelTarget = ch.username || ch.channelId || ch.url.replace('https://t.me/', '').replace('@', '').trim();
    }

    const channelLabel = typeof channelTarget === 'object' ? (channelTarget.title || channelTarget.username || 'Private Channel') : `@${channelTarget}`;

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🔍 Scanning Channel: ${channelLabel} (${ch.name || 'Feed'})`);
    console.log(`${'─'.repeat(50)}`);

    try {
      let allMessages = [];
      let offsetId = 0;
      const batchSize = 100;
      let fetchedTotal = 0;

      while (fetchedTotal < MESSAGE_LIMIT) {
        const remaining = MESSAGE_LIMIT - fetchedTotal;
        const limit = Math.min(batchSize, remaining);

        let batch = [];
        try {
          batch = await client.getMessages(channelTarget, {
            limit,
            offsetId: offsetId || undefined,
          });
        } catch (fetchErr) {
          console.log(`⚠️  Could not fetch messages from ${channelLabel}: ${fetchErr.message}`);
          break;
        }

        if (!batch || batch.length === 0) break;

        allMessages = allMessages.concat(batch);
        fetchedTotal += batch.length;
        offsetId = batch[batch.length - 1].id;

        process.stdout.write(`   Fetched ${fetchedTotal} messages from ${channelLabel}...\r`);
        if (batch.length < limit) break;
      }

      console.log(`\n📨 Messages fetched: ${allMessages.length}`);

      for (const msg of allMessages) {
        if (!msg.media || !(msg.media instanceof Api.MessageMediaDocument)) continue;
        const doc = msg.media.document;
        if (!(doc instanceof Api.Document)) continue;

        const fileAttr = doc.attributes.find(a => a instanceof Api.DocumentAttributeFilename);
        const originalFilename = fileAttr?.fileName || '';
        const mimeType = doc.mimeType || '';

        const isPdf = mimeType === 'application/pdf' || originalFilename.toLowerCase().endsWith('.pdf');
        if (!isPdf) continue;

        totalPdfsFound++;

        const caption = msg.message || '';
        const msgDate = new Date(msg.date * 1000);
        const msgDateStr = msgDate.toISOString().split('T')[0];
        const fileSizeMB = (Number(doc.size) / 1024 / 1024).toFixed(1);

        const detected = detectNewspaper(caption, originalFilename);
        const newspaperName = detected?.name || originalFilename.replace(/\.pdf$/i, '').replace(/[~_-]+/g, ' ').trim() || 'National Newspaper';
        const language = detected?.language || 'English';
        const edition = detectEdition(caption, originalFilename);

        const filenameDate = extractDateFromText(originalFilename);
        const captionDate = extractDateFromText(caption);
        const editionDate = filenameDate || captionDate || msgDateStr;

        const isToday = editionDate === TODAY;
        if (isToday) todayPdfsFound++;

        const editionSuffix = edition ? `-${edition}` : '';
        const savedFilename = sanitizeFilename(
          `${newspaperName}${editionSuffix}-${editionDate}.pdf`
        );
        const savePath = path.join(OUTPUT_DIR, savedFilename);

        const dedupKey = getDeduplicationKey(newspaperName, edition, editionDate);

        console.log(`  [PDF FOUND] #${totalPdfsFound}`);
        console.log(`    Channel:            ${channelLabel}`);
        console.log(`    Filename:           ${originalFilename}`);
        console.log(`    Size:               ${fileSizeMB} MB`);
        console.log(`    Detected newspaper: ${newspaperName}`);
        console.log(`    Detected edition:   ${edition || '(none)'}`);
        console.log(`    Extracted date:     ${editionDate}${isToday ? '  ← TODAY' : ''}`);
        console.log(`    Save as:            ${savedFilename}`);

        // ─── Strict Policy: Only Sync Today & Future Editions ────────
        if (editionDate < TODAY) {
          olderSkipped++;
          console.log(`    Status:             ⏭️  Skipped older edition (${editionDate} < ${TODAY}) [Policy: Today onwards only]\n`);
          continue;
        }

        // ─── Smart Cross-Channel Deduplication ───────────────
        if (seenEditions.has(dedupKey)) {
          duplicatesSkipped++;
          console.log(`    Status:             ⏭️  DUPLICATE DETECTED: [${newspaperName} - ${edition || 'Main'} (${editionDate})] already collected from another channel. Picking one only!\n`);
          continue;
        }

        // Check if file already exists on disk
        if (existingFiles.has(savedFilename.toLowerCase()) || fs.existsSync(savePath)) {
          alreadyExisting++;
          seenEditions.add(dedupKey);
          console.log(`    Status:             ⏭️  Already exists on disk\n`);

          if (!existingMsgIds.has(msg.id)) {
            const entry = buildEntry(msg, newspaperName, originalFilename, caption, editionDate, language, edition, savedFilename, fileSizeMB, doc.size);
            manifest.newspapers.push(entry);
            existingMsgIds.add(msg.id);
          }
          continue;
        }

        // ─── Download ───────────────────────────────────────
        console.log(`    Status:             📥 Downloading (Single Selected Copy)...`);

        try {
          const buffer = await client.downloadMedia(msg.media, { workers: 1 });

          if (buffer) {
            fs.writeFileSync(savePath, buffer);
            const actualSize = (fs.statSync(savePath).size / 1024 / 1024).toFixed(1);
            console.log(`    Result:             ✅ Saved (${actualSize} MB)\n`);

            const entry = buildEntry(msg, newspaperName, originalFilename, caption, editionDate, language, edition, savedFilename, actualSize, fs.statSync(savePath).size);
            manifest.newspapers.push(entry);
            existingMsgIds.add(msg.id);
            existingFiles.add(savedFilename.toLowerCase());
            seenEditions.add(dedupKey);
            downloadedEntries.push(entry);
            newDownloaded++;
            if (isToday) todayPdfsDownloaded++;
          } else {
            console.log(`    Result:             ⚠️  Empty buffer returned\n`);
            downloadFailed++;
          }
        } catch (dlErr) {
          downloadFailed++;
          console.log(`    Result:             ❌ Failed: ${dlErr.message}\n`);
        }
      }
    } catch (chErr) {
      console.error(`❌ Error processing channel @${channelTarget}: ${chErr.message}`);
    }
  }

  // ─── Sort manifest: newest edition date first ───────────
  manifest.newspapers.sort((a, b) => {
    if (a.editionDate !== b.editionDate) return b.editionDate.localeCompare(a.editionDate);
    return a.title.localeCompare(b.title);
  });

  // Final deduplication pass
  const finalSeen = new Set();
  manifest.newspapers = manifest.newspapers.filter(n => {
    const key = getDeduplicationKey(n.title.split('—')[0].trim(), n.title.includes('—') ? n.title.split('—')[1].replace('Edition', '').trim() : '', n.editionDate);
    if (finalSeen.has(key)) return false;
    finalSeen.add(key);
    return true;
  });

  // Update manifest
  manifest.lastFetch = new Date().toISOString();
  manifest.totalPapers = manifest.newspapers.length;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // Sync to frontend channels
  try {
    fs.copyFileSync(CHANNELS_PATH, path.join(OUTPUT_DIR, 'channels.json'));
  } catch (_) {}

  // ─── Summary ────────────────────────────────────────────
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`📊 MULTI-CHANNEL INGESTION SUMMARY`);
  console.log(`${'═'.repeat(65)}`);
  console.log(`  Channels processed:         ${channels.length}`);
  console.log(`  PDFs scanned in channels:   ${totalPdfsFound}`);
  console.log(`  New PDFs downloaded:        ${newDownloaded}`);
  console.log(`  Duplicates eliminated:      ${duplicatesSkipped} (Single copy kept)`);
  console.log(`  Already existing:           ${alreadyExisting}`);
  console.log(`  Download failures:          ${downloadFailed}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Today's newspapers found:   ${todayPdfsFound}`);
  console.log(`  Today's newspapers saved:   ${todayPdfsDownloaded}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Total in library:           ${manifest.totalPapers}`);
  console.log(`  Manifest saved:             ${MANIFEST_PATH}`);
  console.log(`${'═'.repeat(65)}\n`);

  try {
    await client.disconnect();
  } catch (e) {}

  return {
    success: true,
    channels: channels.length,
    newCount: newDownloaded,
    duplicatesSkipped,
    total: manifest.totalPapers,
    todayFound: todayPdfsFound,
    todayDownloaded: todayPdfsDownloaded,
    results: downloadedEntries,
  };
}

// ─── Helper: build a manifest entry ───────────────────────
function buildEntry(msg, newspaperName, originalFilename, caption, editionDate, language, edition, savedFilename, fileSizeMB, fileSize) {
  const editionSuffix = edition ? ` — ${edition} Edition` : '';
  return {
    id: `tg-${msg.id}`,
    telegramMsgId: msg.id,
    title: `${newspaperName}${editionSuffix}`,
    originalFilename,
    caption: caption.substring(0, 500),
    editionDate,
    displayDate: formatDisplayDate(editionDate),
    language,
    pdfUrl: `/newspapers/${savedFilename}`,
    filename: savedFilename,
    fileSize: Number(fileSize),
    fileSizeMB: String(fileSizeMB),
    fetchedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    fetchedTimestamp: new Date().toISOString(),
    source: 'National Daily Edition',
  };
}

// ─── Run directly ─────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('fetch-newspapers.mjs')) {
  fetchNewspapers()
    .then((result) => {
      if (result.success) process.exit(0);
      else process.exit(1);
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
