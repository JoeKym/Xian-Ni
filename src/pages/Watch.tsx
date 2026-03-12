import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import {
  Play, Search, Loader2, Star, Calendar, ChevronLeft, ChevronRight,
  Tv, Clock, List, Grid, Volume2
} from "lucide-react";
import { VideoPlayer } from "@/components/watch/VideoPlayer";

interface AniListData {
  id: number;
  title: { romaji: string; english: string | null; native: string };
  episodes: number | null;
  nextAiringEpisode: { airingAt: number; episode: number; timeUntilAiring: number } | null;
  status: string;
  averageScore: number | null;
  meanScore: number | null;
  coverImage: { extraLarge: string; large: string; medium: string };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  streamingEpisodes: { title: string; thumbnail: string; url: string; site: string }[] | null;
  studios: { nodes: { name: string }[] };
}

// Query multiple Xian Ni entries and pick the best metadata
const ANILIST_QUERY = `
  query {
    Page(perPage: 10) {
      media(search: "Xian Ni", type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji english native }
        episodes
        nextAiringEpisode { airingAt episode timeUntilAiring }
        status
        averageScore
        meanScore
        description(asHtml: false)
        coverImage { extraLarge large medium }
        bannerImage
        genres
        studios { nodes { name } }
        streamingEpisodes { title thumbnail url site }
      }
    }
  }
`;

const seasonLabels: { maxEp: number; title: string }[] = [
  { maxEp: 39, title: "Heng Yue Sect Arc" },
  { maxEp: 78, title: "Zhao Kingdom Arc" },
  { maxEp: 118, title: "Sea of Devils Arc" },
  { maxEp: 158, title: "Tian Gang Sect Arc" },
  { maxEp: 198, title: "Allheaven Arc" },
  { maxEp: 9999, title: "Star System Arc" },
];

function getArcForEpisode(ep: number): string {
  for (const s of seasonLabels) {
    if (ep <= s.maxEp) return s.title;
  }
  return seasonLabels[seasonLabels.length - 1].title;
}

