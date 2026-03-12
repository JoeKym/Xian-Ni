import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, Radio, Circle } from "lucide-react";

const timelineData = [
  {
    season: "Season 1",
    episodes: "Ep 1–50",
    date: "Jan 2023 – Dec 2023",
    status: "completed" as const,
    milestones: ["Ji Realm Awakening", "Heng Yue Sect Arc", "Bead Discovery"],
  },
  {
    season: "Season 2",
    episodes: "Ep 51–100",
    date: "Jan 2024 – Dec 2024",
    status: "completed" as const,
    milestones: ["Underworld Dao", "Corporeal Realm", "First Betrayals"],
  },
  {
    season: "Season 3",
    episodes: "Ep 101–150",
    date: "Jan 2025 – Est. Dec 2025",
    status: "airing" as const,
    milestones: ["Ancient God Heritage", "Dao of Slaughter", "Tuo Sen Emergence"],
  },
  {
    season: "Season 4",
    episodes: "Ep 151–200",
    date: "Est. Q1 2026 – Q4 2026",
    status: "upcoming" as const,
    milestones: ["Life & Death Dao", "Karma Dao", "True/False Dao"],
  },
  {
    season: "Season 5",
    episodes: "Ep 201–250",
    date: "Est. Q1 2027 – Q4 2027",
    status: "upcoming" as const,
    milestones: ["Space/Time Mastery", "Cave System Truth", "Celestial Pursuit"],
  },
  {
    season: "Season 6",
    episodes: "Ep 251–300+",
    date: "Est. Q1 2028 – Q2 2029",
    status: "upcoming" as const,
    milestones: ["Ancient God Essence", "Heaven Defiance", "True Transcendence"],
  },
];

const statusIcon = (s: "completed" | "airing" | "upcoming") => {
  if (s === "completed") return <CheckCircle2 className="w-5 h-5 text-jade" />;
  if (s === "airing") return <Radio className="w-5 h-5 text-primary animate-pulse" />;
  return <Circle className="w-5 h-5 text-muted-foreground" />;
};

const statusLine = (s: "completed" | "airing" | "upcoming") =>
  s === "completed" ? "bg-jade" : s === "airing" ? "bg-primary" : "bg-border";

export const ReleaseTimeline = () => {
  return (
    <div className="gradient-card border border-border rounded-lg p-6 mb-12">
      <h3 className="font-heading text-lg text-primary tracking-wider mb-6 flex items-center gap-2">
        <Calendar className="w-4 h-4" /> Release Timeline
      </h3>

      <div className="relative">
        {timelineData.map((item, i) => (
          <motion.div
            key={item.season}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-4 pb-8 last:pb-0"
          >
            {/* Vertical line + icon */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative z-10 bg-background p-0.5 rounded-full">
                {statusIcon(item.status)}
              </div>
              {i < timelineData.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 rounded-full ${statusLine(item.status)}`} />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 -mt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <h4 className="font-heading text-sm text-foreground tracking-wider">{item.season}</h4>
                <span className="text-xs font-body text-primary">{item.episodes}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs font-body text-muted-foreground">{item.date}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.milestones.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-body px-2 py-0.5 rounded-full border border-border bg-muted/40 text-foreground/70"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-body mt-4 border-t border-border/50 pt-4">
        Estimated dates based on current weekly release schedule (~50 episodes/year). Seasonal breaks and production delays may shift timelines.
      </p>
    </div>
  );
};
