import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  ChevronRight,
  Clapperboard,
  Eye,
  Flame,
  Play,
  Radio,
  Search,
  Sparkles,
  Users,
  Video as VideoIcon,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  Avatar,
  Button,
  Card,
  Chip,
  DemoTag,
  EmptyState,
  Photo,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { videos as seedVideos } from "@/data";
import { cn, formatCount, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";
import type { Video } from "@/types";

const categories = ["Tout", "Tendances", "Musique", "Cuisine", "Tech", "Sport", "Culture"] as const;
type Category = (typeof categories)[number];

function VideoCard({
  video,
  saved,
  onSave,
  onOpen,
}: {
  video: Video;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <div className="relative">
        <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Lire ${video.title}`}>
          <Photo
            src={video.poster}
            alt={video.title}
            className="aspect-video w-full"
            imgClassName="transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {video.live ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-mali-red)] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
              <span className="size-1 animate-pulse rounded-full bg-white" />
              Direct
            </span>
          ) : (
            <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[8.5px] font-semibold text-white backdrop-blur">
              {video.duration}
            </span>
          )}
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
            <Play className="ml-0.5 size-4" fill="currentColor" />
          </span>
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? "Retirer des enregistrements" : "Enregistrer la vidéo"}
          className={cn(
            "absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full backdrop-blur transition",
            saved ? "bg-brand text-white" : "bg-black/35 text-white hover:bg-black/55",
          )}
        >
          {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
        </button>
      </div>
      <div className="p-3">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug text-ink transition group-hover:text-brand">
            {video.title}
          </h3>
        </button>
        <Link
          to={video.channel.href ?? "/videos"}
          className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-muted hover:text-ink"
        >
          <Avatar
            name={video.channel.name}
            src={video.channel.avatar}
            tone={video.channel.tone}
            size="xs"
            shape={video.channel.kind === "page" ? "squircle" : "circle"}
          />
          <span className="truncate">{video.channel.name}</span>
          {video.channel.verified && <VerifiedBadge className="size-2.5" />}
        </Link>
        <p className="mt-1 text-[9px] text-muted">
          {video.views}
          {video.live ? " · en direct" : " · il y a 2 h"}
        </p>
      </div>
    </article>
  );
}

export default function VideosPage() {
  const { showToast } = useApp();
  const [category, setCategory] = useState<Category>("Tout");
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(seedVideos.filter((video) => video.saved).map((video) => video.id)),
  );
  const [selected, setSelected] = useState<Video | null>(null);

  const live = seedVideos.find((video) => video.live) ?? seedVideos[0];

  const filtered = useMemo(() => {
    const normalized = searchNormalize(query.trim());
    return seedVideos.filter((video) => {
      const matchesCategory = category === "Tout" || video.category === category;
      const matchesQuery =
        !normalized ||
        searchNormalize(video.title).includes(normalized) ||
        searchNormalize(video.channel.name).includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        showToast("Vidéo retirée de vos enregistrements.", "info");
      } else {
        next.add(id);
        showToast("Vidéo enregistrée pour plus tard.");
      }
      return next;
    });
  };

  return (
    <div>
      <PageIntro
        eyebrow="N’Teriface Watch"
        title="Vidéos"
        description="Le meilleur du Mali en images : documentaires, concerts, cuisine, sport et directs de votre communauté."
        action={
          <div className="flex items-center gap-2">
            <DemoTag />
            <Button size="sm" variant="secondary" onClick={() => showToast("Lecteur de démo : la lecture est simulée.", "info")}>
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Parcourir</span>
            </Button>
          </div>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <div className="relative">
          <Photo src={live.poster} alt={live.title} className="aspect-[16/9] w-full sm:aspect-[16/8]" eager>
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-mali-red)] px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.14em] text-white">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              En direct · {formatCount(4800)} spectateurs
            </span>
            <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[8.5px] font-semibold text-white/85 backdrop-blur">
              Démo
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/70">
                    <Avatar
                      name={live.channel.name}
                      src={live.channel.avatar}
                      tone={live.channel.tone}
                      size="xs"
                      shape="squircle"
                    />
                    {live.channel.name}
                    {live.channel.verified && <VerifiedBadge className="size-2.5" />}
                  </div>
                  <h2 className="mt-1.5 font-display text-[19px] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-[24px]">
                    {live.title}
                  </h2>
                  <p className="mt-1.5 max-w-md text-[10.5px] leading-relaxed text-white/65">
                    {live.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => setSelected(live)}>
                      <Play className="size-3.5" fill="currentColor" />
                      Rejoindre le direct
                    </Button>
                    <Link
                      to="/reels"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 text-[10.5px] font-semibold text-white backdrop-blur transition hover:bg-white/20"
                    >
                      <Clapperboard className="size-3.5" />
                      Reels
                    </Link>
                  </div>
                </div>
                <div className="hidden shrink-0 rounded-2xl border border-white/20 bg-black/25 p-3 backdrop-blur sm:block">
                  <p className="flex items-center gap-1.5 text-[9px] font-semibold text-white/70">
                    <Users className="size-3" />
                    Chat du direct
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {["Aminata : magnifique !", "Sékou : on est là 🔥", "Hawa : la lumière 😍"].map((line) => (
                      <p key={line} className="max-w-[160px] truncate text-[9px] text-white/60">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Photo>
        </div>
      </Card>

      <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une vidéo ou une chaîne…"
            aria-label="Rechercher une vidéo"
            className={cn(fieldClass, "h-10 pl-9 text-[11px]")}
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {categories.map((item) => (
            <Chip key={item} active={category === item} onClick={() => setCategory(item)}>
              {item === "Tout" && <Flame className="size-3" />}
              {item}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold text-muted">
          {filtered.length} vidéo{filtered.length > 1 ? "s" : ""}
          {category !== "Tout" ? ` · ${category}` : ""}
        </p>
        <Link to="/reels" className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline">
          Passer aux Reels
          <ChevronRight className="size-3" />
        </Link>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              saved={savedIds.has(video.id)}
              onSave={() => toggleSaved(video.id)}
              onOpen={() => setSelected(video)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<VideoIcon className="size-6" />}
            title="Aucune vidéo trouvée"
            description="Essayez un autre mot-clé ou explorez une catégorie différente."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("Tout");
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        </Card>
      )}

      <Card className="mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand">Chaînes à suivre</p>
            <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">
              Les voix du Mali
            </h2>
          </div>
          <Sparkles className="size-4 text-[color:var(--color-gold)]" />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto">
          {[1, 4, 6, 8].map((index) => {
            const video = seedVideos[index % seedVideos.length];
            return (
              <Link
                key={video.id}
                to={video.channel.href ?? "/videos"}
                className="flex w-[190px] shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-surface-muted/40 p-2.5 transition hover:border-line-strong hover:bg-surface-muted"
              >
                <Avatar
                  name={video.channel.name}
                  src={video.channel.avatar}
                  tone={video.channel.tone}
                  size="md"
                  shape={video.channel.kind === "page" ? "squircle" : "circle"}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-[10.5px] font-semibold text-ink">
                    {video.channel.name}
                    {video.channel.verified && <VerifiedBadge className="size-2.5" />}
                  </p>
                  <p className="mt-0.5 truncate text-[8.5px] text-muted">{video.channel.subtitle ?? "Créateur malien"}</p>
                </div>
                <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand">
                  <Play className="ml-0.5 size-3" fill="currentColor" />
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/evenements"
          className="group flex items-center gap-3 rounded-[22px] border border-line bg-surface p-3.5 shadow-card transition hover:border-line-strong"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tone-red text-tone-red-ink">
            <CalendarDays className="size-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold text-ink">Les directs à venir</span>
            <span className="mt-0.5 block text-[9px] text-muted">Concerts et rencontres près de vous</span>
          </span>
          <ChevronRight className="size-3.5 text-muted" />
        </Link>
        <Link
          to="/createur"
          className="group flex items-center gap-3 rounded-[22px] border border-line bg-surface p-3.5 shadow-card transition hover:border-line-strong"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
            <Eye className="size-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold text-ink">Vos statistiques vidéo</span>
            <span className="mt-0.5 block text-[9px] text-muted">Audience et performances dans Creator Studio</span>
          </span>
          <ChevronRight className="size-3.5 text-muted" />
        </Link>
      </div>

      {selected && (
        <VideoPlayer
          open
          onClose={() => setSelected(null)}
          poster={selected.poster}
          title={selected.title}
          author={selected.channel}
          views={selected.views}
          duration={selected.duration}
          live={selected.live}
          subtitle={selected.description}
        />
      )}
    </div>
  );
}
