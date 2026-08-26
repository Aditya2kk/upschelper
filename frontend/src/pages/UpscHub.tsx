import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Sparkles,
  Filter,
  Flame,
  Globe,
  MapPin,
  Scale,
  Award,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Send,
  Lightbulb,
  AlertTriangle,
  FileText,
  Search,
  Bookmark,
  Share2,
  Copy,
  Check,
  Zap,
  Target,
  PenTool,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────
interface MCQItem {
  id: string;
  gsPaper: 'GS-I' | 'GS-II' | 'GS-III' | 'GS-IV';
  topic: string;
  question: string;
  statements?: string[];
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  eliminationTip: string;
  trapWarning: string;
  syllabusLink: string;
}

interface MainsQuestion {
  id: string;
  gsPaper: string;
  topic: string;
  marks: number;
  wordLimit: number;
  question: string;
  context: string;
  structure: {
    intro: string;
    dimensions: { heading: string; points: string[] }[];
    wayForward: string[];
    committeesOrArticles: string[];
    conclusion: string;
  };
}

interface PlaceInNews {
  name: string;
  region: string;
  whyInNews: string;
  keyGeographicalFeatures: string[];
  strategicImportance: string;
  mapPointers: string;
}

interface ConstitutionalItem {
  title: string;
  articleOrCase: string;
  significance: string;
  prelimsFact: string;
  mainsApplication: string;
  year: string;
}

interface InterviewDilemma {
  issue: string;
  coreDebate: string;
  argumentsInFavor: string[];
  argumentsAgainst: string[];
  balancedConclusion: string;
  boardTrapToAvoid: string;
}

