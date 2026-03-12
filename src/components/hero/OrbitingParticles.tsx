import { motion } from "framer-motion";
import { CIRCLES } from "./SpiritualCircleArray";

const TRAIL_COUNT = 5;

export function OrbitingParticles({ isHovered }: { isHovered: boolean }) {
  return (
    <>
      {CIRCLES.map((circle, ci) => {
        const particleCount = ci === 0 ? 3 : ci === 1 ? 2 : 1;
        const duration = circle.rotationDuration * 1.2;

        return Array.from({ length: particleCount }).map((_, pi) => {
          const startAngle = (pi / particleCount) * 360;
          return (
            <div key={`orbit-${ci}-${pi}`} className="contents">
              {/* Main particle */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: `${circle.radius * 2}%`,
                  height: `${circle.radius * 2}%`,
                  left: `${50 - circle.radius}%`,
                  top: `${50 - circle.radius}%`,
                }}
                animate={{ rotate: circle.direction * 360 + startAngle }}
                initial={{ rotate: startAngle }}
                transition={{ duration, repeat: Infinity, ease: "linear" }}
              >
                <motion.div
                  className="absolute"
                  style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)" }}
                >
                  <motion.div
                    className="rounded-full"
                    style={{
                      width: isHovered ? 18 : 12,
                      height: isHovered ? 18 : 12,
                      background: `radial-gradient(circle, hsl(var(--primary) / ${isHovered ? 0.5 : 0.25}), transparent 70%)`,
                    }}
                    animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, isHovered ? 0.8 : 0.5, 0.3] }}
                    transition={{ duration: 2.5, delay: pi * 0.8 + ci * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 3, height: 3, left: "50%", top: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "hsl(var(--primary))",
                      boxShadow: `0 0 6px hsl(var(--primary) / ${isHovered ? 0.9 : 0.5}), 0 0 12px hsl(var(--primary) / ${isHovered ? 0.4 : 0.2})`,
                    }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, delay: pi * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>

              {/* Trail particles - slightly lagging behind */}
              {Array.from({ length: TRAIL_COUNT }).map((_, ti) => {
                const lagDeg = (ti + 1) * (circle.direction > 0 ? -4 : 4);
                const trailStart = startAngle + lagDeg;
                const scale = 1 - (ti + 1) * 0.17;
                const opacityMul = 1 - (ti + 1) * 0.18;

                return (
                  <motion.div
                    key={`trail-${ci}-${pi}-${ti}`}
                    className="absolute pointer-events-none"
                    style={{
                      width: `${circle.radius * 2}%`,
                      height: `${circle.radius * 2}%`,
                      left: `${50 - circle.radius}%`,
                      top: `${50 - circle.radius}%`,
                    }}
                    animate={{ rotate: circle.direction * 360 + trailStart }}
                    initial={{ rotate: trailStart }}
                    transition={{ duration, repeat: Infinity, ease: "linear" }}
                  >
                    <motion.div
                      className="absolute"
                      style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)" }}
                    >
                      <motion.div
                        className="rounded-full"
                        style={{
                          width: (isHovered ? 12 : 8) * scale,
                          height: (isHovered ? 12 : 8) * scale,
                          background: `radial-gradient(circle, hsl(var(--primary) / ${(isHovered ? 0.35 : 0.15) * opacityMul}), transparent 70%)`,
                        }}
                        animate={{
                          scale: [0.7, 1.2, 0.7],
                          opacity: [0.2 * opacityMul, (isHovered ? 0.55 : 0.3) * opacityMul, 0.2 * opacityMul],
                        }}
                        transition={{
                          duration: 2.5,
                          delay: pi * 0.8 + ci * 0.4 + (ti + 1) * 0.12,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          width: Math.max(1.5, 2.5 * scale),
                          height: Math.max(1.5, 2.5 * scale),
                          left: "50%", top: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "hsl(var(--primary))",
                          boxShadow: `0 0 ${4 * scale}px hsl(var(--primary) / ${(isHovered ? 0.6 : 0.3) * opacityMul})`,
                        }}
                        animate={{ opacity: [0.3 * opacityMul, 0.7 * opacityMul, 0.3 * opacityMul] }}
                        transition={{
                          duration: 1.5,
                          delay: pi * 0.5 + (ti + 1) * 0.1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          );
        });
      })}
    </>
  );
}
