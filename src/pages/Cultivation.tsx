import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";

const realms = [
  { name: "Mortal Stage", level: 0, desc: "A being with no cultivation ability. The starting point of all cultivators.", abilities: "None", power: 0 },
  { name: "Qi Condensation", level: 1, desc: "The cultivator begins to absorb and refine spiritual energy from the environment.", abilities: "Basic spiritual energy manipulation, minor physical enhancement", power: 5 },
  { name: "Foundation Establishment", level: 2, desc: "Building the foundation of cultivation. A critical stage that determines future potential.", abilities: "Spirit vessel creation, basic spell usage, enhanced longevity", power: 10 },
  { name: "Core Formation", level: 3, desc: "Forming the golden core, a crucial cultivation milestone. Many cultivators never pass this stage.", abilities: "Golden core powers, flight, intermediate spells, extended lifespan", power: 20 },
  { name: "Nascent Soul", level: 4, desc: "Birth of the nascent soul — the cultivator's spirit can now exist independently of the body.", abilities: "Soul separation, advanced spells, near-immortal lifespan", power: 30 },
  { name: "Soul Formation", level: 5, desc: "The soul reaches maturity and power. Cultivators at this stage are extremely rare and powerful.", abilities: "Soul domain, cosmic perception, extended dimensional awareness", power: 40 },
  { name: "Spirit Severing", level: 6, desc: "Severing worldly ties and attachments to transcend mortal limitations. A painful but necessary step.", abilities: "Law manipulation, reality perception, heavenly tribulation resistance", power: 55 },
  { name: "Ascendant", level: 7, desc: "Ascending beyond the mortal plane. Cultivators become legends at this stage.", abilities: "Realm crossing, advanced law manipulation, cosmic authority", power: 70 },
  { name: "Third Step", level: 8, desc: "Beyond conventional cultivation. Third Step cultivators operate on a cosmic scale.", abilities: "Universe-scale manipulation, Dao mastery, ancient race-level power", power: 85 },
  { name: "Fourth Step / Transcendence", level: 9, desc: "The ultimate cultivation state. Only Wang Lin is known to have truly achieved this through integration of all Ancient Races.", abilities: "Multiverse manipulation, complete transcendence, existence beyond all classification", power: 100 },
];

const knownCharacters: Record<string, string[]> = {
  "Mortal Stage": ["Wang Lin (origin)"],
  "Core Formation": ["Wang Lin (early)", "Zhou Yi"],
  "Nascent Soul": ["Situ Nan", "Red Butterfly"],
  "Soul Formation": ["Li Muwan (peak)", "Qing Shui"],
  "Ascendant": ["All-Seer", "Master Hong Shan"],
  "Third Step": ["Tu Si", "Tou Sen", "Ta Jia"],
  "Fourth Step / Transcendence": ["Wang Lin (final)"],
};

const CultivationPage = () => {
  return (
    <Layout>
      <PageHero title="Cultivation Realms" subtitle="The progression system from mortal to transcendence" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="gradient-card border border-border rounded-lg p-8 mb-12">
            <p className="font-body text-foreground/80 text-lg leading-relaxed">
              Cultivation is the process of refining one's body, soul, and spirit. Cultivators advance through increasingly powerful realms, 
              each requiring exponentially more time and understanding. Wang Lin's journey spans all known realms and beyond.
            </p>
          </div>

          {/* Progression */}
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-jade via-primary to-crimson" />
            
            <div className="space-y-6">
              {realms.map((realm, i) => {
                const chars = knownCharacters[realm.name];
                return (
                  <motion.div
                    key={realm.name}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-16 md:pl-20"
                  >
                    <div className="absolute left-4 md:left-6 top-6 w-4 h-4 rounded-full border-2 border-primary bg-background z-10" />
                    
                    <div className="gradient-card border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                        <h3 className="font-heading text-lg text-primary tracking-wider">{realm.name}</h3>
                        <span className="text-xs font-heading text-muted-foreground tracking-wider">
                          POWER: {realm.power}/100
                        </span>
                      </div>
                      <p className="text-foreground/80 font-body text-sm leading-relaxed mb-3">{realm.desc}</p>
                      
                      {/* Power bar */}
                      <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${realm.power}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full gradient-gold"
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground font-body mb-2">
                        <strong className="text-foreground/60">Abilities:</strong> {realm.abilities}
                      </div>
                      
                      {chars && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-xs font-heading text-muted-foreground tracking-wider">Known:</span>
                          {chars.map((c) => (
                            <span key={c} className="text-xs font-body px-2 py-0.5 rounded border border-primary/20 text-primary/80">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CultivationPage;
