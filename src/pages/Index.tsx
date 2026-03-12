import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Users, Sparkles, Clock, Globe, Tv, BookOpen, Swords, ChevronRight, HelpCircle, Shield, Map, Star } from "lucide-react";
import { TopReviews } from "@/components/TopReviews";
import { CommunityDiscovery } from "@/components/CommunityDiscovery";
import { CommunityLeaderboard } from "@/components/CommunityLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";
import wangLinImg from "@/assets/wang-lin.jpg";

const quotes = [
  { text: "I will not be a slave to fate. I will forge my own Dao.", attr: "Wang Lin's Resolve" },
  { text: "The Ancient God, Demon, and Devil are but steps on my path.", attr: "Wang Lin's Ascension" },
  { text: "Heaven-defying means nothing if it doesn't transcend all.", attr: "Wang Lin's Philosophy" },
  { text: "In the clash of Daos, I am inevitable.", attr: "Wang Lin's Certainty" },
  { text: "The God's real name is Wang Lin, the main protagonist of the prequel novel.", attr: "Wang Lin's Legacy" },
];

const daos = [
  { name: "Underworld", color: "text-jade" },
  { name: "Slaughter", color: "text-crimson" },
  { name: "Life/Death", color: "text-foreground" },
  { name: "Karma", color: "text-primary" },
  { name: "True/False", color: "text-jade" },
  { name: "Space/Time", color: "text-primary" },
];

const features = [
  { icon: HelpCircle, title: "Start Here", desc: "New? Begin your journey", path: "/guide" },
  { icon: Users, title: "Characters", desc: "Legends and ancient beings", path: "/characters" },
  { icon: Sparkles, title: "Dao System", desc: "Wang Lin's unprecedented Daos", path: "/daos" },
  { icon: Swords, title: "Cultivation", desc: "Realm progression system", path: "/cultivation" },
  { icon: Shield, title: "Artifacts", desc: "Weapons & techniques", path: "/artifacts" },
  { icon: Map, title: "Locations", desc: "Worlds and realms", path: "/locations" },
  { icon: Clock, title: "Timeline", desc: "Journey through epochs", path: "/timeline" },
  { icon: Globe, title: "Multiverse", desc: "Er Gen's connected universes", path: "/multiverse" },
  { icon: Tv, title: "Donghua", desc: "Anime adaptation tracker", path: "/donghua" },
  { icon: BookOpen, title: "Lore Notes", desc: "Glossary and deep dives", path: "/lore" },
];

