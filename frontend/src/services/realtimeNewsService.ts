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

interface DomainKnowledge {
  background: string;
  analysis: string;
  challenges: string;
  wayForward: string;
  prelims: string[];
  mains: string[];
  question: string;
  topics: string[];
}

function synthesizeDeepEditorial(title: string, desc: string, category: string, gsPaper: string): {
  fullArticle: string;
  summary: string;
  prelimsPoints: string[];
  mainsPoints: string[];
  mainsQuestion: string;
  topics: string[];
} {
  const lower = (title + ' ' + desc).toLowerCase();

  // 1. India - China / Border / Indo-Pacific
  if (lower.includes('china') || lower.includes('chinese') || lower.includes('lac') || lower.includes('border') || lower.includes('disengagement')) {
    const fullArticle = `### Context & Overview
${title}

${desc}

### Background & Strategic Landscape
India and China share a 3,488-km undemarcated Line of Actual Control (LAC) divided into Western (Ladakh), Middle (Himachal/Uttarakhand), and Eastern (Arunachal Pradesh) sectors. Bilateral ties experienced unprecedented disruption following the May 2020 military standoff and the Galwan Valley clash. While multiple rounds of Corps Commander-level talks and Working Mechanism for Consultation & Coordination on India-China Border Affairs (WMCC) have achieved disengagement at friction points like Pangong Tso, Galwan, Hot Springs, and Gogra, structural differences remain pronounced in Depsang Plains and Demchok.

### Key Structural Bottlenecks & Friction Points
1. **Asymmetry in Perception:** The absence of mutually agreed LAC maps perpetuates overlapping patrols and tactical friction.
2. **Buffer Zones vs. Sovereign Patrol Rights:** Creation of temporary buffer zones has curtailed traditional patrolling points (PPs) for Indian troops, leading to domestic strategic concerns.
3. **Trade vs. Security Paradox:** Despite severe border tensions, bilateral merchandise trade continues to exceed $100 billion, resulting in a persistent trade deficit for India and supply-chain vulnerabilities in active pharmaceutical ingredients (APIs) and electronics.
4. **Regional Geopolitical Balancing:** China's expanding footprint in South Asia (String of Pearls, CPEC in Pakistan, port infrastructure in Sri Lanka/Myanmar) conflicts directly with India's 'Neighbourhood First' and SAGAR doctrines.

### Policy Implications & Strategic Way Forward
- **Institutionalized Border Management:** Transition from temporary crisis-management protocols (1993, 1996, 2005, 2012, 2013 agreements) to a verifiable, legally binding boundary demarcation framework.
- **De-risking and Supply Chain Diversification:** Accelerate domestic production under Production Linked Incentive (PLI) schemes while deepening strategic partnerships through Quad, IPEF, and India-Middle East-Europe Economic Corridor (IMEC).
- **Border Infrastructure Modernization:** Sustain high-altitude all-weather road and tunnel connectivity (e.g. Sela Tunnel, Nyoma Advanced Landing Ground, Border Roads Organisation projects) to ensure rapid force mobilization.`;

    return {
      fullArticle,
      summary: `${title}. Comprehensive strategic breakdown of India-China relations, LAC disengagement dynamics, border stability mechanisms, and India's multi-alignment foreign policy.`,
      prelimsPoints: [
        'Line of Actual Control (LAC) spans 3,488 km across Western, Middle, and Eastern sectors.',
        'WMCC (Working Mechanism for Consultation & Coordination on India-China Border Affairs) established in 2012 for diplomatic dialogue.',
        'Key border friction points: Depsang Plains (Y-Junction/Bottleneck), Demchok (Charding Nullah), Pangong Tso (Fingers 1-8).',
        'Border Agreements: 1993 Maintenance of Peace & Tranquillity, 1996 Military CBMs, 2005 Standard Operating Procedures, 2013 Border Defence Cooperation Agreement (BDCA).'
      ],
      mainsPoints: [
        'Strategic Autonomy vs. Deterrence: Balancing bilateral diplomatic negotiations while strengthening deterrence through Quad and Western partnerships.',
        'Economic Interdependence: Addressing India\'s $80B+ trade deficit and reducing critical import dependencies in active pharma ingredients and solar modules.',
        'Border Infrastructure Doctrine: Rapid execution of Vibrant Villages Programme and BRO capital expenditure along northern borders.',
        'Regional Stability: Navigating China\'s footprint in the Indian Ocean Region under the SAGAR (Security and Growth for All in the Region) framework.'
      ],
      mainsQuestion: '“Peace and tranquillity along the Line of Actual Control (LAC) is the indispensable prerequisite for the normalisation of India–China relations.” Critically examine this statement in light of recent diplomatic and security developments. (15 Marks, 250 Words)',
      topics: ['India-China Relations', 'LAC & Border Security', 'GS-II Bilateral Relations', 'Strategic Autonomy', 'Indo-Pacific']
    };
  }

  // 2. Supreme Court / Judiciary / Constitution / Reservation
  if (lower.includes('supreme court') || lower.includes('judge') || lower.includes('reservation') || lower.includes('quota') || lower.includes('constitution') || lower.includes('article') || lower.includes('bench')) {
    const fullArticle = `### Context & Key Ruling
${title}

${desc}

### Constitutional Framework & Evolution
Affirmative action and social justice in India are firmly anchored in Articles 14 (Equality before Law), 15 (Prohibition of Discrimination), and 16 (Equality of Opportunity in Public Employment). Over decades, the constitutional jurisprudence on reservations has evolved through landmark verdicts including Indra Sawhney (1992), M. Nagaraj (2006), Jarnail Singh (2018), and Janhit Abhiyan (2022 EWS case). The core constitutional objective is achieving 'substantive equality' rather than merely formal legal equality.

### Key Dimensions & Constitutional Debates
1. **Sub-classification within Backward Classes:** The doctrine that backward classes are not a homogeneous, monolithic group. More marginalized sub-castes require targeted state protection to prevent benefits from being monopolized by the relatively advanced sections ('creamy layer').
2. **Empirical Data Mandate:** The Supreme Court has repeatedly emphasized that any classification, sub-quota, or reservation policy must be backed by quantifiable, empirical data demonstrating inadequacy of representation and backwardness.
3. **Article 341 vs. State Legislative Competence:** Harmonizing the President's exclusive power under Article 341 to notify the Scheduled Castes list with the State legislatures' authority to make reasonable sub-classifications for affirmative action.
4. **Administrative Efficiency (Article 335):** Balancing reservation provisions with the maintenance of overall efficiency and merit in public administration.

### Way Forward & Institutional Safeguards
- **Robust Socio-Economic Caste Census (SECC):** Establishing objective, verifiable data infrastructure to guide affirmative action policies transparently.
- **Regular Review Mechanisms:** Institution of independent commissions to periodically review representation levels and phase out benefits for families that have achieved multi-generational advancement.
- **Holistic Empowerment:** Combining public sector reservations with capacity-building investments in quality public education, skill training, and health access.`;

    return {
      fullArticle,
      summary: `${title}. In-depth constitutional analysis covering fundamental rights, judicial precedents, substantive equality, and public administration under UPSC GS-II Polity.`,
      prelimsPoints: [
        'Article 14 guarantees Equality before Law and Equal Protection of the Laws.',
        'Articles 15(4) & 16(4) empower the State to make special provisions for the advancement of socially and educationally backward classes.',
        'Article 341 empowers the President to specify the Castes, Races or Tribes deemed to be Scheduled Castes in consultation with Governors.',
        'Article 335 mandates that claims of SCs/STs shall be considered consistently with the maintenance of efficiency of administration.',
        'Indra Sawhney (1992) established the 50% reservation ceiling and introduced the \'creamy layer\' exclusion principle.'
      ],
      mainsPoints: [
        'Substantive Equality vs Formal Equality: How proportional and targeted state affirmative action fulfills the directive principles of state policy (Article 46).',
        'Federalism in Affirmative Action: Demarcation of powers between Union Presidential notifications (Art 341/342) and State legislative enactments.',
        'Judicial Review & Empirical Thresholds: The necessity of verifiable census data to avoid arbitrariness and survive judicial scrutiny under Article 14.',
        'Policy Shift from Quotas to Capacity Building: Fostering economic mobility through quality schooling, vocational skills, and entrepreneurship ecosystems.'
      ],
      mainsQuestion: '“Sub-classification of backward classes is an essential step towards fulfilling the constitutional promise of substantive equality.” Critically evaluate the constitutional and administrative implications of this principle. (15 Marks, 250 Words)',
      topics: ['Polity & Constitution', 'Judiciary', 'Fundamental Rights', 'Affirmative Action', 'GS-II Governance']
    };
  }

  // 3. Elections / Parliament / Simultaneous Polls / Governance
  if (lower.includes('poll') || lower.includes('election') || lower.includes('simultaneous') || lower.includes('parliament') || lower.includes('bill') || lower.includes('ekyc') || lower.includes('lpg') || lower.includes('subsidy')) {
    const fullArticle = `### Context & Key Development
${title}

${desc}

### Governance Framework & Policy Architecture
Effective public administration requires balancing electoral integrity, fiscal efficiency, and transparent delivery of welfare entitlements. In India's democratic system, structural reforms—ranging from electoral synchronisation to Direct Benefit Transfer (DBT) pipelines—aim to eliminate intermediaries, plug revenue leakages, and ensure targeted delivery under the 'Minimum Government, Maximum Governance' doctrine.

### Structural Analysis & Key Dimensions
1. **Fiscal & Governance Synergies:** Continuous elections result in frequent enforcement of the Model Code of Conduct (MCC), leading to policy paralysis and massive election expenditure. Synchronisation or streamlining governance cycles allows sustained administrative focus on long-term capital investments.
2. **Citizen-Centric Service Delivery:** Digital public infrastructure (Aadhaar, UPI, JAM Trinity, eKYC) has enabled direct benefit transfers of over ₹35 lakh crore, eliminating ghost beneficiaries and reducing leakage across welfare schemes like PM Ujjwala Yojana, PM-KISAN, and PDS.
3. **Federal & Constitutional Sensitivities:** Reforms touching state assemblies, local bodies, or public distribution require extensive consultation with State governments to uphold constitutional federalism and prevent exclusion of marginalized citizens without biometric access.
4. **Data Security & Privacy Safeguards:** Rapid digitization of citizen registries mandates strict compliance with the Digital Personal Data Protection (DPDP) Act 2023 to prevent surveillance risks and unauthorized data profiling.

### Strategic Way Forward
- **Institutional Consensus Building:** Passing constitutional amendment bills with broad political consensus, particularly for provisions altering the terms of legislative assemblies (Articles 83, 172).
- **Offline & Assisted Verification Alternatives:** Providing robust non-biometric alternative verification routes (e.g. physical verification by local administrative officers) so that no genuine beneficiary is denied essential subsidies like LPG or food grains.
- **Strengthening State Capacity:** Investing in district-level administrative training and modern grievance redressal portals.`;

    return {
      fullArticle,
      summary: `${title}. Detailed examination of governance reforms, digital public infrastructure, welfare administration, and constitutional considerations under UPSC GS-II.`,
      prelimsPoints: [
        'Articles 83 & 172 govern the duration of the Houses of Parliament and State Legislative Assemblies (5 years unless dissolved earlier).',
        'Direct Benefit Transfer (DBT) operates under the JAM Trinity (Jan Dhan - Aadhaar - Mobile) architecture.',
        'High-Level Committee on Simultaneous Elections was chaired by former President Ram Nath Kovind.',
        'Law Commission of India (170th & 255th Reports) recommended electoral reforms to curb policy paralysis and election expenditure.',
        'Digital Personal Data Protection Act, 2023 provides statutory framework for citizen consent and data processing.'
      ],
      mainsPoints: [
        'Democratic Accountability vs Administrative Continuity: Examining the trade-offs between frequent localized elections and uninterrupted developmental governance.',
        'Federal Equilibrium: Ensuring that national synchronisation policies respect the distinct mandates and regional political aspirations of State Assemblies.',
        'Inclusion in Welfare Delivery: Balancing technological efficiency (eKYC/biometrics) with constitutional rights to food, energy, and social security.',
        'Fiscal Rationalisation: Redirecting administrative savings from reduced poll cycles and welfare leakage toward public capital expenditure and healthcare.'
      ],
      mainsQuestion: '“The integration of Digital Public Infrastructure with targeted welfare schemes has transformed Indian governance, but challenges of inclusion and federal coordination remain.” Discuss. (15 Marks, 250 Words)',
      topics: ['Governance & Administration', 'Electoral Reforms', 'Digital Public Infrastructure', 'Welfare Schemes', 'GS-II Governance']
    };
  }

  // 4. Science, Technology, Semiconductors & Economy
  if (lower.includes('semiconductor') || lower.includes('chip') || lower.includes('ai') || lower.includes('isro') || lower.includes('technology') || lower.includes('manufacturing') || lower.includes('gdp') || lower.includes('economy') || lower.includes('rbi') || lower.includes('inflation')) {
    const fullArticle = `### Context & Key Development
${title}

${desc}

### Economic & Technological Significance
The global economy is undergoing a massive structural transformation driven by artificial intelligence, green energy transitions, and semiconductor sovereignty. Semiconductors represent the fundamental building block of all modern electronics, defense equipment, electric vehicles, and critical infrastructure. Under the ₹76,000-crore India Semiconductor Mission (ISM) and Production Linked Incentive (PLI) schemes, India is strategically positioning itself as a trusted global manufacturing hub and design powerhouse.

### Critical Dimensions & Industry Realities
1. **Capital & Resource Intensity:** Semiconductor fabrication ('fabs') requires billions of dollars in upfront capital, uninterrupted ultra-pure water supplies (millions of gallons daily), stable high-voltage power grids, and ultra-clean room facilities.
2. **Supply Chain Geopolitics:** The semiconductor value chain is geographically concentrated—EDA design software in the US, lithography machines (EUV) in the Netherlands (ASML), foundry fabrication in Taiwan (TSMC) and South Korea (Samsung), and packaging/assembly (ATMP/OSAT) across Southeast Asia. Developing domestic capacity insulates India against geopolitical black swan events.
3. **Regional Industrial Dispersal:** Setting up high-tech manufacturing plants in non-traditional industrial states (e.g. Assam, Gujarat) fosters regional economic growth, creates high-value engineering employment, and stimulates local auxiliary MSME ecosystems.
4. **Talent & R&D Ecosystem:** While India commands over 20% of the world's semiconductor design engineers, domestic fabrication experience remains limited, necessitating international technology transfer agreements and rapid upskilling through specialized university curricula.

### Way Forward & Policy Imperatives
- **Sustained Incentive Outlay (ISM 2.0):** Expanding financial subsidies beyond assembly/testing (ATMP) into commercial compound semiconductor fabs and indigenous fabless chip design startups.
- **Resource Infrastructure Assurances:** State governments must provide iron-clad guarantees for zero-interruption green power, specialized industrial water recycling plants, and logistics corridors.
- **Strategic Global Alliances:** Deepening bilateral semiconductor supply chain partnerships through the US-India iCET (Initiative on Critical and Emerging Technology) and Quad Semiconductor Supply Chain Initiative.`;

    return {
      fullArticle,
      summary: `${title}. Comprehensive analysis of India's technology manufacturing strategy, semiconductor mission, supply chain resilience, and economic impact under UPSC GS-III.`,
      prelimsPoints: [
        'India Semiconductor Mission (ISM) launched under Digital India Corporation with a financial outlay of ₹76,000 crore.',
        'Semiconductor manufacturing components: Fabless Design, Front-End Fabrication, Back-End ATMP (Assembly, Testing, Marking, and Packaging) / OSAT.',
        'ASML (Netherlands) is the world\'s sole manufacturer of Extreme Ultraviolet (EUV) lithography systems required for sub-7nm chips.',
        'Initiative on Critical and Emerging Technologies (iCET) is a strategic bilateral framework between India and the United States.',
        'Production Linked Incentive (PLI) Scheme provides financial incentives of 4% to 6% on incremental sales of manufactured goods.'
      ],
      mainsPoints: [
        'Strategic Tech Sovereignty: How domestic chip manufacturing shields India\'s national security and critical infrastructure from global supply shocks.',
        'Employment & Economic Multiplier: Transitioning India from a software service-export economy to a high-value hardware design and manufacturing powerhouse.',
        'Infrastructure & Environmental Challenges: Addressing massive industrial water consumption and high-voltage power demands sustainably.',
        'Geopolitical Tech Diplomacy: Leveraging iCET, Quad, and EU partnerships to secure technology transfer and intellectual property licensing.'
      ],
      mainsQuestion: '“Building a domestic semiconductor ecosystem is essential for India’s economic resilience and strategic sovereignty.” Examine the key opportunities and structural bottlenecks in achieving this goal. (15 Marks, 250 Words)',
      topics: ['Semiconductor Mission', 'Science & Tech', 'Industrial PLI', 'Economic Growth', 'GS-III Technology']
    };
  }

  // 5. Global Geopolitics, West Asia, Middle East, Diplomacy
  if (lower.includes('iran') || lower.includes('us') || lower.includes('sanction') || lower.includes('war') || lower.includes('israel') || lower.includes('gaza') || lower.includes('russia') || lower.includes('ukraine') || lower.includes('un') || lower.includes('treaty')) {
    const fullArticle = `### Context & Key Development
${title}

${desc}

### Geopolitical Landscape & Strategic Dynamics
The international order is experiencing intense fragmentation characterized by escalating regional conflicts, weaponization of global trade and financial sanctions, and the erosion of multilateral consensus. For India, developments in West Asia and Eurasia carry direct strategic consequences for energy security, the safety of over 9 million diaspora members, maritime trade through critical choke points (Strait of Hormuz, Bab-el-Mandeb, Suez Canal), and regional connectivity projects.

### Strategic Dimensions & Conflicting Interests
1. **Energy Security & Sea Lines of Communication (SLOCs):** India imports over 85% of its crude oil requirements, a predominant share of which transits through West Asian maritime routes. Any escalation threatening maritime shipping directly impacts domestic inflation and current account deficits (CAD).
2. **Balancing Partnerships in a Polarized World:** India maintains robust, multi-vector diplomatic ties with conflicting regional actors—including the Gulf Cooperation Council (UAE, Saudi Arabia), Israel, Iran, the United States, and Russia—strictly guided by its foundational doctrine of Strategic Autonomy.
3. **Strategic Connectivity Corridors:** Sustaining long-term commitments in key connectivity initiatives—such as the Chabahar Port in Iran (gateway to Afghanistan and Central Asia via INSTC) and the proposed India-Middle East-Europe Economic Corridor (IMEC)—requires navigating complex unilateral international sanctions.
4. **Humanitarian & Diaspora Security:** Ensuring active consular safety, maritime escort operations (e.g. Indian Navy's anti-piracy and merchant vessel protection in the Arabian Sea/Gulf of Aden), and humanitarian assistance in conflict zones.

### Strategic Way Forward for India
- **Principled Multi-Alignment Diplomacy:** Advocating for de-escalation, immediate cessation of hostilities, adherence to international humanitarian law, and peaceful resolution through structured bilateral dialogue.
- **Sanctions Mitigation & Rupee Trade Settlements:** Institutionalizing bilateral currency swap agreements and special Rupee Vostro Accounts to insulate vital trade flows from third-party sanctions.
- **Active Maritime Security Posture:** Expanding naval patrol deployments under 'Operation Sankalp' to safeguard commercial maritime vessels and ensure unrestricted freedom of navigation.`;

    return {
      fullArticle,
      summary: `${title}. Comprehensive geopolitical analysis of West Asian tensions, global sanctions, energy security, and India's strategic autonomy under UPSC GS-II International Relations.`,
      prelimsPoints: [
        'Strait of Hormuz connects the Persian Gulf with the Gulf of Oman and Arabian Sea; handles ~20% of global petroleum liquids consumption.',
        'Bab-el-Mandeb Strait connects the Red Sea to the Gulf of Aden and the Indian Ocean.',
        'Chabahar Port is located in Sistan-Baluchistan province of Iran on the Gulf of Oman, developed by India to bypass Pakistan for Central Asian transit.',
        'International North-South Transport Corridor (INSTC) is a 7,200-km multi-mode transit network linking India, Iran, Azerbaijan, and Russia.',
        'Operation Sankalp is the Indian Navy\'s continuous maritime security operation in the Persian Gulf and Gulf of Oman launched in 2019.'
      ],
      mainsPoints: [
        'Strategic Autonomy in West Asia: Evaluating India’s delicate diplomatic balancing between Israel, the Arab Gulf states, and Iran.',
        'Energy Security Vulnerabilities: The macroeconomic and fiscal impact of West Asian geopolitical shocks on India’s import bill and inflation.',
        'Connectivity vs Sanctions: Navigating unilateral foreign sanctions to operationalize Chabahar Port and the INSTC corridor.',
        'Maritime Security Leadership: India’s expanding role as a \'Net Security Provider\' in the Western Indian Ocean and Arabian Sea.'
      ],
      mainsQuestion: 'Critically analyze the strategic and economic implications of rising West Asian instability on India’s energy security and connectivity initiatives. Suggest policy measures to safeguard India’s core national interests. (15 Marks, 250 Words)',
      topics: ['International Relations', 'West Asia', 'Energy Security', 'Maritime Security', 'GS-II Geopolitics']
    };
  }

  // 6. Default High-Depth Synthesis for other categories (Environment, Society, Agriculture, Economy)
  const fullArticle = `### Context & Key Overview
${title}

${desc}

### Comprehensive Background & Policy Framework
This development has direct bearing on ${category.toLowerCase().replace('_', ' ')} under the UPSC ${gsPaper} syllabus. Effective governance and sustainable socio-economic growth require harmonizing statutory mandates, executive policies, and stakeholder participation. Over recent years, India's policy architecture has transitioned toward data-driven governance, decentralized administration, and outcome-oriented program monitoring.

### Multi-Dimensional Analytical Breakdown
1. **Institutional & Regulatory Mechanisms:** Assessing the statutory bodies, administrative departments, and regulatory authorities responsible for enforcing standards and policy compliance in this sector.
2. **Socio-Economic & Environmental Impact:** Evaluating the tangible impact on citizens, marginalized sections, regional equity, and ecological sustainability.
3. **Implementation Bottlenecks & Resource Constraints:** Addressing institutional capacity gaps, fiscal allocations, inter-departmental coordination silos, and ground-level enforcement challenges.
4. **Accountability & Public Transparency:** Leveraging digital monitoring, social audits, and robust grievance redressal mechanisms to enhance administrative responsiveness.

### Actionable Policy Recommendations & Way Forward
- **Strengthening Statutory Frameworks:** Updating existing laws and regulations to reflect contemporary technological and socio-economic realities.
- **Inter-Agency Coordination:** Fostering cooperative federalism between Union ministries and State departments through institutionalized review platforms.
- **Capacity Building & Grassroots Engagement:** Empowering local self-governments (Panchayati Raj Institutions and Urban Local Bodies) and civil society organizations to ensure inclusive execution.`;

  return {
    fullArticle,
    summary: `${title}. In-depth UPSC analysis examining institutional frameworks, socio-economic implications, policy bottlenecks, and strategic recommendations for ${category.replace('_', ' ')}.`,
    prelimsPoints: [
      `Syllabus Relevance: Falls directly under UPSC ${gsPaper} — ${CATEGORY_KEYWORDS[category]?.theme || 'National Current Affairs'}.`,
      `Regulatory Architecture: Governed by respective Union Ministries, statutory commissions, and state administrative bodies.`,
      `Key Core Concept: Highlights contemporary policy execution, institutional reforms, and factual developments.`,
      `Exam Focus: Factual aspects related to constitutional articles, statutory provisions, reports, and national indices.`
    ],
    mainsPoints: [
      `Structural Assessment: Evaluating policy efficacy, institutional design, and administrative implementation on the ground.`,
      `Federal & Socio-Economic Dimensions: Harmonizing Union policy guidelines with State-level execution priorities.`,
      `Critical Bottlenecks: Identifying structural deficits, budgetary constraints, and procedural delays.`,
      `Strategic Way Forward: Promoting transparent governance, digital monitoring, and participatory public administration.`
    ],
    mainsQuestion: `Analyze the key issues and policy imperatives surrounding recent developments in ${category.toLowerCase().replace('_', ' ')}. Discuss the structural challenges and suggest a pragmatic roadmap. (15 Marks, 250 Words)`,
    topics: [category.replace('_', ' '), gsPaper, 'UPSC Current Affairs', 'Policy Analysis', 'Governance']
  };
}

function generateLiveUpscAnalysis(title: string, category: string, gsPaper: string, desc = '') {
  return synthesizeDeepEditorial(title, desc, category, gsPaper);
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
          const { prelimsPoints, mainsPoints, mainsQuestion, topics, fullArticle, summary } = generateLiveUpscAnalysis(title, category, gsPaper, desc);

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
            summary: summary || (desc.length > 20 ? desc.slice(0, 300) + '...' : `${title}. Comprehensive editorial breakdown under UPSC ${gsPaper}.`),
            fullArticle: fullArticle || `${title}\n\n${desc}\n\nSource: ${feed.name} · Real-time live feed.\nRead official source: ${item.link || '#'}`,
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
