import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Bookmark,
  Cake,
  CalendarDays,
  ChevronRight,
  Clapperboard,
  Flag,
  Image as ImageIcon,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";

import { PostCard } from "@/components/PostCard";
import { StoryViewer } from "@/components/StoryViewer";
import {
  ArtCover,
  Avatar,
  Button,
  Card,
  DemoTag,
  EmptyState,
  Photo,
  SegmentedTabs,
  VerifiedBadge,
} from "@/components/ui";
import { cn, formatCount, formatPrice } from "@/lib/utils";
import { useApp } from "@/store";

type FeedFilter = "for-you" | "friends" | "pages" | "groups" | "saved";

const filters: { id: FeedFilter; label: string; icon: typeof Sparkles }[] = [
  { id: "for-you", label: "Pour vous", icon: Sparkles },
  { id: "friends", label: "Amis", icon: Users },
  { id: "pages", label: "Pages", icon: Flag },
  { id: "groups", label: "Groupes", icon: Users },
  { id: "saved", label: "Enregistrés", icon: Bookmark },
];

const composerActions = [
  { label: "Photo", icon: ImageIcon, tone: "bg-tone-green text-tone-green-ink", kind: "post" as const },
  { label: "Vidéo", icon: Clapperboard, tone: "bg-tone-red text-tone-red-ink", kind: "post" as const },
  { label: "Story", icon: Sparkles, tone: "bg-tone-yellow text-tone-yellow-ink", kind: "story" as const },
  { label: "Reel", icon: Radio, tone: "bg-tone-indigo text-tone-indigo-ink", kind: "reel" as const },
];

function Greeting() {
  const { state } = useApp();
  const firstName = state.me.name.split(" ")[0];
  const date = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3 pt-1">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-brand">
          Votre fil
          <DemoTag />
        </p>
        <h1 className="mt-1.5 font-display text-[27px] font-semibold leading-[1.05] tracking-[-0.05em] text-ink sm:text-[32px]">
          Bonjour, {firstName}.
        </h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
          <span className="capitalize">{date}</span>
          <span className="size-1 rounded-full bg-line-strong" />
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            Bamako, Mali
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 shadow-card sm:flex">
          <span className="grid size-8 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
            <Sun className="size-4" />
          </span>
          <div>
            <p className="text-[12px] font-semibold leading-none text-ink">34°C</p>
            <p className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.12em] text-muted">
              Ciel dégagé
            </p>
          </div>
        </div>
        <Link
          to="/createur"
          className="group hidden items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 shadow-card transition hover:border-line-strong sm:flex"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold leading-none text-ink">Creator Studio</p>
            <p className="mt-1 text-[8.5px] font-medium text-muted">
              {formatCount(state.me.followers)} abonnés
            </p>
          </div>
          <ChevronRight className="size-3.5 text-muted transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}

function StoriesRail({
  onOpen,
  seenIds,
}: {
  onOpen: (index: number) => void;
  seenIds: Set<string>;
}) {
  const { state, openComposer } = useApp();

  return (
    <section aria-label="Stories" className="mb-4">
      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => openComposer("story")}
          className="group relative flex h-[174px] w-[106px] shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border border-dashed border-brand/30 bg-brand-soft/70 text-center transition hover:border-brand/50 hover:bg-brand-soft sm:h-[188px] sm:w-[118px]"
        >
          <span className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(11,122,69,0.16),transparent_70%)]" />
          <span className="relative grid size-10 place-items-center rounded-full bg-surface text-brand shadow-sm transition group-hover:scale-105">
            <Plus className="size-5" />
          </span>
          <span className="relative px-2">
            <span className="block text-[10.5px] font-semibold text-brand-ink">Créer une Story</span>
            <span className="mt-0.5 block text-[8.5px] leading-tight text-muted">Photo · texte · musique</span>
          </span>
        </button>

        {state.stories.map((story, index) => {
          const seen = seenIds.has(story.id) || story.seen;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`Ouvrir la Story de ${story.author.name}`}
              className={cn(
                "group relative h-[174px] w-[106px] shrink-0 overflow-hidden rounded-[20px] border-2 text-left shadow-card transition duration-300 hover:-translate-y-0.5 sm:h-[188px] sm:w-[118px]",
                seen ? "border-line" : "border-brand/70",
              )}
            >
              <Photo
                src={story.image}
                alt={story.caption ?? story.author.name}
                className="absolute inset-0 size-full"
                imgClassName={cn(
                  "transition duration-500 group-hover:scale-[1.04]",
                  seen && "opacity-80 saturate-[0.75]",
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/75" />
              <span
                className={cn(
                  "absolute left-2.5 top-2.5 rounded-full p-[2px]",
                  seen ? "bg-black/25" : "bg-brand",
                )}
              >
                <Avatar
                  name={story.author.name}
                  src={story.author.avatar}
                  tone={story.author.tone}
                  size="sm"
                  ring
                />
              </span>
              {story.mine && (
                <span className="absolute right-2 top-2 rounded-full bg-black/35 px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur">
                  Vous
                </span>
              )}
              <span className="absolute inset-x-2.5 bottom-2.5">
                <span className="flex items-center gap-1 truncate text-[10px] font-semibold text-white drop-shadow">
                  {story.author.name}
                  {story.author.verified && <VerifiedBadge className="size-3 bg-white/20" />}
                </span>
                {story.caption && (
                  <span className="mt-0.5 line-clamp-2 text-[8px] leading-tight text-white/70">
                    {story.caption}
                  </span>
                )}
              </span>
            </button>
          );
        })}

        <Link
          to="/videos"
          className="group relative flex h-[174px] w-[106px] shrink-0 flex-col justify-between overflow-hidden rounded-[20px] bg-[linear-gradient(150deg,#173d55,#0d2333)] p-3 text-left text-white shadow-card transition hover:-translate-y-0.5 sm:h-[188px] sm:w-[118px]"
        >
          <span className="grid size-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
            <Clapperboard className="size-4" />
          </span>
          <span>
            <span className="block text-[10px] font-semibold leading-tight">Les Reels du jour</span>
            <span className="mt-1 flex items-center gap-1 text-[8px] font-semibold text-white/60">
              Découvrir
              <ArrowUpRight className="size-2.5" />
            </span>
          </span>
          <span className="pointer-events-none absolute -right-8 -top-6 size-24 rounded-full border border-white/15" />
          <span className="pointer-events-none absolute -bottom-10 -left-6 size-24 rounded-full border border-white/10" />
        </Link>
      </div>
    </section>
  );
}

