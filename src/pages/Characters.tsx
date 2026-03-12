import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Search, ChevronDown, Heart } from "lucide-react";
import { CharacterRelationships } from "@/components/CharacterRelationships";
import { CharacterComments } from "@/components/CharacterComments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  characters,
  races,
  alignments,
  alignmentColors,
  alignmentBorderColors,
  type Character,
} from "@/data/charactersData";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const CharactersPage = () => {
  const [search, setSearch] = useState("");
  const [race, setRace] = useState("All Races");
  const [alignment, setAlignment] = useState("All Roles");
  const [expandedChar, setExpandedChar] = useState<string | null>(null);
  const { user, profile, refreshProfile } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.favorite_characters) {
      setFavorites(profile.favorite_characters);
    }
  }, [profile]);

  const toggleFavorite = useCallback(async (charName: string) => {
    if (!user) {
      toast.error("Sign in to favorite characters");
      return;
    }
    const isFav = favorites.includes(charName);
    const updated = isFav ? favorites.filter(n => n !== charName) : [...favorites, charName];
    if (updated.length > 10) {
      toast.error("Maximum 10 favorite characters");
      return;
    }
    setFavorites(updated);
    const { error } = await supabase
      .from("profiles")
      .update({ favorite_characters: updated })
      .eq("user_id", user.id);
    if (error) {
      setFavorites(favorites);
      toast.error("Failed to update favorites");
    } else {
      toast.success(isFav ? `Removed ${charName}` : `Added ${charName} to favorites`);
      refreshProfile();
    }
  }, [user, favorites, refreshProfile]);

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchRace = race === "All Races" || c.race === race;
      const matchAlign = alignment === "All Roles" || c.alignment === alignment;
      return matchSearch && matchRace && matchAlign;
    });
  }, [search, race, alignment]);

  return (
    <Layout>
      <PageHero
        title="Characters"
        subtitle="Explore the legends, heroes, and ancient beings that shape the world of Xian Ni"
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Filters */}
          <div className="gradient-card border border-border rounded-lg p-6 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Search size={18} className="text-primary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search characters..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-lg border-b border-border pb-1 focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
                  Race
                </span>
                <div className="flex flex-wrap gap-1">
                  {races.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRace(r)}
                      className={`px-3 py-1 rounded text-xs font-body transition-colors ${
                        race === r
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
                  Role
                </span>
                <div className="flex flex-wrap gap-1">
                  {alignments.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlignment(a)}
                      className={`px-3 py-1 rounded text-xs font-body transition-colors ${
                        alignment === a
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Characters Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((char, i) => (
              <CharacterCard
                key={char.name}
                char={char}
                index={i}
                isExpanded={expandedChar === char.name}
                onToggle={() =>
                  setExpandedChar(
                    expandedChar === char.name ? null : char.name
                  )
                }
                isFavorite={favorites.includes(char.name)}
                onToggleFavorite={() => toggleFavorite(char.name)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12 font-body">
              No characters match your filters
            </p>
          )}

          {/* Relationship Map */}
          <CharacterRelationships />

          {/* Ancient Races */}
          <div className="mt-16">
            <h2 className="font-heading text-2xl text-primary text-center mb-8 tracking-wider">
              The Three Ancient Races
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Ancient Gods",
                  desc: "Embody creation, order, and celestial authority.",
                  traits: [
                    "Supreme authority",
                    "Creation Daos",
                    "Pride in lineage",
                    "Resistance to change",
                  ],
                },
                {
                  title: "Ancient Demons",
                  desc: "Chaotic and powerful entities that embody instinct.",
                  traits: [
                    "Respect for strength",
                    "Chaotic but strategic",
                    "Complex honor codes",
                    "Bridge god and devil traits",
                  ],
                },
                {
                  title: "Ancient Devils",
                  desc: "The most destructive and least organized.",
                  traits: [
                    "Pure destructive power",
                    "Chaotic Dao mastery",
                    "Loose collectives",
                    "Feared across realms",
                  ],
                },
              ].map((r) => (
                <div
                  key={r.title}
                  className="gradient-card border border-border rounded-lg p-6"
                >
                  <h3 className="font-heading text-lg text-primary tracking-wider mb-2">
                    {r.title}
                  </h3>
                  <p className="text-foreground/70 font-body text-sm mb-4">
                    {r.desc}
                  </p>
                  <ul className="space-y-1">
                    {r.traits.map((t) => (
                      <li
                        key={t}
                        className="text-xs text-muted-foreground font-body flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function CharacterCard({
  char,
  index,
  isExpanded,
  onToggle,
  isFavorite,
  onToggleFavorite,
}: {
  char: Character;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const borderColor = alignmentBorderColors[char.alignment] ?? "border-border";
  const bgColor = alignmentColors[char.alignment] ?? "bg-muted";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className={`gradient-card border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300 ${borderColor} flex flex-col`}
    >
      {/* Portrait */}
      <button onClick={onToggle} className="w-full text-left">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
          {char.image ? (
            <img
              src={char.image}
              alt={char.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${bgColor}`}>
              <span className="font-heading text-4xl text-primary-foreground tracking-wider opacity-60">
                {getInitials(char.name)}
              </span>
              <span className="text-xs text-primary-foreground/50 font-body italic">
                No image preview available
              </span>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/95 to-transparent" />
          {/* Name overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className="font-heading text-xl text-primary tracking-wider drop-shadow-lg">
              {char.name}
            </h3>
            <p className="text-xs text-foreground/70 font-body">{char.subtitle}</p>
          </div>
          {/* Favorite + Expand icons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="bg-background/60 backdrop-blur-sm rounded-full p-1 transition-colors hover:bg-background/80"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                size={16}
                className={isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}
              />
            </button>
            <ChevronDown
              className={`text-primary/80 bg-background/60 rounded-full p-0.5 backdrop-blur-sm transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={20}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 space-y-1.5">
          {char.cultivationRealm && (
            <QuickStat label="Realm" value={char.cultivationRealm} />
          )}
          {char.sect && (
            <QuickStat label="Affiliation" value={char.sect} />
          )}
          {char.master && (
            <QuickStat label="Master" value={char.master} />
          )}
          {char.enemies && char.enemies.length > 0 && (
            <QuickStat label="Enemies" value={char.enemies.slice(0, 2).join(", ")} />
          )}
          {char.dao && char.dao.length > 0 && (
            <QuickStat label="Dao" value={char.dao.slice(0, 3).join(", ")} />
          )}
          {char.majorBattles && char.majorBattles.length > 0 && (
            <QuickStat label="Key Arcs" value={char.majorBattles[0]} />
          )}

          <div className="flex flex-wrap gap-1 pt-2">
            {char.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-body px-1.5 py-0.5 rounded border border-primary/20 text-primary/80"
              >
                {tag}
              </span>
            ))}
            {char.tags.length > 3 && (
              <span className="text-[10px] font-body text-muted-foreground">
                +{char.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
              <p className="text-sm text-foreground/80 font-body leading-relaxed">
                {char.description}
              </p>
              {char.alias && <ProfileField label="Alias" value={char.alias} />}
              {char.bloodline && (
                <ProfileField label="Bloodline" value={char.bloodline} />
              )}
              {char.status && (
                <ProfileField label="Status" value={char.status} />
              )}
              {char.firstAppearance && (
                <ProfileField label="First Appearance" value={char.firstAppearance} />
              )}
              {char.dao && char.dao.length > 0 && (
                <div>
                  <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
                    Daos
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {char.dao.map((d) => (
                      <Link
                        key={d}
                        to="/daos"
                        className="text-xs font-body px-2 py-0.5 rounded border border-primary/20 text-primary/80 hover:bg-primary/10 transition-colors"
                      >
                        {d}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {char.techniques && char.techniques.length > 0 && (
                <div>
                  <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
                    Techniques
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {char.techniques.map((t) => (
                      <Link
                        key={t}
                        to="/artifacts"
                        className="text-xs font-body px-2 py-0.5 rounded border border-[hsl(var(--jade))]/30 text-[hsl(var(--jade))] hover:bg-[hsl(var(--jade))]/10 transition-colors"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {char.artifacts && char.artifacts.length > 0 && (
                <div>
                  <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
                    Artifacts
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {char.artifacts.map((a) => (
                      <Link
                        key={a}
                        to="/artifacts"
                        className="text-xs font-body px-2 py-0.5 rounded border border-[hsl(var(--crimson))]/30 text-[hsl(var(--crimson))] hover:bg-[hsl(var(--crimson))]/10 transition-colors"
                      >
                        {a}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {char.enemies && char.enemies.length > 0 && (
                <ProfileField label="Enemies" value={char.enemies.join(", ")} />
              )}
              {char.disciples && char.disciples.length > 0 && (
                <ProfileField label="Disciples" value={char.disciples.join(", ")} />
              )}
              {char.majorBattles && char.majorBattles.length > 0 && (
                <div>
                  <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
                    Major Battles
                  </span>
                  <ul className="mt-1 space-y-1">
                    {char.majorBattles.map((b) => (
                      <li
                        key={b}
                        className="text-xs text-foreground/70 font-body flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-[hsl(var(--crimson))]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments */}
              <CharacterComments
                characterId={char.name.toLowerCase().replace(/\s+/g, "-")}
                characterName={char.name}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="truncate">
      <span className="text-[10px] font-heading text-muted-foreground tracking-wider uppercase">{label}: </span>
      <span className="text-xs text-foreground/80 font-body">{value}</span>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-heading text-muted-foreground tracking-wider uppercase">
        {label}
      </span>
      <p className="text-sm text-foreground/80 font-body">{value}</p>
    </div>
  );
}

export default CharactersPage;