const Index = () => {
  const [pageStats, setPageStats] = useState<Record<string, { count: number; avg: number }>>({});

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("reviews").select("page_path, rating").neq("page_path", "/_contact_inbox");
      if (!data) return;
      const stats: Record<string, { count: number; sum: number }> = {};
      data.forEach((r: any) => {
        if (!stats[r.page_path]) stats[r.page_path] = { count: 0, sum: 0 };
        stats[r.page_path].count++;
        stats[r.page_path].sum += r.rating;
      });
      const result: Record<string, { count: number; avg: number }> = {};
      Object.entries(stats).forEach(([path, s]) => {
        result[path] = { count: s.count, avg: +(s.sum / s.count).toFixed(1) };
      });
      setPageStats(result);
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2 }}>
            <h1 className="font-heading text-5xl md:text-8xl font-bold text-primary tracking-[0.15em] mb-2">仙逆</h1>
            <p className="font-heading text-2xl md:text-4xl text-foreground tracking-[0.2em] uppercase mb-6">Renegade Immortal</p>
          </motion.div>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="font-body text-lg md:text-xl text-foreground/70 max-w-xl mx-auto mb-10">
            The Journey of Wang Lin Across Gods, Demons, and Devils
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="flex flex-wrap justify-center gap-4">
            <Link to="/guide" className="px-6 py-3 rounded-md gradient-gold font-heading text-sm tracking-wider text-primary-foreground hover:opacity-90 transition-opacity">
              Start Here
            </Link>
            <Link to="/characters" className="px-6 py-3 rounded-md border border-primary/30 font-heading text-sm tracking-wider text-primary hover:bg-primary/10 transition-colors">
              Explore Characters
            </Link>
            <Link to="/daos" className="px-6 py-3 rounded-md border border-border font-heading text-sm tracking-wider text-foreground hover:border-primary/30 transition-colors">
              Discover Daos
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Wang Lin Section */}
      <section className="py-20 gradient-cosmic">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="relative rounded-lg overflow-hidden glow-gold">
                <img src={wangLinImg} alt="Wang Lin" className="w-full aspect-[3/4] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
            </motion.div>
            <motion.div initial={{ x: 40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <h2 className="font-heading text-3xl md:text-4xl text-primary mb-6 tracking-wider">Wang Lin: The Protagonist</h2>
              <p className="font-body text-lg text-foreground/80 mb-6 leading-relaxed">
                From a powerless mortal in a small village on planet Suzaku to a transcendent being who reshapes the multiverse. Through unrelenting cultivation and the forging of impossible Daos, Wang Lin defies heaven itself.
              </p>

              {/* Character Profile Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Name", value: "Wang Lin (王林)" },
                  { label: "Alias", value: "Xu Mu, Lu Yuncong, The Ancestor" },
                  { label: "Cultivation Realm", value: "Third Step — Transcendent" },
                  { label: "Dao", value: "Underworld, Slaughter, Life/Death, Karma, True/False, Space/Time" },
                  { label: "Affiliation / Sect", value: "Heng Yue Sect → Tian Yun Sect → Heaven-Defying Alliance" },
                  { label: "Master", value: "Situ Nan" },
                  { label: "Disciples", value: "Thirteen, Qing Shui" },
                  { label: "Enemies", value: "Teng Huayuan, Ling Tianhou, All-Seer" },
                  { label: "First Appearance", value: "Chapter 1 — Planet Suzaku" },
                  { label: "Status", value: "Alive — Transcendent" },
                ].map((item) => (
                  <div key={item.label} className="gradient-card rounded-lg p-3 border border-border">
                    <span className="font-heading text-[11px] text-primary/70 tracking-wider uppercase block mb-0.5">{item.label}</span>
                    <span className="font-body text-sm text-foreground/90 leading-tight block">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4">
                {[
                  { label: "Important Arcs", value: "Planet Suzaku Arc, Allheaven Arc, Cave World Arc, Ancient God Arc, Star System War, Immortal Palace Trials" },
                  { label: "Techniques", value: "Ancient God Powers, Finger of Slaughter, Life & Death Domain, Karma Severing, Heaven Punishing Grand Formation" },
                  { label: "Artifacts", value: "Celestial Sword, Ancient God Furnace, Heaven Revolting Insignia, God Slaying War Chariot" },
                  { label: "Bloodline", value: "Ancient God Royal Bloodline (8-Star → Ultimate), Merged with Devil & Demon" },
                  { label: "Major Battles", value: "vs Teng Huayuan, vs All-Seer, vs Allheaven, vs Immortal Palace Masters, vs Heaven Trampling God" },
                  { label: "Personality", value: "Ruthless yet sentimental. Cold and calculating toward enemies, but deeply loyal to family and loved ones. A true heaven-defier who refuses to bow to fate." },
                ].map((item) => (
                  <div key={item.label} className="gradient-card rounded-lg p-3 border border-border">
                    <span className="font-heading text-[11px] text-primary/70 tracking-wider uppercase block mb-0.5">{item.label}</span>
                    <span className="font-body text-sm text-foreground/90 leading-tight block">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="gradient-card rounded-lg p-4 border border-border">
                <h3 className="font-heading text-sm text-primary tracking-wider mb-1">Primary Daos</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daos.map((dao) => (
                    <Link key={dao.name} to="/daos" className={`text-sm font-body ${dao.color} border border-border rounded px-2 py-0.5 hover:bg-muted/50 transition-colors`}>
                      {dao.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-2xl text-primary text-center mb-10 tracking-wider">Iconic Words</h2>
          <div className="space-y-6">
            {quotes.map((q, i) => (
              <motion.blockquote key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-l-2 border-primary/40 pl-6 py-2">
                <p className="font-body text-lg italic text-foreground/80">"{q.text}"</p>
                <cite className="text-sm text-primary/70 font-heading not-italic mt-1 block">— {q.attr}</cite>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl text-primary text-center mb-12 tracking-wider">Explore the Encyclopedia</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {features.map((f, i) => {
              const Icon = f.icon;
              const stats = pageStats[f.path];
              return (
                <motion.div key={f.title} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                  <Link to={f.path} className="block gradient-card border border-border rounded-lg p-5 hover:border-primary/30 hover:glow-gold transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <Icon className="text-primary mb-2" size={22} />
                      {stats && stats.count > 0 && (
                        <div className="flex items-center gap-1 bg-muted/60 rounded-full px-2 py-0.5">
                          <Star size={10} className="fill-primary text-primary" />
                          <span className="text-[10px] font-heading text-primary">{stats.avg}</span>
                          <span className="text-[10px] text-muted-foreground">({stats.count})</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-foreground text-sm tracking-wider mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground font-body">{f.desc}</p>
                    <ChevronRight className="text-primary/50 group-hover:text-primary mt-2 transition-colors" size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Discovery */}
      <CommunityDiscovery />

      {/* Community Leaderboard */}
      <CommunityLeaderboard />

      {/* Top Reviews */}
      <TopReviews />
    </Layout>
  );
};

export default Index;
