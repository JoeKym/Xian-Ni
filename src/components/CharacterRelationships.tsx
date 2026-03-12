import { motion } from "framer-motion";

interface Relationship {
  from: string;
  to: string;
  type: "master" | "enemy" | "ally" | "love" | "disciple";
  label: string;
}

const relationships: Relationship[] = [
  { from: "Wang Lin", to: "Situ Nan", type: "master", label: "Mentor" },
  { from: "Wang Lin", to: "Li Muwan", type: "love", label: "Love" },
  { from: "Wang Lin", to: "Tu Si", type: "enemy", label: "Rival → Absorbed" },
  { from: "Wang Lin", to: "Tou Sen", type: "enemy", label: "Rival" },
  { from: "Wang Lin", to: "Ta Jia", type: "enemy", label: "Rival → Absorbed" },
  { from: "Wang Lin", to: "All-Seer", type: "ally", label: "Enemy → Ally" },
  { from: "Wang Lin", to: "Mu Bingmei", type: "ally", label: "Complex Tension" },
  { from: "Wang Lin", to: "Qing Shui", type: "enemy", label: "Tragic Rival" },
  { from: "Wang Lin", to: "Su Ming", type: "ally", label: "Multiverse Link" },
];

const typeColors: Record<string, string> = {
  master: "border-jade text-jade",
  enemy: "border-crimson text-crimson",
  ally: "border-primary text-primary",
  love: "border-pink-400 text-pink-400",
  disciple: "border-foreground/40 text-foreground/60",
};

const typeBg: Record<string, string> = {
  master: "bg-jade/10",
  enemy: "bg-crimson/10",
  ally: "bg-primary/10",
  love: "bg-pink-400/10",
  disciple: "bg-foreground/5",
};

export function CharacterRelationships() {
  return (
    <div className="mt-16">
      <h2 className="font-heading text-2xl text-primary text-center mb-3 tracking-wider">Character Relationships</h2>
      <p className="text-center text-muted-foreground font-body text-sm mb-8">Wang Lin's key connections</p>

      <div className="gradient-card border border-border rounded-lg p-8">
        {/* Central node */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center glow-gold"
          >
            <span className="font-heading text-sm text-primary-foreground tracking-wider">王林</span>
          </motion.div>
          <p className="font-heading text-sm text-primary tracking-wider mt-2">Wang Lin</p>
        </div>

        {/* Relationship lines */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relationships.map((rel, i) => (
            <motion.div
              key={`${rel.from}-${rel.to}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${typeColors[rel.type]} ${typeBg[rel.type]}`}
            >
              <div className={`w-2 h-2 rounded-full border ${typeColors[rel.type]}`} />
              <div>
                <p className="font-heading text-sm tracking-wider">{rel.to}</p>
                <p className="text-xs font-body opacity-70">{rel.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border justify-center">
          {[
            { type: "master", label: "Master/Mentor" },
            { type: "enemy", label: "Enemy/Rival" },
            { type: "ally", label: "Ally" },
            { type: "love", label: "Love Interest" },
          ].map((l) => (
            <div key={l.type} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full border ${typeColors[l.type]}`} />
              <span className="text-xs text-muted-foreground font-body">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