function ComposerCard() {
  const { state, openComposer } = useApp();

  return (
    <Card className="mb-3.5 p-3 sm:p-4">
      <div className="flex items-center gap-2.5">
        <Link to={`/profil/${state.me.username}`} aria-label="Votre profil">
          <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="lg" online />
        </Link>
        <button
          type="button"
          onClick={() => openComposer("post")}
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface-muted px-4 text-left text-[12px] text-muted transition hover:border-line-strong hover:bg-surface"
        >
          Quoi de neuf, {state.me.name.split(" ")[0]} ?
        </button>
      </div>
      <div className="mt-3 h-px bg-line" />
      <div className="mt-2 grid grid-cols-4 gap-1">
        {composerActions.map(({ label, icon: Icon, tone, kind }) => (
          <button
            key={label}
            type="button"
            onClick={() => openComposer(kind)}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-[10.5px] font-semibold text-ink-soft transition hover:bg-surface-muted hover:text-ink sm:gap-2 sm:text-[11px]"
          >
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", tone)}>
              <Icon className="size-3.5" />
            </span>
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Birthdays() {
  const { showToast } = useApp();

  return (
    <div className="mb-3.5 flex items-center gap-3 rounded-2xl border border-gold/25 bg-gold-soft/50 px-3.5 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface text-[color:var(--color-gold)] shadow-sm">
        <Cake className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-[10.5px] leading-relaxed text-ink-soft">
        <span className="font-semibold text-ink">Kadidia et 2 autres amis</span> fêtent leur
        anniversaire aujourd’hui.
      </p>
      <button
        type="button"
        onClick={() => showToast("Message d’anniversaire envoyé à Kadidia. 🎉")}
        className="shrink-0 text-[10px] font-semibold text-brand hover:underline"
      >
        Souhaiter
      </button>
    </div>
  );
}

function DiscoverStrip() {
  const { state } = useApp();
  const event = state.events[0];
  const listing = state.listings.find((item) => item.id === "bazin-collection") ?? state.listings[0];
  const page = state.pages[0];

  return (
    <Card className="mb-3.5 overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand">À découvrir</p>
          <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">
            Le Mali bouge près de vous
          </h2>
        </div>
        <Link
          to="/local"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
        >
          Explorer
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1">
        <Link
          to={`/evenements/${event.id}`}
          className="group w-[210px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted/40"
        >
          <ArtCover art={event.art} className="h-[98px]" label={event.category}>
            <span className="absolute bottom-2.5 left-3 right-3">
              <span className="block text-[11px] font-semibold leading-tight text-white drop-shadow">
                {event.title}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[8.5px] text-white/75">
                <CalendarDays className="size-2.5" />
                {event.date}
              </span>
            </span>
          </ArtCover>
          <div className="p-2.5">
            <p className="flex items-center gap-1 text-[9px] font-medium text-muted">
              <Users className="size-2.5" />
              {formatCount(event.attendees)} participants
            </p>
            <p className="mt-1 line-clamp-1 text-[9px] text-ink-soft">{event.location}</p>
          </div>
        </Link>

        <Link
          to={`/marketplace/${listing.id}`}
          className="group w-[180px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted/40"
        >
          <Photo src={listing.image} alt={listing.title} className="h-[98px] w-full" />
          <div className="p-2.5">
            <p className="line-clamp-1 text-[10.5px] font-semibold text-ink group-hover:text-brand">
              {listing.title}
            </p>
            <p className="mt-1 font-display text-[12px] font-semibold text-brand">
              {formatPrice(listing.price)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[8.5px] text-muted">
              <MapPin className="size-2.5" />
              {listing.location}
            </p>
          </div>
        </Link>

        <Link
          to={`/pages/${page.id}`}
          className="group w-[190px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted/40"
        >
          <ArtCover art={page.art} className="h-[98px]" />
          <div className="p-2.5">
            <p className="flex items-center gap-1 text-[10.5px] font-semibold text-ink group-hover:text-brand">
              {page.name}
              {page.verified && <VerifiedBadge className="size-3" />}
            </p>
            <p className="mt-0.5 text-[8.5px] text-muted">{page.category}</p>
            <p className="mt-1.5 flex items-center gap-1 text-[9px] font-medium text-ink-soft">
              <Flag className="size-2.5 text-muted" />
              {formatCount(page.followers)} abonnés
            </p>
          </div>
        </Link>
      </div>
    </Card>
  );
}

function EmptyFeed({ filter }: { filter: FeedFilter }) {
  const messages: Record<FeedFilter, { title: string; description: string }> = {
    "for-you": {
      title: "Votre fil se prépare",
      description: "Revenez dans un instant ou créez votre première publication.",
    },
    friends: {
      title: "Aucune publication d’amis pour le moment",
      description: "Ajoutez des amis pour voir leurs photos, idées et moments partagés ici.",
    },
    pages: {
      title: "Vous ne suivez encore aucune Page",
      description: "Suivez Faso Kréa, Baobab Café ou Mali Tourisme pour suivre leur actualité.",
    },
    groups: {
      title: "Aucune discussion de groupe",
      description: "Rejoignez un groupe et participez aux conversations de votre communauté.",
    },
    saved: {
      title: "Rien d’enregistré pour l’instant",
      description: "Touchez l’icône signet sur une publication pour la retrouver ici.",
    },
  };
  const message = messages[filter];

  return (
    <Card>
      <EmptyState
        icon={<Sparkles className="size-6" />}
        title={message.title}
        description={message.description}
        action={
          <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Explorer le fil
          </Button>
        }
      />
    </Card>
  );
}

export default function Feed() {
  const { state, showToast } = useApp();
  const [filter, setFilter] = useState<FeedFilter>("for-you");
  const [visible, setVisible] = useState(4);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set(state.stories.filter((story) => story.seen).map((story) => story.id)),
  );

  const handleSeen = useCallback((id: string) => {
    setSeenIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const filteredPosts = useMemo(() => {
    switch (filter) {
      case "friends":
        return state.posts.filter(
          (post) =>
            (post.author.kind === "user" || !post.author.kind) &&
            (post.author.id === state.me.id || state.friendIds.includes(post.author.id)),
        );
      case "pages":
        return state.posts.filter((post) => post.pageId || post.author.kind === "page");
      case "groups":
        return state.posts.filter((post) => post.groupId);
      case "saved":
        return state.posts.filter((post) => post.saved);
      default:
        return state.posts;
    }
  }, [filter, state.friendIds, state.me.id, state.posts]);

  const changeFilter = (next: FeedFilter) => {
    setFilter(next);
    setVisible(4);
  };

  const visiblePosts = filteredPosts.slice(0, visible);
  const remaining = filteredPosts.length - visiblePosts.length;

  return (
    <div>
      <Greeting />
      <StoriesRail onOpen={setViewerIndex} seenIds={seenIds} />
      <ComposerCard />
      <Birthdays />

      <div className="sticky top-[64px] z-30 mb-3 -mx-1 bg-canvas/85 px-1 py-1 backdrop-blur-xl">
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-card">
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
            {filters.map(({ id, label, icon: Icon }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => changeFilter(id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[10.5px] font-semibold transition sm:px-3",
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "text-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setVisible(4);
              showToast("Fil actualisé. Les dernières publications sont affichées.", "info");
            }}
            aria-label="Actualiser le fil"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {visiblePosts.map((post, index) => (
          <div key={post.id}>
            <PostCard post={post} />
            {index === 2 && filter === "for-you" && <div className="mt-3.5"><DiscoverStrip /></div>}
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && <EmptyFeed filter={filter} />}

      {filteredPosts.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {remaining > 0 ? (
            <Button variant="secondary" onClick={() => setVisible((current) => current + 3)}>
              Afficher plus de publications
              <span className="text-[10px] font-semibold text-muted">({remaining})</span>
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <span className="grid size-10 place-items-center rounded-full border border-brand/20 bg-brand-soft text-brand">
                <Sparkles className="size-4" />
              </span>
              <p className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
                Vous êtes à jour.
              </p>
              <p className="max-w-xs text-[10.5px] leading-relaxed text-muted">
                Prenez le temps de découvrir les tendances et les créateurs du Mali.
              </p>
              <Link
                to="/local"
                className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline"
              >
                Explorer le Mali
                <ChevronRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {viewerIndex !== null && (
        <StoryViewer
          stories={state.stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onSeen={handleSeen}
        />
      )}
    </div>
  );
}