// ─── High-Yield Data Sets ─────────────────────────────────
const PRELIMS_MCQS: MCQItem[] = [
  {
    id: 'mcq-1',
    gsPaper: 'GS-II',
    topic: 'Indian Polity · Affirmative Action',
    question: 'With reference to the Supreme Court’s 7-judge bench judgment on sub-classification of Scheduled Castes (SCs), consider the following statements:',
    statements: [
      '1. State legislatures possess constitutional authority to create sub-quotas within the SC list without collecting empirical data.',
      '2. Sub-classification does not violate Article 341 of the Constitution as it does not amend the Presidential List.',
      '3. States are constitutionally permitted to allocate 100% of reserved seats to a single sub-caste if proven severely marginalized.'
    ],
    options: [
      { key: 'A', text: '1 and 2 only' },
      { key: 'B', text: '2 only' },
      { key: 'C', text: '2 and 3 only' },
      { key: 'D', text: '1, 2 and 3' },
    ],
    correctKey: 'B',
    explanation: 'Statement 2 is correct: The Supreme Court held that sub-classification gives effect to substantive equality (Article 14) and does not alter the Presidential List under Article 341. Statement 1 is incorrect because the Court mandated verifiable empirical data. Statement 3 is incorrect because granting 100% quota to one group amounts to total exclusion of others, which is constitutionally impermissible.',
    eliminationTip: 'Look out for absolute words like "without collecting empirical data" (Statement 1) and "allocate 100%" (Statement 3) — UPSC rarely endorses unguided arbitrary powers.',
    trapWarning: 'Don’t confuse Presidential power under Article 341 (specifying castes) with State legislative power under Articles 15(4) & 16(4) (apportioning reservation benefits).',
    syllabusLink: 'GS-II: Indian Constitution — Significant provisions, basic structure & affirmative action'
  },
  {
    id: 'mcq-2',
    gsPaper: 'GS-III',
    topic: 'Environment & Biodiversity',
    question: 'Consider the following statements regarding the Great Indian Bustard (Ardeotis nigriceps):',
    statements: [
      '1. It is designated as "Critically Endangered" on the IUCN Red List and listed in Schedule I of Wildlife (Protection) Act, 1972.',
      '2. Desert National Park in Rajasthan is its primary remaining natural breeding habitat in the wild.',
      '3. The Supreme Court recognized a fundamental right to be free from adverse impacts of climate change under Articles 14 and 21 in cases concerning its conservation.'
    ],
    options: [
      { key: 'A', text: '1 and 2 only' },
      { key: 'B', text: '2 and 3 only' },
      { key: 'C', text: '1 and 3 only' },
      { key: 'D', text: '1, 2 and 3' },
    ],
    correctKey: 'D',
    explanation: 'All three statements are correct. The GIB is Critically Endangered and in Schedule I. Desert National Park holds ~95% of the wild population. In M.K. Ranjitsinh v. Union of India (2024), the Supreme Court formally linked the right to be free from climate change to the Right to Equality (Art 14) and Right to Life (Art 21).',
    eliminationTip: 'The SC climate change landmark judgment is one of the most prominent 2024-2026 legal-environmental precedents — remember its linkage directly to GIB overhead powerline disputes.',
    trapWarning: 'GIB is NOT found across entire peninsular India today; it is locally extinct in almost all states except Rajasthan and Gujarat.',
    syllabusLink: 'GS-III: Conservation, Environmental Pollution & Degradation, EIA'
  },
  {
    id: 'mcq-3',
    gsPaper: 'GS-III',
    topic: 'International Conventions · Deep Sea Mining',
    question: 'With reference to the International Seabed Authority (ISA) and the "Area", consider the following statements:',
    statements: [
      '1. The ISA is an autonomous international organization established under the 1982 United Nations Convention on the Law of the Sea (UNCLOS).',
      '2. The seabed and ocean floor beyond the limits of national jurisdiction are designated as the "Common Heritage of Mankind".',
      '3. India was the first country to be granted "Pioneer Investor" status for polymetallic nodules exploration in the Central Indian Ocean Basin.'
    ],
    options: [
      { key: 'A', text: '1 only' },
      { key: 'B', text: '1 and 2 only' },
      { key: 'C', text: '2 and 3 only' },
      { key: 'D', text: '1, 2 and 3' },
    ],
    correctKey: 'D',
    explanation: 'All statements are factual and correct. ISA is headquartered in Kingston, Jamaica, under UNCLOS 1982. The international seabed area is the Common Heritage of Mankind (Part XI UNCLOS). India was designated the first Pioneer Investor in 1987 in the Central Indian Ocean Basin (CIOB).',
    eliminationTip: 'India\'s Samudrayan Mission (MATSYA 6000) and Deep Ocean Mission are direct national programs executing this ISA mandate.',
    trapWarning: 'ISA regulates ONLY international waters ("The Area"); it has NO jurisdiction over a country’s Exclusive Economic Zone (EEZ) or Territorial Waters.',
    syllabusLink: 'GS-III: Science & Technology — Deep Sea Exploration, Critical Minerals & Blue Economy'
  },
  {
    id: 'mcq-4',
    gsPaper: 'GS-I',
    topic: 'Physical Geography & Geopolitics',
    question: 'Which of the following strategically significant straits connects the Red Sea to the Gulf of Aden and the Indian Ocean?',
    options: [
      { key: 'A', text: 'Strait of Hormuz' },
      { key: 'B', text: 'Bab-el-Mandeb' },
      { key: 'C', text: 'Strait of Malacca' },
      { key: 'D', text: 'Bosphorus Strait' },
    ],
    correctKey: 'B',
    explanation: 'Bab-el-Mandeb ("Gate of Tears") is a choke point connecting the Red Sea (and Suez Canal) to the Gulf of Aden and the Indian Ocean. It borders Yemen (Arabian Peninsula) and Djibouti/Eritrea (Horn of Africa).',
    eliminationTip: 'Hormuz connects Persian Gulf to Gulf of Oman; Malacca connects Indian Ocean to South China Sea; Bosphorus connects Black Sea to Sea of Marmara.',
    trapWarning: 'Do not confuse Bab-el-Mandeb (Red Sea gateway) with Strait of Hormuz (Persian Gulf oil chokepoint).',
    syllabusLink: 'GS-I: Important Geophysical Phenomena, Location of critical world choke points'
  }
];

