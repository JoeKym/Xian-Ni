import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Tv, Play, Globe, Scroll, Star, Heart,
  Shield, Map, Clock, Sparkles, ExternalLink, Code2, Mail
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Users, label: "Characters", desc: "Detailed profiles for every major character — cultivation level, dao, relationships, and story arc.", path: "/characters" },
  { icon: BookOpen, label: "Guide", desc: "New to Xian Ni? Start here with a curated reading and watching guide.", path: "/guide" },
  { icon: Sparkles, label: "Daos", desc: "Explore every Dao and technique featured in the story.", path: "/daos" },
  { icon: Shield, label: "Artifacts", label2: "Artifacts", desc: "All celestial artifacts, flying swords, and magical treasures catalogued.", path: "/artifacts" },
  { icon: Map, label: "Locations", desc: "Interactive atlas of every realm, sect, and landmark.", path: "/locations" },
  { icon: Clock, label: "Timeline", desc: "Chronological story events across all arcs.", path: "/timeline" },
  { icon: Globe, label: "Multiverse", desc: "The full cosmology — star systems, realms, and planes of existence.", path: "/multiverse" },
  { icon: Tv, label: "Donghua", desc: "Everything about the animated adaptation — seasons, studios, cast.", path: "/donghua" },
  { icon: Play, label: "Watch", desc: "Stream all released episodes directly inside the site.", path: "/watch" },
  { icon: Scroll, label: "Lore", desc: "Deep-dives into cultivation systems, factions, and in-universe history.", path: "/lore" },
  { icon: Users, label: "Community", desc: "Join fan communities, post theories, and chat with other readers.", path: "/communities" },
];

const stats = [
  { value: "4", label: "Streaming Servers" },
  { value: "180+", label: "Episodes Covered" },
  { value: "100+", label: "Characters Documented" },
  { value: "1", label: "Epic Story" },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">

        {/* Hero */}
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p variants={fadeUp} className="text-primary font-heading tracking-[0.3em] text-sm mb-3 uppercase">
            仙逆 · Xian Ni
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-6xl text-foreground mb-5 tracking-wide">
            Renegade Immortal Wiki
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted-foreground font-body text-lg max-w-2xl mx-auto leading-relaxed">
            The most complete fan-made encyclopedia for Er Gen's{" "}
            <em>Renegade Immortal (仙逆)</em> — covering the original novel, the
            donghua adaptation, characters, lore, and more.
          </motion.p>
        </motion.div>

        {/* About the Show */}
        <motion.section
          className="mb-20 grid md:grid-cols-2 gap-12 items-start"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="font-heading text-2xl text-foreground mb-4 tracking-wide">About the Story</h2>
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              <strong className="text-foreground">Renegade Immortal (仙逆, Xian Ni)</strong> is a xianxia web novel
              written by <strong className="text-foreground">Er Gen</strong>, one of China's most celebrated
              cultivation fiction authors. The story follows <strong className="text-foreground">Wang Lin</strong>,
              a boy born without exceptional talent who enters the world of cultivation through sheer will and
              determination — and becomes one of its most terrifying figures.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              Known for its cold, ruthless protagonist, intricate power systems, and emotionally resonant storytelling,
              Xian Ni is considered one of the foundational works of the xianxia genre alongside Er Gen's other
              masterpieces <em>I Shall Seal the Heavens</em> and <em>A Will Eternal</em>.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed">
              The donghua (Chinese animated) adaptation by <strong className="text-foreground">Tencent Penguin Pictures</strong> began airing in 2023
              and is currently ongoing with 180+ episodes released.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-foreground text-sm uppercase tracking-widest mb-4">Quick Facts</h3>
              <dl className="space-y-3 font-body text-sm">
                {[
                  ["Author", "Er Gen (耳根)"],
                  ["Genre", "Xianxia / Cultivation"],
                  ["Novel Chapters", "2,138"],
                  ["Status", "Novel Complete · Donghua Ongoing"],
                  ["Studio", "Tencent Penguin Pictures"],
                  ["First Episode", "2023"],
                  ["Languages", "Chinese (subbed in English)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-3">
                    <dt className="text-muted-foreground shrink-0">{k}</dt>
                    <dd className="text-foreground text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </motion.section>

        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="font-heading text-3xl text-primary mb-1">{s.value}</p>
              <p className="text-muted-foreground font-body text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-2xl text-foreground mb-2 tracking-wide text-center">What's Inside</h2>
          <p className="text-muted-foreground font-body text-center mb-10">
            Every section of the wiki, explained.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <Link
                    to={f.path}
                    className="block rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group h-full"
                    data-testid={`about-feature-${f.label.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={16} className="text-primary shrink-0" />
                      <span className="font-heading text-foreground text-sm tracking-wide group-hover:text-primary transition-colors">
                        {f.label}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-body text-xs leading-relaxed">{f.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* About the Site */}
        <motion.section
          className="mb-20 rounded-xl border border-border bg-card p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Heart size={18} className="text-primary" />
            <h2 className="font-heading text-xl text-foreground tracking-wide">About This Site</h2>
          </div>
          <p className="text-muted-foreground font-body leading-relaxed mb-4">
            This wiki was built as a passion project by a fan of Er Gen's works. The goal is simple: give the
            Renegade Immortal community the best possible resource — detailed lore, a character database,
            streaming access, and a place to connect with other readers and viewers.
          </p>
          <p className="text-muted-foreground font-body leading-relaxed mb-4">
            All lore, story summaries, and character information are based on the original novel by Er Gen and
            the official donghua adaptation. This site is non-commercial and fan-made — it is not affiliated
            with Er Gen, the publishers, or Tencent.
          </p>
          <p className="text-muted-foreground font-body leading-relaxed mb-6">
            Designed and developed by{" "}
            <a
              href="https://joekymlabs.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              JoeKym Labs™ <ExternalLink size={12} />
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-body text-sm"
              data-testid="about-contact-link"
            >
              <Mail size={14} /> Contact Us
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 font-body text-sm"
              data-testid="about-support-link"
            >
              <Star size={14} /> Support & FAQ
            </Link>
          </div>
        </motion.section>

        {/* Disclaimer */}
        <motion.p
          className="text-center text-muted-foreground/50 font-body text-xs"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Renegade Immortal / 仙逆 and all related characters are the property of Er Gen and their respective rights holders.
          This is an unofficial fan wiki with no commercial purpose.
        </motion.p>

      </div>
    </Layout>
  );
}