function formatTimeUntil(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function WatchPage() {
  const [search, setSearch] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [aniData, setAniData] = useState<AniListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const episodeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // --- AniList (primary metadata) ---
        const aniRes = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ query: ANILIST_QUERY }),
        });
        const aniJson = aniRes.ok ? await aniRes.json() : null;

        const mediaList: AniListData[] = aniJson?.data?.Page?.media || [];
        const relevant = mediaList.filter((m) => {
          const names = [m.title?.romaji, m.title?.english, m.title?.native].filter(Boolean).join(" ").toLowerCase();
          return names.includes("xian ni") || names.includes("renegade immortal") || names.includes("仙逆");
        });
        const pool = relevant.length > 0 ? relevant : mediaList.slice(0, 1);

        if (pool.length === 0) {
          setError("Could not find Renegade Immortal data.");
          setLoading(false);
          return;
        }

        const primary = pool.find((m) => m.status === "RELEASING") ||
          pool.reduce((a, b) => (a.episodes || 0) >= (b.episodes || 0) ? a : b);

        const anilistTotal = pool.reduce((sum, m) => sum + (m.episodes || 0), 0);
        const allStreamingEps = pool.flatMap((m) => m.streamingEpisodes || []);

        // --- Jikan / MyAnimeList (more complete episode counts for donghua) ---
        let jikanTotal = 0;
        let jikanNextAiring: AniListData["nextAiringEpisode"] | null = null;
        try {
          const jRes = await fetch(
            "https://api.jikan.moe/v4/anime?q=xian+ni&type=ona&limit=25&order_by=popularity&sort=asc"
          );
          if (jRes.ok) {
            const jData = await jRes.json();
            const jList: { title: string; title_english: string | null; episodes: number | null; status: string; airing: boolean }[] =
              jData?.data || [];
            const jRelevant = jList.filter((a) => {
              const n = [a.title, a.title_english].filter(Boolean).join(" ").toLowerCase();
              return n.includes("xian ni") || n.includes("renegade immortal");
            });
            jikanTotal = jRelevant.reduce((sum, a) => sum + (a.episodes || 0), 0);
            // If a season is still airing on Jikan with no episode count, treat it as ongoing
            const airingEntry = jRelevant.find((a) => a.airing);
            if (airingEntry && !airingEntry.episodes) {
              // We know it's airing but MAL doesn't have a count yet — skip
            }
          }
        } catch (_) { /* Jikan failure is non-fatal */ }

        // Known released count as of March 2026: 131 (132 next).
        // Jikan sometimes over-counts by including unreleased future episodes across seasons.
        // We trust API data only if it falls within a reasonable window of the known count.
        const KNOWN_RELEASED = 131;
        const apiMax = Math.max(anilistTotal || 0, jikanTotal || 0);
        const bestTotal = (apiMax >= KNOWN_RELEASED && apiMax <= KNOWN_RELEASED + 30)
          ? apiMax
          : KNOWN_RELEASED;

        setAniData({
          ...primary,
          episodes: bestTotal,
          streamingEpisodes: allStreamingEps.length > 0 ? allStreamingEps : primary.streamingEpisodes,
          // Keep nextAiringEpisode from AniList if the show is currently airing
          nextAiringEpisode: primary.nextAiringEpisode ?? jikanNextAiring,
        });
      } catch (e) {
        console.error("Data fetch failed:", e);
        setError("Failed to load show data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Only released episodes
  // AniList often returns null episodes for Chinese ONA donghua.
  // We compute from nextAiringEpisode if available, then episodes, then streamingEpisodes count, then a known minimum.
  const releasedCount = useMemo(() => {
    if (!aniData) return 0;
    if (aniData.nextAiringEpisode) return aniData.nextAiringEpisode.episode - 1;
    if (aniData.episodes) return aniData.episodes;
    // Use the highest episode number found in streamingEpisodes
    if (aniData.streamingEpisodes?.length) {
      const nums = aniData.streamingEpisodes.map((se) => {
        const m = se.title?.match(/Episode\s+(\d+)/i);
        return m ? parseInt(m[1]) : 0;
      });
      const max = Math.max(...nums);
      if (max > 0) return max;
    }
    // Last resort: minimum known episode count (130+)
    return 130;
  }, [aniData]);

  const thumbnailMap = useMemo(() => {
    const map = new Map<number, string>();
    if (aniData?.streamingEpisodes) {
      for (const se of aniData.streamingEpisodes) {
        const match = se.title?.match(/Episode\s+(\d+)/i);
        if (match && se.thumbnail) map.set(parseInt(match[1]), se.thumbnail);
      }
    }
    return map;
  }, [aniData]);

  const allEpisodes = useMemo(() => {
    if (releasedCount === 0) return [];
    return Array.from({ length: releasedCount }, (_, i) => {
      const num = i + 1;
      return { number: num, arc: getArcForEpisode(num), thumbnail: thumbnailMap.get(num) };
    });
  }, [releasedCount, thumbnailMap]);

  const filtered = useMemo(() => {
    if (!search) return allEpisodes;
    const q = search.toLowerCase();
    return allEpisodes.filter(
      (ep) => ep.number.toString().includes(q) || ep.arc.toLowerCase().includes(q)
    );
  }, [search, allEpisodes]);

  const selectedData = selectedEpisode
    ? allEpisodes.find((e) => e.number === selectedEpisode)
    : null;

  const handleEpisodeSelect = (num: number) => {
    setSelectedEpisode(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (selectedEpisode && selectedEpisode > 1) handleEpisodeSelect(selectedEpisode - 1);
  };
  const handleNext = () => {
    if (selectedEpisode && selectedEpisode < releasedCount) handleEpisodeSelect(selectedEpisode + 1);
  };

  const studio = aniData?.studios?.nodes?.[0]?.name;
  const title = aniData?.title?.english || aniData?.title?.romaji || "Renegade Immortal";

  return (
    <Layout>
      {/* Banner */}
      <div
        className="relative h-48 sm:h-64 overflow-hidden"
        style={{
          backgroundImage: aniData?.bannerImage
            ? `url(${aniData.bannerImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundColor: "hsl(228 15% 7%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex items-end gap-5">
          {aniData?.coverImage && (
            <img
              src={aniData.coverImage.large}
              alt={title}
              className="hidden sm:block w-24 h-36 object-cover rounded-lg border border-border shadow-xl flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs text-primary font-body tracking-widest uppercase mb-1">仙逆 · Xian Ni</p>
            <h1 className="text-2xl sm:text-3xl font-heading text-foreground tracking-wider leading-tight truncate">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {aniData?.averageScore && (
                <span className="flex items-center gap-1 text-xs text-yellow-400 font-body">
                  <Star size={12} fill="currentColor" /> {aniData.averageScore / 10}/10
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                <Tv size={12} /> {releasedCount} episodes
              </span>
              {aniData?.status && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                  <Volume2 size={12} />
                  {aniData.status === "RELEASING" ? (
                    <span className="text-green-400">Airing</span>
                  ) : aniData.status}
                </span>
              )}
              {studio && (
                <span className="text-xs text-muted-foreground font-body">{studio}</span>
              )}
            </div>
            {aniData?.genres && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {aniData.genres.slice(0, 4).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body border border-primary/20">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next episode countdown */}
      {aniData?.nextAiringEpisode && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 max-w-7xl py-2 flex items-center gap-2">
            <Clock size={13} className="text-primary flex-shrink-0" />
            <span className="text-xs font-body text-muted-foreground">
              Episode {aniData.nextAiringEpisode.episode} airs in{" "}
              <span className="text-primary font-semibold">
                {formatTimeUntil(aniData.nextAiringEpisode.timeUntilAiring)}
              </span>
              {" "}·{" "}
              {new Date(aniData.nextAiringEpisode.airingAt * 1000).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 max-w-7xl py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={36} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-body text-sm">Connecting to AniList...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-destructive font-body mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-primary hover:underline font-body"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT: Player + Info */}
            <div className="flex-1 min-w-0">
              {selectedEpisode ? (
                <motion.div
                  key={selectedEpisode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Now playing bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">Now Playing</p>
                      <h2 className="text-sm font-heading text-foreground tracking-wide">
                        Episode {selectedEpisode} — {selectedData?.arc}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={selectedEpisode <= 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed text-xs font-body transition-colors"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={selectedEpisode >= releasedCount}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed text-xs font-body transition-colors"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <VideoPlayer episode={selectedEpisode} onEnded={handleNext} />

                  {/* Description */}
                  {aniData?.description && (
                    <div className="mt-4 p-4 gradient-card border border-border rounded-lg">
                      <h3 className="text-xs font-heading text-muted-foreground tracking-wider uppercase mb-2">About</h3>
                      <p className="text-sm font-body text-muted-foreground leading-relaxed line-clamp-4">
                        {aniData.description.replace(/<[^>]*>/g, "")}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* No episode selected — show cover card */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="gradient-card border border-border rounded-xl overflow-hidden"
                >
                  <div
                    className="relative w-full flex items-center justify-center"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <div className="absolute inset-0">
                      {aniData?.bannerImage ? (
                        <img src={aniData.bannerImage} alt="banner" className="w-full h-full object-cover opacity-40" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Play size={36} className="text-primary ml-1" />
                      </div>
                      <div>
                        <p className="text-foreground font-heading tracking-wider text-lg mb-1">Select an Episode</p>
                        <p className="text-muted-foreground font-body text-sm">
                          Choose any of the {releasedCount} released episodes from the list
                        </p>
                      </div>
                      <button
                        onClick={() => handleEpisodeSelect(1)}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-heading tracking-wider hover:bg-primary/90 transition-colors"
                      >
                        Start from Episode 1
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT: Episode List */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="gradient-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: "80vh" }}>
                {/* Episode list header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <List size={15} className="text-primary" />
                      <span className="text-xs font-heading text-foreground tracking-wider">
                        Episodes ({releasedCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Grid size={13} />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <List size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search episodes or arcs..."
                      className="w-full pl-8 pr-3 py-2 bg-muted/40 border border-border rounded-lg text-xs font-body text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Episodes scrollable */}
                <div ref={episodeListRef} className="overflow-y-auto flex-1 p-3">
                  <AnimatePresence mode="popLayout">
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
                        {filtered.map((ep) => (
                          <motion.button
                            key={ep.number}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleEpisodeSelect(ep.number)}
                            className={`relative rounded-md py-2 text-xs font-body transition-all border ${
                              selectedEpisode === ep.number
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-border"
                            }`}
                          >
                            {ep.number}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filtered.map((ep) => (
                          <motion.button
                            key={ep.number}
                            layout
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleEpisodeSelect(ep.number)}
                            className={`w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-all border ${
                              selectedEpisode === ep.number
                                ? "bg-primary/10 border-primary/40 text-foreground"
                                : "border-transparent hover:bg-muted/40 hover:border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {ep.thumbnail ? (
                              <img
                                src={ep.thumbnail}
                                alt={`ep ${ep.number}`}
                                className="w-16 h-10 object-cover rounded flex-shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-16 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                                <Play size={14} className="text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-heading tracking-wide text-inherit">
                                {selectedEpisode === ep.number && (
                                  <span className="text-primary mr-1">▶</span>
                                )}
                                Episode {ep.number}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-body truncate">{ep.arc}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>

                  {filtered.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs font-body py-8">
                      No episodes match your search
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
