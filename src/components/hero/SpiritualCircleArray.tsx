import { motion, MotionValue } from "framer-motion";
import { useMemo } from "react";

const QI_CHARS = ["氣", "道", "仙", "靈", "陰", "陽", "☯", "✦"];

export interface CircleConfig {
  radius: number;
  count: number;
  size: number;
  rotationDuration: number;
  direction: 1 | -1;
  opacity: number;
  pulseDelay: number;
  parallaxSpeed: number;
}

export const CIRCLES: CircleConfig[] = [
  { radius: 28, count: 8, size: 18, rotationDuration: 20, direction: 1, opacity: 0.30, pulseDelay: 0, parallaxSpeed: 0.15 },
  { radius: 18, count: 6, size: 16, rotationDuration: 28, direction: -1, opacity: 0.25, pulseDelay: 1.5, parallaxSpeed: 0.25 },
  { radius: 10, count: 4, size: 14, rotationDuration: 35, direction: 1, opacity: 0.20, pulseDelay: 3, parallaxSpeed: 0.35 },
];

interface SpiritualCircleArrayProps {
  circle: CircleConfig;
  index: number;
  isHovered: boolean;
  scrollY: MotionValue<number>;
}

export function SpiritualCircleArray({ circle, index, isHovered, scrollY }: SpiritualCircleArrayProps) {
  const chars = useMemo(
    () => Array.from({ length: circle.count }, (_, i) => QI_CHARS[(i + index * 3) % QI_CHARS.length]),
    [circle.count, index]
  );

  const opMultiplier = isHovered ? 2.5 : 1;
  const glowIntensity = isHovered ? 0.7 : 0.5;
  const strokeGlow = isHovered ? 1.5 : 1.0;

  return (
    <motion.div
      className="absolute transition-[filter] duration-700"
      style={{
        width: `${circle.radius * 2}%`,
        height: `${circle.radius * 2}%`,
        left: `${50 - circle.radius}%`,
        top: `${50 - circle.radius}%`,
        y: scrollY,
        filter: isHovered ? `drop-shadow(0 0 12px hsl(var(--primary) / 0.35))` : `drop-shadow(0 0 4px hsl(var(--primary) / 0.1))`,
      }}
      animate={{ rotate: circle.direction * 360 }}
      transition={{ duration: circle.rotationDuration, repeat: Infinity, ease: "linear" }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`energy-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={isHovered ? 0.5 : 0.3} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${index}`}>
            <feGaussianBlur stdDeviation={strokeGlow} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx="50" cy="50" r="49"
          fill="none"
          stroke={`url(#energy-grad-${index})`}
          strokeWidth={isHovered ? "0.8" : "0.5"}
          filter={`url(#glow-${index})`}
          strokeDasharray="18 10 6 10"
          animate={{
            opacity: [0.04 * opMultiplier, 0.14 * opMultiplier, 0.04 * opMultiplier],
            strokeDashoffset: [0, -314],
          }}
          transition={{
            opacity: { duration: 5, delay: circle.pulseDelay, repeat: Infinity, ease: "easeInOut" },
            strokeDashoffset: { duration: circle.rotationDuration * 0.8, repeat: Infinity, ease: "linear" },
          }}
        />
        <motion.circle
          cx="50" cy="50" r="49"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={isHovered ? "0.25" : "0.12"}
          animate={{ opacity: [0.02 * opMultiplier, 0.07 * opMultiplier, 0.02 * opMultiplier] }}
          transition={{ duration: 4, delay: circle.pulseDelay + 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {chars.map((char, i) => {
        const angle = (i / circle.count) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 50;
        const y = 50 + Math.sin(angle) * 50;
        return (
          <motion.span
            key={i}
            className="absolute text-primary select-none font-heading"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              fontSize: circle.size,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              opacity: [circle.opacity * 0.5 * opMultiplier, circle.opacity * opMultiplier, circle.opacity * 0.5 * opMultiplier],
              scale: [0.85, isHovered ? 1.3 : 1.15, 0.85],
              textShadow: [
                "0 0 4px hsl(var(--primary) / 0)",
                `0 0 ${isHovered ? 22 : 14}px hsl(var(--primary) / ${glowIntensity})`,
                "0 0 4px hsl(var(--primary) / 0)",
              ],
            }}
            transition={{
              duration: 4 + i * 0.5,
              delay: circle.pulseDelay + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.span
              style={{ display: "inline-block" }}
              animate={{ rotate: -circle.direction * 360 }}
              transition={{ duration: circle.rotationDuration, repeat: Infinity, ease: "linear" }}
            >
              {char}
            </motion.span>
          </motion.span>
        );
      })}
    </motion.div>
  );
}
