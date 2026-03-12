import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { MapPin } from "lucide-react";

interface Location {
  name: string;
  region: string;
  description: string;
  events: string[];
  significance: string;
}

const locations: Location[] = [
  {
    name: "Planet Suzaku",
    region: "Mortal Realm",
    description: "Wang Lin's home planet and the starting point of his cultivation journey. A relatively weak cultivation world where resources are scarce.",
    events: ["Wang Lin's birth and early life", "Joining Heng Yue Sect", "Teng Clan conflict", "First cultivation breakthroughs"],
    significance: "The emotional anchor of Wang Lin's journey — he never forgets his roots.",
  },
  {
    name: "Heng Yue Sect",
    region: "Planet Suzaku",
    description: "A small, declining cultivation sect on Planet Suzaku. Wang Lin's first formal introduction to cultivation.",
    events: ["Wang Lin accepted as disciple", "Meeting Situ Nan", "Early cultivation training", "Sect conflicts"],
    significance: "Where Wang Lin's cultivation story begins despite his lack of talent.",
  },
  {
    name: "Suzaku Star",
    region: "Star System",
    description: "The major cultivation world in the Suzaku system. Much larger and more powerful than Planet Suzaku with multiple sects and factions.",
    events: ["Wang Lin's first exposure to true cultivation society", "Major sect battles", "Dao forging milestones"],
    significance: "The bridge between mortal-level cultivation and cosmic-level power.",
  },
  {
    name: "Outer Realm",
    region: "Beyond Mortal Worlds",
    description: "The vast space beyond the mortal cultivation planets. Home to powerful sects, ancient ruins, and cosmic-level cultivators.",
    events: ["Exploration of ancient ruins", "Encounters with Third Step cultivators", "Discovery of Ancient God heritage"],
    significance: "Where Wang Lin transitions from a local power to a cosmic threat.",
  },
  {
    name: "Ancient God Territory",
    region: "Primordial Space",
    description: "The ancestral domain of the Ancient Gods. Contains the remnants of their civilization and the source of their power.",
    events: ["Tu Si confrontation", "Ancient God essence absorption", "Revelation of Ancient God history"],
    significance: "Critical to Wang Lin's Ancient God integration and understanding of cosmic history.",
  },
  {
    name: "Ancient Demon Realm",
    region: "Primordial Space",
    description: "The domain of the Ancient Demons. A chaotic space where strength determines hierarchy.",
    events: ["Tou Sen encounters", "Demon essence absorption", "Understanding of chaos-order balance"],
    significance: "Where Wang Lin gains his second Ancient Race integration.",
  },
  {
    name: "Ancient Devil Domain",
    region: "Primordial Space",
    description: "The destructive domain of the Ancient Devils. The most dangerous of all primordial spaces.",
    events: ["Ta Jia confrontation", "Devil essence absorption", "Final Ancient Race integration"],
    significance: "The last piece needed for Wang Lin's complete transcendence.",
  },
  {
    name: "Celestial Realm",
    region: "Higher Plane",
    description: "The higher plane where transcendent beings and celestial authorities reside. Governed by heavenly law.",
    events: ["Wang Lin challenges heavenly authority", "Cosmic-level battles", "Transcendence breakthrough"],
    significance: "The final battlefield before Wang Lin achieves true transcendence.",
  },
  {
    name: "Allheaven",
    region: "Supreme Realm",
    description: "The supreme realm that governs all heavens across the multiverse. The domain of 'The God' — Wang Lin's ultimate destination.",
    events: ["Wang Lin's ascension to Allheaven", "Multiverse restructuring", "Becoming 'The God'"],
    significance: "Wang Lin's final resting place and the center of the Er Gen multiverse.",
  },
];

const regions = ["All", "Mortal Realm", "Planet Suzaku", "Star System", "Beyond Mortal Worlds", "Primordial Space", "Higher Plane", "Supreme Realm"];

const LocationsPage = () => {
  return (
    <Layout>
      <PageHero title="World & Locations" subtitle="Key locations across realms, planets, and dimensions in Renegade Immortal" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="gradient-card border border-border rounded-lg p-8 mb-12">
            <p className="font-body text-foreground/80 text-lg leading-relaxed">
              Wang Lin's journey spans from a small village on a remote planet to the supreme realm that governs the entire multiverse. 
              Each location marks a transformative stage of his cultivation path.
            </p>
          </div>

          {/* Location Cards */}
          <div className="space-y-6">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.name}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-heading text-xl text-primary tracking-wider">{loc.name}</h3>
                      <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase px-2 py-0.5 rounded bg-muted">{loc.region}</span>
                    </div>
                    <p className="text-foreground/80 font-body text-sm leading-relaxed mt-2">{loc.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-2">Key Events</h4>
                    <ul className="space-y-1">
                      {loc.events.map((e) => (
                        <li key={e} className="text-xs text-foreground/70 font-body flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-2">Significance</h4>
                    <p className="text-xs text-foreground/70 font-body leading-relaxed">{loc.significance}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Journey Path Visual */}
          <div className="mt-16">
            <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Wang Lin's Journey Path</h2>
            <div className="flex flex-col items-center space-y-1">
              {locations.map((loc, i) => (
                <div key={loc.name} className="flex flex-col items-center">
                  <div className="gradient-card border border-border rounded-lg px-6 py-3 text-center max-w-xs">
                    <p className="font-heading text-sm text-primary tracking-wider">{loc.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{loc.region}</p>
                  </div>
                  {i < locations.length - 1 && <div className="w-px h-4 bg-primary/30" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LocationsPage;
