/**
 * Telegram Newspaper PDF Fetcher — v2
 * 
 * Connects to a public Telegram channel via MTProto, finds PDF documents,
 * downloads them, and generates a manifest.json for the frontend.
 * 
 * Key improvements over v1:
 * - Scans 200+ messages (not just 50) to reliably find today's papers
 * - Robust date extraction from filenames with ~, -, _, space separators
 * - Detailed [PDF FOUND] logging for every candidate
 * - Timeout-resilient: individual download failures don't kill the whole run
 * - Summary report at the end
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
const CHANNEL = process.env.TELEGRAM_CHANNEL || 'abvcdsdf';
const MESSAGE_LIMIT = parseInt(process.env.FETCH_MESSAGE_LIMIT || '300');
const OUTPUT_DIR = path.resolve(__dirname, process.env.PDF_OUTPUT_DIR || '../frontend/public/newspapers');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

// ─── Today's date (IST) ──────────────────────────────────
function getTodayIST() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split('T')[0]; // YYYY-MM-DD
}

const TODAY = getTodayIST();

// ─── Newspaper detection patterns ─────────────────────────
const NEWSPAPER_PATTERNS = [
  { regex: /indian\s*express/i, name: 'Indian Express', language: 'English' },
  { regex: /the\s*hindu/i, name: 'The Hindu', language: 'English' },
  { regex: /hindustan\s*times/i, name: 'Hindustan Times', language: 'English' },
  { regex: /times\s*of\s*india/i, name: 'Times of India', language: 'English' },
  { regex: /economic\s*times/i, name: 'Economic Times', language: 'English' },
  { regex: /mint/i, name: 'Livemint', language: 'English' },
  { regex: /business\s*standard/i, name: 'Business Standard', language: 'English' },
  { regex: /telegraph/i, name: 'The Telegraph', language: 'English' },
  { regex: /deccan\s*(herald|chronicle)/i, name: 'Deccan Herald', language: 'English' },
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
  { regex: /delhi/i, edition: 'Delhi' },
  { regex: /mumbai|bombay/i, edition: 'Mumbai' },
  { regex: /kolkata|calcutta/i, edition: 'Kolkata' },
  { regex: /chennai|madras/i, edition: 'Chennai' },
  { regex: /bangalore|bengaluru/i, edition: 'Bengaluru' },
  { regex: /hyderabad/i, edition: 'Hyderabad' },
  { regex: /lucknow/i, edition: 'Lucknow' },
  { regex: /all\s*india|national/i, edition: 'National' },
  { regex: /hd\b/i, edition: 'HD' },
];

function detectNewspaper(text, filename) {
  const combined = `${text || ''} ${filename || ''}`;
  for (const pattern of NEWSPAPER_PATTERNS) {
    if (pattern.regex.test(combined)) {
      return { ...pattern };
    }
  }
  return null;
}

function detectEdition(text, filename) {
  const combined = `${text || ''} ${filename || ''}`;
  for (const pattern of EDITION_PATTERNS) {
    if (pattern.regex.test(combined)) {
      return pattern.edition;
    }
  }
  return null;
}

/**
 * Extract a date from a filename or caption text.
 * Supports separators: ~ - _ . / space
 * Supports formats: DD~MM~YYYY, DD-MM-YYYY, YYYY-MM-DD, DD MM YYYY, etc.
 * Returns YYYY-MM-DD string or null.
 */
function extractDateFromText(text) {
  if (!text) return null;

  // Normalize separators: replace ~ _ . / with -
  const normalized = text.replace(/[~_./]/g, '-');

  // Try DD-MM-YYYY or DD MM YYYY (most common in Indian newspapers)
  const ddmmyyyy = normalized.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{4})/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const day = parseInt(dd);
    const month = parseInt(mm);
    const year = parseInt(yyyy);
    if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${yyyy}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Try YYYY-MM-DD
  const yyyymmdd = normalized.match(/(\d{4})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})/);
  if (yyyymmdd) {
    const [, yyyy, mm, dd] = yyyymmdd;
    const year = parseInt(yyyy);
    const month = parseInt(mm);
    const day = parseInt(dd);
    if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${yyyy}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Try DD Month YYYY (e.g., "23 August 2026", "23 Aug 2026")
  const monthNames = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
    apr: '04', april: '04', may: '05', jun: '06', june: '06',
    jul: '07', july: '07', aug: '08', august: '08', sep: '09', september: '09',
    oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
  };
  const namedMonth = text.match(/(\d{1,2})\s*[-~_./]?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[-~_./]?\s*(\d{4})/i);
  if (namedMonth) {
    const [, dd, monthStr, yyyy] = namedMonth;
    const mm = monthNames[monthStr.toLowerCase()];
    if (mm) {
      return `${yyyy}-${mm}-${String(parseInt(dd)).padStart(2, '0')}`;
    }
  }

  return null;
}

