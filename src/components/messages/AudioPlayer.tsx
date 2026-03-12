import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  isOwnMessage: boolean;
}

export function AudioPlayer({ src, isOwnMessage }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (secs: number) => {
    if (!isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          if (audioRef.current && duration > 0) {
            setProgress((audioRef.current.currentTime / duration) * 100);
          }
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button
        onClick={togglePlay}
        className={`p-1 rounded-full shrink-0 transition-colors ${isOwnMessage ? "hover:bg-primary-foreground/20" : "hover:bg-muted-foreground/20"}`}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="w-full h-1 rounded-full bg-current/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isOwnMessage ? "bg-primary-foreground/60" : "bg-primary/60"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-[9px] ${isOwnMessage ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {playing ? formatTime(audioRef.current?.currentTime || 0) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
