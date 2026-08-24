export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string; // e.g. '24 Aug 2026'
  dateIso: string; // '2026-08-24'
  category: string;
  importance: 'HIGH' | 'NORMAL';
  gsPaper: string;
  syllabusTheme: string;
  summary: string;
  fullArticle: string;
  prelimsPoints: string[];
  mainsPoints: string[];
  mainsQuestion: string;
  topics: string[];
}

export const ALL_NEWS_ITEMS: NewsItem[] = [
  // ─── 24 Aug 2026 (Today) ─────────────────────────────────
  {
    id: 'news-24-01',
    title: 'PM Modi Concludes Historic Bilateral Visit to Poland & Ukraine; Elevates Strategic Ties',
    source: 'The Hindu',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'GEOPOLITICS',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    syllabusTheme: 'Bilateral, regional and global groupings and agreements involving India and affecting India’s interests',
    summary: 'First visit by an Indian Prime Minister to Poland in 45 years and Ukraine since 1991. Strategic Partnership agreement signed in Warsaw; high-level discussions held in Kyiv on food security, diplomatic conflict resolution, and defense technology collaboration.',
    fullArticle: `In a landmark diplomatic tour of Central and Eastern Europe, Prime Minister Narendra Modi concluded high-stakes bilateral visits to Poland and Ukraine. This marked the first visit by an Indian head of government to Poland in nearly half a century and the first official visit to independent Ukraine since diplomatic relations were established in 1991.\n\nIn Warsaw, India and Poland formally elevated their bilateral ties to a Strategic Partnership. Key agreements were inked covering defense manufacturing supply chains, cybersecurity collaboration, renewable energy transition, and agriculture technology. Prime Minister Modi highlighted Poland's pivotal role as a gateway for Indian trade in Central Europe and thanked the Polish leadership for their crucial humanitarian assistance during 'Operation Ganga' in 2022.\n\nProceeding to Kyiv aboard the Rail Force One, the Prime Minister held comprehensive bilateral talks with Ukrainian President Volodymyr Zelenskyy. India reiterated its consistent and principled stance: that sovereignty, territorial integrity, and international law must be respected, and that modern conflicts cannot be resolved on the battlefield. India offered to play a constructive diplomatic bridging role to achieve a durable, negotiated peace. Additionally, four Memoranda of Understanding (MoUs) were signed spanning agricultural cooperation, medical standards, cultural exchanges, and high-tech humanitarian assistance.`,
    prelimsPoints: [
      'Operation Ganga (2022) evacuated over 22,000 Indian citizens via Poland, Romania, Hungary, and Slovakia.',
      'Poland is India\'s largest trading and investment partner in Central and Eastern Europe (CEE).',
      'India and Ukraine established diplomatic ties in 1992 following the dissolution of the Soviet Union.',
      'Strategic autonomy remains the guiding tenet of Indian multi-alignment diplomacy.'
    ],
    mainsPoints: [
      'Balance in Multi-Alignment: India successfully maintained strong strategic and defense ties with Russia while actively engaging Western and Central European partners.',
      'Food & Energy Security: Ukraine is a critical supplier of sunflower oil and agricultural inputs to the Global South, directly affecting domestic price stability.',
      'Peace Diplomacy: Demonstrates India’s evolving role as a responsible global mediator bridging the Global South and Western democracies.'
    ],
    mainsQuestion: 'Evaluate how India’s proactive diplomacy in Central and Eastern Europe reflects its policy of strategic autonomy. Discuss its significance for India’s global standing. (15 Marks, 250 Words)',
    topics: ['India-Poland Relations', 'India-Ukraine', 'Diplomacy', 'Strategic Autonomy', 'Global South'],
  },
  {
    id: 'news-24-02',
    title: 'Supreme Court 7-Judge Bench Upholds Sub-Classification of Scheduled Castes for Affirmative Action',
    source: 'The Hindu',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'POLITY',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    syllabusTheme: 'Indian Constitution — historical underpinnings, evolution, features, amendments, significant provisions & basic structure',
    summary: 'By a 6:1 majority, the Supreme Court ruled that State governments possess constitutional power under Articles 14, 15, and 16 to sub-classify Scheduled Castes to provide quota benefits to more backward groups, subject to empirical data.',
    fullArticle: `In a historic constitutional ruling, a seven-judge Constitution Bench of the Supreme Court headed by Chief Justice of India held by a 6:1 majority that State legislatures are constitutionally empowered to create sub-categories within the Scheduled Castes (SC) and Scheduled Tribes (ST) categories to extend preferential quota benefits to the most disadvantaged sub-groups.\n\nThe majority judgment authored by Chief Justice D.Y. Chandrachud and concurred by five other judges overruled the 2004 five-judge bench verdict in E.V. Chinnaiah v. State of Andhra Pradesh, which had held that the Presidential List under Article 341 created a single, indivisible composite class that could not be subdivided by states.\n\nThe Court clarified that sub-classification does not violate Article 341 or Article 14 (Right to Equality). Rather, substantive equality demands differential treatment among unequals within a broadly defined category. However, the bench imposed strict constitutional guardrails: States cannot arbitrarily sub-classify; they must collect verifiable empirical data demonstrating inadequate representation, and states cannot grant 100% reservation to any single sub-group, thereby completely excluding others.`,
    prelimsPoints: [
      'Article 341 empowers the President to specify Scheduled Castes in consultation with State Governors.',
      'Article 342 provides the procedure for Presidential notification of Scheduled Tribes.',
      'E.V. Chinnaiah case (2004) was formally overruled by the 7-judge Constitution Bench in 2026.',
      'Articles 15(4) and 16(4) enable the State to make special provisions for the advancement of socially and educationally backward classes.'
    ],
    mainsPoints: [
      'Substantive vs Formal Equality: Moving from treating the SC category as homogeneous to recognizing internal socio-economic stratification (e.g. Mahadalits, Valmikis).',
      'Empirical Guardrail Requirement: Mandates quantifiable administrative data on backwardness to prevent vote-bank driven arbitrary categorization.',
      'Federal Balance: Affirms the role of state legislatures in crafting localized social justice policies while keeping the Presidential List intact.'
    ],
    mainsQuestion: 'Sub-classification within reserved categories is a progressive step toward substantive equality, yet fraught with administrative challenges. Critically analyze in light of recent judicial pronouncements. (15 Marks, 250 Words)',
    topics: ['Article 14', 'Article 341', 'Reservation', 'Affirmative Action', 'Judiciary', 'Social Justice'],
  },
  {
    id: 'news-24-03',
    title: 'DRDO Successfully Completes High-Altitude Desert & Firing Trials for Indigenous "Zorawar" Light Tank',
    source: 'Indian Express',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'DEFENCE',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    syllabusTheme: 'Indigenization of technology and developing new technology; Security challenges and their management in border areas',
    summary: 'The 25-tonne light tank designed specifically for mountain warfare in Eastern Ladakh and Sikkim successfully validated missile firing and amphibious mobility tests. Induction planned by early 2027.',
    fullArticle: `The Defence Research and Development Organisation (DRDO) in joint partnership with Larsen & Toubro (L&T) announced the successful conclusion of all rigorous high-altitude desert and firing validation trials for the indigenous Light Tank 'Zorawar' in Eastern Ladakh at altitudes exceeding 14,000 feet.\n\nNamed after the legendary 19th-century Dogra General Zorawar Singh who led military campaigns across Ladakh and Western Tibet, the 25-tonne tank addresses a critical operational void identified during the 2020 standoff along the Line of Actual Control (LAC). Heavier main battle tanks like the T-90 Bhishma and Arjun face engine performance degradation, track strain, and maneuverability constraints in narrow mountain passes and river valleys.\n\nZorawar features an advanced active protection system (APS), integration with anti-tank guided missiles (ATGMs), loitering munitions, and artificial intelligence-enabled drone integration for real-time battlefield telemetry. Serial production under the Make in India initiative will begin with an initial tranche of 59 tanks, expanding to a full fleet of over 300 units.`,
    prelimsPoints: [
      'Named after General Zorawar Singh Kahluria (known as the Napoleon of India for his trans-Himalayan conquests).',
      'Weight: ~25 tonnes, designed for airlift by C-17 Globemaster and Il-76 military transport aircraft.',
      'Equipped with rubber tracks for silent mobility and specialized cold-start high-altitude diesel powerplants.',
      'Developed under the Make-I category of the Defence Acquisition Procedure (DAP).'
    ],
    mainsPoints: [
      'Operational Parity at LAC: Matches the deployment of China’s Type 15 (ZTQ-15) light tanks stationed in the Tibet Military District.',
      'Defense Indigenization: Strengthens the domestic armored vehicle manufacturing ecosystem, reducing dependence on foreign legacy platforms.',
      'Combined Arms Warfare: Integrates drone swarms and precision ATGMs for digitized modern mountain combat doctrines.'
    ],
    mainsQuestion: 'Examine the strategic and operational necessity of lightweight armored platforms for mountain warfare along India’s northern borders. How does Project Zorawar enhance indigenous defense preparedness? (10 Marks, 150 Words)',
    topics: ['Zorawar Tank', 'DRDO', 'Indigenisation of Defence', 'LAC Mountain Warfare', 'Make in India'],
  },
  {
    id: 'news-24-04',
    title: 'NPCI-UPI Links with UAE\'s AANI and Singapore\'s PayNow for Instant Cross-Border Rupee Settlements',
    source: 'Press Information Bureau',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'ECONOMY',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    syllabusTheme: 'Indian Economy and issues relating to planning, mobilization of resources, growth, development and employment',
    summary: 'Reserve Bank of India expands bilateral digital payment corridors enabling real-time low-cost cross-border remittances. Eliminates intermediary correspondent banking fees and enhances rupee internationalisation.',
    fullArticle: `The National Payments Corporation of India (NPCI) through its international arm NIPL, in collaboration with the Reserve Bank of India (RBI), Central Bank of the UAE, and Monetary Authority of Singapore, has operationalized full two-way retail cross-border payment links between UPI and respective national fast payment systems (AANI and PayNow).\n\nUnder this arrangement, Indian residents and the vast diaspora in the Gulf and Southeast Asia can execute instantaneous fund transfers directly using mobile numbers or Virtual Payment Addresses (VPAs). The linkage bypasses traditional SWIFT correspondent banking rails, slashing average cross-border transaction costs from 5.5% down to under 1.2%, while reducing settlement timelines from 48 hours to less than 15 seconds.\n\nThis development marks a decisive milestone in the Reserve Bank of India\'s roadmap for Rupee Internationalization, fostering bilateral local currency settlement mechanisms (LCS) and insulating trade remittances from dollar volatility.`,
    prelimsPoints: [
      'NPCI was established in 2008 as an initiative of RBI and Indian Banks\' Association (IBA) under the Payment and Settlement Systems Act, 2007.',
      'AANI is the instant payment platform operated by Al Etihad Payments (UAE).',
      'PayNow is the retail instant payment system of Singapore.',
      'RBI Local Currency Settlement (LCS) framework encourages invoicing in INR and partner domestic currencies.'
    ],
    mainsPoints: [
      'Remittance Lifeline: India is the world\'s largest recipient of remittances (> $125 Billion), and slashing intermediary costs directly benefits migrant households.',
      'Export of Digital Public Infrastructure (DPI): Positions India’s India Stack (UPI, Aadhaar, DigiLocker) as an open, scalable global standard.',
      'De-dollarization & Rupee Internationalization: Reduces reliance on US Dollar reserve clearing mechanisms for regional trade flows.'
    ],
    mainsQuestion: 'The internationalization of India’s Digital Public Infrastructure (DPI) serves as a potent instrument of both economic efficiency and economic diplomacy. Elaborate with examples. (15 Marks, 250 Words)',
    topics: ['Digital Public Infrastructure', 'UPI Internationalisation', 'Cross-Border Payments', 'RBI', 'India Stack'],
  },
  {
    id: 'news-24-05',
    title: 'National Clean Air Programme (NCAP) 2026 Assessment: 95 Cities Achieve Over 25% Reduction in PM2.5',
    source: 'Indian Express',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'ENVIRONMENT',
    importance: 'NORMAL',
    gsPaper: 'GS-III',
    syllabusTheme: 'Conservation, environmental pollution and degradation, environmental impact assessment',
    summary: 'Environment Ministry report indicates major air quality improvements attributed to dust suppression grids, EV transition in public transport, and industrial emission switchover to natural gas.',
    fullArticle: `The Ministry of Environment, Forest and Climate Change (MoEFCC) released the comprehensive five-year progress evaluation of the National Clean Air Programme (NCAP), highlighting measurable air quality improvements across 131 non-attainment cities.\n\nAccording to the report, 95 cities registered a 20% to 32% reduction in ambient PM2.5 and PM10 concentrations compared to the 2017–2018 baseline. Top performing cities included Varanasi, Indore, Surat, and Hyderabad, which implemented aggressive localized action plans including mechanical road sweepers, decentralized construction and demolition (C&D) waste recycling plants, and citywide public transit electrification under the PM-eBus Sewa scheme.\n\nHowever, the report emphasized that airshed-level transboundary pollution across the Indo-Gangetic Plains remains a critical challenge, requiring harmonized agricultural stubble management, regional thermal power emission enforcement, and enhanced continuous ambient air quality monitoring stations (CAAQMS).`,
    prelimsPoints: [
      'NCAP was launched in 2019 targeting 20–30% reduction in PM2.5 and PM10 levels by 2024, later revised to 40% reduction by 2026.',
      'Non-attainment cities are those that consistently fail to meet the National Ambient Air Quality Standards (NAAQS) over 5 consecutive years.',
      'PRANA Portal (Portal for Regulation of Air-pollution in Non-Attainment cities) tracks real-time NCAP implementation.',
      'Central Pollution Control Board (CPCB) is the statutory body executing national monitoring under the Air Act, 1981.'
    ],
    mainsPoints: [
      'Airshed Management Approach: Pollution does not respect administrative boundaries; management must transition to regional airshed governance across state lines.',
      'Decarbonization of Urban Mobility: Integration of renewable grids with electric bus transit networks delivers dual climate and air quality dividends.',
      'Public Health Co-benefits: Mitigating PM2.5 directly lowers cardiovascular and respiratory disease burden, saving billions in healthcare expenditure.'
    ],
    mainsQuestion: 'Air pollution in the Indo-Gangetic Plain is an ecological crisis demanding an airshed-based inter-state collaborative framework rather than piecemeal urban interventions. Discuss. (15 Marks, 250 Words)',
    topics: ['NCAP', 'Air Pollution', 'PM2.5', 'Environmental Governance', 'CPCB'],
  },
  {
    id: 'news-24-06',
    title: 'Ministry of Mines Releases National Critical Minerals Recycling Policy & Incentive Framework',
    source: 'Hindustan Times',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'SCIENCE_TECH',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    syllabusTheme: 'Science and Technology- developments and their applications and effects in everyday life; Resource distribution',
    summary: 'Scheme offers 20% capital subsidies for battery and rare-earth element recovery plants. Aims to secure 30% domestic supply of Lithium, Cobalt, and Neodymium through urban mining by 2030.',
    fullArticle: `To insulate India’s clean energy transition and high-tech defense industries from global supply chain shocks, the Ministry of Mines notified the National Critical Minerals Recycling Policy 2026.\n\nThe framework introduces a ₹4,200 Crore capital subsidy scheme covering up to 20% of capital expenditure for state-of-the-art hydrometallurgical and pyrometallurgical recycling facilities capable of recovering battery-grade Lithium, Cobalt, Nickel, and Rare Earth Elements (REEs) from spent electric vehicle batteries and electronic waste.\n\nThe policy introduces mandatory Extended Producer Responsibility (EPR) targets for clean tech manufacturers, mandating that by 2030, at least 30% of critical minerals utilized in domestic manufacturing must originate from certified secondary recycled sources. This circular economy thrust minimizes environmental degradation associated with virgin open-cast mining while mitigating geopolitical dependency on concentrated mineral refining hubs.`,
    prelimsPoints: [
      'Critical minerals are those essential for economic development and national security whose supply chain is vulnerable to disruption (e.g. Lithium, Cobalt, Nickel, Graphite, REEs).',
      'India is a member of the US-led Minerals Security Partnership (MSP) since 2023.',
      'KABIL (Khanij Bidesh India Ltd) is a joint venture of NALCO, HCL, and MECL to acquire critical mineral assets overseas.',
      'Urban mining refers to the process of reclaiming raw materials from spent electronics and industrial waste.'
    ],
    mainsPoints: [
      'Geopolitical Vulnerability: Global refining of rare earths and battery minerals is heavily concentrated (>70% in China), creating strategic supply bottlenecks.',
      'Circular Economy & Sustainability: Battery recycling generates 80% fewer carbon emissions compared to extracting virgin ores.',
      'Industrial Competitiveness: Supports domestic production linked incentive (PLI) schemes for Advanced Chemistry Cells (ACC) and semiconductors.'
    ],
    mainsQuestion: 'Securing critical mineral supply chains is imperative for India’s energy transition and strategic autonomy. Evaluate the role of domestic circular recycling policies and international partnerships in achieving this goal. (15 Marks, 250 Words)',
    topics: ['Critical Minerals', 'Lithium', 'Rare Earth Elements', 'Circular Economy', 'MSP'],
  },
  {
    id: 'news-24-07',
    title: 'India-ASEAN Free Trade in Goods Agreement (AITIGA) Modernisation Talks Enter Final Round in Jakarta',
    source: 'The Hindu',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'IR',
    importance: 'NORMAL',
    gsPaper: 'GS-II',
    syllabusTheme: 'Bilateral, regional and global groupings and agreements involving India and affecting India’s interests',
    summary: 'Commerce Ministry delegation seeks stricter Rules of Origin (ROO) to curb Chinese circumvention and wider market access for Indian pharmaceutical and IT exports.',
    fullArticle: `Senior trade negotiators from India and the 10 member states of the Association of Southeast Asian Nations (ASEAN) commenced the final round of negotiations in Jakarta for the comprehensive review and modernisation of the ASEAN-India Trade in Goods Agreement (AITIGA).\n\nSigned originally in 2009, AITIGA has witnessed a widening trade deficit for India—growing from $5 Billion in 2010 to over $44 Billion. India’s core negotiating priorities focus on establishing rigorous Product-Specific Rules (PSRs) and anti-circumvention mechanisms to prevent non-originating third-party goods (primarily from China) from entering Indian ports tariff-free via ASEAN routing.\n\nIndia is also pressing for mutual recognition agreements (MRAs) in pharmaceuticals, marine products, and professional services, aligning trade architectures with the Act East Policy and Indo-Pacific economic resilience.`,
    prelimsPoints: [
      'AITIGA was signed in 2009 and came into force on January 1, 2010.',
      'ASEAN comprises 10 Southeast Asian nations: Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Vietnam.',
      'Rules of Origin (ROO) are the criteria needed to determine the national source of a product to prevent trade re-routing.',
      'India opted out of RCEP (Regional Comprehensive Economic Partnership) in 2019 citing unresolved trade deficits.'
    ],
    mainsPoints: [
      'Trade Deficit Asymmetry: India’s tariff concessions under early FTAs were deeper than partner reciprocity, leading to asymmetric trade imbalances.',
      'Geoeconomic Rebalancing: Modernizing AITIGA is essential to align trade ties with India\'s security role in the Indo-Pacific.',
      'Integration into Global Value Chains (GVCs): Creating resilient semiconductor, automotive, and textile value networks between India and Southeast Asia.'
    ],
    mainsQuestion: 'Analyze why India’s Free Trade Agreements with Asian partners have historically resulted in trade deficits. How does the ongoing review of AITIGA address these structural concerns? (10 Marks, 150 Words)',
    topics: ['AITIGA', 'Act East Policy', 'ASEAN-India', 'Rules of Origin', 'Free Trade Agreements'],
  },
  {
    id: 'news-24-08',
    title: 'Health Ministry Completes Pan-India Rollout of U-WIN Portal for Universal Child Immunization Tracking',
    source: 'Press Information Bureau',
    date: '24 Aug 2026',
    dateIso: '2026-08-24',
    category: 'GOVERNANCE',
    importance: 'NORMAL',
    gsPaper: 'GS-II',
    syllabusTheme: 'Issues relating to development and management of Social Sector/Services relating to Health, Education, Human Resources',
    summary: 'Modeled after CoWIN, U-WIN digitized records of over 2.9 Crore pregnant women and infants, automating vaccination alerts, QR certificates, and reducing dropout rates under Mission Indradhanush.',
    fullArticle: `The Ministry of Health and Family Welfare announced the successful nationwide operationalization of the U-WIN (Universal Immunization Win) platform across all 36 States and Union Territories.\n\nDeveloped on the technological backbone of the CoWIN platform, U-WIN serves as the single centralized registry for the Universal Immunization Programme (UIP). The platform creates individualized digital vaccination passports with ABHA (Ayushman Bharat Health Account) linkage for every pregnant woman and newborn in the country.\n\nKey features include automated multilingual SMS reminders before due vaccination dates, real-time tracking of dropouts and left-out beneficiaries, on-spot registration by frontline ASHA and ANM workers in remote tribal areas, and verifiable QR-code digital certificates. The platform has significantly accelerated coverage under Intensified Mission Indradhanush (IMI), aiming for 100% full immunization coverage against 12 vaccine-preventable diseases.`,
    prelimsPoints: [
      'Universal Immunization Programme (UIP) provides free vaccines against 12 life-threatening diseases (including Diphtheria, Pertussis, Tetanus, Polio, Measles, Rubella, Rotavirus, and Hepatitis B).',
      'Mission Indradhanush was launched in December 2014 to ensure full immunization coverage for children and pregnant women.',
      'ABHA (Ayushman Bharat Health Account) is a 14-digit unique identifier under the Ayushman Bharat Digital Mission (ABDM).',
      'ASHA (Accredited Social Health Activist) and ANM (Auxiliary Nurse Midwife) are key community healthcare facilitators.'
    ],
    mainsPoints: [
      'Harnessing Digital Public Goods in Health: Translating pandemic-tested digital architectures into routine primary healthcare delivery.',
      'Addressing Dropout Disparities: Automated tracking overcomes geographical and socio-economic hurdles that lead to dropouts between primary and booster shots.',
      'Evidence-Based Resource Allocation: Real-time supply chain monitoring prevents vaccine stock-outs and wastage at primary health centres (PHCs).'
    ],
    mainsQuestion: 'Digital interventions have the potential to transform primary healthcare delivery in India. Discuss with special reference to the U-WIN platform and Ayushman Bharat Digital Mission. (10 Marks, 150 Words)',
    topics: ['U-WIN', 'Mission Indradhanush', 'E-Health', 'Public Health Governance', 'ABDM'],
  },

  // ─── 23 Aug 2026 ─────────────────────────────────────────
  {
    id: 'news-23-01',
    title: 'India-China Bilateral Dialogue on Border Disengagement Advances in Eastern Ladakh',
    source: 'The Hindu',
    date: '23 Aug 2026',
    dateIso: '2026-08-23',
    category: 'GEOPOLITICS',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    syllabusTheme: 'India and its neighborhood- relations; Bilateral agreements',
    summary: 'Special Representatives met to review diplomatic and military channels for complete disengagement along LAC. India insists on restoration of status quo ante at Depsang and Demchok.',
    fullArticle: `Diplomatic and military representatives of India and China concluded a crucial round of the Working Mechanism for Consultation & Coordination on India-China Border Affairs (WMCC). Both sides agreed to accelerate consensus on mutual disengagement at legacy friction points in Eastern Ladakh.\n\nIndia reiterated that peace and tranquility along the Line of Actual Control (LAC) is an indispensable prerequisite for the normalization of overall bilateral relations. Talks focused on resolving patrolling rights at Depsang Plains and Demchok, with both sides committing to maintain peace through existing military protocols.`,
    prelimsPoints: [
      'WMCC was established in 2012 as an institutional mechanism for consultation on border affairs.',
      'Depsang Plains and Demchok are key friction sectors in Eastern Ladakh.',
      'Line of Actual Control (LAC) is divided into Western (Ladakh), Middle (Himachal/Uttarakhand), and Eastern (Arunachal/Sikkim) sectors.'
    ],
    mainsPoints: [
      'Restoration of Status Quo Ante: Critical for preventing buffer zones from compromising India’s patrolling rights.',
      'Strategic Asymmetry: Highlights India’s multi-tiered border infrastructure upgrade along the northern borders.'
    ],
    mainsQuestion: 'Peace and tranquility along the LAC is foundational for bilateral normalcy. Discuss the strategic imperatives for India in managing its border dispute with China. (15 Marks, 250 Words)',
    topics: ['LAC', 'India-China Relations', 'National Security', 'WMCC'],
  },
  {
    id: 'news-23-02',
    title: 'India Semiconductor Mission Approves Phase-II Fabrication Plants in Gujarat & Tamil Nadu',
    source: 'Indian Express',
    date: '23 Aug 2026',
    dateIso: '2026-08-23',
    category: 'SCIENCE_TECH',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    syllabusTheme: 'Science and Technology- developments and their applications in everyday life',
    summary: 'Union Cabinet approves ₹45,000 Cr outlay for sub-10nm chip manufacturing and R&D ecosystem. Three fabs to be operational by 2029.',
    fullArticle: `The Union Cabinet approved Phase-II of the India Semiconductor Mission (ISM) with a dedicated fiscal allocation of ₹45,000 Crore. The program focuses on establishing sub-10nm silicon logic fabrication units, advanced compound semiconductor plants, and specialized packaging testing (OSAT/ATMP) facilities in Dholera (Gujarat) and Sriperumbudur (Tamil Nadu).\n\nThe program provides 50% fiscal support on a pari-passu basis, aiming to reduce India\'s $30 Billion annual electronics component import reliance.`,
    prelimsPoints: [
      'ISM was launched under the Ministry of Electronics and Information Technology (MeitY).',
      'Compound semiconductors (GaN, SiC) are critical for power electronics, EVs, and defense radars.',
      'ATMP refers to Assembly, Testing, Marking, and Packaging.'
    ],
    mainsPoints: [
      'Tech Sovereignty: Establishing domestic chip fabs secures critical infrastructure against global semiconductor supply chokeholds.',
      'High-Tech Ecosystem Creation: Catalyzes domestic design, specialized chemicals, and ultra-pure water treatment clusters.'
    ],
    mainsQuestion: 'Examine the challenges and strategic significance of developing an indigenous semiconductor manufacturing ecosystem in India. (15 Marks, 250 Words)',
    topics: ['ISM', 'Make in India', 'Electronics Manufacturing', 'MeitY'],
  },
  {
    id: 'news-23-03',
    title: 'Supreme Court Standardizes Guidelines on Preventive Detention under Article 22',
    source: 'Press Information Bureau',
    date: '23 Aug 2026',
    dateIso: '2026-08-23',
    category: 'POLITY',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    syllabusTheme: 'Fundamental Rights, Judiciary and Constitutional Safeguards',
    summary: 'Constitution Bench mandates strict adherence to procedural safeguards and 90-day review limits. Personal liberty cannot be curtailed without compelling grounds.',
    fullArticle: `The Supreme Court emphasized that preventive detention is an exceptional power that infringes upon personal liberty under Article 21 and must be strictly confined within constitutional procedural safeguards outlined in Article 22.\n\nThe Court observed that preventive detention orders must establish a direct link to public order and cannot be invoked routinely for ordinary law-and-order infractions. Advisory boards must conclude statutory reviews within strict timelines.`,
    prelimsPoints: [
      'Article 22(1) and 22(2) provide safeguards against punitive detention (right to be informed of grounds, right to consult lawyer, magistrate production within 24 hours).',
      'Article 22(4) to 22(7) govern preventive detention procedures and Advisory Board oversight.'
    ],
    mainsPoints: [
      'Balancing Liberty vs State Security: Preventing misuse of draconian preventive provisions while safeguarding public order.',
      'Procedural Due Process: Reaffirming judicial review as a cornerstone of personal liberty.'
    ],
    mainsQuestion: 'Preventive detention is a necessary evil in constitutional governance. Discuss the constitutional and judicial safeguards against its arbitrary use. (10 Marks, 150 Words)',
    topics: ['Article 22', 'Fundamental Rights', 'Judiciary', 'Preventive Detention'],
  },
  {
    id: 'news-23-04',
    title: 'RBI Monetary Policy Committee Keeps Repo Rate Unchanged at 6.5% Amid Softening Inflation',
    source: 'The Hindu',
    date: '23 Aug 2026',
    dateIso: '2026-08-23',
    category: 'ECONOMY',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    syllabusTheme: 'Monetary Policy, Inflation and Economic Growth',
    summary: 'Core CPI inflation stabilized at 3.8% in July. MPC maintains accommodative stance to support growth recovery while keeping inflation within target band.',
    fullArticle: `The Reserve Bank of India’s Monetary Policy Committee (MPC) voted unanimously to maintain the benchmark repo rate at 6.50% for the tenth consecutive meeting. The MPC retained its policy stance focused on withdrawal of accommodation to ensure inflation progressively aligns with the 4.0% headline target while supporting sustained GDP growth.\n\nGovernor highlighted that while core inflation has softened to 3.8%, unpredictable weather events and food price volatility require continued monetary vigilance.`,
    prelimsPoints: [
      'MPC is a 6-member statutory body constituted under the RBI Act, 1934 (amended in 2016).',
      'Inflation targeting band is 4% (+/- 2%) based on Consumer Price Index (CPI).'
    ],
    mainsPoints: [
      'Inflation vs Growth Dilemma: Managing sticky food inflation while sustaining capital expenditure and industrial investment.',
      'Transmission of Monetary Policy: Analyzing bank credit growth and interest rate pass-through.'
    ],
    mainsQuestion: 'Explain the composition and mandate of the RBI Monetary Policy Committee. How does flexible inflation targeting stabilize macroeconomic fundamentals? (10 Marks, 150 Words)',
    topics: ['RBI', 'Monetary Policy', 'Inflation', 'Interest Rates'],
  }
];

export function getAvailableNewsDates(): string[] {
  return Array.from(new Set(ALL_NEWS_ITEMS.map((item) => item.dateIso))).sort().reverse();
}
