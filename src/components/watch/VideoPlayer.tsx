import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Loader2, AlertTriangle, MonitorPlay, RefreshCw,
  Maximize2, ExternalLink, ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Server {
  name: string;
  label: string;
  directUrl: (ep: number) => string;
}

const SERVERS: Server[] = [
  {
    name: "luciferdonghua",
    label: "Lucifer Donghua",
    directUrl: (ep) => `https://luciferdonghua.org/renegade-immortal-xian-ni-episode-${ep}-english-sub/`,
  },
  {
    name: "luciferdonghua-alt",
    label: "Lucifer Donghua (Alt)",
    directUrl: (ep) => `https://luciferdonghua.org/renegade-immortal-xian-ni-episode-${ep}-english-subtitles/`,
  },
  {
    name: "donghuastream",
    label: "DonghuaStream",
    directUrl: (ep) => `https://donghuastream.org/episode/renegade-immortal-episode-${ep}/`,
  },
  {
    name: "anime4i",
    label: "Anime4i",
    directUrl: (ep) => `https://anime4i.com/renegade-immortal-xian-ni-episode-${ep}-english-subtitles`,
  },
];

interface VideoPlayerProps {
  episode: number;
  onEnded?: () => void;
}

type LoadState = "loading" | "playing" | "error";

export function VideoPlayer({ episode, onEnded }: VideoPlayerProps) {
  const [activeServer, setActiveServer] = useState(0);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [serverStatuses, setServerStatuses] = useState<Record<string, "ok" | "fail" | "unknown">>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const fetchEmbed = useCallback(async (serverIndex: number) => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    fetchControllerRef.current = new AbortController();

    setLoadState("loading");
    setEmbedUrl(null);
    setActiveServer(serverIndex);

    const server = SERVERS[serverIndex];
    if (!server) {
      setLoadState("error");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("fetch-video-source", {
        body: { episode, server: server.name },
      });

      if (error) throw new Error(error.message);

      if (data?.success && data?.embedUrl) {
        setEmbedUrl(data.embedUrl);
        setLoadState("loading");
        setServerStatuses((prev) => ({ ...prev, [server.name]: "ok" }));
      } else {
        throw new Error("No embed URL returned");
      }
    } catch (e) {
      console.warn(`Server ${server.name} failed:`, e);
      setServerStatuses((prev) => ({ ...prev, [server.name]: "fail" }));

      const nextIndex = serverIndex + 1;
      if (nextIndex < SERVERS.length) {
        fetchEmbed(nextIndex);
      } else {
        setLoadState("error");
      }
    }
  }, [episode]);

  useEffect(() => {
    setServerStatuses({});
    setEmbedUrl(null);
    fetchEmbed(0);
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, [episode, fetchEmbed]);

  const handleServerClick = (index: number) => {
    setServerStatuses((prev) => {
      const copy = { ...prev };
      delete copy[SERVERS[index].name];
      return copy;
    });
    fetchEmbed(index);
  };

  const handleIframeLoad = () => {
    setLoadState("playing");
  };

  const handleRetry = () => {
    setServerStatuses({});
    fetchEmbed(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="gradient-card border border-border rounded-xl overflow-hidden">
      {/* Video area */}
      <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>

        {/* Loading overlay */}
        {loadState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <MonitorPlay size={22} className="text-primary absolute inset-0 m-auto" />
            </div>
            <p className="text-sm text-foreground font-heading tracking-wider mb-1">
              {SERVERS[activeServer]?.label}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Loading Episode {episode}...
            </p>
          </div>
        )}

        {/* Error state */}
        {loadState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center">
            <AlertTriangle size={36} className="text-destructive mb-3" />
            <p className="text-sm font-heading text-foreground tracking-wider mb-1">Stream Unavailable</p>
            <p className="text-xs text-muted-foreground font-body mb-5">
              All servers failed to load Episode {episode}. Try again or watch on the source site.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-body hover:bg-primary/90 transition-colors"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SERVERS.map((srv) => (
                <a
                  key={srv.name}
                  href={srv.directUrl(episode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground rounded text-xs font-body transition-colors border border-border"
                >
                  <ExternalLink size={11} /> {srv.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Iframe player */}
        {embedUrl && (
          <iframe
            ref={iframeRef}
            key={`${episode}-${activeServer}-${embedUrl}`}
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            onLoad={handleIframeLoad}
            title={`Renegade Immortal Episode ${episode}`}
          />
        )}

        {/* Fullscreen button */}
        {loadState === "playing" && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
          >
            <Maximize2 size={15} />
          </button>
        )}
      </div>

      {/* Controls bar */}
      <div className="p-3 border-t border-border bg-card/50">
        {/* Server selector */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <MonitorPlay size={13} className="text-primary" />
            <span className="text-[11px] font-heading text-muted-foreground tracking-wider uppercase">
              Servers
            </span>
          </div>
          <button
            onClick={() => setShowSources((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-body transition-colors"
          >
            <ExternalLink size={11} /> Sources
            <ChevronDown size={11} className={`transition-transform ${showSources ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SERVERS.map((srv, i) => {
            const status = serverStatuses[srv.name];
            const isActive = activeServer === i && loadState !== "error";
            return (
              <button
                key={srv.name}
                onClick={() => handleServerClick(i)}
                className={`relative px-3 py-1.5 rounded text-xs font-body transition-all ${
                  isActive && loadState === "playing"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isActive && loadState === "loading"
                    ? "bg-primary/40 text-primary-foreground"
                    : status === "fail"
                    ? "bg-destructive/10 text-destructive/70 hover:bg-destructive/20 line-through"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {srv.label}
                {isActive && loadState === "loading" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Direct source links (collapsible) */}
        {showSources && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border"
          >
            <p className="text-[10px] text-muted-foreground font-body mb-2">Watch on source sites:</p>
            <div className="flex flex-wrap gap-1.5">
              {SERVERS.map((srv) => (
                <a
                  key={srv.name}
                  href={srv.directUrl(episode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/70 text-[10px] font-body text-muted-foreground hover:text-foreground transition-colors border border-border"
                >
                  <ExternalLink size={10} />
                  {srv.label}
                </a>
              ))}
              <a
                href={`https://gogoanime3.co/xian-ni-episode-${episode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/70 text-[10px] font-body text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                <ExternalLink size={10} /> Gogoanime
              </a>
              <a
                href={`https://hianime.to/watch/xian-ni`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/70 text-[10px] font-body text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                <ExternalLink size={10} /> HiAnime
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
