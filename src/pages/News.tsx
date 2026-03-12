import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Newspaper, ExternalLink, RefreshCw, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
  tag?: string;
}

const officialSources = [
  { name: "Bilibili (仙逆)", url: "https://www.bilibili.com/bangumi/media/md28238644/" },
  { name: "Tencent Video", url: "https://v.qq.com/x/cover/mzc00200c29xqbx.html" },
  { name: "MyAnimeList", url: "https://myanimelist.net/anime/49468/Xian_Ni" },
  { name: "AniList", url: "https://anilist.co/anime/136468/Xian-Ni" },
  { name: "Novel Updates", url: "https://www.novelupdates.com/series/renegade-immortal/" },
  { name: "Wuxia World", url: "https://www.wuxiaworld.com/" },
];

const staticNews: NewsItem[] = [
  {
    title: "Renegade Immortal Season 6 Announced",
    url: "https://www.bilibili.com/bangumi/media/md28238644/",
    source: "Bilibili",
    date: "2026-02-15",
    snippet: "The highly anticipated Season 6 of Xian Ni has been officially confirmed, continuing Wang Lin's journey through the Star System.",
    tag: "Announcement",
  },
  {
    title: "Xian Ni Donghua Reaches 200+ Episodes Milestone",
    url: "https://myanimelist.net/anime/49468/Xian_Ni",
    source: "MyAnimeList",
    date: "2026-01-20",
    snippet: "The Renegade Immortal donghua adaptation has surpassed 200 episodes, making it one of the longest-running cultivation anime adaptations.",
    tag: "Milestone",
  },
  {
    title: "Er Gen's Renegade Immortal Novel Completes Official English Translation",
    url: "https://www.novelupdates.com/series/renegade-immortal/",
    source: "Novel Updates",
    date: "2025-12-01",
    snippet: "The complete official English translation of Renegade Immortal (仙逆) is now available, spanning all 2088 chapters.",
    tag: "Novel",
  },
  {
    title: "New Renegade Immortal Merchandise Collection Released",
    url: "https://www.bilibili.com/",
    source: "Bilibili",
    date: "2025-11-10",
    snippet: "Official Wang Lin figurines and art books from the Xian Ni donghua are now available for pre-order.",
    tag: "Merchandise",
  },
  {
    title: "Xian Ni OST Volume 3 Released on Streaming Platforms",
    url: "https://open.spotify.com/",
    source: "Spotify",
    date: "2025-10-05",
    snippet: "The third volume of the Renegade Immortal original soundtrack featuring themes from Season 5 is now streaming worldwide.",
    tag: "Music",
  },
];

const tagColors: Record<string, string> = {
  Announcement: "bg-crimson/10 text-crimson",
  Milestone: "bg-jade/10 text-jade",
  Novel: "bg-primary/10 text-primary",
  Merchandise: "bg-void/10 text-void",
  Music: "bg-accent/10 text-accent",
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>(staticNews);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-news");
      if (!error && data?.success && data.data?.length > 0) {
        setNews(data.data);
        setLiveMode(true);
      } else {
        // Fallback to static
        setNews(staticNews);
        setLiveMode(false);
      }
    } catch {
      setNews(staticNews);
      setLiveMode(false);
    }
  };

  useEffect(() => {
    fetchNews().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  return (
    <Layout>
      <PageHero
        title="News"
        subtitle="Stay updated with the latest Renegade Immortal news from official sources"
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-heading text-lg text-primary tracking-wider flex items-center gap-2">
              <TrendingUp size={20} />
              {liveMode ? "Live Updates" : "Latest Updates"}
              {liveMode && (
                <span className="ml-2 w-2 h-2 rounded-full bg-jade animate-pulse" />
              )}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="gap-2 text-xs"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="gradient-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* News Feed */}
          {!loading && (
            <div className="space-y-4">
              {news.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="block gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {item.tag && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${tagColors[item.tag] || "bg-muted text-muted-foreground"}`}>
                            {item.tag}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-body">{item.source}</span>
                      </div>
                      <h3 className="font-heading text-foreground group-hover:text-primary transition-colors tracking-wider mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed mb-3">
                        {item.snippet}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <Clock size={10} />
                        {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {/* Live status note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="gradient-card border border-border rounded-lg p-4 mt-8 flex items-start gap-3"
          >
            <Newspaper size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground font-body">
              {liveMode
                ? "Showing live news fetched from the web. Click Refresh for the latest updates."
                : "Showing curated updates. Live news fetching will activate when the news service is available."}
            </p>
          </motion.div>

          {/* Official Sources */}
          <div className="mt-12">
            <h2 className="font-heading text-lg text-primary tracking-wider mb-6">Official Sources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {officialSources.map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gradient-card border border-border rounded-lg p-4 hover:border-primary/30 transition-all flex items-center justify-between group"
                >
                  <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">
                    {src.name}
                  </span>
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