const MAINS_QUESTIONS: MainsQuestion[] = [
  {
    id: 'mains-1',
    gsPaper: 'GS-II: Governance & Social Justice',
    topic: 'Sub-classification of Affirmative Action',
    marks: 15,
    wordLimit: 250,
    question: '“Sub-classification within reserved categories is an essential step towards realizing substantive equality, but without empirical safeguards, it risks political fragmentation.” Critically analyze in light of the recent Supreme Court verdict. (15 Marks, 250 Words)',
    context: 'Supreme Court 7-judge bench overruled E.V. Chinnaiah (2004) and permitted States to sub-classify SC/STs for quota benefits.',
    structure: {
      intro: 'Define "Substantive Equality" vs "Formal Equality". Cite the recent Supreme Court 7-judge Constitution Bench ruling upholding State powers to sub-classify Scheduled Castes under Articles 15(4) and 16(4).',
      dimensions: [
        {
          heading: '1. Why Sub-classification Promotes Substantive Equality',
          points: [
            'Heterogeneity within SCs: Certain sub-castes (e.g. Valmikis, Mazhabi Sikhs, Madigas) have historically faced extreme deprivation and remained unrepresented compared to advanced Dalit groups.',
            'Eliminating "Monopolization of Benefits": Prevents the entrenched creamy layer within backward classes from capturing 80%+ of state quotas.',
            'Constitutional Mandate: Article 14 commands equal treatment among equals; treating unequals equally perpetuates systemic inequality.'
          ]
        },
        {
          heading: '2. Major Risks & Institutional Bottlenecks',
          points: [
            'Electoral Gerrymandering: Political parties may weaponize sub-quotas for vote-bank mobilization.',
            'Data Deficit: Lack of periodic caste-based socio-economic surveys makes empirical justification contentious.',
            'Administrative Complexity: Managing micro-rosters across state public service commissions.'
          ]
        },
        {
          heading: '3. Supreme Court Guardrails & Safeguards',
          points: [
            'Empirical Evidence: State must produce quantifiable data showing inadequate representation of specific sub-groups.',
            'No 100% Monopolization: States cannot allocate entire quota to one sub-caste, excluding others completely.',
            'Judicial Review: Any sub-classification policy remains open to strict proportionality scrutiny.'
          ]
        }
      ],
      wayForward: [
        'Establish independent statutory Equal Opportunity Commissions to audit quota distribution annually.',
        'Implement the Justice Rohini Commission methodology for objective backwardness indexing.',
        'Focus on capacity building, quality schooling, and skilling rather than relying solely on entry-level quotas.'
      ],
      committeesOrArticles: [
        'Articles 14, 15(4), 16(4), 341 & 342',
        'E.V. Chinnaiah (2004) vs State of Punjab (2024)',
        'Justice Rohini Commission on Sub-categorization'
      ],
      conclusion: 'Conclude with Dr. B.R. Ambedkar’s vision: Reservation is a mechanism for socio-economic mobility, and dynamic sub-classification guided by empirical rigour ensures justice reaches the last person in the queue (Antyodaya).'
    }
  },
  {
    id: 'mains-2',
    gsPaper: 'GS-II: International Relations',
    topic: 'India’s Strategic Autonomy in Central Europe',
    marks: 15,
    wordLimit: 250,
    question: '“India’s active diplomacy in Central and Eastern Europe demonstrates a confident multi-alignment strategy without compromising its traditional partnerships.” Evaluate in the context of recent high-level diplomatic visits. (15 Marks, 250 Words)',
    context: 'PM Modi’s historic state visits to Poland (first in 45 years) and Ukraine (first since 1991 independence).',
    structure: {
      intro: 'Highlight India’s foreign policy evolution from Non-Alignment 1.0 to Strategic Multi-Alignment in an increasingly multipolar world, referencing bilateral visits to Poland and Ukraine.',
      dimensions: [
        {
          heading: '1. Strategic Significance of Central & Eastern Europe (CEE)',
          points: [
            'Economic Gateway: Poland is India’s largest trade and manufacturing partner in the CEE region ($5.7B bilateral trade).',
            'Defense Supply Chain Resilience: Poland’s advanced defense manufacturing complements India’s Make-in-India defense indigenization.',
            'Humanitarian Reciprocity: Strengthening ties forged during Operation Ganga (evacuating 22,000+ Indian students).'
          ]
        },
        {
          heading: '2. Balancing Multi-Alignment: Ukraine & Russia',
          points: [
            'Constructive Diplomatic Bridge: India engages Ukraine while preserving deep strategic, energy, and defense ties with Russia.',
            'Principled Stance on International Law: Reiterating that sovereignty and territorial integrity must be respected, and "today’s era is not of war".',
            'Food & Energy Security: Ensuring continuity in agricultural inputs and fertilizer trade for the Global South.'
          ]
        }
      ],
      wayForward: [
        'Institutionalize India-Central Europe business corridors and green hydrogen technology partnerships.',
        'Leverage Global South leadership (Voice of Global South Summits) to foster negotiated conflict resolution.',
        'Expand cultural diplomacy and bilateral migration mobility partnerships.'
      ],
      committeesOrArticles: [
        'Strategic Partnership Agreement (India-Poland 2024)',
        'Operation Ganga (2022)',
        'Article 51 (Directive Principle on International Peace and Security)'
      ],
      conclusion: 'Conclude that proactive engagement in Central Europe elevates India as a Vishwamitra (Global Friend), maintaining autonomous diplomatic maneuverability.'
    }
  }
];

