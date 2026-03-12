import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Tv, ArrowRightLeft, Info } from "lucide-react";

// Detailed mapping: each entry is [episodeStart, episodeEnd, chapterStart, chapterEnd, arcName]
const episodeMap: [number, number, number, number, string][] = [
  [1, 10, 1, 50, "Heng Yue Sect"],
  [11, 20, 51, 100, "Cultivation Beginnings"],
  [21, 30, 101, 150, "Ancient Bead Awakening"],
  [31, 40, 151, 200, "Zhao Country Trials"],
  [41, 50, 201, 250, "Ji Realm Climax"],
  [51, 60, 251, 350, "Sea of Devils"],
  [61, 70, 351, 430, "Corpse Sect Arc"],
  [71, 80, 431, 500, "Underworld Dao"],
  [81, 90, 501, 560, "Suzaku Star"],
  [91, 100, 561, 600, "Corporeal Realm Ascension"],
  [101, 110, 601, 700, "Allheaven Star System"],
  [111, 120, 701, 780, "Ancient God Awakening"],
  [121, 128, 781, 850, "Dao of Slaughter"],
  [129, 140, 851, 950, "Demon Sect Infiltration"],
  [141, 150, 951, 1000, "Tuo Sen Confrontation"],
  [151, 170, 1001, 1200, "Life & Death Dao"],
  [171, 185, 1201, 1300, "Karma Dao"],
  [186, 200, 1301, 1400, "True/False Dao"],
  [201, 220, 1401, 1600, "Space/Time Mastery"],
  [221, 250, 1601, 1800, "Cave System Revelation"],
  [251, 280, 1801, 1950, "Celestial War"],
  [281, 300, 1951, 2100, "True Transcendence"],
];

type Mode = "chapter" | "episode";

interface Result {
  episodes: string;
  chapters: string;
  arc: string;
}

export const ChapterConverter = () => {
  const [mode, setMode] = useState<Mode>("chapter");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const num = parseInt(input);
    if (isNaN(num) || num < 1) {
      setResults([]);
      setSearched(true);
      return;
    }

    const found = episodeMap.filter(([epS, epE, chS, chE]) => {
      if (mode === "chapter") return num >= chS && num <= chE;
      return num >= epS && num <= epE;
    });

    setResults(
      found.map(([epS, epE, chS, chE, arc]) => ({
        episodes: `${epS}–${epE}`,
        chapters: `${chS}–${chE}`,
        arc,
      }))
    );
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="gradient-card border border-border rounded-lg p-6 mb-12">
      <h3 className="font-heading text-lg text-primary tracking-wider mb-2 flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4" /> Chapter ↔ Episode Converter
      </h3>
      <p className="text-xs font-body text-muted-foreground mb-5">
        Look up which episodes adapt a specific novel chapter, or which chapters an episode covers.
      </p>

      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit mb-4">
        {[
          { key: "chapter" as Mode, icon: BookOpen, label: "Chapter → Episode" },
          { key: "episode" as Mode, icon: Tv, label: "Episode → Chapter" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setResults([]); setSearched(false); setInput(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading tracking-wider transition-colors ${
              mode === m.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <m.icon className="w-3 h-3" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="number"
            min={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "chapter" ? "Enter chapter number (e.g. 450)" : "Enter episode number (e.g. 75)"}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-heading text-xs tracking-wider hover:bg-primary/90 transition-colors shrink-0"
        >
          Look Up
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-heading text-foreground tracking-wider">Ep {r.episodes}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">↔</span>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-heading text-foreground tracking-wider">Ch {r.chapters}</span>
                    </div>
                    <span className="text-xs font-body px-2 py-0.5 rounded-full border border-primary/20 text-primary/80 bg-primary/5 ml-auto">
                      {r.arc}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground font-body">
                  No match found. {mode === "chapter" ? "Try a chapter between 1–2100." : "Try an episode between 1–300."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground font-body mt-4 flex items-center gap-1 border-t border-border/50 pt-3">
        <Info className="w-3 h-3 shrink-0" /> Mappings are approximate (~5–7 chapters per episode). Actual pacing varies by arc.
      </p>
    </div>
  );
};
