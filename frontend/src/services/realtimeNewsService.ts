/**
 * UPSC NewsHub AI — Real-Time Live News & Breaking Current Affairs Service
 * 
 * Fetches real-time breaking news directly in the browser from live RSS feeds
 * (The Hindu, Indian Express Explained & India, PIB) and categorizes them
 * on-the-fly for UPSC GS-I, GS-II, GS-III, and GS-IV.
 */

import { NewsItem, ALL_NEWS_ITEMS } from './newsData';

const LIVE_FEEDS = [
  {
    name: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    defaultCategory: 'POLITY'
  },
  {
    name: 'The Hindu World',
    url: 'https://www.thehindu.com/news/international/feeder/default.rss',
    defaultCategory: 'GEOPOLITICS'
  },
  {
    name: 'Indian Express Explained',
    url: 'https://indianexpress.com/section/explained/feed/',
    defaultCategory: 'CURRENT_AFFAIRS'
  },
  {
    name: 'Indian Express',
    url: 'https://indianexpress.com/section/india/feed/',
    defaultCategory: 'GOVERNANCE'
  }
];

const CATEGORY_KEYWORDS: Record<string, { gs: string; theme: string; keywords: string[] }> = {
  POLITY: {
    gs: 'GS-II',
    theme: 'Indian Constitution — historical underpinnings, evolution, features, amendments, significant provisions & basic structure',
    keywords: ['supreme court', 'high court', 'bill', 'act', 'constitution', 'parliament', 'lok sabha', 'rajya sabha', 'governor', 'cabinet', 'election commission', 'judiciary', 'ordinance', 'tribunal', 'panchayat', 'reservation', 'quota', 'caa']
  },
  ECONOMY: {
    gs: 'GS-III',
    theme: 'Indian Economy and issues relating to planning, mobilization of resources, growth, development and employment',
    keywords: ['rbi', 'inflation', 'gdp', 'repo rate', 'banking', 'fiscal deficit', 'tax', 'gst', 'export', 'import', 'trade', 'fdi', 'rupee', 'monetary policy', 'manufacturing', 'sebi', 'msme', 'stock', 'market', 'budget']
  },
  ENVIRONMENT: {
    gs: 'GS-III',
    theme: 'Conservation, environmental pollution and degradation, environmental impact assessment, biodiversity & disaster management',
    keywords: ['climate change', 'cop', 'carbon', 'wildlife', 'forest', 'species', 'sanctuary', 'tiger', 'pollution', 'biodiversity', 'wetland', 'ramsar', 'renewable energy', 'emission', 'solar', 'monsoon', 'cyclone', 'flood', 'earthquake']
  },
  SCIENCE_TECH: {
    gs: 'GS-III',
    theme: 'Science and Technology — developments and their applications and effects in everyday life, indigenization of technology',
    keywords: ['isro', 'space', 'satellite', 'ai', 'artificial intelligence', 'quantum', 'biotechnology', 'genome', 'semiconductor', 'supercomputer', 'nuclear', 'nasa', 'telescope', 'crispr', '5g', '6g', 'cyber', 'chatgpt']
  },
  DEFENCE: {
    gs: 'GS-III',
    theme: 'Security challenges and their management in border areas; linkages of organized crime with terrorism; indigenization of defense',
    keywords: ['drdo', 'army', 'navy', 'air force', 'missile', 'lac', 'loc', 'ins ', 'border', 'submarine', 'combat', 'tank', 'defence acquisition', 'iaf', 'radar', 'exercise', 'warfare', 'security']
  },
  GEOPOLITICS: {
    gs: 'GS-II',
    theme: 'Bilateral, regional and global groupings and agreements involving India and affecting India’s interests',
    keywords: ['summit', 'un', 'united nations', 'quad', 'brics', 'g20', 'asean', 'sco', 'treaty', 'bilateral', 'china', 'us', 'russia', 'diplomacy', 'ambassador', 'wto', 'imf', 'conflict', 'taiwan', 'ukraine', 'israel', 'gaza']
  },
  AGRICULTURE: {
    gs: 'GS-III',
    theme: 'Major crops cropping patterns in various parts of the country, irrigation, storage, transport and marketing of agricultural produce',
    keywords: ['farmer', 'agriculture', 'crop', 'msp', 'kharif', 'rabi', 'fertilizer', 'irrigation', 'pm-kisan', 'soil', 'mandis', 'fci', 'food security', 'monsoon']
  },
  SOCIETY: {
    gs: 'GS-I',
    theme: 'Salient features of Indian Society, Diversity of India, Role of women and women’s organization, population and associated issues',
    keywords: ['women', 'education', 'health', 'tribal', 'poverty', 'child', 'caste', 'demography', 'literacy', 'who', 'social justice', 'migration', 'hospital', 'neet', 'exam']
  }
};

