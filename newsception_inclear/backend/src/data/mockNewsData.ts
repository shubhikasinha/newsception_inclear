export interface MockNewsArticle {
  title: string;
  url: string;
  source: string;
  description: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
}

export interface MockNewsArticleGroup {
  keywords: string[];
  articles: MockNewsArticle[];
}

export const curatedMockNews: MockNewsArticleGroup[] = [
  {
    keywords: ["artificial intelligence", "ai", "ai regulation", "ai safety"],
    articles: [
      {
        title: "UN Members Back AI Safety Accord Ahead of 2025 Summit",
        url: "https://www.bbc.com/news/technology-ai-safety-2025",
        source: "BBC News",
        description: "Delegates from 68 countries endorsed baseline rules for auditing frontier AI models ahead of the Geneva AI Safety Summit.",
        publishedAt: "2025-10-28T09:30:00Z",
        imageUrl: "https://ichef.bbci.co.uk/news/976/cpsprodpb/ai-summit.jpg",
        author: "Jane McMillan"
      },
      {
        title: "Big Tech Agrees to Real-Time AI Incident Reporting",
        url: "https://www.reuters.com/technology/ai-incident-reporting-accord-2025-10-27/",
        source: "Reuters",
        description: "Alphabet, Microsoft and OpenAI will share high-risk AI incidents with regulators within 72 hours under a new voluntary agreement.",
        publishedAt: "2025-10-27T16:05:00Z",
        imageUrl: "https://static.reuters.com/resources/r/?m=02&d=20251027&t=2&i=ai-briefing",
        author: "Paresh Dave"
      },
      {
        title: "India Launches National Compute Grid for AI Startups",
        url: "https://www.livemint.com/technology/tech-news/india-national-ai-compute-grid-2025-10-25.html",
        source: "Mint",
        description: "The INR 12,000 crore mission gives Indian startups subsidised access to GPUs and model evaluation labs in Bengaluru and Hyderabad.",
        publishedAt: "2025-10-25T05:45:00Z",
        imageUrl: "https://images.livemint.com/img/2025/10/25/ai-grid.webp",
        author: "Niharika Sharma"
      },
      {
        title: "EU Parliament Passes AI Liability Directive",
        url: "https://www.politico.eu/article/european-parliament-approves-ai-liability-directive/",
        source: "Politico Europe",
        description: "Consumers harmed by high-risk AI systems will be able to sue developers without proving intent under the bloc's new liability regime.",
        publishedAt: "2025-10-22T14:12:00Z",
        imageUrl: "https://www.politico.eu/cdn/ai-liability-2025.jpg",
        author: "Laura Kayali"
      },
      {
        title: "Tokyo Summit Sets AI Compute Emissions Benchmark",
        url: "https://asia.nikkei.com/Business/Technology/Tokyo-summit-sets-ai-compute-emissions-benchmark",
        source: "Nikkei Asia",
        description: "Japan, South Korea and Singapore agreed to measure greenhouse impact per trillion AI operations, pushing chipmakers toward greener fabs.",
        publishedAt: "2025-10-20T07:00:00Z",
        imageUrl: "https://asia.nikkei.com/ai-summit-2025.jpg",
        author: "Yuki Misaki"
      }
    ]
  },
  {
    keywords: ["climate change", "cop30", "climate summit", "net zero"],
    articles: [
      {
        title: "COP30 Draft Commits G20 to 60% Emissions Cut by 2035",
        url: "https://www.theguardian.com/environment/2025/oct/29/cop30-draft-emissions-cut",
        source: "The Guardian",
        description: "A leaked text from the Belém summit proposes the steepest collective reduction yet, with phased oil and gas exit plans.",
        publishedAt: "2025-10-29T18:40:00Z",
        imageUrl: "https://media.guim.co.uk/cop30-draft.jpg",
        author: "Fiona Harvey"
      },
      {
        title: "Amazon Rainforest Nations Launch Carbon Corridor",
        url: "https://www.bloomberg.com/news/articles/2025-10-26/amazon-nations-carbon-corridor-plan",
        source: "Bloomberg",
        description: "Brazil, Peru and Colombia unveiled a joint carbon credit market tied to deforestation-free supply chains across the Amazon basin.",
        publishedAt: "2025-10-26T11:22:00Z",
        imageUrl: "https://assets.bloomberg.com/amazon-carbon-2025.jpg",
        author: "Mariana Durao"
      },
      {
        title: "US Treasury Floats Climate Stress Tests for Insurers",
        url: "https://www.wsj.com/articles/u-s-treasury-proposes-climate-stress-tests-2025",
        source: "Wall Street Journal",
        description: "Regulators want property insurers to model cascading wildfire and flood losses, citing $140 billion in exposures along the Gulf Coast.",
        publishedAt: "2025-10-24T21:05:00Z",
        imageUrl: "https://images.wsj.net/climate-risk-2025.jpg",
        author: "Amrith Ramkumar"
      },
      {
        title: "Kenya Opens Africa's Largest Green Hydrogen Plant",
        url: "https://www.africa-news.com/climate/kenya-green-hydrogen-plant-2025",
        source: "Africa News",
        description: "The Lamu coastal facility will produce green ammonia for fertiliser exports using wind and solar power from Turkana.",
        publishedAt: "2025-10-22T09:15:00Z",
        imageUrl: "https://cdn.africa-news.com/green-hydrogen-kenya.jpg",
        author: "Faith Odinga"
      },
      {
        title: "China Sets Methane Pricing Pilot Across Three Provinces",
        url: "https://www.scmp.com/economy/china-economy/article/3276349/china-launches-methane-pricing-pilot",
        source: "South China Morning Post",
        description: "Beijing's new policy covers coal seam methane and landfill gas, with penalties for leaks above 0.2 cubic metres per tonne mined.",
        publishedAt: "2025-10-19T04:20:00Z",
        imageUrl: "https://multimedia.scmp.com/methane-pricing-2025.jpg",
        author: "Coco Liu"
      }
    ]
  },
  {
    keywords: ["cryptocurrency", "bitcoin", "digital assets", "crypto regulation"],
    articles: [
      {
        title: "Bitcoin ETF Inflows Hit $4.6B Ahead of Halving",
        url: "https://www.cnbc.com/2025/10/28/bitcoin-etf-inflows-halving.html",
        source: "CNBC",
        description: "Spot bitcoin funds in the US logged their largest monthly inflows yet as traders bet on supply tightening in April.",
        publishedAt: "2025-10-28T13:00:00Z",
        imageUrl: "https://image.cnbcfm.com/bitcoin-halving-floor.jpg",
        author: "Kate Rooney"
      },
      {
        title: "EU Grants MiCA Passports to First Stablecoin Issuers",
        url: "https://www.coindesk.com/policy/2025/10/25/eu-mica-stablecoin-passports/",
        source: "CoinDesk",
        description: "Circle, Société Générale and Santander received the first pan-EU licences, imposing daily attestations and reserve disclosures.",
        publishedAt: "2025-10-25T07:50:00Z",
        imageUrl: "https://www.coindesk.com/resizer/mica-stablecoins.jpg",
        author: "Sandali Handagama"
      },
      {
        title: "Brazil's CBDC Launch Draws 12 Million Wallets in Week One",
        url: "https://www.ft.com/content/digital-real-launch-2025",
        source: "Financial Times",
        description: "Banco Central do Brasil said the Drex platform processed $9.4 billion in instant settlements during its nationwide debut.",
        publishedAt: "2025-10-23T05:40:00Z",
        imageUrl: "https://www.ft.com/imagery/drex-launch.jpg",
        author: "Michael Stott"
      },
      {
        title: "SEC Closes Probe Into Ethereum Foundation",
        url: "https://www.bloomberg.com/news/articles/2025-10-22/sec-closes-ethereum-foundation-investigation",
        source: "Bloomberg",
        description: "Regulators concluded ether sales were not unregistered securities offerings, lifting a two-year cloud over staking providers.",
        publishedAt: "2025-10-22T17:30:00Z",
        imageUrl: "https://assets.bloomberg.com/ethereum-foundation-hq.jpg",
        author: "Olga Kharif"
      },
      {
        title: "Nigeria Taxes Crypto Gains at 5% Under New Finance Bill",
        url: "https://www.premiumtimesng.com/business/crypto-tax-nigeria-2025",
        source: "Premium Times",
        description: "Finance Minister Wale Edun says proceeds will fund broadband rollouts as peer-to-peer volumes hit record highs.",
        publishedAt: "2025-10-19T08:25:00Z",
        imageUrl: "https://media.premiumtimesng.com/nigeria-crypto-tax.jpg",
        author: "Opeyemi Kehinde"
      }
    ]
  },
  {
    keywords: ["space exploration", "mars mission", "lunar", "space economy"],
    articles: [
      {
        title: "NASA and ESA Finalize Crew Roster for 2026 Lunar Gateway",
        url: "https://www.nasa.gov/press-release/nasa-esa-gateway-crew-2025",
        source: "NASA",
        description: "The Artemis IV mission will see the first European astronaut serve as Gateway commander, marking a milestone in transatlantic cooperation.",
        publishedAt: "2025-10-27T15:10:00Z",
        imageUrl: "https://images-assets.nasa.gov/lunar-gateway-crew.jpg",
        author: "Katherine Rohloff"
      },
      {
        title: "ISRO Tests Methane Engine for Mars Sample Return Lander",
        url: "https://www.thehindu.com/sci-tech/isro-methane-engine-test-2025/",
        source: "The Hindu",
        description: "A successful 650-second burn paves the way for India's partnership on a joint Mars caching mission launching in 2028.",
        publishedAt: "2025-10-24T10:05:00Z",
        imageUrl: "https://www.thehindu.com/incoming/isro-methane-engine.jpg",
        author: "T.S. Subramanian"
      },
      {
        title: "SpaceX Starship Delivers 40 Tonnes to Orbital Depot",
        url: "https://www.spacenews.com/spacex-starship-orbital-depot-2025/",
        source: "SpaceNews",
        description: "The tanker flight validated on-orbit cryogenic transfer, a critical step toward fueling crewed missions to Mars.",
        publishedAt: "2025-10-21T22:18:00Z",
        imageUrl: "https://spacenews.com/wp-content/uploads/2025/10/starship-tanker.jpg",
        author: "Jeff Foust"
      },
      {
        title: "Australia Opens Largest Southern Hemisphere Spaceport",
        url: "https://www.abc.net.au/news/2025-10-20/australia-arnhem-spaceport-opens/102981452",
        source: "ABC News Australia",
        description: "The Arnhem site will host reusable launch systems and a rapid emergency satellite deployment service for Asia-Pacific clients.",
        publishedAt: "2025-10-20T06:12:00Z",
        imageUrl: "https://live-production.wcms.abc-cdn.net.au/spaceport-arnhem.jpg",
        author: "Gavin Coote"
      },
      {
        title: "Chinese Private Firm GalaxySpace Lands First Reusable Booster",
        url: "https://www.scmp.com/tech/science-research/article/3276234/galaxyspace-reusable-booster-landing",
        source: "South China Morning Post",
        description: "The Shenzhen-based company aims to challenge SpaceX in the smallsat launch market with 12 flights planned for 2026.",
        publishedAt: "2025-10-18T03:40:00Z",
        imageUrl: "https://multimedia.scmp.com/galaxyspace-landing.jpg",
        author: "Zhinan Zeng"
      }
    ]
  },
  {
    keywords: ["electric vehicles", "ev", "battery", "charging"],
    articles: [
      {
        title: "Tesla Unveils 900-Km Solid-State Battery Model S",
        url: "https://www.theverge.com/2025/10/29/tesla-solid-state-battery-model-s",
        source: "The Verge",
        description: "A new pack using Toyota-Panasonic chemistry will launch in Europe next summer with 10-minute ultra-fast charging capability.",
        publishedAt: "2025-10-29T15:45:00Z",
        imageUrl: "https://cdn.vox-cdn.com/tesla-solid-state.jpg",
        author: "Sean O'Kane"
      },
      {
        title: "California Mandates Bidirectional Chargers in New Homes",
        url: "https://www.latimes.com/business/story/2025-10-26/california-bidirectional-charger-mandate",
        source: "Los Angeles Times",
        description: "Starting 2027, new residential builds must include bidirectional EV chargers able to power homes during grid outages.",
        publishedAt: "2025-10-26T13:25:00Z",
        imageUrl: "https://ca-times.brightspotcdn.com/ev-bidirectional.jpg",
        author: "Russ Mitchell"
      },
      {
        title: "BYD Launches $18,000 Seagull Hatchback in Latin America",
        url: "https://www.reuters.com/business/autos-transportation/byd-seagull-latin-america-2025-10-24/",
        source: "Reuters",
        description: "The compact EV will debut in Brazil and Chile with LFP batteries and a 420-kilometre range under regional testing cycles.",
        publishedAt: "2025-10-24T12:10:00Z",
        imageUrl: "https://static.reuters.com/resources/r/?m=02&d=20251024&i=BYD-seagull",
        author: "Norihiko Shirouzu"
      },
      {
        title: "UK Approves £1 Billion Battery Recycling Hub",
        url: "https://www.ft.com/content/uk-battery-recycling-hub-2025",
        source: "Financial Times",
        description: "The Teesside facility will recover lithium and nickel from 120,000 tonnes of EV packs annually starting in 2027.",
        publishedAt: "2025-10-22T07:55:00Z",
        imageUrl: "https://www.ft.com/imagery/teesside-recycling.jpg",
        author: "Helen Thomas"
      },
      {
        title: "Kenya's Roam Opens East Africa's Largest Charging Corridor",
        url: "https://www.businessdailyafrica.com/bd/corporate/companies/roam-ev-charging-corridor-2025-4763810",
        source: "Business Daily Africa",
        description: "The Nairobi-to-Mombasa route now features 28 solar-powered hubs designed for commercial vans and electric buses.",
        publishedAt: "2025-10-19T09:05:00Z",
        imageUrl: "https://bdafrica.s3.af-south-1.amazonaws.com/roam-charging.jpg",
        author: "Brian Ambani"
      }
    ]
  },
  {
    keywords: ["renewable energy", "solar", "wind", "green hydrogen"],
    articles: [
      {
        title: "Global Solar Installations to Top 500 GW in 2026, Report Finds",
        url: "https://www.iea.org/news/global-solar-forecast-2025",
        source: "International Energy Agency",
        description: "The IEA's latest outlook says cost declines and storage mandates will double annual solar deployments compared with 2023.",
        publishedAt: "2025-10-28T08:00:00Z",
        imageUrl: "https://www.iea.org/site/assets/img/solar-outlook.jpg",
        author: "IEA Renewables Team"
      },
      {
        title: "Vestas Debuts 25 MW Offshore Turbine at Denmark Test Site",
        url: "https://www.windpowermonthly.com/article/1834721/vestas-installs-25mw",
        source: "Windpower Monthly",
        description: "The prototype's 280-metre rotor will be the world's largest, targeting LCOE under €50 per MWh for deepwater projects.",
        publishedAt: "2025-10-25T14:32:00Z",
        imageUrl: "https://windpowermonthly.com/offshore-25mw.jpg",
        author: "Richard Aitken"
      },
      {
        title: "Saudi Arabia Signs $18B Green Hydrogen Deal With South Korea",
        url: "https://www.arabnews.com/node/2528141/business-economy",
        source: "Arab News",
        description: "NEOM's Helios project will supply ammonia to Korean steelmakers via a dedicated shipping corridor beginning in 2028.",
        publishedAt: "2025-10-23T05:10:00Z",
        imageUrl: "https://www.arabnews.com/sites/default/files/neom-hydrogen.jpg",
        author: "Layan Damanhouri"
      },
      {
        title: "US DOE Issues First Loan for Long-Duration Iron-Air Storage",
        url: "https://www.energy.gov/articles/doe-issues-loan-iron-air-storage",
        source: "US Department of Energy",
        description: "Form Energy will build a 500 MW facility in West Virginia that can discharge for 100 hours to backstop renewable-heavy grids.",
        publishedAt: "2025-10-21T18:12:00Z",
        imageUrl: "https://www.energy.gov/sites/default/files/form-energy-storage.jpg",
        author: "Office of Clean Energy Demonstrations"
      },
      {
        title: "Chile Auctions Record-Low Solar Price of $14/MWh",
        url: "https://www.pv-magazine.com/2025/10/19/chile-auctions-record-low-solar-price/",
        source: "PV Magazine",
        description: "A new Desert Sunlight project in Antofagasta will pair solar with molten salt storage to deliver round-the-clock power.",
        publishedAt: "2025-10-19T11:48:00Z",
        imageUrl: "https://img.pv-magazine.com/chile-auction.jpg",
        author: "Jonathan Gifford"
      }
    ]
  },
  {
    keywords: ["cybersecurity", "ransomware", "data breach", "zero trust"],
    articles: [
      {
        title: "Global Ransomware Losses Top $1 Trillion as Attacks Target Infrastructure",
        url: "https://www.wsj.com/articles/global-ransomware-losses-2025",
        source: "Wall Street Journal",
        description: "A new Chainalysis report shows energy grids and hospital networks account for 42% of ransom revenues this year.",
        publishedAt: "2025-10-28T10:00:00Z",
        imageUrl: "https://images.wsj.net/cyber-grid-attack.jpg",
        author: "Catherine Stupp"
      },
      {
        title: "Microsoft Warns of Midnight Blizzard's Supply-Chain Compromise",
        url: "https://www.microsoft.com/en-us/security/blog/2025/10/26/midnight-blizzard-supply-chain-compromise/",
        source: "Microsoft Security Blog",
        description: "The Russian state-backed group trojanised firmware updates for industrial controllers used in water treatment plants worldwide.",
        publishedAt: "2025-10-26T17:30:00Z",
        imageUrl: "https://cloudblogs.microsoft.com/security/wp-content/uploads/sites/92/2025/10/midnight-blizzard.jpg",
        author: "Vasu Jakkal"
      },
      {
        title: "India Mandates 6-Hour Breach Disclosure for Critical Sectors",
        url: "https://economictimes.indiatimes.com/tech/information-tech/india-six-hour-breach-disclosure-2025/articleshow/105041234.cms",
        source: "Economic Times",
        description: "CERT-In's updated directive covers telecom, finance and healthcare, with penalties up to ₹5 crore for late reporting.",
        publishedAt: "2025-10-24T09:12:00Z",
        imageUrl: "https://img.etimg.com/cybersecurity-india-2025.jpg",
        author: "Surabhi Agarwal"
      },
      {
        title: "NIST Releases Post-Quantum TLS Guidelines",
        url: "https://www.nist.gov/news-events/news/2025/10/nist-releases-post-quantum-tls-guidelines",
        source: "NIST",
        description: "The US standards agency recommends hybrid key exchange using Kyber alongside classical algorithms for federal agencies by 2026.",
        publishedAt: "2025-10-21T13:05:00Z",
        imageUrl: "https://www.nist.gov/sites/default/files/post-quantum-tls.jpg",
        author: "NIST Cybersecurity Center"
      },
      {
        title: "Singapore Launches Bug-Bounty-as-a-Service Platform",
        url: "https://www.straitstimes.com/singapore/singapore-launches-bbsp",
        source: "The Straits Times",
        description: "GovTech's new marketplace lets small businesses commission white-hat hackers on fixed-price engagements.",
        publishedAt: "2025-10-19T05:45:00Z",
        imageUrl: "https://static.straitstimes.com.sg/cyber-hub.jpg",
        author: "Hariz Baharudin"
      }
    ]
  },
  {
    keywords: ["quantum computing", "quantum", "qpu"],
    articles: [
      {
        title: "IBM Unveils 2,048-Qubit Quantum System With Error Mitigation Stack",
        url: "https://www.ibm.com/blog/quantum-system-2080",
        source: "IBM Research Blog",
        description: "The Kookaburra architecture combines chip-level redundancy with dynamic decoders, enabling chemistry workloads once deemed infeasible.",
        publishedAt: "2025-10-27T12:00:00Z",
        imageUrl: "https://research.ibm.com/blog/quantum-2048.jpg",
        author: "Jay Gambetta"
      },
      {
        title: "Oxford Researchers Demonstrate Quantum Memory With 12-Hour Coherence",
        url: "https://www.nature.com/articles/quantum-memory-oxford-2025",
        source: "Nature",
        description: "A rare-earth doped crystal maintained quantum states overnight, pointing to practical quantum repeaters for intercity networks.",
        publishedAt: "2025-10-25T15:10:00Z",
        imageUrl: "https://media.nature.com/quantum-memory.jpg",
        author: "Emily White"
      },
      {
        title: "Japan's RIKEN Spins Out Quantum Cloud Service",
        url: "https://www.japantimes.co.jp/business/2025/10/24/japan-riken-quantum-cloud/",
        source: "The Japan Times",
        description: "The new venture will commercialise superconducting processors for automotive and pharma clients across Asia.",
        publishedAt: "2025-10-24T04:20:00Z",
        imageUrl: "https://www.japantimes.co.jp/wp-content/uploads/2025/10/riken-quantum.jpg",
        author: "Satoshi Sugiyama"
      },
      {
        title: "Google Claims Quantum Advantage in Logistics Benchmark",
        url: "https://www.theinformation.com/articles/google-claims-quantum-advantage-logistics",
        source: "The Information",
        description: "The Sycamore 3 processor solved a vehicle routing problem with 512 nodes 30x faster than classical heuristics.",
        publishedAt: "2025-10-21T18:40:00Z",
        imageUrl: "https://static.theinformation.com/google-quantum-logistics.jpg",
        author: "Arielle Pardes"
      },
      {
        title: "Australia Allocates $900M to Quantum Workforce Grants",
        url: "https://www.afr.com/technology/australia-allocates-900m-quantum-workforce-20251019-p5be2n",
        source: "Australian Financial Review",
        description: "The funding will support 25 research hubs and a national apprenticeship track for quantum hardware technicians.",
        publishedAt: "2025-10-19T06:25:00Z",
        imageUrl: "https://static.ffx.io/images/quantum-hub-australia.jpg",
        author: "Yolanda Redrup"
      }
    ]
  },
  {
    keywords: ["mental health", "wellbeing", "psychology"],
    articles: [
      {
        title: "WHO Updates Mental Health Action Plan With Youth Targets",
        url: "https://www.who.int/news-room/detail/2025-10-28-mental-health-action-plan",
        source: "World Health Organization",
        description: "Member states agreed to halve untreated adolescent depression by 2030 through school-based screening and telehealth.",
        publishedAt: "2025-10-28T10:30:00Z",
        imageUrl: "https://www.who.int/images/mental-health-summit.jpg",
        author: "WHO Mental Health Unit"
      },
      {
        title: "UK's NHS Expands 24/7 Crisis Lines Amid Rising Demand",
        url: "https://www.bbc.com/news/health-67294513",
        source: "BBC News",
        description: "The service handled 1.2 million contacts last year; new funding will add 500 clinical responders and regional hubs.",
        publishedAt: "2025-10-26T08:15:00Z",
        imageUrl: "https://ichef.bbci.co.uk/news/976/cpsprodpb/nhs-mental-health.jpg",
        author: "Nick Triggle"
      },
      {
        title: "US Employers Add Psychedelic Therapy to Health Plans",
        url: "https://www.wsj.com/articles/employers-psychedelic-therapy-coverage-2025",
        source: "Wall Street Journal",
        description: "Companies are partnering with FDA-cleared clinics to cover MDMA-assisted therapy for PTSD and treatment-resistant depression.",
        publishedAt: "2025-10-24T14:22:00Z",
        imageUrl: "https://images.wsj.net/psychedelic-therapy.jpg",
        author: "Sarah Krouse"
      },
      {
        title: "India's Tele-Manas Network Crosses 10 Million Consultations",
        url: "https://indianexpress.com/article/india/tele-manas-consultations-2025-9102248/",
        source: "The Indian Express",
        description: "The free helpline now operates in 25 Indian languages with a dedicated app for rural outreach.",
        publishedAt: "2025-10-22T05:55:00Z",
        imageUrl: "https://images.indianexpress.com/tele-manas.jpg",
        author: "Sushmita Pathak"
      },
      {
        title: "Australia Pilots Mental Health Days for University Students",
        url: "https://www.smh.com.au/national/nsw/universities-trial-mental-health-days-2025-102981540.html",
        source: "Sydney Morning Herald",
        description: "Students at UNSW can now take three wellness days per semester without medical certificates under a new wellbeing policy.",
        publishedAt: "2025-10-19T03:35:00Z",
        imageUrl: "https://static.ffx.io/images/student-wellbeing.jpg",
        author: "Jordan Baker"
      }
    ]
  },
  {
    keywords: ["healthcare innovation", "digital health", "medtech"],
    articles: [
      {
        title: "FDA Clears First AI Copilot for Robotic Surgery",
        url: "https://www.statnews.com/2025/10/28/fda-clears-ai-surgery-copilot/",
        source: "STAT News",
        description: "Intuitive Surgical's Iris system can auto-suture and highlight critical anatomy during minimally invasive procedures.",
        publishedAt: "2025-10-28T12:40:00Z",
        imageUrl: "https://www.statnews.com/wp-content/uploads/2025/10/iris-ai-surgery.jpg",
        author: "Katie Palmer"
      },
      {
        title: "Germany Launches National Digital Twin for Hospitals",
        url: "https://www.handelsblatt.com/technik/forschung-entwicklung/deutschland-digitaler-krankenhauszwilling/","source": "Handelsblatt","description": "The platform models patient flow and energy usage across 320 hospitals to optimise staffing and ICU capacity.","publishedAt": "2025-10-26T07:20:00Z","imageUrl": "https://www.handelsblatt.com/images/hospital-digital-twin.jpg","author": "Katharina Kort"},
      {"title": "Kenya Tests Drone Delivery of Blood and Chemotherapy Drugs", "url": "https://www.nation.africa/kenya/health/kenya-tests-drone-delivery-2025-4763854", "source": "Daily Nation", "description": "Zipline's expanded corridor will serve 12 county hospitals, cutting delivery times from four hours to twenty minutes.", "publishedAt": "2025-10-24T06:05:00Z", "imageUrl": "https://nation.africa/resource/img/drone-healthcare.jpg", "author": "Angela Okoth"},
      {"title": "Singapore Approves At-Home Cancer Screening Patch", "url": "https://www.channelnewsasia.com/singapore/healthtech-cancer-screening-patch-2025-4049821", "source": "Channel NewsAsia", "description": "The wearable sensors analyse sweat biomarkers for early detection of colorectal cancer, with results synced to clinicians.", "publishedAt": "2025-10-22T02:42:00Z", "imageUrl": "https://onecms-res.cloudinary.com/patch-healthtech.jpg", "author": "Cheryl Lin"},
      {"title": "Brazil's SUS Adds AI Triage in 1,200 Primary Clinics", "url": "https://g1.globo.com/saude/noticia/2025/10/20/sus-triagem-ia-clinicas.ghtml", "source": "G1", "description": "The chatbot screens symptoms in Portuguese and indigenous languages, reducing wait times by 37%, according to the health ministry.", "publishedAt": "2025-10-20T11:18:00Z", "imageUrl": "https://s2.glbimg.com/ai-triage.jpg", "author": "Ana Paula Ribeiro"}
    ]
  },
  {
    keywords: ["remote work", "hybrid work", "future of work"],
    articles: [
      {"title": "Google Extends Global Hybrid Policy With 3 Days Mandatory Onsite", "url": "https://www.cnn.com/2025/10/27/tech/google-hybrid-policy-update/index.html", "source": "CNN Business", "description": "Employees must badge in three days per week but can relocate to any approved region within their country, the company said.", "publishedAt": "2025-10-27T15:05:00Z", "imageUrl": "https://cdn.cnn.com/google-hybrid.jpg", "author": "Samantha Kelly"},
      {"title": "WeWork Successor Orbit Spaces Files for NYSE Listing", "url": "https://www.wsj.com/articles/orbit-spaces-ipo-remote-work-2025", "source": "Wall Street Journal", "description": "The flexible office operator posted $2.1 billion in revenue as firms book smaller hubs combined with remote stipends.", "publishedAt": "2025-10-25T12:18:00Z", "imageUrl": "https://images.wsj.net/orbit-spaces.jpg", "author": "Konrad Putzier"},
      {"title": "Philippines Approves Digital Nomad Visa Allowing 3-Year Stay", "url": "https://www.philstar.com/business/2025/10/23/remote-worker-visa-philippines", "source": "Philippine Star", "description": "Remote professionals earning at least $45,000 annually may live and work in the country with streamlined tax rules.", "publishedAt": "2025-10-23T06:30:00Z", "imageUrl": "https://media.philstar.com/digital-nomad-ph.jpg", "author": "Louella Desiderio"},
      {"title": "Slack Adds AI Meeting Companion for Async Teams", "url": "https://www.theverge.com/2025/10/21/slack-ai-meeting-companion", "source": "The Verge", "description": "The tool summarises huddles, assigns action items and generates follow-up questions for teammates across time zones.", "publishedAt": "2025-10-21T14:40:00Z", "imageUrl": "https://cdn.vox-cdn.com/slack-ai-companion.jpg", "author": "Ashley Carman"},
      {"title": "Sweden Grants Right to Disconnect Outside Flex Hours", "url": "https://www.thelocal.se/20251019/sweden-right-to-disconnect-law/", "source": "The Local", "description": "The new law requires firms with hybrid policies to define communication-free windows, enforceable by labour inspectors.", "publishedAt": "2025-10-19T09:00:00Z", "imageUrl": "https://www.thelocal.se/wp-content/uploads/right-to-disconnect.jpg", "author": "Catherine Edwards"}
    ]
  },
  {
    keywords: ["social media regulation", "online safety", "platform accountability"],
    articles: [
      {"title": "US Senate Advances Kids Online Safety Act With New Amendments", "url": "https://www.nytimes.com/2025/10/28/technology/kosa-amendments.html", "source": "New York Times", "description": "The bipartisan bill now requires independent audits of recommendation algorithms for minors and stronger parental tools.", "publishedAt": "2025-10-28T19:10:00Z", "imageUrl": "https://static01.nyt.com/images/kosa-2025.jpg", "author": "Cecilia Kang"},
      {"title": "EU Slaps €2.4B Fine on Meta for Failing to Remove Deepfakes", "url": "https://www.euractiv.com/section/digital/news/eu-fines-meta-deepfakes-2025/", "source": "Euractiv", "description": "Commissioners said Meta missed DSA deadlines to take down election deepfakes within one hour despite prior warnings.", "publishedAt": "2025-10-25T07:55:00Z", "imageUrl": "https://www.euractiv.com/wp-content/uploads/meta-fine-2025.jpg", "author": "Samuel Stolton"},
      {"title": "Australia Expands Misinformation Code to Encrypted Apps", "url": "https://www.abc.net.au/news/2025-10-23/australia-misinformation-code-encrypted-apps/102985014", "source": "ABC News Australia", "description": "Platforms like WhatsApp must label virally forwarded messages and share anonymised metadata with regulators.", "publishedAt": "2025-10-23T03:35:00Z", "imageUrl": "https://live-production.wcms.abc-cdn.net.au/misinformation-code.jpg", "author": "Michael Vincent"},
      {"title": "Brazil Orders X to Restore Suspended Journalists", "url": "https://www1.folha.uol.com.br/internacional/en/world/2025/10/brazil-orders-x-to-restore-suspended-journalists.shtml", "source": "Folha de S.Paulo", "description": "A federal judge gave the platform 24 hours to reinstate investigative reporters or face a daily fine of 500,000 reais.", "publishedAt": "2025-10-21T01:45:00Z", "imageUrl": "https://f.i.uol.com.br/social-media-ruling.jpg", "author": "Anna Virginia Balloussier"},
      {"title": "Kenya Drafts Influencer Income Disclosure Rules", "url": "https://www.businessdailyafrica.com/bd/economy/kenya-influencer-regulation-2025-4763838", "source": "Business Daily Africa", "description": "Creators with over 100,000 followers must register advertising contracts and pay a 7% levy under new proposals.", "publishedAt": "2025-10-19T08:18:00Z", "imageUrl": "https://bdafrica.s3.af-south-1.amazonaws.com/influencer-regulation.jpg", "author": "Stella Cherono"}
    ]
  },
  {
    keywords: ["education technology", "edtech", "digital learning"],
    articles: [
      {"title": "Coursera Launches GenAI Mentor Across 5,000 Courses", "url": "https://www.edtechmagazine.com/k12/article/2025/10/coursera-genai-mentor-launch", "source": "EdTech Magazine", "description": "The mentor offers personalised quizzes and explains complex topics using real-time transcripts from instructors.", "publishedAt": "2025-10-28T07:45:00Z", "imageUrl": "https://media.edtechmagazine.com/coursera-genai.jpg", "author": "Ryan Johnston"},
      {"title": "Delhi Government Expands Virtual Labs to 2,000 Schools", "url": "https://www.hindustantimes.com/education/news/delhi-virtual-labs-expansion-2025-101698132318887.html", "source": "Hindustan Times", "description": "Students can conduct physics and chemistry experiments through AR modules aligned with India's new curriculum framework.", "publishedAt": "2025-10-26T05:20:00Z", "imageUrl": "https://images.hindustantimes.com/virtual-labs.jpg", "author": "Sritama Datta"},
      {"title": "UNESCO Issues Guidelines on Ethical EdTech Procurement", "url": "https://www.unesco.org/en/articles/unesco-guidelines-ethical-edtech-2025", "source": "UNESCO", "description": "The framework urges governments to vet learning platforms for privacy, accessibility and evidence-backed outcomes.", "publishedAt": "2025-10-24T09:30:00Z", "imageUrl": "https://www.unesco.org/sites/default/files/edtech-guidelines.jpg", "author": "UNESCO Education Sector"},
      {"title": "Mexico Pilots AI Teaching Assistants in Rural Classrooms", "url": "https://mexiconewsdaily.com/education/mexico-ai-teaching-assistants-pilot/", "source": "Mexico News Daily", "description": "Tablets preloaded with Spanish and indigenous language lessons help address teacher shortages in Oaxaca and Chiapas.", "publishedAt": "2025-10-22T13:05:00Z", "imageUrl": "https://mexiconewsdaily.com/wp-content/uploads/ai-teaching-assistant.jpg", "author": "Joseph Sorrentino"},
      {"title": "UK Universities Adopt Skills Passport for Lifelong Learning", "url": "https://www.timeshighereducation.com/news/uk-skills-passport-universities-2025", "source": "Times Higher Education", "description": "The blockchain-based passport lets learners stack micro-credentials from different institutions into degree pathways.", "publishedAt": "2025-10-19T10:10:00Z", "imageUrl": "https://www.timeshighereducation.com/sites/default/files/skills-passport.jpg", "author": "Anna McKie"}
    ]
  },
  {
    keywords: ["food security", "agritech", "supply chains"],
    articles: [
      {"title": "Global Rice Prices Ease After Vietnam Lifts Export Caps", "url": "https://www.aljazeera.com/economy/2025/10/27/vietnam-lifts-rice-export-caps", "source": "Al Jazeera", "description": "The Ho Chi Minh government will resume premium jasmine shipments after bumper harvests, stabilising Southeast Asian markets.", "publishedAt": "2025-10-27T07:12:00Z", "imageUrl": "https://www.aljazeera.com/wp-content/uploads/2025/10/rice-harvest-vietnam.jpg", "author": "Kate Mayberry"},
      {"title": "Bill & Melinda Gates Foundation Funds Climate-Smart Maize", "url": "https://www.devex.com/news/gates-foundation-climate-smart-maize-2025-107812", "source": "Devex", "description": "A $420 million grant backs seed varieties that resist both drought and flooding across sub-Saharan Africa.", "publishedAt": "2025-10-24T11:40:00Z", "imageUrl": "https://assets.devex.com/maize-climate-smart.jpg", "author": "Sara Jerving"},
      {"title": "USDA Approves Lab-Grown Chicken for Retail Sale", "url": "https://www.usda.gov/media/press-releases/2025/10/22/usda-approves-cultivated-chicken", "source": "US Department of Agriculture", "description": "Good Meat will sell cultivated chicken in select supermarkets with clear labelling and QR code traceability.", "publishedAt": "2025-10-22T14:00:00Z", "imageUrl": "https://www.usda.gov/sites/default/files/cultivated-chicken.jpg", "author": "USDA Food Safety Team"},
      {"title": "Kenya, Ethiopia Launch Cross-Border Grain Reserves", "url": "https://www.standardmedia.co.ke/business/article/2001499760/kenya-ethiopia-grain-reserve", "source": "The Standard",
        "description": "The Eastern Africa Grain Council will manage 1.5 million tonnes of maize and sorghum to buffer against climate shocks.",
        "publishedAt": "2025-10-20T05:55:00Z",
        "imageUrl": "https://www.standardmedia.co.ke/images/grain-reserve.jpg",
        "author": "Paul Wafula"},
      {"title": "Netherlands Tests Autonomous Vertical Farms in Urban Basements", "url": "https://www.dutchnews.nl/news/2025/10/netherlands-autonomous-vertical-farms/", "source": "DutchNews", "description": "Robotic systems in Rotterdam basements grow leafy greens with 95% less water for nearby supermarkets.", "publishedAt": "2025-10-19T08:10:00Z", "imageUrl": "https://www.dutchnews.nl/wp-content/uploads/vertical-farm.jpg", "author": "James Crisp"}
    ]
  },
  {
    keywords: ["sustainable fashion", "circular fashion", "textile recycling"],
    articles: [
      {"title": "Paris Fashion Pact Sets Mandatory Recommerce Targets", "url": "https://www.voguebusiness.com/sustainability/paris-fashion-pact-recommerce-targets-2025", "source": "Vogue Business", "description": "Luxury brands must derive 20% of revenue from resale or rental by 2030 under the renewed Fashion Pact commitments.", "publishedAt": "2025-10-28T09:55:00Z", "imageUrl": "https://media.voguebusiness.com/photos/fashion-pact-2025.jpg", "author": "Rachel Cernansky"},
      {"title": "H&M Opens Polyester Regeneration Plant in Vietnam", "url": "https://www.businessoffashion.com/articles/sustainability/hm-polyester-recycling-plant-vietnam-2025/", "source": "Business of Fashion", "description": "The facility will process 60,000 tonnes of textile waste annually into fibre suitable for new garments.", "publishedAt": "2025-10-25T06:40:00Z", "imageUrl": "https://img.businessoffashion.com/polyester-recycling.jpg", "author": "Sarah Kent"},
      {"title": "EPR Laws Spread as California Passes Fashion Act", "url": "https://www.latimes.com/environment/story/2025-10-23/california-fashion-act", "source": "Los Angeles Times", "description": "Brands selling in the state must disclose supply chain emissions and fund recycling programmes starting in 2028.", "publishedAt": "2025-10-23T14:22:00Z", "imageUrl": "https://ca-times.brightspotcdn.com/fashion-act.jpg", "author": "Susanne Rust"},
      {"title": "Bangladesh Launches Fair Wage Digital Ledger for Garment Workers", "url": "https://www.bdnews24.com/business/2025/10/21/bangladesh-fair-wage-ledger", "source": "bdnews24", "description": "A blockchain payroll system piloted in Dhaka ensures overtime pay and social security contributions are transparent.", "publishedAt": "2025-10-21T05:18:00Z", "imageUrl": "https://d30fl32nd2baj9.cloudfront.net/fair-wage-ledger.jpg", "author": "Ayesha Rahman"},
      {"title": "Zara Trials Mushroom-Based Leather in Flagship Stores", "url": "https://www.reuters.com/business/retail-consumer/zara-mushroom-leather-2025-10-19/", "source": "Reuters", "description": "Inditex partnered with Bolt Threads to release limited mycelium handbags with a 70% lower carbon footprint.", "publishedAt": "2025-10-19T07:05:00Z", "imageUrl": "https://static.reuters.com/resources/r/?m=02&d=20251019&i=mushroom-leather", "author": "Jessica DiNapoli"}
    ]
  }
];
