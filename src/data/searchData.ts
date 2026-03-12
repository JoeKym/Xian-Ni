export interface SearchResult {
  title: string;
  category: string;
  description: string;
  path: string;
}

export const searchableData: SearchResult[] = [
  // Characters
  { title: "Wang Lin", category: "Character", description: "The central protagonist who rises from mortal to transcendent being", path: "/characters" },
  { title: "Tu Si", category: "Character", description: "Supreme being of the Ancient God lineage", path: "/characters" },
  { title: "Tou Sen", category: "Character", description: "Legendary Ancient Demon with god-origin hybrid essence", path: "/characters" },
  { title: "Ta Jia", category: "Character", description: "Master of the Ancient Devil ways", path: "/characters" },
  { title: "All-Seer", category: "Character", description: "Mysterious transcendent oracle with fate vision", path: "/characters" },
  { title: "Li Muwan", category: "Character", description: "Wang Lin's most important emotional anchor", path: "/characters" },
  { title: "Mu Bingmei", category: "Character", description: "Cold, prideful, and powerfully skilled cultivator", path: "/characters" },
  { title: "Situ Nan", category: "Character", description: "Chaotic mentor and rogue cultivator", path: "/characters" },
  { title: "Qing Shui", category: "Character", description: "Tragic powerhouse with heavy karmic weight", path: "/characters" },
  { title: "Su Ming", category: "Character", description: "Cross-novel essential for multiverse connections", path: "/characters" },

  // Daos
  { title: "Dao of the Underworld", category: "Dao", description: "Wang Lin's first forged Dao — born from desperation", path: "/daos" },
  { title: "Dao of Slaughter", category: "Dao", description: "Absolute offensive power forged through countless battles", path: "/daos" },
  { title: "Dao of Life/Death", category: "Dao", description: "Mastery over the cycle of life and death", path: "/daos" },
  { title: "Dao of Karma", category: "Dao", description: "Manipulation of cause and effect across lifetimes", path: "/daos" },
  { title: "Dao of True/False", category: "Dao", description: "Distinguishing reality from illusion", path: "/daos" },
  { title: "Dao of Space/Time", category: "Dao", description: "Control over the fundamental fabric of existence", path: "/daos" },

  // Cultivation
  { title: "Qi Condensation", category: "Cultivation", description: "Early cultivation stage", path: "/cultivation" },
  { title: "Foundation Establishment", category: "Cultivation", description: "Building the cultivation foundation", path: "/cultivation" },
  { title: "Core Formation", category: "Cultivation", description: "Forming the golden core", path: "/cultivation" },
  { title: "Nascent Soul", category: "Cultivation", description: "Birth of the nascent soul", path: "/cultivation" },
  { title: "Spirit Severing", category: "Cultivation", description: "Severing worldly ties for power", path: "/cultivation" },
  { title: "Transcendence", category: "Cultivation", description: "The ultimate cultivation goal", path: "/cultivation" },

  // Lore
  { title: "Ancient Gods", category: "Lore", description: "Primordial race embodying order and creation", path: "/lore" },
  { title: "Ancient Demons", category: "Lore", description: "Chaotic beings respecting strength above all", path: "/lore" },
  { title: "Ancient Devils", category: "Lore", description: "Most destructive of the ancient races", path: "/lore" },
  { title: "Heaven", category: "Lore", description: "Cosmic law governing all existence", path: "/lore" },
  { title: "Tribulation", category: "Lore", description: "Heavenly test during cultivation breakthroughs", path: "/lore" },

  // Multiverse
  { title: "I Shall Seal the Heavens", category: "Multiverse", description: "Connected universe with Meng Hao", path: "/multiverse" },
  { title: "A Will Eternal", category: "Multiverse", description: "Connected universe in Er Gen's multiverse", path: "/multiverse" },
  { title: "The God", category: "Multiverse", description: "Cosmic entity — 'The God's real name is Wang Lin'", path: "/multiverse" },

  // Timeline
  { title: "The Mortal's Beginning", category: "Timeline", description: "Arc 1 — Wang Lin rises from a powerless mortal", path: "/timeline" },
  { title: "Heaven-Defying Ascension", category: "Timeline", description: "Arc 5 — Mastery of True/False and Space/Time Daos", path: "/timeline" },
  { title: "Transcendent Legends", category: "Timeline", description: "Arc 9 — Wang Lin reshapes multiple universes", path: "/timeline" },

  // Donghua
  { title: "Donghua Adaptation", category: "Donghua", description: "Chinese anime series — Episode 129 and counting", path: "/donghua" },

  // Artifacts & Techniques
  { title: "Heaven Rending Sword", category: "Artifact", description: "Ancient weapon capable of slicing through dimensions", path: "/artifacts" },
  { title: "Soul Flag", category: "Artifact", description: "Wang Lin's soul-binding treasure for capturing spirits", path: "/artifacts" },
  { title: "Ancient God Leather Armor", category: "Artifact", description: "Armor forged from Ancient God remains", path: "/artifacts" },
  { title: "Restriction Flag", category: "Artifact", description: "Array-type treasure for sealing and binding", path: "/artifacts" },
  { title: "God Slaying Spear", category: "Artifact", description: "Legendary weapon forged to kill Ancient Gods", path: "/artifacts" },
  { title: "Call the Wind", category: "Technique", description: "One of Wang Lin's early signature techniques", path: "/artifacts" },
  { title: "Finger of Death", category: "Technique", description: "Underworld Dao-derived killing technique", path: "/artifacts" },
  { title: "Life & Death Domain", category: "Technique", description: "Domain technique from Life/Death Dao mastery", path: "/artifacts" },
  { title: "Karmic Severance", category: "Technique", description: "Cuts karmic ties to weaken enemies", path: "/artifacts" },
  { title: "Stop", category: "Technique", description: "Wang Lin's time-stopping space/time technique", path: "/artifacts" },

  // Locations
  { title: "Planet Suzaku", category: "Location", description: "Wang Lin's home planet and starting point", path: "/locations" },
  { title: "Heng Yue Sect", category: "Location", description: "Wang Lin's first sect and cultivation home", path: "/locations" },
  { title: "Suzaku Star", category: "Location", description: "Major cultivation world in the Suzaku system", path: "/locations" },
  { title: "Outer Realm", category: "Location", description: "Vast space beyond the mortal cultivation planets", path: "/locations" },
  { title: "Ancient God Territory", category: "Location", description: "The ancestral domain of the Ancient Gods", path: "/locations" },
  { title: "Celestial Realm", category: "Location", description: "Higher plane where transcendent beings reside", path: "/locations" },
  { title: "Allheaven", category: "Location", description: "The supreme realm governing all heavens", path: "/locations" },

  // Guide
  { title: "Beginner Guide", category: "Guide", description: "Start here — introduction to Renegade Immortal", path: "/guide" },
  { title: "Reading Order", category: "Guide", description: "Recommended order for Er Gen's novels", path: "/guide" },
  { title: "Watching Order", category: "Guide", description: "Donghua episode guide and season breakdown", path: "/guide" },
];
