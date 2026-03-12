import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Search, Sword, Wand2 } from "lucide-react";

interface ArtifactItem {
  name: string;
  type: "artifact" | "technique";
  origin: string;
  owner: string;
  power: string;
  firstAppearance: string;
  storyArc: string;
  dao?: string;
}

const items: ArtifactItem[] = [
  // Artifacts
  { name: "Heaven Rending Sword", type: "artifact", origin: "Ancient battlefield", owner: "Wang Lin", power: "Capable of slicing through spatial barriers and dimensional rifts", firstAppearance: "Mid arcs", storyArc: "Outer Realm Exploration" },
  { name: "Soul Flag", type: "artifact", origin: "Underworld Dao refinement", owner: "Wang Lin", power: "Captures and binds souls, can command an army of spirits", firstAppearance: "Early arcs", storyArc: "Foundation Stage", dao: "Underworld" },
  { name: "Ancient God Leather Armor", type: "artifact", origin: "Ancient God remains", owner: "Wang Lin", power: "Provides immense physical defense, enhances Ancient God body", firstAppearance: "Ancient God arc", storyArc: "Ancient God Integration" },
  { name: "Restriction Flag", type: "artifact", origin: "Wang Lin's creation", owner: "Wang Lin", power: "Deploys sealing arrays and binding formations", firstAppearance: "Early arcs", storyArc: "Foundation Stage" },
  { name: "God Slaying Spear", type: "artifact", origin: "Forged by ancient beings", owner: "Various", power: "Legendary weapon designed to kill Ancient God-level beings", firstAppearance: "Late arcs", storyArc: "Ancient Race conflicts" },
  { name: "Celestial Sword", type: "artifact", origin: "Celestial Realm", owner: "Various sect leaders", power: "Standard high-level cultivator weapon with celestial energy", firstAppearance: "Various", storyArc: "Multiple arcs" },
  { name: "Mosquito Beast", type: "artifact", origin: "Ancient creature", owner: "Wang Lin", power: "Soul-devouring beast companion, grows stronger over time", firstAppearance: "Early arcs", storyArc: "Foundation Stage" },

  // Techniques
  { name: "Call the Wind", type: "technique", origin: "Early cultivation", owner: "Wang Lin", power: "Summons destructive wind blades; one of Wang Lin's signature early moves", firstAppearance: "Chapter 1-50", storyArc: "Early cultivation", dao: "None (basic)" },
  { name: "Finger of Death", type: "technique", origin: "Underworld Dao", owner: "Wang Lin", power: "Channels death energy into a single devastating finger strike", firstAppearance: "Mid arcs", storyArc: "Underworld Dao Mastery", dao: "Underworld" },
  { name: "Life & Death Domain", type: "technique", origin: "Life/Death Dao mastery", owner: "Wang Lin", power: "Creates a domain where Wang Lin controls life and death of all within", firstAppearance: "Soul Formation arc", storyArc: "Life/Death Dao", dao: "Life/Death" },
  { name: "Karmic Severance", type: "technique", origin: "Karma Dao", owner: "Wang Lin", power: "Severs karmic ties between beings, weakening their fate connections", firstAppearance: "Late mid arcs", storyArc: "Karma Dao Mastery", dao: "Karma" },
  { name: "Stop", type: "technique", origin: "Space/Time Dao", owner: "Wang Lin", power: "Freezes time in a localized area; devastating when combined with other Daos", firstAppearance: "Transcendent arc", storyArc: "Space/Time Dao", dao: "Space/Time" },
  { name: "True/False Reversal", type: "technique", origin: "True/False Dao", owner: "Wang Lin", power: "Makes illusions real and reality into illusion", firstAppearance: "Divine Transformation arc", storyArc: "True/False Dao", dao: "True/False" },
  { name: "Slaughter Domain", type: "technique", origin: "Slaughter Dao", owner: "Wang Lin", power: "Fills an area with killing intent, amplifying attack power dramatically", firstAppearance: "Core Formation arc", storyArc: "Slaughter Dao Mastery", dao: "Slaughter" },
  { name: "Ancient God Punch", type: "technique", origin: "Ancient God inheritance", owner: "Wang Lin", power: "Physical attack infused with Ancient God body power", firstAppearance: "Ancient God arc", storyArc: "Ancient God Integration" },
];

const types = ["All", "artifact", "technique"];
const typeLabels: Record<string, string> = { All: "All Items", artifact: "Artifacts", technique: "Techniques" };

const ArtifactsPage = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.power.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || item.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  return (
    <Layout>
      <PageHero title="Artifacts & Techniques" subtitle="The legendary weapons, treasures, and cultivation techniques of Renegade Immortal" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Filters */}
          <div className="gradient-card border border-border rounded-lg p-6 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Search size={18} className="text-primary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search artifacts and techniques..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-lg border-b border-border pb-1 focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-1.5 rounded text-xs font-body transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className={`gradient-card border rounded-lg p-6 hover:border-primary/30 transition-all duration-300 ${
                  item.type === "artifact" ? "border-crimson/20 border-l-2 border-l-crimson/40" : "border-jade/20 border-l-2 border-l-jade/40"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {item.type === "artifact" ? (
                    <Sword size={16} className="text-crimson mt-0.5 shrink-0" />
                  ) : (
                    <Wand2 size={16} className="text-jade mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-heading text-lg text-primary tracking-wider">{item.name}</h3>
                    <p className="text-xs text-muted-foreground font-body capitalize">{item.type} • {item.owner}</p>
                  </div>
                </div>
                <p className="text-foreground/80 font-body text-sm leading-relaxed mb-4">{item.power}</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-body">
                  <div>
                    <span className="text-muted-foreground">Origin:</span>
                    <p className="text-foreground/70">{item.origin}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Story Arc:</span>
                    <p className="text-foreground/70">{item.storyArc}</p>
                  </div>
                </div>
                {item.dao && (
                  <div className="mt-3">
                    <Link to="/daos" className="text-xs font-body px-2 py-0.5 rounded border border-primary/20 text-primary/80 hover:bg-primary/10 transition-colors">
                      {item.dao} Dao
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12 font-body">No items match your search</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ArtifactsPage;
