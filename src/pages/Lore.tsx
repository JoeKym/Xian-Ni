import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { ChevronDown } from "lucide-react";

const glossary = [
  { term: "Dao", def: "The fundamental law or way of existence. A complete understanding of a principle. Cultivators forge or inherit Daos to gain power and transcend mortal limitations." },
  { term: "Cultivation", def: "The process of refining one's body, soul, and spirit through meditation and practice. Cultivators advance through various realms and stages." },
  { term: "Transcendence", def: "The ultimate goal of cultivation — to transcend mortal existence and the laws of the universe itself." },
  { term: "Ancient God", def: "One of the three primordial races. Embody order, creation, and celestial authority." },
  { term: "Ancient Demon", def: "One of the three primordial races. Represent chaos, instinct, and strength tempered with intelligence." },
  { term: "Ancient Devil", def: "One of the three primordial races. Embody pure chaos and destruction." },
  { term: "Heaven", def: "The cosmic law and order that governs all existence. Enforces celestial rules and punishes those who defy it." },
  { term: "The Ancient Order", def: "A mysterious entity or collective that transcends individual universes. Possibly connected to Wang Lin's transcendent state." },
  { term: "Tribulation", def: "A heavenly test that cultivators must overcome during breakthrough moments. Surviving grants power and progression." },
  { term: "Spirit Vessel", def: "A cultivator's internal energy reservoir and cultivation foundation." },
  { term: "Realm / Stage", def: "Levels of cultivation power. Progression through realms represents increasing mastery of Daos." },
  { term: "Immortal", def: "A being who has transcended mortality and can live indefinitely. Far more powerful than mortals." },
];

const powerScale = [
  { label: "Mortal (Early Game)", power: 1 },
  { label: "Foundation Master", power: 15 },
  { label: "Immortal Realm", power: 25 },
  { label: "Dao Master", power: 45 },
  { label: "Heaven-Defier", power: 65 },
  { label: "Ancient Race Hybrid", power: 80 },
  { label: "TRANSCENDENT", power: 100 },
];

const faqs = [
  { q: "Why isn't Wang Lin called 'The God' in the early story?", a: "Wang Lin only becomes 'The God' upon achieving transcendence. During his journey, he is still ascending. The title is a future state — he IS the God, but only after transcendence reshapes his existence." },
  { q: "What's the difference between god, demon, and devil?", a: "Ancient Gods represent order and creation. Ancient Demons represent chaos mixed with intelligence. Ancient Devils represent pure chaos and destruction. Wang Lin's integration of all three creates a unique balance." },
  { q: "How does Wang Lin forge new Daos when others inherit them?", a: "Most cultivators inherit Daos from lineages or masters. Wang Lin creates Daos from scratch through understanding, desperation, and genius — making them far more compatible with his cultivation." },
  { q: "What makes Wang Lin's transcendence different?", a: "He integrates all three Ancient Races, achieves heaven-defying cultivation that breaks cosmic law, exists across multiple universes simultaneously, and becomes the God that maintains cosmic balance." },
  { q: "Can other beings achieve transcendence like Wang Lin?", a: "While theoretically possible, Wang Lin's particular achievement — integrating all three Ancient Races combined with mortal-origin foundation and forged Daos — appears unique." },
];

const concepts = [
  { title: "Heaven-Defying Cultivation", desc: "A path that deliberately violates heavenly law. Those who practice it become hunted but gain unprecedented freedom and power." },
  { title: "Dao Fusion & Integration", desc: "Merging multiple Daos into a cohesive system. Wang Lin's ability to fuse incompatible Daos is unprecedented." },
  { title: "Ancient Race Absorption", desc: "Absorbing the essence of an Ancient Race being. Grants access to that race's Daos and authority but risks overwhelming the cultivator." },
  { title: "Tribulation Navigation", desc: "Surviving heavenly tribulations during cultivation breakthroughs. Heaven-defying cultivators face deadlier tribulations." },
  { title: "Soul Cultivation", desc: "Refining and strengthening one's soul essence. A stronger soul allows for greater Dao integration." },
];

const LorePage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <Layout>
      <PageHero title="Lore Notes & Glossary" subtitle="Deep dive into terminology, power scaling, and cultivation concepts" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Glossary */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Glossary of Terms</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-16">
            {glossary.map((g) => (
              <div key={g.term} className="gradient-card border border-border rounded-lg p-5">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-1">{g.term}</h3>
                <p className="text-foreground/70 font-body text-sm leading-relaxed">{g.def}</p>
              </div>
            ))}
          </div>

          {/* Power Scaling */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Power Scaling Chart</h2>
          <div className="space-y-3 mb-16">
            {powerScale.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gradient-card border border-border rounded-lg p-4"
              >
                <div className="flex justify-between mb-2">
                  <span className={`font-heading text-sm tracking-wider ${s.power === 100 ? "text-primary" : "text-foreground"}`}>
                    {s.label}
                  </span>
                  <span className="text-xs text-primary font-heading">
                    {s.power === 100 ? "∞/∞" : `${s.power}/100`}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.power}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${s.power === 100 ? "gradient-gold" : "bg-primary/60"}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQs */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Frequently Asked Questions</h2>
          <div className="space-y-2 mb-16">
            {faqs.map((faq, i) => (
              <div key={i} className="gradient-card border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <h3 className="font-heading text-sm text-foreground tracking-wider pr-4">{faq.q}</h3>
                  <ChevronDown className={`text-primary shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} size={16} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-foreground/70 font-body text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Advanced Concepts */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Advanced Cultivation Concepts</h2>
          <div className="space-y-3">
            {concepts.map((c) => (
              <div key={c.title} className="gradient-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-2">{c.title}</h3>
                <p className="text-foreground/70 font-body text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LorePage;
