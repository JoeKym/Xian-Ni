import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { ChevronDown } from "lucide-react";

interface Dao {
  name: string;
  order: string;
  description: string;
  powers: string[];
  arc: string;
  color: string;
  icon: string;
  techniquesDerived: string[];
  storyImpact: string;
}

const daos: Dao[] = [
  {
    name: "Dao of the Underworld",
    order: "First Forged Dao",
    description: "Born from desperation and life-or-death circumstances. The first Dao ever forged by a mortal instead of inherited. Allows Wang Lin to command aspects of death, soul manipulation, and the realm between life and death.",
    powers: ["Soul Command", "Death Manipulation", "Underworld Realm Access", "Life-Death Transition"],
    arc: "Foundation Stage — Early Cultivation",
    color: "border-jade",
    icon: "💀",
    techniquesDerived: ["Finger of Death", "Soul Flag binding", "Underworld summoning"],
    storyImpact: "Establishes Wang Lin as the first mortal Dao forger — a feat that draws the attention of ancient beings and changes the course of his destiny.",
  },
  {
    name: "Dao of Slaughter",
    order: "Second Major Dao",
    description: "Forged through countless battles and the weight of countless lives taken. Represents absolute offensive power. Transforms killing intent into a tangible force.",
    powers: ["Killing Intent", "Battle Aura", "Power Amplification", "Martial Supremacy"],
    arc: "Core Formation — Battle Focus",
    color: "border-crimson",
    icon: "⚔️",
    techniquesDerived: ["Slaughter Domain", "Battle aura projection", "Killing intent materialization"],
    storyImpact: "Transforms Wang Lin from a survivor into an apex predator. This Dao makes him feared across multiple realms.",
  },
  {
    name: "Dao of Life/Death",
    order: "Third Major Dao",
    description: "A profound Dao that explores the fundamental duality of existence. Wang Lin gains mastery over the cycle of life and death itself.",
    powers: ["Life Force Manipulation", "Death Touch", "Reincarnation Insight", "Vitality Stealing"],
    arc: "Nascent Soul — Soul Mastery",
    color: "border-foreground/30",
    icon: "☯️",
    techniquesDerived: ["Life & Death Domain", "Resurrection techniques", "Vitality drain"],
    storyImpact: "Connected to Li Muwan's fate — this Dao is forged partly from the grief and love Wang Lin carries for her.",
  },
  {
    name: "Dao of Karma",
    order: "Fourth Major Dao",
    description: "Represents the interconnected web of cause and effect that binds all beings. Wang Lin can manipulate karmic ties between individuals.",
    powers: ["Karmic Bonding", "Luck Manipulation", "Fate Weaving", "Cause-Effect Control"],
    arc: "Soul Formation — Cosmic Understanding",
    color: "border-primary",
    icon: "🔮",
    techniquesDerived: ["Karmic Severance", "Fate thread manipulation", "Karmic reversal"],
    storyImpact: "Gives Wang Lin insight into the deeper connections between all beings — key to understanding his role in the multiverse.",
  },
  {
    name: "Dao of True/False",
    order: "Fifth Major Dao",
    description: "Explores the nature of reality itself — distinguishing between what is real and what is illusion. Wang Lin can make the false become true.",
    powers: ["Truth Perception", "Illusion Breaking", "Reality Manipulation", "False-to-True Conversion"],
    arc: "Divine Transformation — Realm Breaking",
    color: "border-jade",
    icon: "🪞",
    techniquesDerived: ["True/False Reversal", "Reality inversion", "Illusion realm creation"],
    storyImpact: "A philosophical Dao that changes how Wang Lin perceives existence itself — preparation for transcendence.",
  },
  {
    name: "Dao of Space/Time",
    order: "Sixth Major Dao",
    description: "The ultimate Dao of reality manipulation — control over the fundamental fabric of existence. Space and time become tools in Wang Lin's arsenal.",
    powers: ["Spatial Manipulation", "Dimensional Travel", "Time Dilation", "Spacetime Dominion"],
    arc: "Transcendent Stage — Cosmic Mastery",
    color: "border-primary",
    icon: "🌌",
    techniquesDerived: ["Stop (time freeze)", "Dimensional rift creation", "Spatial collapse"],
    storyImpact: "The final Dao before transcendence — gives Wang Lin power over the most fundamental aspects of the universe.",
  },
];

