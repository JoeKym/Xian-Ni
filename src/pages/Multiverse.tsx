import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";

const universes = [
  {
    name: "Renegade Immortal",
    short: "Xian Ni • Primary Universe",
    desc: "The primary universe where Wang Lin's journey begins. This world introduces the Dao system, Ancient Races, and the foundational rules of cultivation.",
    entities: ["Wang Lin", "Ancient Gods", "Ancient Demons", "Ancient Devils", "Underworld Dao"],
  },
  {
    name: "I Shall Seal the Heavens",
    short: "ISSTH • Connected Universe",
    desc: "A parallel universe with similar cultivation systems. Meng Hao, the protagonist, may encounter references or influences from Wang Lin.",
    entities: ["Meng Hao", "The God", "Heavenly Dao", "Immortal Realms"],
  },
  {
    name: "A Will Eternal",
    short: "AWE • Connected Universe",
    desc: "Another universe where cultivation follows similar yet distinct rules. Events may be influenced by or parallel to Wang Lin's rise.",
    entities: ["Immortal Continent", "Celestial Realms", "Spirit Vessels", "Heavenly Authority"],
  },
  {
    name: "The Void Between Realms",
    short: "Void • Transcendent Space",
    desc: "Not a traditional universe but the space between realities. This is where transcendent beings exist after achieving ultimate power.",
    entities: ["Transcendent Beings", "Wang Lin (Post-Transcendence)", "Ancient Order", "Void Entities"],
  },
  {
    name: "The God",
    short: "Cosmic Entity • Multiverse Anchor",
    desc: "'The God' is a mysterious entity referenced across multiple universes. 'The God's real name is Wang Lin' — meaning Wang Lin becomes the God that maintains the balance of the multiverse.",
    entities: ["Wang Lin (Transcendent)", "Multiverse Balance", "Cosmic Authority", "Ancient Order"],
  },
];

const connections = [
  {
    from: "Renegade Immortal",
    to: "I Shall Seal the Heavens",
    points: [
      "Wang Lin transcends all realms",
      "Creates the Dao system",
      "Becomes 'The God' entity",
      "Influences other universes",
    ],
    toPoints: [
      "References to 'The God'",
      "Meng Hao's ascension similar to Wang Lin",
      "Attempts to challenge heavenly order",
      "Operates in system created by Wang Lin",
    ],
  },
];

const heavenlyAuthority = [
  { universe: "RI Heaven", desc: "Governed by Ancient Races; challenged by Wang Lin" },
  { universe: "ISSTH Heaven", desc: "Sealed by Meng Hao; may be influenced by Wang Lin" },
  { universe: "AWE Heaven", desc: "Follows same cosmic laws as other universes" },
];

const MultiversePage = () => {
  return (
    <Layout>
      <PageHero title="The Multiverse" subtitle="Connections between Er Gen's legendary universes and the role of Wang Lin" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="gradient-card border border-border rounded-lg p-8 mb-12">
            <p className="font-body text-foreground/80 text-lg leading-relaxed">
              Er Gen's novels exist within a connected multiverse where characters, entities, and events influence each other across seemingly separate universes.
              <strong className="text-primary"> Wang Lin</strong> is the transcendent figure who becomes the common thread binding these realities together.
            </p>
          </div>

          {/* Universes */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">The Universes of Er Gen</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            {universes.map((u, i) => (
              <motion.div
                key={u.name}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
              >
                <h3 className="font-heading text-lg text-primary tracking-wider">{u.name}</h3>
                <p className="text-xs text-muted-foreground font-body mb-3">{u.short}</p>
                <p className="text-foreground/80 font-body text-sm leading-relaxed mb-4">{u.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {u.entities.map((e) => (
                    <span key={e} className="text-xs font-body px-2 py-0.5 rounded border border-primary/20 text-primary/80">{e}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cross-Universe Connections */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Cross-Universe Connections</h2>
          {connections.map((conn) => (
            <div key={conn.from} className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="gradient-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-3">{conn.from}</h3>
                <ul className="space-y-2">
                  {conn.points.map((p) => (
                    <li key={p} className="text-sm text-foreground/80 font-body flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="gradient-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-3">{conn.to}</h3>
                <ul className="space-y-2">
                  {conn.toPoints.map((p) => (
                    <li key={p} className="text-sm text-foreground/80 font-body flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-crimson mt-1.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Heavenly Authority */}
          <h2 className="font-heading text-2xl text-primary text-center mt-16 mb-8 tracking-wider">Heavenly Authority Across Universes</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-16">
            {heavenlyAuthority.map((h) => (
              <div key={h.universe} className="gradient-card border border-border rounded-lg p-5">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-1">{h.universe}</h3>
                <p className="text-foreground/70 font-body text-sm">{h.desc}</p>
              </div>
            ))}
          </div>

          {/* The Ultimate Theory */}
          <div className="gradient-card border-2 border-primary/30 rounded-lg p-8 text-center glow-gold">
            <h2 className="font-heading text-2xl text-primary tracking-wider mb-4">
              "The God's Real Name is Wang Lin"
            </h2>
            <p className="font-body text-foreground/80 leading-relaxed mb-6">
              This famous statement reveals a profound truth: Upon achieving transcendence, Wang Lin becomes the God that:
            </p>
            <ul className="space-y-2 text-left max-w-lg mx-auto">
              {[
                "Governs all universes within the Er Gen multiverse",
                "Maintains the cosmic balance between creation and destruction",
                "Sets the rules by which all other cultivators must abide",
                "Exists beyond time and space, able to influence past and future",
                "Transcends the Ancient Races, rendering them lesser beings",
              ].map((p) => (
                <li key={p} className="text-sm text-foreground/80 font-body flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MultiversePage;
