import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { searchableData, type SearchResult } from "@/data/searchData";

const fuse = new Fuse(searchableData, {
  keys: [
    { name: "title", weight: 2 },
    { name: "category", weight: 1 },
    { name: "description", weight: 0.8 },
  ],
  threshold: 0.3,
  includeScore: true,
});

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 12).map((r) => r.item);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="w-full max-w-xl mx-4 rounded-lg border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-primary" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search characters, daos, artifacts, locations..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-lg"
              />
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-xs font-heading text-primary uppercase tracking-wider mt-0.5 shrink-0">
                      {result.category}
                    </span>
                    <div>
                      <p className="text-foreground font-body">{result.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{result.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query && results.length === 0 && (
              <p className="p-4 text-center text-muted-foreground font-body">No results found</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
