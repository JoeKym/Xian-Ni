import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { BookOpen, Tv, Clock, Calendar, TrendingUp, ExternalLink, Play, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import { ReleaseTimeline } from "@/components/donghua/ReleaseTimeline";
import { ChapterConverter } from "@/components/donghua/ChapterConverter";

const adaptationTable = [
  { range: "1–50", chapters: "1–250", frequency: "1 per week", status: "aired" },
  { range: "51–100", chapters: "251–600", frequency: "1 per week", status: "aired" },
  { range: "101–128", chapters: "601–850", frequency: "1 per week", status: "airing" },
  { range: "129–150", chapters: "851–1000", frequency: "1 per week", status: "upcoming" },
  { range: "151–200", chapters: "1001–1400", frequency: "1 per week", status: "upcoming" },
  { range: "201–250", chapters: "1401–1800", frequency: "1 per week", status: "upcoming" },
  { range: "251–300+", chapters: "1801–2100", frequency: "1 per week", status: "upcoming" },
];

const storyArcs = [
  { num: "I", title: "Ji Realm Awakening", episodes: "1–50", chapters: "1–250", status: "completed", desc: "Wang Lin's humble origins on Suzaku Planet, his entry into the Heng Yue Sect, and the discovery of the mysterious bead. His early struggles in the cultivation world forge his iron will." },
  { num: "II", title: "Underworld & Corporeal Realm", episodes: "51–100", chapters: "251–600", status: "completed", desc: "Wang Lin masters the Underworld Dao, gains recognition among cultivators, and faces the first major betrayals. His cunning nature emerges as he navigates deadly political landscapes." },
  { num: "III", title: "Ancient God Lands", episodes: "101–150", chapters: "601–1000", status: "airing", desc: "Confrontations with Ancient Races begin. Wang Lin discovers his Ancient God heritage and forges the Dao of Slaughter. The emergence of Tuo Sen and demonic forces threatens all realms." },
  { num: "IV", title: "Dao Expansion & Alliances", episodes: "151–200", chapters: "1001–1400", status: "upcoming", desc: "Wang Lin forges multiple Daos — Life and Death, Karma, and True/False. His power reaches unprecedented levels as he challenges heavenly forces and builds unlikely alliances." },
  { num: "V", title: "Heaven-Defying Ascension", episodes: "201–250", chapters: "1401–1800", status: "upcoming", desc: "Wang Lin masters Space/Time Daos. Hunted by celestial beings, he uncovers the truth behind the Cave system and the ancient war between immortals and gods." },
  { num: "VI", title: "Final Confrontation", episodes: "251–300+", chapters: "1801–2100", status: "upcoming", desc: "The ultimate battle. Wang Lin absorbs the essences of Ancient Gods, Demons, and Devils. He confronts the heavens themselves and achieves true transcendence — defying fate itself." },
];

const storyHighlights = [
  { label: "Protagonist", value: "Wang Lin" },
  { label: "Key Traits", value: "Determined, cunning, grows through adversity" },
  { label: "Themes", value: "Revenge, justice, cultivation, morality, fate & destiny" },
];

const fanPredictions = [
  { label: "Optimistic", year: "2028", reasoning: "Faster adaptation in later arcs" },
  { label: "Reasonable", year: "2029", reasoning: "Seasonal releases + episode stacking" },
  { label: "Slow Pace", year: "2030–2031", reasoning: "Extended production breaks" },
];

const DonghuaPage = () => {
  const totalEstimated = 350;
  const airedEpisodes = 128;
  const totalChapters = 2100;
  const adaptedChapters = 850;
  const [expandedArc, setExpandedArc] = useState<string | null>(null);

  const statusColor = (s: string) =>
    s === "completed" ? "text-jade" : s === "airing" ? "text-primary" : "text-muted-foreground";
  const statusBadge = (s: string) =>
    s === "completed"
      ? "bg-jade/10 text-jade border-jade/20"
      : s === "airing"
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-muted text-muted-foreground border-border";

  return (
    <Layout>
      <PageHero
        title="Donghua Progress Tracker"
        subtitle="Track the animated adaptation of Er Gen's Renegade Immortal (仙逆)"
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Tv, label: "Episodes Aired", value: `${airedEpisodes}`, sub: `~${totalEstimated} estimated total` },
              { icon: BookOpen, label: "Chapters Adapted", value: `${adaptedChapters}`, sub: `of ${totalChapters} total` },
              { icon: Clock, label: "Release Schedule", value: "Weekly", sub: "1 episode per week" },
              { icon: Calendar, label: "Est. Completion", value: "2029", sub: "Fan consensus" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="gradient-card border border-border rounded-lg p-5 text-center group hover:border-primary/30 transition-colors"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-heading text-primary tracking-wider">{stat.value}</p>
                <p className="font-heading text-xs text-muted-foreground tracking-wider mt-1">{stat.label}</p>
                <p className="text-xs text-foreground/50 font-body mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Dual Progress Bars */}
          <div className="gradient-card border border-border rounded-lg p-6 mb-12">
            <h3 className="font-heading text-lg text-primary tracking-wider mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Adaptation Progress
            </h3>

            {/* Episode Progress */}
            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-body text-foreground/80">Episode Progress</span>
                <span className="text-sm font-heading text-primary">{airedEpisodes} / ~{totalEstimated}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(airedEpisodes / totalEstimated) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full gradient-gold relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">{((airedEpisodes / totalEstimated) * 100).toFixed(1)}% complete</p>
            </div>

            {/* Chapter Coverage */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-body text-foreground/80">Novel Coverage</span>
                <span className="text-sm font-heading text-primary">{adaptedChapters} / {totalChapters} chapters</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(adaptedChapters / totalChapters) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--crimson)), hsl(var(--primary)))" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">{((adaptedChapters / totalChapters) * 100).toFixed(1)}% of novel adapted • ~5–7 chapters per episode</p>
            </div>
          </div>

          {/* Episode Adaptation Table */}
          <div className="gradient-card border border-border rounded-lg p-6 mb-12 overflow-hidden">
            <h3 className="font-heading text-lg text-primary tracking-wider mb-5 flex items-center gap-2">
              <Play className="w-4 h-4" /> Episode Release Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-heading text-muted-foreground tracking-wider text-xs">Episodes</th>
                    <th className="text-left py-3 px-4 font-heading text-muted-foreground tracking-wider text-xs">Chapters Adapted</th>
                    <th className="text-left py-3 px-4 font-heading text-muted-foreground tracking-wider text-xs">Frequency</th>
                    <th className="text-left py-3 px-4 font-heading text-muted-foreground tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adaptationTable.map((row) => (
                    <tr key={row.range} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-body text-foreground">{row.range}</td>
                      <td className="py-3 px-4 font-body text-foreground/80">{row.chapters}</td>
                      <td className="py-3 px-4 font-body text-foreground/60">{row.frequency}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading tracking-wider border ${statusBadge(row.status)}`}>
                          {row.status === "aired" ? "✓ Aired" : row.status === "airing" ? "● Airing" : "○ Upcoming"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-4 flex items-center gap-1">
              <Info className="w-3 h-3" /> Numbers are approximate based on fan-adaptation tracking. Actual studio pace may vary.
            </p>
          </div>

          {/* Release Timeline */}
          <ReleaseTimeline />

          {/* Chapter Converter */}
          <ChapterConverter />

          {/* Story Arcs */}
          <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">Story Arcs</h2>
          <div className="space-y-3 mb-16">
            {storyArcs.map((arc, i) => {
              const isExpanded = expandedArc === arc.num;
              return (
                <motion.div
                  key={arc.num}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`gradient-card border rounded-lg overflow-hidden transition-colors cursor-pointer ${isExpanded ? "border-primary/40" : "border-border hover:border-primary/20"}`}
                  onClick={() => setExpandedArc(isExpanded ? null : arc.num)}
                >
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-heading tracking-wider border ${statusBadge(arc.status)}`}>
                        {arc.num}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading text-base text-foreground tracking-wider truncate">{arc.title}</h3>
                        <p className="text-xs text-muted-foreground font-body">Ep {arc.episodes} • Ch {arc.chapters}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-heading tracking-wider ${statusColor(arc.status)}`}>
                        {arc.status === "completed" ? "Completed" : arc.status === "airing" ? "Now Airing" : "Upcoming"}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 border-t border-border/50"
                    >
                      <p className="text-foreground/80 font-body text-sm leading-relaxed pt-4">{arc.desc}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Story Highlights & Fan Predictions side by side */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Story Highlights */}
            <div className="gradient-card border border-border rounded-lg p-6">
              <h3 className="font-heading text-lg text-primary tracking-wider mb-4">Story Highlights</h3>
              <div className="space-y-3">
                {storyHighlights.map((h) => (
                  <div key={h.label} className="flex gap-3">
                    <span className="text-xs font-heading text-muted-foreground tracking-wider w-24 shrink-0 pt-0.5">{h.label}</span>
                    <span className="text-sm font-body text-foreground/80">{h.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-xs font-heading text-muted-foreground tracking-wider mb-2">Notable Arcs</p>
                <div className="flex flex-wrap gap-2">
                  {["Ji Realm Awakening", "Ancient God Lands", "Final Confrontation"].map((a) => (
                    <span key={a} className="text-xs font-body px-2.5 py-1 rounded-full border border-primary/20 text-primary/80 bg-primary/5">{a}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fan Predictions */}
            <div className="gradient-card border border-border rounded-lg p-6">
              <h3 className="font-heading text-lg text-primary tracking-wider mb-4">Completion Predictions</h3>
              <div className="space-y-4">
                {fanPredictions.map((p) => (
                  <div key={p.label} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${p.label === "Optimistic" ? "bg-jade" : p.label === "Reasonable" ? "bg-primary" : "bg-muted-foreground"}`} />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading text-sm text-foreground tracking-wider">{p.label}</span>
                        <span className="font-heading text-primary text-sm">{p.year}</span>
                      </div>
                      <p className="text-xs font-body text-muted-foreground mt-0.5">{p.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-xs font-body text-muted-foreground">Based on adaptation rate of ~5–7 chapters/episode and weekly releases. Seasonal breaks may adjust timelines.</p>
              </div>
            </div>
          </div>

          {/* Where to Watch */}
          <div className="gradient-card border border-border rounded-lg p-6 mb-12">
            <h3 className="font-heading text-lg text-primary tracking-wider mb-4">Where to Watch & Read</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Read the Novel", sub: "WuxiaWorld", url: "https://www.wuxiaworld.com/novel/renegade-immortal" },
                { label: "Watch Donghua", sub: "Tencent Video / WeTV", url: "#" },
                { label: "Fan Community", sub: "Reddit r/Donghua", url: "https://www.reddit.com/r/Donghua" },
                { label: "Wiki", sub: "Xian Ni Fandom Wiki", url: "https://xian-ni.fandom.com/wiki/Xian_Ni_Wiki" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <div>
                    <p className="text-sm font-heading text-foreground tracking-wider group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-xs font-body text-muted-foreground">{link.sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
            This page aggregates publicly available information and fan estimates. Actual release dates and episode counts may vary according to studio production schedules.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default DonghuaPage;