function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 150);
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ─── Main fetch function ──────────────────────────────────
export async function fetchNewspapers() {
  if (!API_ID || !API_HASH || !SESSION) {
    console.error('❌ Missing Telegram credentials. Run "npm run auth" first.');
    console.error('   Required: TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION');
    return { success: false, error: 'Missing credentials' };
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load existing manifest
  let manifest = { lastFetch: null, channel: CHANNEL, totalPapers: 0, newspapers: [] };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch (e) {
      console.log('⚠️  Could not parse existing manifest, starting fresh.');
    }
  }

  // Build set of existing files on disk (not just manifest IDs)
  const existingFiles = new Set(
    fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.pdf')).map(f => f.toLowerCase())
  );
  const existingMsgIds = new Set(manifest.newspapers.map((n) => n.telegramMsgId));

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📰 UPSC NewsHub — Telegram Newspaper Fetcher v2`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`📅 Today (IST):    ${TODAY}`);
  console.log(`📡 Channel:        @${CHANNEL}`);
  console.log(`📨 Scan limit:     ${MESSAGE_LIMIT} messages`);
  console.log(`💾 Output:         ${OUTPUT_DIR}`);
  console.log(`📂 Existing PDFs:  ${existingFiles.size}`);
  console.log(`${'─'.repeat(60)}\n`);

  console.log(`📡 Connecting to Telegram...`);
  const client = new TelegramClient(
    new StringSession(SESSION),
    API_ID,
    API_HASH,
    { connectionRetries: 5, timeout: 30 }
  );

  await client.connect();
  console.log(`✅ Connected to Telegram\n`);

  // Stats
  let totalPdfsFound = 0;
  let newDownloaded = 0;
  let alreadyExisting = 0;
  let downloadFailed = 0;
  let todayPdfsFound = 0;
  let todayPdfsDownloaded = 0;
  let todayPdfsMissing = 0;
  const downloadedEntries = [];

  try {
    // Fetch messages in batches to handle large limits
    console.log(`📂 Fetching messages from @${CHANNEL}...`);
    let allMessages = [];
    let offsetId = 0;
    const batchSize = 100;
    let fetchedTotal = 0;

    while (fetchedTotal < MESSAGE_LIMIT) {
      const remaining = MESSAGE_LIMIT - fetchedTotal;
      const limit = Math.min(batchSize, remaining);

      const batch = await client.getMessages(CHANNEL, {
        limit,
        offsetId: offsetId || undefined,
      });

      if (!batch || batch.length === 0) break;

      allMessages = allMessages.concat(batch);
      fetchedTotal += batch.length;
      offsetId = batch[batch.length - 1].id;

      // Log progress
      process.stdout.write(`   Fetched ${fetchedTotal} messages...\r`);

      // If we got fewer than requested, we've reached the end
      if (batch.length < limit) break;
    }

    console.log(`\n📨 Total messages fetched: ${allMessages.length}`);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🔍 Scanning for PDF documents...\n`);

    for (const msg of allMessages) {
      // Check if message has a document (PDF)
      if (!msg.media || !(msg.media instanceof Api.MessageMediaDocument)) continue;

      const doc = msg.media.document;
      if (!(doc instanceof Api.Document)) continue;

      // Check file attributes for filename
      const fileAttr = doc.attributes.find(
        (a) => a instanceof Api.DocumentAttributeFilename
      );

      const originalFilename = fileAttr?.fileName || '';
      const mimeType = doc.mimeType || '';

      // Only process PDFs
      const isPdf = mimeType === 'application/pdf' || originalFilename.toLowerCase().endsWith('.pdf');
      if (!isPdf) continue;

      // ─── PDF Found! ─────────────────────────────────
      totalPdfsFound++;

      const caption = msg.message || '';
      const msgDate = new Date(msg.date * 1000);
      const msgDateStr = msgDate.toISOString().split('T')[0];
      const fileSizeMB = (Number(doc.size) / 1024 / 1024).toFixed(1);

      // Detect newspaper name
      const detected = detectNewspaper(caption, originalFilename);
      const newspaperName = detected?.name || originalFilename.replace(/\.pdf$/i, '').replace(/[~_-]+/g, ' ').trim() || 'Document';
      const language = detected?.language || 'English';

      // Detect edition
      const edition = detectEdition(caption, originalFilename);

      // Extract date from filename (primary) or fallback to message date
      const filenameDate = extractDateFromText(originalFilename);
      const captionDate = extractDateFromText(caption);
      const editionDate = filenameDate || captionDate || msgDateStr;

      const isToday = editionDate === TODAY;
      if (isToday) todayPdfsFound++;

      // Build a clean saved filename
      const editionSuffix = edition ? `-${edition}` : '';
      const savedFilename = sanitizeFilename(
        `${newspaperName}${editionSuffix}-${editionDate}.pdf`
      );

      // ─── Log every candidate ────────────────────────
      console.log(`  [PDF FOUND] #${totalPdfsFound}`);
      console.log(`    Filename:           ${originalFilename}`);
      console.log(`    Size:               ${fileSizeMB} MB`);
      console.log(`    Message date:       ${msgDateStr}`);
      console.log(`    Detected newspaper: ${newspaperName}`);
      console.log(`    Detected edition:   ${edition || '(none)'}`);
      console.log(`    Extracted date:     ${editionDate}${isToday ? '  ← TODAY' : ''}`);
      console.log(`    Save as:            ${savedFilename}`);

      // Check if already exists
      const savePath = path.join(OUTPUT_DIR, savedFilename);
      if (existingFiles.has(savedFilename.toLowerCase()) || fs.existsSync(savePath)) {
        alreadyExisting++;
        console.log(`    Status:             ⏭️  Already exists\n`);
        
        // Ensure it's in the manifest even if file existed before
        if (!existingMsgIds.has(msg.id)) {
          const entry = buildEntry(msg, newspaperName, originalFilename, caption, editionDate, language, edition, savedFilename, fileSizeMB, doc.size);
          manifest.newspapers.push(entry);
          existingMsgIds.add(msg.id);
        }
        continue;
      }

      // Skip if already in manifest by message ID
      if (existingMsgIds.has(msg.id)) {
        alreadyExisting++;
        console.log(`    Status:             ⏭️  Already in manifest\n`);
        continue;
      }

      // ─── Download ───────────────────────────────────
      console.log(`    Status:             📥 Downloading...`);

      try {
        const buffer = await client.downloadMedia(msg.media, {
          workers: 1,
        });

        if (buffer) {
          fs.writeFileSync(savePath, buffer);
          const actualSize = (fs.statSync(savePath).size / 1024 / 1024).toFixed(1);
          console.log(`    Result:             ✅ Saved (${actualSize} MB)\n`);

          const entry = buildEntry(msg, newspaperName, originalFilename, caption, editionDate, language, edition, savedFilename, actualSize, fs.statSync(savePath).size);
          manifest.newspapers.push(entry);
          existingMsgIds.add(msg.id);
          existingFiles.add(savedFilename.toLowerCase());
          downloadedEntries.push(entry);
          newDownloaded++;
          if (isToday) todayPdfsDownloaded++;
        } else {
          console.log(`    Result:             ⚠️  Empty buffer returned\n`);
          downloadFailed++;
        }
      } catch (dlErr) {
        downloadFailed++;
        // Don't let a single download failure kill the whole run
        const errMsg = dlErr.message || String(dlErr);
        if (errMsg.includes('TIMEOUT') || errMsg.includes('timeout')) {
          console.log(`    Result:             ⚠️  Timeout (will retry next run)\n`);
        } else {
          console.log(`    Result:             ❌ Failed: ${errMsg}\n`);
        }
      }
    }

    // Check how many of today's papers are missing
    const todayInManifest = manifest.newspapers.filter(n => n.editionDate === TODAY).length;
    todayPdfsMissing = Math.max(0, todayPdfsFound - todayInManifest);

  } catch (err) {
    const errMsg = err.message || String(err);
    // If it's a timeout but we already downloaded some files, don't report failure
    if ((errMsg.includes('TIMEOUT') || errMsg.includes('timeout')) && newDownloaded > 0) {
      console.log(`\n⚠️  Connection timed out, but ${newDownloaded} PDFs were already downloaded successfully.`);
    } else {
      console.error(`\n❌ Error fetching messages: ${errMsg}`);
      // Still save whatever we have
    }
  }

  // ─── Sort manifest: newest edition date first ───────────
  manifest.newspapers.sort((a, b) => {
    // Primary sort: edition date descending
    if (a.editionDate !== b.editionDate) return b.editionDate.localeCompare(a.editionDate);
    // Secondary: newspaper name ascending
    return a.title.localeCompare(b.title);
  });

  // Deduplicate by telegramMsgId
  const seen = new Set();
  manifest.newspapers = manifest.newspapers.filter(n => {
    if (seen.has(n.telegramMsgId)) return false;
    seen.add(n.telegramMsgId);
    return true;
  });

  // Update manifest
  manifest.lastFetch = new Date().toISOString();
  manifest.channel = CHANNEL;
  manifest.totalPapers = manifest.newspapers.length;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // ─── Summary ────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 FETCH SUMMARY`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  PDFs found in channel:      ${totalPdfsFound}`);
  console.log(`  New PDFs downloaded:         ${newDownloaded}`);
  console.log(`  Already existing:            ${alreadyExisting}`);
  console.log(`  Download failures:           ${downloadFailed}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Today's newspapers found:    ${todayPdfsFound}`);
  console.log(`  Today's newspapers saved:    ${todayPdfsDownloaded}`);
  console.log(`  Today's newspapers missing:  ${todayPdfsMissing}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Total in library:            ${manifest.totalPapers}`);
  console.log(`  Manifest saved:              ${MANIFEST_PATH}`);
  console.log(`${'═'.repeat(60)}\n`);

  // Disconnect gracefully
  try {
    await client.disconnect();
  } catch (e) {
    // Ignore disconnect errors
  }

  return {
    success: true,
    newCount: newDownloaded,
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
fetchNewspapers()
  .then((result) => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