const integrations = [
  { title: "Ancient God Integration", desc: "Celestial-level power and absolute authority.", powers: ["Celestial Authority", "Creation Dao Mastery", "Primordial Energy Control", "Divine Hierarchy Position"] },
  { title: "Ancient Demon Integration", desc: "Chaotic, instinctual power complementing ordered authority.", powers: ["Chaos Manipulation", "Instinctive Power", "Demon Essence Control", "Hybrid Flexibility"] },
  { title: "Ancient Devil Integration", desc: "Pure destructive power completing transcendence.", powers: ["Destruction Dao Mastery", "Unlimited Offensive Power", "Law Shattering", "Complete Transcendence"] },
];

const DaosPage = () => {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <Layout>
      <PageHero title="The Dao Evolution" subtitle="The Legendary Cultivation Paths of Renegade Immortal" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Intro */}
          <div className="gradient-card border border-border rounded-lg p-8 mb-12">
            <p className="font-body text-foreground/80 text-lg leading-relaxed">
              In the world of Renegade Immortal, the Dao represents the fundamental path of cultivation — a cultivator's unique understanding of the universe. 
              Unlike most cultivators who inherit Daos, <strong className="text-primary">Wang Lin forges entirely new Daos</strong> that have never existed before.
            </p>
          </div>

          {/* Dao List */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Wang Lin's Legendary Daos</h2>
          <div className="space-y-3">
            {daos.map((dao, i) => (
              <motion.div
                key={dao.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`gradient-card border-l-2 ${dao.color} border border-border rounded-lg overflow-hidden`}
              >
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dao.icon}</span>
                    <div>
                      <h3 className="font-heading text-lg text-primary tracking-wider">{dao.name}</h3>
                      <p className="text-sm text-muted-foreground font-body">{dao.order}</p>
                    </div>
                  </div>
                  <ChevronDown className={`text-primary transition-transform ${expanded === i ? "rotate-180" : ""}`} size={18} />
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-4">
                        <p className="font-body text-foreground/80 leading-relaxed">{dao.description}</p>
                        <div>
                          <h4 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-2">Powers & Abilities</h4>
                          <div className="flex flex-wrap gap-2">
                            {dao.powers.map((p) => (
                              <span key={p} className="text-xs font-body px-2 py-1 rounded border border-primary/20 text-primary/80">{p}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-2">Techniques Derived</h4>
                          <div className="flex flex-wrap gap-2">
                            {dao.techniquesDerived.map((t) => (
                              <Link key={t} to="/artifacts" className="text-xs font-body px-2 py-1 rounded border border-jade/20 text-jade hover:bg-jade/10 transition-colors">{t}</Link>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-1">Story Impact</h4>
                          <p className="text-sm text-foreground/70 font-body leading-relaxed">{dao.storyImpact}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-1">Cultivation Arc</h4>
                          <p className="text-sm text-foreground/70 font-body">{dao.arc}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Integrations */}
          <h2 className="font-heading text-2xl text-primary text-center mt-16 mb-8 tracking-wider">Ancient Race Integrations</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {integrations.map((int) => (
              <div key={int.title} className="gradient-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-2">{int.title}</h3>
                <p className="text-foreground/70 font-body text-sm mb-3">{int.desc}</p>
                <ul className="space-y-1">
                  {int.powers.map((p) => (
                    <li key={p} className="text-xs text-muted-foreground font-body flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Dao Evolution Visual */}
          <div className="mt-16">
            <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Dao Evolution Path</h2>
            <div className="flex flex-col items-center space-y-1">
              {daos.map((dao, i) => (
                <div key={dao.name} className="flex flex-col items-center">
                  <div className="gradient-card border border-border rounded-lg px-6 py-3 text-center flex items-center gap-2">
                    <span>{dao.icon}</span>
                    <p className="font-heading text-sm text-primary tracking-wider">{dao.name}</p>
                  </div>
                  {i < daos.length - 1 && <div className="w-px h-6 bg-primary/30" />}
                </div>
              ))}
              <div className="w-px h-6 bg-primary/30" />
              <div className="gradient-gold rounded-lg px-8 py-4 text-center">
                <p className="font-heading text-sm text-primary-foreground tracking-wider">∞ TRANSCENDENCE</p>
                <p className="text-xs text-primary-foreground/70 font-body">All Ancient Races Integrated</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DaosPage;