const PLACES_IN_NEWS: PlaceInNews[] = [
  {
    name: 'Bab-el-Mandeb Strait',
    region: 'Horn of Africa / Arabian Peninsula (Red Sea Gateway)',
    whyInNews: 'Disruptions to global commercial shipping routes due to maritime drone attacks, forcing ships to detour via the Cape of Good Hope (+14 days).',
    keyGeographicalFeatures: [
      'Connects Red Sea (Suez Canal) to the Gulf of Aden & Indian Ocean',
      'Bordered by Yemen to the north-east, Djibouti and Eritrea to the south-west',
      'Contains Perim Island dividing the strait into two channels'
    ],
    strategicImportance: 'Carries ~12% of total global seaborne trade and 30% of global container traffic.',
    mapPointers: 'Identify Gulf of Aden, Red Sea, Djibouti, Yemen, Suez Canal.'
  },
  {
    name: 'Suwalki Gap',
    region: 'Central Europe (Poland-Lithuania Border)',
    whyInNews: 'NATO defense planners identify it as the most vulnerable bottleneck in European security.',
    keyGeographicalFeatures: [
      '65 km wide land corridor between Poland and Lithuania',
      'Pinched between Russian exclave of Kaliningrad and Belarus'
    ],
    strategicImportance: 'Only overland link connecting the Baltic states (Estonia, Latvia, Lithuania) with the rest of NATO and the European Union.',
    mapPointers: 'Locate Kaliningrad (Russia), Belarus, Lithuania, Poland, Baltic Sea.'
  },
  {
    name: 'Central Indian Ocean Basin (CIOB)',
    region: 'Indian Ocean (International Waters)',
    whyInNews: 'India expanding deep-sea polymetallic nodule exploration under the Deep Ocean Mission and ISA license.',
    keyGeographicalFeatures: [
      'Located south of the Indian peninsula in international waters',
      'Rich in Polymetallic Nodules containing Nickel, Copper, Cobalt, and Manganese'
    ],
    strategicImportance: 'Essential for clean energy transition (EV batteries, grid storage) and national critical mineral security.',
    mapPointers: 'Locate Ninety East Ridge, Chagos-Laccadive Ridge, Indian Ocean Basin.'
  }
];

