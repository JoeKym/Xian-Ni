import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

/** Generate a jagged lightning path with random branches */
function generateBolt(
  startX: number, startY: number, endY: number, spread: number, segments: number, seed: number
): { main: string; branches: string[] } {
  const pts: [number, number][] = [[startX, startY]];
  const branches: string[] = [];
  const rng = (i: number) => Math.sin(seed * 9301 + i * 4973) * 0.5 + 0.5;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const y = startY + (endY - startY) * t;
    const prevX = pts[pts.length - 1][0];
    const jitter = (rng(i * seed) - 0.5) * spread * 2;
    const x = prevX + jitter;
    pts.push([x, y]);

    // Branch at ~30% of segments
    if (rng(i * seed + 77) > 0.7 && i < segments - 1) {
      const branchLen = 2 + Math.floor(rng(i * seed + 33) * 3);
      let bx = x, by = y;
      const dir = rng(i * seed + 11) > 0.5 ? 1 : -1;
      let branch = `M${bx},${by}`;
      for (let j = 1; j <= branchLen; j++) {
        bx += dir * (8 + rng(j * seed + i) * 18);
        by += (endY - startY) / segments * (0.5 + rng(j * seed + i + 5) * 0.8);
        branch += ` L${bx.toFixed(1)},${by.toFixed(1)}`;
      }
      branches.push(branch);
    }
  }

  const main = pts.map((p, i) => `${i === 0 ? "M" : " L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  return { main, branches };
}

const BOLT_CONFIGS = [
  { x: 200, y0: 30, y1: 290, spread: 22, segs: 9, seed: 1 },
  { x: 80, y0: 50, y1: 305, spread: 20, segs: 10, seed: 2 },
  { x: 320, y0: 40, y1: 295, spread: 24, segs: 9, seed: 3 },
  { x: 140, y0: 25, y1: 280, spread: 18, segs: 8, seed: 4 },
  { x: 260, y0: 35, y1: 290, spread: 20, segs: 9, seed: 5 },
  { x: 110, y0: 42, y1: 300, spread: 22, segs: 10, seed: 6 },
  { x: 290, y0: 48, y1: 295, spread: 21, segs: 9, seed: 7 },
];

interface LightningBoltsProps {
  isHovered: boolean;
  clickBurst: number;
}

export function LightningBolts({ isHovered, clickBurst }: LightningBoltsProps) {
  const bolts = useMemo(
    () => BOLT_CONFIGS.map((c) => generateBolt(c.x, c.y0, c.y1, c.spread, c.segs, c.seed)),
    []
  );

  return (
    <>
      <AnimatePresence>
        {isHovered && bolts.map((bolt, i) => (
          <motion.svg
            key={`lightning-${i}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 320"
            preserveAspectRatio="xMidYMid slice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08, delay: i * 0.05 }}
          >
            <defs>
              <filter id={`lg-${i}`}>
                <feGaussianBlur stdDeviation="5" result="b1" />
                <feGaussianBlur stdDeviation="14" result="b2" />
                <feGaussianBlur stdDeviation="24" result="b3" />
                <feMerge>
                  <feMergeNode in="b3" />
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wide outer glow - main */}
            <motion.path
              d={bolt.main}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#lg-${i})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.2, 0.12, 0] }}
              transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity, repeatDelay: 1.6 + i * 0.2, ease: "easeOut" }}
            />
            {/* Mid glow - main */}
            <motion.path
              d={bolt.main}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#lg-${i})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.45, 0.3, 0] }}
              transition={{ duration: 0.7, delay: i * 0.12 + 0.02, repeat: Infinity, repeatDelay: 1.6 + i * 0.2, ease: "easeOut" }}
            />
            {/* Ultra-thin white-hot core - main */}
            <motion.path
              d={bolt.main}
              fill="none"
              stroke="white"
              strokeWidth="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 0.85, 0] }}
              transition={{ duration: 0.6, delay: i * 0.12 + 0.04, repeat: Infinity, repeatDelay: 1.6 + i * 0.2, ease: "easeOut" }}
            />

            {/* Branch bolts */}
            {bolt.branches.map((bd, bi) => (
              <g key={`branch-${bi}`}>
                <motion.path
                  d={bd}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#lg-${i})`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.15, 0.08, 0] }}
                  transition={{ duration: 0.5, delay: i * 0.12 + 0.1 + bi * 0.05, repeat: Infinity, repeatDelay: 1.6 + i * 0.2, ease: "easeOut" }}
                />
                <motion.path
                  d={bd}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.9, 0.7, 0] }}
                  transition={{ duration: 0.45, delay: i * 0.12 + 0.12 + bi * 0.05, repeat: Infinity, repeatDelay: 1.6 + i * 0.2, ease: "easeOut" }}
                />
              </g>
            ))}
          </motion.svg>
        ))}
      </AnimatePresence>

      {/* Click burst flash */}
      <AnimatePresence>
        {clickBurst > 0 && (
          <motion.div
            key={clickBurst}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.25), transparent 60%)" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {clickBurst > 0 && Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <motion.div
              key={`spark-${clickBurst}-${i}`}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: "50%", top: "50%", width: 4, height: 4,
                backgroundColor: "hsl(var(--primary))",
                boxShadow: "0 0 8px hsl(var(--primary) / 0.8)",
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angle) * 120, y: Math.sin(angle) * 120, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
    </>
  );
}
