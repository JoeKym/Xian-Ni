import { motion, useScroll, useTransform } from "framer-motion";
import horusIcon from "@/assets/horus.svg";
import sharinganIcon from "@/assets/sharingan.svg";
import { SpiritualCircleArray, CIRCLES } from "./SpiritualCircleArray";
import { LightningBolts } from "./LightningBolts";
import { OrbitingParticles } from "./OrbitingParticles";

interface AmbientQiParticlesProps {
  isHovered: boolean;
  sectionRef: React.RefObject<HTMLElement>;
  clickBurst: number;
}

export function AmbientQiParticles({ isHovered, sectionRef, clickBurst }: AmbientQiParticlesProps) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const parallaxSlow = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const parallaxMed = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const parallaxFast = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const parallaxValues = [parallaxSlow, parallaxMed, parallaxFast];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Energy ripple effect on page load */}
      {[0, 0.35, 0.7, 1.05, 1.4].map((delay, i) => (
        <motion.div
          key={`ripple-${i}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 8,
            height: 8,
            border: `${i % 2 === 0 ? 2 : 1}px solid hsl(var(--primary) / 0.3)`,
            background: `radial-gradient(circle, hsl(var(--primary) / ${0.12 - i * 0.02}), transparent 70%)`,
            boxShadow: `0 0 ${20 + i * 8}px hsl(var(--primary) / ${0.15 - i * 0.02}), inset 0 0 ${10 + i * 4}px hsl(var(--primary) / ${0.1 - i * 0.015})`,
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: [0, 50], opacity: [0.5, 0] }}
          transition={{ duration: 3 + i * 0.3, delay: 0.2 + delay, ease: "easeOut" }}
        />
      ))}

      {/* Central ☯ anchor */}
      <motion.span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-heading select-none transition-all duration-700"
        style={{
          fontSize: 28,
          color: `hsl(var(--primary) / ${isHovered ? 0.45 : 0.25})`,
          y: parallaxFast,
          textShadow: `0 0 12px hsl(var(--primary) / ${isHovered ? 0.4 : 0.15})`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          rotate: [0, 360],
          scale: [0.9, isHovered ? 1.5 : 1.2, 0.9],
          opacity: [isHovered ? 0.25 : 0.15, isHovered ? 0.5 : 0.3, isHovered ? 0.25 : 0.15],
        }}
        transition={{
          rotate: { duration: 40, repeat: Infinity, ease: "linear" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
        }}
      >
        ☯
      </motion.span>

      {/* Central energy formation SVG */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[260px] h-[260px] md:w-[400px] md:h-[400px]"
        viewBox="0 0 400 400"
      >
        <defs>
          <filter id="star-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="node-glow">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Energy rays from each vertex to outer rings */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const cx = 200, cy = 200;
          const innerR = 55;
          const outerR = 190;
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * outerR;
          const y2 = cy + Math.sin(angle) * outerR;
          return (
            <motion.line
              key={`ray-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--primary))"
              strokeWidth={isHovered ? 0.8 : 0.4}
              strokeDasharray="6 8"
              filter="url(#star-glow)"
              animate={{
                opacity: [isHovered ? 0.15 : 0.06, isHovered ? 0.35 : 0.15, isHovered ? 0.15 : 0.06],
                strokeDashoffset: [0, -28],
              }}
              transition={{
                opacity: { duration: 3, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" },
                strokeDashoffset: { duration: 4, repeat: Infinity, ease: "linear" },
              }}
            />
          );
        })}

        {/* Containing circle */}
        <motion.circle
          cx="200" cy="200" r="85"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={isHovered ? 1.2 : 0.6}
          filter="url(#star-glow)"
          animate={{
            opacity: [isHovered ? 0.2 : 0.1, isHovered ? 0.45 : 0.25, isHovered ? 0.2 : 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Square 1 — clockwise */}
        <motion.rect
          x="140" y="140" width="120" height="120"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={isHovered ? 1.6 : 0.9}
          strokeLinejoin="round"
          filter="url(#star-glow)"
          animate={{
            rotate: [0, 360],
            opacity: [isHovered ? 0.3 : 0.15, isHovered ? 0.55 : 0.3, isHovered ? 0.3 : 0.15],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ transformOrigin: "200px 200px" }}
        />

        {/* Square 2 — counter-clockwise, offset 45° */}
        <motion.rect
          x="140" y="140" width="120" height="120"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={isHovered ? 1.6 : 0.9}
          strokeLinejoin="round"
          filter="url(#star-glow)"
          initial={{ rotate: 45 }}
          animate={{
            rotate: [45, -315],
            opacity: [isHovered ? 0.3 : 0.15, isHovered ? 0.55 : 0.3, isHovered ? 0.3 : 0.15],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            opacity: { duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ transformOrigin: "200px 200px" }}
        />

        {/* Energy connection lines between corner nodes */}
        {[
          [[140, 140], [260, 140]],
          [[260, 140], [260, 260]],
          [[260, 260], [140, 260]],
          [[140, 260], [140, 140]],
          [[140, 140], [260, 260]],
          [[260, 140], [140, 260]],
        ].map(([[x1, y1], [x2, y2]], i) => (
          <motion.line
            key={`conn-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="hsl(var(--primary))"
            strokeWidth={isHovered ? 0.8 : 0.4}
            strokeDasharray="4 6"
            filter="url(#star-glow)"
            animate={{
              opacity: [isHovered ? 0.1 : 0.04, isHovered ? 0.35 : 0.15, isHovered ? 0.1 : 0.04],
              strokeDashoffset: [0, -40],
            }}
            transition={{
              opacity: { duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" },
              strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" },
            }}
          />
        ))}

        {/* Pulsing energy nodes at square corners */}
        {[
          [140, 140], [260, 140], [260, 260], [140, 260],
        ].map(([cx, cy], i) => (
          <g key={`node-${i}`}>
            <motion.circle
              cx={cx} cy={cy} r={isHovered ? 6 : 4}
              fill="url(#node-glow)"
              filter="url(#star-glow)"
              animate={{
                r: [isHovered ? 4 : 2.5, isHovered ? 8 : 5, isHovered ? 4 : 2.5],
                opacity: [isHovered ? 0.4 : 0.2, isHovered ? 0.9 : 0.5, isHovered ? 0.4 : 0.2],
              }}
              transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 200px" }}
            />
            <motion.circle
              cx={cx} cy={cy} r={isHovered ? 14 : 10}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={0.5}
              animate={{
                r: [isHovered ? 8 : 5, isHovered ? 20 : 14, isHovered ? 8 : 5],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
              style={{ transformOrigin: "200px 200px" }}
            />
          </g>
        ))}

        {/* Inner hexagon with dashed energy flow */}
        <motion.polygon
          points="200,165 230,182 230,218 200,235 170,218 170,182"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={isHovered ? 0.8 : 0.4}
          strokeDasharray="8 4"
          filter="url(#star-glow)"
          animate={{
            rotate: [0, -360],
            opacity: [isHovered ? 0.15 : 0.06, isHovered ? 0.35 : 0.15, isHovered ? 0.15 : 0.06],
            strokeDashoffset: [0, -48],
          }}
          transition={{
            rotate: { duration: 35, repeat: Infinity, ease: "linear" },
            opacity: { duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" },
            strokeDashoffset: { duration: 8, repeat: Infinity, ease: "linear" },
          }}
          style={{ transformOrigin: "200px 200px" }}
        />
      </svg>

      {/* Eye pairs */}
      {[
        { lx: 8, rx: 22, y: 40, size: 52, delay: 0.4, parallax: parallaxSlow },
        { lx: 72, rx: 86, y: 40, size: 52, delay: 1.0, parallax: parallaxSlow },
      ].map((pair, i) => (
        <motion.div
          key={`eye-pair-${i}`}
          className="absolute pointer-events-none hidden md:block"
          style={{
            left: `${pair.lx}%`,
            top: `${pair.y}%`,
            width: `${pair.rx - pair.lx + 6}%`,
            y: pair.parallax,
          }}
        >
          {/* Energy bridge between eyes */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(var(--primary) / ${isHovered ? 0.3 : 0.1}), hsl(0 80% 50% / ${isHovered ? 0.3 : 0.1}), transparent)`,
            }}
            animate={{
              opacity: [0.2, isHovered ? 0.6 : 0.35, 0.2],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{ duration: 3, delay: pair.delay, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Radiant energy aura */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: pair.size * 2.5,
              height: pair.size * 1.2,
              background: `radial-gradient(ellipse, hsl(var(--primary) / ${isHovered ? 0.08 : 0.03}), transparent 70%)`,
            }}
            animate={{
              scale: [0.9, 1.15, 0.9],
              opacity: [0.3, isHovered ? 0.7 : 0.4, 0.3],
            }}
            transition={{ duration: 4, delay: pair.delay, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Left eye — Horus */}
          <motion.img
            src={horusIcon}
            alt=""
            className="absolute select-none"
            style={{
              left: 0,
              top: 0,
              width: pair.size,
              height: pair.size,
              transform: i === 0 ? 'scaleX(-1)' : undefined,
              filter: `drop-shadow(0 0 14px hsl(var(--primary) / ${isHovered ? 0.6 : 0.3}))`,
            }}
            animate={{
              scale: [0.9, isHovered ? 1.2 : 1.05, 0.9],
              opacity: [isHovered ? 0.35 : 0.2, isHovered ? 0.65 : 0.4, isHovered ? 0.35 : 0.2],
              rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{
              scale: { duration: 5, delay: pair.delay, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 5, delay: pair.delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 7, delay: pair.delay, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          {/* Right eye — Sharingan */}
          <motion.img
            src={sharinganIcon}
            alt=""
            className="absolute select-none"
            style={{
              right: 0,
              top: 0,
              width: pair.size,
              height: pair.size,
              transform: i === 0 ? 'scaleX(-1)' : undefined,
              filter: `drop-shadow(0 0 14px hsl(0 80% 45% / ${isHovered ? 0.6 : 0.25}))`,
            }}
            animate={{
              scale: [0.9, isHovered ? 1.2 : 1.05, 0.9],
              opacity: [isHovered ? 0.35 : 0.2, isHovered ? 0.65 : 0.4, isHovered ? 0.35 : 0.2],
              rotate: [0, 360],
            }}
            transition={{
              scale: { duration: 5, delay: pair.delay, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 5, delay: pair.delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            }}
          />
        </motion.div>
      ))}

      {CIRCLES.map((circle, i) => (
        <SpiritualCircleArray
          key={i}
          circle={circle}
          index={i}
          isHovered={isHovered}
          scrollY={parallaxValues[i]}
        />
      ))}

      <OrbitingParticles isHovered={isHovered} />

      <LightningBolts isHovered={isHovered} clickBurst={clickBurst} />
    </div>
  );
}