const CONSTITUTIONAL_MATRIX: ConstitutionalItem[] = [
  {
    title: 'Sub-classification of Scheduled Castes for Affirmative Action',
    articleOrCase: 'Articles 14, 15(4), 16(4), 341 · State of Punjab v. Davinder Singh (2024)',
    significance: 'States possess constitutional power to sub-categorize SC/STs based on empirical data to extend preferential benefits to the most disadvantaged sub-groups.',
    prelimsFact: 'Overrules the 2004 5-judge verdict in E.V. Chinnaiah. Article 341 list is not an indivisible monolithic unit.',
    mainsApplication: 'Use under GS-II when discussing Substantive Equality, Creamy Layer exclusion, and the limits of state affirmative action powers.',
    year: '2024–2026'
  },
  {
    title: 'Right to be Free from Adverse Impacts of Climate Change',
    articleOrCase: 'Articles 14 & 21 · M.K. Ranjitsinh v. Union of India (2024)',
    significance: 'First time Supreme Court formally recognized the Right against adverse effects of Climate Change as a distinct Fundamental Right.',
    prelimsFact: 'Delivered by CJI-led 3-judge bench balancing Great Indian Bustard powerline protection with solar power infrastructure.',
    mainsApplication: 'Essential citation in GS-III (Environment vs Development) and GS-II (Judicial Activism & Fundamental Rights expansion).',
    year: '2024'
  },
  {
    title: 'Governor’s Assent to State Bills & Pocket Veto',
    articleOrCase: 'Article 200 · State of Punjab v. Principal Secretary to Governor (2023)',
    significance: 'Governor cannot indefinitely withhold assent to a Bill or declare assembly sessions illegal without constitutional sanction.',
    prelimsFact: 'If the Governor withholds assent, they MUST return the Bill to the Legislature "as soon as possible" under the proviso to Article 200.',
    mainsApplication: 'Core case study for GS-II Federalism, Governor’s discretionary powers, and checks on legislative deadlock.',
    year: '2023–2024'
  }
];

const INTERVIEW_PERSPECTIVES: InterviewDilemma[] = [
  {
    issue: 'Simultaneous Elections (“One Nation, One Election”) in India',
    coreDebate: 'Whether holding concurrent Lok Sabha and State Assembly elections strengthens fiscal efficiency or undermines federal accountability.',
    argumentsInFavor: [
      'Reduces election expenditure by thousands of crores for Union and State exchequers.',
      'Prevents persistent Model Code of Conduct (MCC) policy paralysis affecting governance.',
      'Reduces voter fatigue and minimizes disruption of security forces and civil administration.'
    ],
    argumentsAgainst: [
      'Regional issues risk getting overshadowed by dominant national narratives.',
      'Complex constitutional amendments needed (Articles 83, 85, 172, 174, 356) requiring state ratification.',
      'Frequent elections ensure politicians remain accountable to local voters every few months.'
    ],
    balancedConclusion: 'A phased implementation (e.g. synchronizing elections in two batches every 2.5 years, as suggested by Law Commission & Kovind Committee) balances administrative efficiency with federal responsiveness.',
    boardTrapToAvoid: 'Never take an extreme single-party stance; evaluate constitutional federalism alongside administrative efficacy.'
  },
  {
    issue: 'Freebies vs Targeted Welfare Economics in Fiscal Federalism',
    coreDebate: 'Drawing the boundary between merit goods (investments in health/education) vs populist short-term electoral transfers.',
    argumentsInFavor: [
      'Direct Income Support (DBT) acts as a crucial safety net for vulnerable informal workers and distressed farm households.',
      'Improves household consumption and human development indicators (e.g. free school meals, subsidized LPG).'
    ],
    argumentsAgainst: [
      'Uncontrolled non-merit subsidies deteriorate State Debt-to-GSDP ratios (breaching FRBM limits).',
      'Crowds out critical capital expenditure (capex) in roads, irrigation, power grids, and quality healthcare.'
    ],
    balancedConclusion: 'Welfare schemes that build long-term human capital (Merit Goods like education, nutrition, health insurance) must be protected, while non-merit unconditional subsidies require statutory fiscal caps monitored by the Finance Commission and CAG.',
    boardTrapToAvoid: 'Do not label all welfare programs as "freebies". Emphasize constitutional Directive Principles (Part IV) while demanding fiscal transparency.'
  }
];

