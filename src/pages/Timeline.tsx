import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";

const arcs = [
  { num: 1, title: "The Mortal's Beginning", desc: "Wang Lin rises from a powerless mortal in a small village. Through desperation and determination, he forges the impossible Dao of the Underworld.", characters: ["Wang Lin", "Mentor Figures"] },
  { num: 2, title: "The Underworld Dao Mastery", desc: "Wang Lin masters the Dao of the Underworld and begins to establish himself. His power attracts attention from both allies and enemies.", characters: ["Wang Lin", "Su Ming", "Sect Leaders"] },
  { num: 3, title: "First Confrontations", desc: "Wang Lin faces his first major challenges. Conflicts with ancient cultivators and the emergence of Ancient Demon and Devil threats.", characters: ["Wang Lin", "Tou Sen", "Ta Jia"] },
  { num: 4, title: "Dao Expansion & Integration", desc: "Wang Lin forges and masters the Dao of Slaughter, Life/Death, and Karma. He becomes recognized as a threat to the ancient races.", characters: ["Wang Lin", "All-Seer", "Ancient Beings"] },
  { num: 5, title: "Heaven-Defying Ascension", desc: "Wang Lin masters the Dao of True/False and Space/Time, granting abilities that defy heavenly law. He becomes hunted by celestial forces.", characters: ["Wang Lin", "Heavenly Forces"] },
  { num: 6, title: "Ancient God Integration", desc: "Wang Lin confronts and absorbs the essence of an Ancient God, achieving a partial god-like state. This shocks the ancient races.", characters: ["Wang Lin", "Tu Si", "God Envoys"] },
  { num: 7, title: "Ancient Demon Essence", desc: "Wang Lin absorbs demon essence, balancing his god aspect with chaotic power. The integration creates instability across multiple realms.", characters: ["Wang Lin", "Tou Sen", "Demon Hierarchy"] },
  { num: 8, title: "The Devil Integration", desc: "In the climactic moment, Wang Lin absorbs Ancient Devil essence. The fusion of god, demon, and devil triggers his final transcendence.", characters: ["Wang Lin", "Ta Jia", "All Ancient Races"] },
  { num: 9, title: "Transcendent Legends", desc: "With transcendence achieved, Wang Lin's actions reshape multiple universes. His name becomes legend across all realms.", characters: ["Wang Lin (Transcendent)", "Meng Hao", "Su Ming"] },
];

const milestones = [
  { title: "First Dao Forged", desc: "The first mortal to forge a Dao instead of inheriting one." },
  { title: "Dao Fusion Breakthrough", desc: "Merging multiple Daos into a single cohesive power system." },
  { title: "Ancient Race Absorption", desc: "Integrating the essence of all three Ancient Races." },
  { title: "Transcendence Achieved", desc: "Becoming something beyond classification." },
  { title: "Multiverse Impact", desc: "Influencing other universes and timelines." },
  { title: "The Living Legend", desc: "'The God's real name is Wang Lin' becomes truth across the multiverse." },
];

const TimelinePage = () => {
  return (
    <Layout>
      <PageHero title="Story Timeline" subtitle="Chronicles of Wang Lin's journey across realms and epochs" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="gradient-card border border-border rounded-lg p-8 mb-12">
            <p className="font-body text-foreground/80 text-lg leading-relaxed">
              From a powerless mortal to a force that shakes the multiverse, Wang Lin's journey spans epochs, realms, and realities. 
              This timeline tracks the major events, conflicts, and transformations that define the legend.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-crimson to-jade" />
            
            <div className="space-y-8">
              {arcs.map((arc, i) => (
                <motion.div
                  key={arc.num}
                  initial={{ x: -30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-16 md:pl-20"
                >
                  <div className="absolute left-3 md:left-5 top-5 w-6 h-6 rounded-full gradient-gold flex items-center justify-center text-xs font-heading text-primary-foreground font-bold z-10">
                    {arc.num}
                  </div>
                  
                  <div className="gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors">
                    <h3 className="font-heading text-lg text-primary tracking-wider mb-2">{arc.title}</h3>
                    <p className="text-foreground/80 font-body text-sm leading-relaxed mb-3">{arc.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-heading text-muted-foreground tracking-wider">Key Characters:</span>
                      {arc.characters.map((c) => (
                        <span key={c} className="text-xs font-body px-2 py-0.5 rounded border border-primary/20 text-primary/80">{c}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <h2 className="font-heading text-2xl text-primary text-center mt-16 mb-8 tracking-wider">Heaven-Defying Milestones</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {milestones.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ y: 15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gradient-card border border-border rounded-lg p-5"
              >
                <h3 className="font-heading text-sm text-primary tracking-wider mb-1">{m.title}</h3>
                <p className="text-foreground/70 font-body text-sm">{m.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Power Progression */}
          <h2 className="font-heading text-2xl text-primary text-center mt-16 mb-8 tracking-wider">Power Progression</h2>
          <div className="space-y-4">
            {[
              { label: "Early Game (Foundation)", power: 1 },
              { label: "Mid Game (Expansion)", power: 30 },
              { label: "Late Game (Ascension)", power: 70 },
              { label: "Endgame (Transcendence)", power: 100 },
            ].map((stage) => (
              <div key={stage.label} className="gradient-card border border-border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-heading text-sm text-foreground tracking-wider">{stage.label}</span>
                  <span className="text-xs text-primary font-heading">{stage.power}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stage.power}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full gradient-gold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TimelinePage;
