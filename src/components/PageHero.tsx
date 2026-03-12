import { motion } from "framer-motion";
import { ReactNode, useCallback, useRef, useState } from "react";
import { AmbientQiParticles } from "./hero/AmbientQiParticles";

interface PageHeroProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [clickBurst, setClickBurst] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleClick = useCallback(() => {
    setClickBurst((prev) => prev + 1);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 gradient-cosmic overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(43_80%_55%/0.05),transparent_70%)]" />
      <AmbientQiParticles isHovered={isHovered} sectionRef={sectionRef} clickBurst={clickBurst} />
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-heading text-4xl md:text-6xl font-bold text-primary tracking-wider mb-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-foreground/70 font-body text-lg md:text-xl max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
        {children}
      </div>
    </section>
  );
}