// ─── Main UPSC Hub Component ──────────────────────────────
export const UpscHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'MCQ' | 'MAINS' | 'PLACES' | 'CONSTITUTION' | 'INTERVIEW'>('MCQ');

  // MCQ State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [userScore, setUserScore] = useState<number>(0);

  // Mains Draft State
  const [expandedMains, setExpandedMains] = useState<string | null>('mains-1');
  const [userDrafts, setUserDrafts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelectOption = (mcqId: string, key: 'A' | 'B' | 'C' | 'D', correctKey: string) => {
    if (selectedAnswers[mcqId]) return; // already answered

    const updated = { ...selectedAnswers, [mcqId]: key };
    setSelectedAnswers(updated);
    setShowExplanation({ ...showExplanation, [mcqId]: true });

    if (key === correctKey) {
      setUserScore((prev) => prev + 2);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setUserScore(0);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ─── Hero Command Banner ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 p-8 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>UPSC CSE Exam Master Suite</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                🎯 Target: <strong>CSE 2026 / 2027</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                ⚡ Live Syllabus-Mapped
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            UPSC Preparation Command Hub
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
            Turn daily current affairs into exam-ready answers. Solve high-yield Prelims MCQs, study 15-marker Mains structural frameworks, analyze strategic Places in News, and master balanced interview perspectives.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Prelims Drill</p>
                <p className="text-xs font-bold text-white">Daily High-Yield MCQs</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Mains Writing</p>
                <p className="text-xs font-bold text-white">3-Tier Frameworks</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Places In News</p>
                <p className="text-xs font-bold text-white">Chokepoints & Seas</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Law & Verdicts</p>
                <p className="text-xs font-bold text-white">Articles & SC Cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        {[
          { key: 'MCQ', label: 'Prelims Daily MCQ Drill', icon: Target, count: `${PRELIMS_MCQS.length} Questions` },
          { key: 'MAINS', label: 'Mains 15-Marker Frameworks', icon: PenTool, count: `${MAINS_QUESTIONS.length} Formats` },
          { key: 'PLACES', label: 'Places in News (IR & Map)', icon: Compass, count: `${PLACES_IN_NEWS.length} Chokepoints` },
          { key: 'CONSTITUTION', label: 'Articles & Landmark Cases', icon: Scale, count: `${CONSTITUTIONAL_MATRIX.length} Judgments` },
          { key: 'INTERVIEW', label: 'Interview & Board Debates', icon: MessageSquare, count: 'Balanced Stances' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-2xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PRELIMS DAILY MCQ DRILL ─────────────────── */}
      {activeTab === 'MCQ' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Daily UPSC Prelims Elimination Drill</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">Negative Marking: -0.66</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Practice UPSC-standard questions with real traps and elimination techniques.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                Score: <span className="text-white text-sm font-black">{userScore}</span> / {PRELIMS_MCQS.length * 2} Marks
              </div>
              <button
                onClick={handleResetQuiz}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reset Quiz"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MCQ List */}
          <div className="space-y-6">
            {PRELIMS_MCQS.map((mcq, index) => {
              const selected = selectedAnswers[mcq.id];
              const isAnswered = !!selected;
              const isCorrect = selected === mcq.correctKey;

              return (
                <div
                  key={mcq.id}
                  className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 space-y-5 hover:border-slate-700 transition-all"
                >
                  {/* Card Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                        {mcq.gsPaper}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• {mcq.topic}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Q{index + 1} of {PRELIMS_MCQS.length}</span>
                  </div>

                  {/* Question */}
                  <div className="space-y-3">
                    <h3 className="text-sm md:text-base font-bold text-white leading-relaxed">
                      {mcq.question}
                    </h3>

                    {mcq.statements && (
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                        {mcq.statements.map((stmt, sIdx) => (
                          <p key={sIdx}>{stmt}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mcq.options.map((opt) => {
                      const isOptionSelected = selected === opt.key;
                      const isOptionCorrect = opt.key === mcq.correctKey;

                      let btnStyle = 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-850';

                      if (isAnswered) {
                        if (isOptionCorrect) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/30';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                        } else {
                          btnStyle = 'bg-slate-950/50 border-slate-800/60 text-slate-600 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(mcq.id, opt.key, mcq.correctKey)}
                          className={`p-3.5 rounded-2xl border text-left text-xs md:text-sm flex items-center gap-3 transition-all ${btnStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOptionCorrect && isAnswered
                              ? 'bg-emerald-500 text-white'
                              : isOptionSelected && isAnswered
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Elimination Guide */}
                  {isAnswered && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200 text-xs leading-relaxed">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+2.00)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Incorrect (-0.66) · Correct Option: {mcq.correctKey}
                          </span>
                        )}
                        <span className="text-slate-500 font-mono text-[11px]">{mcq.syllabusLink}</span>
                      </div>

                      <p className="text-slate-300 whitespace-pre-wrap">{mcq.explanation}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                          <p className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" /> Elimination Technique
                          </p>
                          <p className="text-slate-300 text-[11px]">{mcq.eliminationTip}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                          <p className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Examiner Trap to Avoid
                          </p>
                          <p className="text-slate-300 text-[11px]">{mcq.trapWarning}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MAINS 15-MARKER ANSWER FRAMEWORKS ──────── */}
      {activeTab === 'MAINS' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Daily Mains Answer Architecture (DAW)</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">UPSC CSE GS-I to GS-IV</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured multi-dimensional frameworks, constitutional citations, and model answers.
              </p>
            </div>
          </div>

          {/* Questions Accordion */}
          <div className="space-y-6">
            {MAINS_QUESTIONS.map((m) => {
              const isExpanded = expandedMains === m.id;
              const draft = userDrafts[m.id] || '';
              const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

              return (
                <div
                  key={m.id}
                  className="glass-panel rounded-3xl border border-slate-800 overflow-hidden transition-colors hover:border-slate-700"
                >
                  {/* Top Bar */}
                  <div
                    onClick={() => setExpandedMains(isExpanded ? null : m.id)}
                    className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {m.gsPaper}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">• {m.topic}</span>
                        <span className="text-xs text-amber-400 font-bold">[{m.marks} Marks · {m.wordLimit} Words]</span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {m.question}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        <strong>Context:</strong> {m.context}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800 text-slate-400 shrink-0 mt-1">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-6 border-t border-slate-800/80 pt-6 animate-in fade-in duration-150">
                      {/* Structure Breakdown */}
                      <div className="space-y-4 text-xs">
                        {/* 1. Introduction */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                            Phase 1 · Introduction (30-40 Words)
                          </span>
                          <p className="text-slate-300 leading-relaxed pt-1">{m.structure.intro}</p>
                        </div>

                        {/* 2. Body Dimensions */}
                        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase text-[10px]">
                            Phase 2 · Body Structure & Dimensions (150-180 Words)
                          </span>

                          <div className="space-y-3 pt-1">
                            {m.structure.dimensions.map((dim, dIdx) => (
                              <div key={dIdx} className="space-y-1.5 pl-2 border-l-2 border-purple-500/40">
                                <h4 className="font-bold text-slate-200 text-xs">{dim.heading}</h4>
                                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                                  {dim.points.map((pt, pIdx) => (
                                    <li key={pIdx}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Way Forward & Conclusion */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                              Phase 3 · Pragmatic Way Forward
                            </span>
                            <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px] leading-relaxed pt-1">
                              {m.structure.wayForward.map((wf, wIdx) => (
                                <li key={wIdx}>{wf}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
                              Key Value Additions & Committees
                            </span>
                            <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px] leading-relaxed pt-1">
                              {m.structure.committeesOrArticles.map((ca, cIdx) => (
                                <li key={cIdx}>{ca}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Conclusion */}
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase text-[10px]">
                            Phase 4 · Visionary Conclusion (30 Words)
                          </span>
                          <p className="text-slate-300 leading-relaxed pt-1">{m.structure.conclusion}</p>
                        </div>
                      </div>

                      {/* Interactive Draft Box */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <PenTool className="w-4 h-4 text-indigo-400" />
                            <span>Practice Answer Box</span>
                          </div>
                          <span className={`text-xs font-mono font-bold ${
                            wordCount > m.wordLimit ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            Word Count: {wordCount} / {m.wordLimit}
                          </span>
                        </div>

                        <textarea
                          rows={6}
                          value={draft}
                          onChange={(e) => setUserDrafts({ ...userDrafts, [m.id]: e.target.value })}
                          placeholder="Type your answer introduction, bullet points, and committee recommendations here..."
                          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                        />

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            onClick={() => handleCopy(m.question, m.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                          >
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === m.id ? 'Copied' : 'Copy Question'}</span>
                          </button>

                          <button
                            onClick={() => navigate(`/ai/research?q=${encodeURIComponent(`Evaluate this UPSC Mains answer for question: "${m.question}". Answer: ${draft || 'Please provide feedback on model structure.'}`)}`)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Evaluate with AI Assistant</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: PLACES IN NEWS ─────────────────────────── */}
      {activeTab === 'PLACES' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Places in News & Strategic Waterways</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">Prelims Map Radar</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Critical choke points, contested territories, and maritime exploration zones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLACES_IN_NEWS.map((p, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>{p.region}</span>
                  </div>

                  <h3 className="text-lg font-black text-white">{p.name}</h3>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-amber-400">Why in News</span>
                    <p className="text-slate-300 leading-relaxed">{p.whyInNews}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase text-indigo-400">Key Geographical Features</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                      {p.keyGeographicalFeatures.map((feat, fIdx) => (
                        <li key={fIdx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300">🗺️ Atlas Practice:</span>
                  <p>{p.mapPointers}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: CONSTITUTIONAL ARTICLES & VERDICTS ─────── */}
      {activeTab === 'CONSTITUTION' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Constitutional Articles & Landmark Verdicts</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">Polity Reference Matrix</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-quote constitutional articles, judicial precedents, and committee recommendations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONSTITUTIONAL_MATRIX.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                      {item.year}
                    </span>
                    <Scale className="w-4 h-4 text-indigo-400" />
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 font-mono">Articles & Case Precedents</span>
                    <p className="text-indigo-200 font-semibold leading-relaxed">{item.articleOrCase}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Core Significance</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{item.significance}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <strong>Prelims Fact:</strong> {item.prelimsFact}
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                    <strong>Mains Use:</strong> {item.mainsApplication}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: INTERVIEW & BOARD PERSPECTIVES ─────────── */}
      {activeTab === 'INTERVIEW' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Personality Test & Board Perspectives</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">Non-Partisan Analysis</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                How to articulate balanced, multi-dimensional viewpoints before the UPSC Interview Board.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INTERVIEW_PERSPECTIVES.map((d, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 space-y-5 hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-2 border-b border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
                    Critical National Debate
                  </span>
                  <h3 className="text-lg font-bold text-white">{d.issue}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Core Question:</strong> {d.coreDebate}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <h4 className="font-bold text-emerald-300 text-xs">Pros / Arguments in Favor</h4>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                      {d.argumentsInFavor.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                    <h4 className="font-bold text-rose-300 text-xs">Cons / Structural Concerns</h4>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                      {d.argumentsAgainst.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                    Ideal Balanced Stance Before the Board
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px] pt-1">{d.balancedConclusion}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span><strong>Board Trap:</strong> {d.boardTrapToAvoid}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
