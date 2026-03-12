import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { BookOpen, Users, Swords, Sparkles, Clock, Tv, ChevronRight } from "lucide-react";

const sections = [
  {
    icon: BookOpen,
    title: "What is Renegade Immortal?",
    content: "Renegade Immortal (仙逆, Xian Ni) is a Chinese web novel by Er Gen, widely regarded as one of the greatest cultivation novels ever written. It follows Wang Lin, a talentless mortal who, through sheer willpower and intelligence, rises to become the most powerful being in the multiverse — 'The God.' Unlike typical cultivation stories where the protagonist has innate talent, Wang Lin earns everything through suffering, strategy, and an iron will.",
  },
  {
    icon: Users,
    title: "Meet Wang Lin",
    content: "Wang Lin begins as an ordinary boy from a small village on Planet Suzaku. With virtually no cultivation talent, he is looked down upon by his peers. But through a fateful encounter and relentless determination, he forges his own Daos — something no mortal has ever achieved. Over thousands of years, he integrates the essence of all three Ancient Races (God, Demon, Devil) and transcends existence itself.",
    link: "/characters",
    linkText: "View All Characters →",
  },
  {
    icon: Swords,
    title: "The Cultivation System",
    content: "Cultivation is the process of absorbing spiritual energy and refining one's body and soul to gain supernatural powers. The system progresses from Mortal → Qi Condensation → Foundation Establishment → Core Formation → Nascent Soul → Soul Formation → Spirit Severing → Ascendant → Third Step → Fourth Step (Transcendence). Each stage requires exponentially more effort, talent, and understanding.",
    link: "/cultivation",
    linkText: "Full Cultivation Guide →",
  },
  {
    icon: Sparkles,
    title: "What Are Daos?",
    content: "A Dao is a fundamental law of the universe — a cultivator's unique understanding of reality. Most cultivators inherit Daos from their masters or lineage. Wang Lin is unique because he forges entirely new Daos that have never existed before: Underworld, Slaughter, Life/Death, Karma, True/False, and Space/Time. This makes his cultivation path one-of-a-kind.",
    link: "/daos",
    linkText: "Explore the Dao System →",
  },
];

const storyArcs = [
  { num: 1, title: "The Mortal's Beginning", desc: "Wang Lin's humble origins and first steps into cultivation" },
  { num: 2, title: "Rise Through Conflict", desc: "Building power through desperate battles and Dao forging" },
  { num: 3, title: "Ancient Race Encounters", desc: "Discovering the Ancient Gods, Demons, and Devils" },
  { num: 4, title: "Dao Expansion", desc: "Mastering multiple Daos and cosmic-level power" },
  { num: 5, title: "Transcendence", desc: "Integrating all Ancient Races and becoming 'The God'" },
];

const readingOrder = [
  { num: 1, title: "Renegade Immortal (Xian Ni)", note: "Start here — Wang Lin's complete journey" },
  { num: 2, title: "Pursuit of the Truth (Beseech the Devil)", note: "Su Ming's story — connected to the same multiverse" },
  { num: 3, title: "I Shall Seal the Heavens", note: "Meng Hao's story — references 'The God'" },
  { num: 4, title: "A Will Eternal", note: "Bai Xiaochun's story — expands the multiverse" },
  { num: 5, title: "A World Worth Protecting", note: "Modern setting — may connect to the multiverse" },
];

const GuidePage = () => {
  return (
    <Layout>
      <PageHero title="Beginner's Guide" subtitle="New to Renegade Immortal? Start here to understand the world of Xian Ni" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Core Sections */}
          <div className="space-y-6 mb-16">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="gradient-card border border-border rounded-lg p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={20} className="text-primary" />
                    <h2 className="font-heading text-xl text-primary tracking-wider">{s.title}</h2>
                  </div>
                  <p className="font-body text-foreground/80 leading-relaxed">{s.content}</p>
                  {s.link && (
                    <Link to={s.link} className="inline-flex items-center gap-1 mt-4 text-sm font-heading text-primary tracking-wider hover:underline">
                      {s.linkText} <ChevronRight size={14} />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Story Arcs Overview */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Major Story Arcs (Spoiler-Free)</h2>
          <div className="relative mb-16">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-crimson to-jade" />
            <div className="space-y-4">
              {storyArcs.map((arc, i) => (
                <motion.div
                  key={arc.num}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-3 top-4 w-6 h-6 rounded-full gradient-gold flex items-center justify-center text-xs font-heading text-primary-foreground font-bold z-10">
                    {arc.num}
                  </div>
                  <div className="gradient-card border border-border rounded-lg p-5">
                    <h3 className="font-heading text-sm text-primary tracking-wider">{arc.title}</h3>
                    <p className="text-foreground/70 font-body text-sm">{arc.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reading Order */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Recommended Reading Order</h2>
          <div className="space-y-3 mb-16">
            {readingOrder.map((book, i) => (
              <motion.div
                key={book.num}
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gradient-card border border-border rounded-lg p-5 flex items-center gap-4"
              >
                <span className="font-heading text-2xl text-primary/30">{book.num}</span>
                <div>
                  <h3 className="font-heading text-sm text-primary tracking-wider">{book.title}</h3>
                  <p className="text-foreground/70 font-body text-xs">{book.note}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Donghua Section */}
          <div className="gradient-card border-2 border-primary/30 rounded-lg p-8 text-center glow-gold">
            <Tv className="mx-auto text-primary mb-4" size={28} />
            <h2 className="font-heading text-xl text-primary tracking-wider mb-3">Watch the Donghua</h2>
            <p className="font-body text-foreground/80 mb-4">
              The Renegade Immortal donghua (Chinese anime) has 129+ episodes and is ongoing. It adapts the early arcs of the novel with stunning animation.
            </p>
            <Link to="/donghua" className="inline-flex items-center gap-1 text-sm font-heading text-primary tracking-wider hover:underline">
              Donghua Tracker → <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GuidePage;