function classifyLiveArticle(title: string, description: string, defaultCategory: string) {
  const fullText = (title + ' ' + description).toLowerCase();

  let bestCategory = defaultCategory;
  let maxScore = 0;

  for (const [category, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of config.keywords) {
      if (fullText.includes(kw)) {
        score += title.toLowerCase().includes(kw) ? 3 : 1;
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

function generateLiveUpscAnalysis(title: string, category: string, gsPaper: string) {
  const words = title.split(' ').filter(w => w.length > 3 && !['with', 'from', 'have', 'that', 'this', 'will', 'over', 'into', 'what', 'when'].includes(w.toLowerCase()));
  const topic1 = words[0] || 'National Policy';
  const topic2 = words[1] || 'Current Affairs';

  return {
    prelimsPoints: [
      `Key Core Concept: Real-time development pertaining to ${category.toLowerCase().replace('_', ' ')} under UPSC ${gsPaper}.`,
      `Statutory & Administrative Background: Relevant to policy implementation, statutory regulators, and executive mandates.`,
      `Analytical Relevance: Scrutinizes recent events against foundational UPSC syllabus themes.`,
      `Exam Focus: Factual takeaways for Prelims regarding agencies, geographical locations, and constitutional mandates.`
    ],
    mainsPoints: [
      `Structural Implications: Assesses policy dimensions, societal impact, and governance effectiveness.`,
      `Critical Evaluation: Weighs the socio-economic benefits against institutional bottlenecks and implementation hurdles.`,
      `Way Forward: Emphasizes multi-stakeholder consensus, administrative transparency, and structural reforms.`
    ],
    mainsQuestion: `Examine the constitutional and developmental significance of recent developments in ${category.toLowerCase().replace('_', ' ')}. Discuss the challenges involved and suggest a pragmatic way forward. (15 Marks, 250 Words)`,
    topics: [category.replace('_', ' '), gsPaper, topic1, topic2, 'Live Breaking 2026']
  };
}

export function formatTimeAgo(isoString: string): string {
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (isNaN(diff) || diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch (e) {
    return 'Recent';
  }
}

function getLocalDateIso(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parsePubDateInfo(rawPubDate: any): { dateIso: string; dateFormatted: string } {
  const today = new Date();
  const todayIso = getLocalDateIso(today);
  const todayFormatted = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!rawPubDate) {
    return { dateIso: todayIso, dateFormatted: todayFormatted };
  }

  // If string starts with YYYY-MM-DD, extract it directly without timezone shifting!
  const match = String(rawPubDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    const dateObj = new Date(`${y}-${m}-${d}T12:00:00`);
    return {
      dateIso: `${y}-${m}-${d}`,
      dateFormatted: !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : todayFormatted
    };
  }

  const parsed = new Date(rawPubDate);
  if (!isNaN(parsed.getTime())) {
    return {
      dateIso: getLocalDateIso(parsed),
      dateFormatted: parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  }

  return { dateIso: todayIso, dateFormatted: todayFormatted };
}

let inMemoryLiveCache: NewsItem[] = [];
let lastFetchedTimestamp = 0;

/**
 * Fetches real-time live breaking news across multiple feeds directly in the client
 */
export async function fetchRealtimeBreakingNews(forceRefresh = false): Promise<NewsItem[]> {
  const now = Date.now();
  // Cache for 45 seconds unless forced
  if (!forceRefresh && inMemoryLiveCache.length > 0 && (now - lastFetchedTimestamp < 45000)) {
    return inMemoryLiveCache;
  }

  const fetchedItems: NewsItem[] = [];

  const promises = LIVE_FEEDS.map(async (feed) => {
    try {
      const targetUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return;

      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        data.items.slice(0, 15).forEach((item: any, idx: number) => {
          const title = (item.title || '').replace(/<[^>]+>/g, '').trim();
          if (!title || title.length < 15) return;

          const desc = (item.description || '').replace(/<[^>]+>/g, '').trim();
          const { dateIso, dateFormatted } = parsePubDateInfo(item.pubDate);

          const { category, gsPaper, syllabusTheme } = classifyLiveArticle(title, desc, feed.defaultCategory);
          const { prelimsPoints, mainsPoints, mainsQuestion, topics } = generateLiveUpscAnalysis(title, category, gsPaper);

          fetchedItems.push({
            id: `realtime-${feed.name.toLowerCase().replace(/\s+/g, '-')}-${idx}-${item.pubDate ? new Date(item.pubDate).getTime() || Date.now() : Date.now()}`,
            title,
            source: feed.name,
            date: dateFormatted,
            dateIso,
            category,
            importance: idx < 3 ? 'HIGH' : 'NORMAL',
            gsPaper,
            syllabusTheme,
            summary: desc.length > 20 ? desc.slice(0, 300) + '...' : `${title}. Important development relevant for UPSC ${gsPaper} preparation.`,
            fullArticle: `${title}\n\n${desc}\n\nSource: ${feed.name} · Real-time live feed.\nRead official source: ${item.link || '#'}`,
            prelimsPoints,
            mainsPoints,
            mainsQuestion,
            topics
          });
        });
      }
    } catch (e) {
      // Ignore individual feed errors, continue with other feeds
    }
  });

  await Promise.allSettled(promises);

  if (fetchedItems.length > 0) {
    // Merge real-time items with built-in archives (deduplicating by title)
    const titleMap = new Map<string, NewsItem>();
    for (const item of ALL_NEWS_ITEMS) {
      titleMap.set(item.title.toLowerCase().trim(), item);
    }
    for (const item of fetchedItems) {
      titleMap.set(item.title.toLowerCase().trim(), item);
    }

    inMemoryLiveCache = Array.from(titleMap.values()).sort((a, b) => b.dateIso.localeCompare(a.dateIso));
    lastFetchedTimestamp = Date.now();
    return inMemoryLiveCache;
  }

  // Fallback to static archive if offline
  return ALL_NEWS_ITEMS;
}
