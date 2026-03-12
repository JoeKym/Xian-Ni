import { Play, Monitor } from "lucide-react";
import { motion } from "framer-motion";

interface EpisodeCardProps {
  number: number;
  title: string;
  thumbnail?: string;
  isSelected: boolean;
  onClick: () => void;
}

export function EpisodeCard({ number, title, thumbnail, isSelected, onClick }: EpisodeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group rounded-lg overflow-hidden border transition-all text-left ${
        isSelected
          ? "border-primary ring-1 ring-primary/50"
          : "border-border hover:border-primary/30"
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
            <Monitor size={24} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
            <Play size={18} className="text-primary-foreground ml-0.5" />
          </div>
        </div>
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-background/80 text-[10px] font-body text-foreground">
          EP {number}
        </span>
      </div>
      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-body text-foreground truncate">{title}</p>
      </div>
    </motion.button>
  );
}
