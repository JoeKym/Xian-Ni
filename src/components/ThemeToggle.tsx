import { useTheme } from "next-themes";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const YinYangIcon = ({ isDark, size = 18 }: { isDark: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer circle */}
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
    {/* Dark half (right) */}
    <path
      d="M12 1 A11 11 0 0 1 12 23 A5.5 5.5 0 0 1 12 12 A5.5 5.5 0 0 0 12 1Z"
      fill="currentColor"
    />
    {/* Light dot in dark half */}
    <circle cx="12" cy="6.5" r="1.8" fill="hsl(var(--background))" />
    {/* Dark dot in light half */}
    <circle cx="12" cy="17.5" r="1.8" fill="currentColor" />
  </svg>
);

const QI_SYMBOLS = ["氣", "道", "陰", "陽", "仙", "靈", "魔", "劍"];

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
  delay: number;
  dx: number;
  dy: number;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticles = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      symbol: QI_SYMBOLS[Math.floor(Math.random() * QI_SYMBOLS.length)],
      delay: Math.random() * 0.3,
      dx: (Math.random() - 0.5) * 60,
      dy: (Math.random() - 0.5) * 60,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }, []);

  const handleToggle = () => {
    setIsTransitioning(true);
    spawnParticles();
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setIsTransitioning(false), 1200);
  };

  const isDark = theme === "dark";

  return (
    <>
      {/* Full-screen cultivation breakthrough flash */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: isDark
                ? "radial-gradient(circle at center, hsl(var(--primary) / 0.8), hsl(270 80% 20% / 0.4), transparent 70%)"
                : "radial-gradient(circle at center, hsl(45 100% 70% / 0.8), hsl(30 100% 50% / 0.3), transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Qi particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="fixed z-[10000] pointer-events-none text-primary font-bold select-none"
            style={{ left: `${p.x}vw`, top: `${p.y}vh`, fontSize: "1.1rem" }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.2, 1, 0.5],
              x: p.dx * 3,
              y: p.dy * 3,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
          >
            {p.symbol}
          </motion.span>
        ))}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className="relative p-2 rounded-md text-muted-foreground hover:text-primary transition-colors overflow-hidden"
        aria-label={isDark ? "Switch to Righteous Path (Light)" : "Switch to Demonic Path (Dark)"}
        title={isDark ? "☯ Righteous Path (陽)" : "☯ Demonic Path (陰)"}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="block"
          >
            <YinYangIcon isDark={isDark} size={20} />
          </motion.span>
        </AnimatePresence>

        {/* Qi ripple on click */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </button>
    </>
  );
}
