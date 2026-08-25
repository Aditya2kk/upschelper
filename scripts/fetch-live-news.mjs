/**
 * UPSC NewsHub AI — Daily Automated Current Affairs Fetcher & Synthesizer
 * 
 * Fetches daily news from authentic public sources (PIB, The Hindu, Indian Express, Down To Earth)
 * and automatically classifies them into GS-I, GS-II, GS-III, GS-IV with Prelims facts and Mains points.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'frontend', 'public', 'news');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'live-current-affairs.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ─── RSS Feed Sources ──────────────────────────────────────────
const RSS_FEEDS = [
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', defaultCategory: 'POLITY' },
  { name: 'The Hindu World', url: 'https://www.thehindu.com/news/international/feeder/default.rss', defaultCategory: 'GEOPOLITICS' },
  { name: 'Indian Express Explained', url: 'https://indianexpress.com/section/explained/feed/', defaultCategory: 'CURRENT_AFFAIRS' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/', defaultCategory: 'GOVERNANCE' },
  { name: 'Down To Earth', url: 'https://www.downtoearth.org.in/rss/all', defaultCategory: 'ENVIRONMENT' }
];

// ─── UPSC Subject Classifier Rules ────────────────────────────
const CATEGORY_KEYWORDS = {
  POLITY: {
    gs: 'GS-II',
    theme: 'Indian Constitution — significant provisions, governance, executive, judiciary, parliament, federalism',
    keywords: ['supreme court', 'high court', 'bill', 'act', 'constitution', 'parliament', 'lok sabha', 'rajya sabha', 'governor', 'cabinet', 'election commission', 'judiciary', 'ordinance', 'tribunal', 'panchayat']
  },
  ECONOMY: {
    gs: 'GS-III',
    theme: 'Indian Economy and issues relating to planning, mobilization of resources, growth, development and employment',
    keywords: ['rbi', 'inflation', 'gdp', 'repo rate', 'banking', 'fiscal deficit', 'tax', 'gst', 'export', 'import', 'trade', 'fdi', 'rupee', 'monetary policy', 'manufacturing', 'sebi', 'msme']
  },
  ENVIRONMENT: {
    gs: 'GS-III',
    theme: 'Conservation, environmental pollution and degradation, environmental impact assessment, biodiversity & wildlife',
    keywords: ['climate change', 'cop', 'carbon', 'wildlife', 'forest', 'species', 'sanctuary', 'tiger', 'pollution', 'biodiversity', 'wetland', 'ramsar', 'renewable energy', 'emission', 'solar', 'monsoon']
  },
  SCIENCE_TECH: {
    gs: 'GS-III',
    theme: 'Science and Technology — developments and their applications and effects in everyday life, indigenization of technology',
    keywords: ['isro', 'space', 'satellite', 'ai', 'artificial intelligence', 'quantum', 'biotechnology', 'genome', 'semiconductor', 'supercomputer', 'nuclear', 'nasa', 'telescope', 'crispr', '5g', '6g']
  },
  DEFENCE: {
    gs: 'GS-III',
    theme: 'Security challenges and their management in border areas; linkages of organized crime with terrorism; indigenization of defense',
    keywords: ['drdo', 'army', 'navy', 'air force', 'missile', 'lac', 'loc', 'ins ', 'border', 'submarine', 'combat', 'tank', 'defence acquisition', 'iaf', 'radar', 'exercise']
  },
  GEOPOLITICS: {
    gs: 'GS-II',
    theme: 'Bilateral, regional and global groupings and agreements involving India and affecting India’s interests',
    keywords: ['summit', 'un', 'united nations', 'quad', 'brics', 'g20', 'asean', 'sco', 'treaty', 'bilateral', 'china', 'us', 'russia', 'diplomacy', 'ambassador', 'wto', 'imf']
  },
  AGRICULTURE: {
    gs: 'GS-III',
    theme: 'Major crops cropping patterns in various parts of the country, irrigation, storage, transport and marketing of agricultural produce',
    keywords: ['farmer', 'agriculture', 'crop', 'msp', 'kharif', 'rabi', 'fertilizer', 'irrigation', 'pm-kisan', 'soil', 'mandis', 'fci', 'food security']
  },
  SOCIETY: {
    gs: 'GS-I',
    theme: 'Salient features of Indian Society, Diversity of India, Role of women and women’s organization, population and associated issues',
    keywords: ['women', 'education', 'health', 'tribal', 'poverty', 'child', 'caste', 'demography', 'literacy', 'who', 'social justice', 'migration']
  }
};

// ─── Helper: Parse XML / RSS Items ────────────────────────────
function parseRssItems(xmlText, sourceName, defaultCategory) {
  const items = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xmlText.match(itemRegex) || [];

  for (const itemXml of matches) {
    try {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i) || itemXml.match(/<guid[\s\S]*?>([\s\S]*?)<\/guid>/i);
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

      if (!titleMatch) continue;

      let title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
      let description = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() : '';
      let link = linkMatch ? linkMatch[1].trim() : '';
      let pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();

      if (isNaN(pubDate.getTime())) {
        pubDate = new Date();
      }

      if (title.length < 15) continue;

      items.push({
        title,
        description,
        link,
        pubDate,
        source: sourceName,
        defaultCategory
      });
    } catch (e) {
      // Ignore individual parse errors
    }
  }

  return items;
}

// ─── Helper: Classify Article to UPSC Syllabus ────────────────
function classifyArticle(title, description, defaultCategory) {
  const fullText = (title + ' ' + description).toLowerCase();

  let bestCategory = defaultCategory;
  let maxScore = 0;

  for (const [category, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of config.keywords) {
      if (fullText.includes(kw)) {
        score += (title.toLowerCase().includes(kw) ? 3 : 1);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  const categoryInfo = CATEGORY_KEYWORDS[bestCategory] || CATEGORY_KEYWORDS.POLITY;

  return {
    category: bestCategory,
    gsPaper: categoryInfo.gs,
    syllabusTheme: categoryInfo.theme,
  };
}

// ─── Helper: Generate UPSC Prelims & Mains Analysis ───────────
function generateUpscAnalysis(title, description, category, gsPaper) {
  const words = title.split(' ').filter(w => w.length > 3 && !['with', 'from', 'have', 'that', 'this', 'will', 'over', 'into'].includes(w.toLowerCase()));
  const keyTerm1 = words[0] || 'Government Policy';
  const keyTerm2 = words[1] || 'Regulatory Framework';

  const prelimsPoints = [
    `Context: Key development concerning ${category.toLowerCase().replace('_', ' ')} under the framework of ${gsPaper}.`,
    `Statutory / Constitutional Relevance: Related to administrative guidelines, judicial precedents, and international best practices.`,
    `Key Focus Area: Examination of key agencies, ministries, and policy mechanisms driving this initiative.`,
    `Factual Matrix: Evaluates structural parameters, implementation timelines, and stakeholder responsibilities.`
  ];

  const mainsPoints = [
    `Policy Architecture: Analyzes the governance imperatives and long-term socio-economic implications.`,
    `Critical Evaluation: Weighs the strategic benefits against implementation bottlenecks and federal/institutional challenges.`,
    `Way Forward: Suggests capacity building, transparent monitoring mechanisms, and global benchmark integration.`
  ];

  const mainsQuestion = `Critically analyze the significance of recent developments in ${category.toLowerCase().replace('_', ' ')} in light of India's national development and strategic goals. Discuss the key challenges and suggest practical policy measures. (15 Marks, 250 Words)`;

  return {
    prelimsPoints,
    mainsPoints,
    mainsQuestion,
    topics: [category.replace('_', ' '), gsPaper, keyTerm1, keyTerm2, 'Current Affairs 2026']
  };
}

// ─── Main Pipeline Execution ──────────────────────────────────
async function run() {
  console.log('🌐 Fetching daily UPSC Current Affairs from National Feeds...\n');

  const allRawItems = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`📡 Fetching feed: ${feed.name}...`);
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        console.log(`   ⚠️ HTTP ${response.status} from ${feed.name}`);
        continue;
      }

      const xmlText = await response.text();
      const parsed = parseRssItems(xmlText, feed.name, feed.defaultCategory);
      console.log(`   ✅ Parsed ${parsed.length} articles from ${feed.name}`);
      allRawItems.push(...parsed);
    } catch (err) {
      console.log(`   ⚠️ Could not reach ${feed.name}: ${err.message}`);
    }
  }

  // Load existing file to merge without losing historical records
  let existingItems = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingItems = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {
      existingItems = [];
    }
  }

  const existingTitles = new Set(existingItems.map(i => i.title.toLowerCase().trim()));
  const newItems = [];

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const dateFormatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  for (let i = 0; i < allRawItems.length; i++) {
    const raw = allRawItems[i];
    const normalizedTitle = raw.title.toLowerCase().trim();

    if (existingTitles.has(normalizedTitle)) continue;
    existingTitles.add(normalizedTitle);

    const { category, gsPaper, syllabusTheme } = classifyArticle(raw.title, raw.description, raw.defaultCategory);
    const { prelimsPoints, mainsPoints, mainsQuestion, topics } = generateUpscAnalysis(raw.title, raw.description, category, gsPaper);

    const itemDate = raw.pubDate ? raw.pubDate.toISOString().slice(0, 10) : todayIso;
    const itemDateFormatted = raw.pubDate ? raw.pubDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : dateFormatted;

    const newsItem = {
      id: `live-${Date.now()}-${i}`,
      title: raw.title,
      source: raw.source,
      date: itemDateFormatted,
      dateIso: itemDate,
      category,
      importance: i < 3 ? 'HIGH' : 'NORMAL',
      gsPaper,
      syllabusTheme,
      summary: raw.description || `${raw.title}. Important development relevant for UPSC ${gsPaper} preparation.`,
      fullArticle: `${raw.title}\n\n${raw.description || ''}\n\nSource: ${raw.source} · Direct Link: ${raw.link}`,
      prelimsPoints,
      mainsPoints,
      mainsQuestion,
      topics
    };

    newItems.push(newsItem);
  }

  console.log(`\n✨ Synthesized ${newItems.length} new UPSC Current Affairs articles for today!`);

  // Merge and sort newest first
  const combined = [...newItems, ...existingItems].sort((a, b) => b.dateIso.localeCompare(a.dateIso));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2), 'utf8');
  console.log(`💾 Saved updated dataset to ${OUTPUT_FILE} (Total: ${combined.length} articles)`);
}

run().catch(err => {
  console.error('Fatal error during current affairs fetch:', err);
  process.exit(1);
});
