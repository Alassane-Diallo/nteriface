import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Clapperboard,
  Ellipsis,
  Heart,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Send,
  Share2,
  Sparkles,
  Volume2,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import {
  Avatar,
  Button,
  Card,
  Chip,
  DemoTag,
  EmptyState,
  IconButton,
  Menu,
  Modal,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { cn, formatCount } from "@/lib/utils";
import { useApp } from "@/store";
import type { Reel } from "@/types";

type ReelFilter = "for-you" | "following" | "saved";

const filters: { id: ReelFilter; label: string }[] = [
  { id: "for-you", label: "Pour vous" },
  { id: "following", label: "Abonnements" },
  { id: "saved", label: "Enregistrés" },
];

function ReelCard({
  reel,
  active,
  onActivate,
  followed,
  onFollow,
}: {
  reel: Reel;
  active: boolean;
  onActivate: () => void;
  followed: boolean;
  onFollow: () => void;
}) {
  const { toggleReelLike, toggleReelSave, showToast } = useApp();
  const [progress, setProgress] = useState(12);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { id: "c1", name: "Aminata Cissé", text: "Cette lumière est incroyable 😍", time: "Il y a 4 min" },
    { id: "c2", name: "Sékou Coulibaly", text: "Le Mali a tellement de talents.", time: "Il y a 18 min" },
  ]);
  const [shares, setShares] = useState(reel.shares);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setProgress((current) => (current >= 99 ? 0 : current + 0.45));
    }, 220);
    return () => window.clearInterval(timer);
  }, [active]);

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setComments((current) => [
      { id: `local-${Date.now()}`, name: "Vous", text: comment.trim(), time: "À l’instant" },
      ...current,
    ]);
    setComment("");
    showToast("Commentaire ajouté au Reel.");
  };

  return (
    <article
      id={`reel-${reel.id}`}
      className="relative h-[clamp(540px,74dvh,720px)] w-full snap-start overflow-hidden rounded-[28px] border border-white/10 bg-[#08110c] text-white shadow-frame"
    >
      <img
        src={reel.poster}
        alt={reel.caption}
        className={cn(
          "absolute inset-0 size-full object-cover transition-transform duration-[7000ms] ease-linear",
          active ? "scale-[1.05]" : "scale-100",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/0 to-black/85" />
      <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-white/20">
        <div
          className="h-full rounded-r-full bg-white transition-[width] duration-200"
          style={{ width: `${active ? progress : 0}%` }}
        />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            name={reel.author.name}
            src={reel.author.avatar}
            tone={reel.author.tone}
            size="md"
            ring
            online
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[12px] font-semibold drop-shadow">
              {reel.author.name}
              {reel.author.verified && <VerifiedBadge className="size-3 bg-white/20" />}
            </p>
            <p className="mt-0.5 text-[8.5px] font-medium text-white/60">
              {reel.author.handle ?? "@nteriface"} · {reel.duration}
            </p>
          </div>
          <button
            type="button"
            onClick={onFollow}
            className={cn(
              "ml-1 h-7 shrink-0 rounded-full border px-2.5 text-[9.5px] font-semibold backdrop-blur transition",
              followed
                ? "border-white/25 bg-white/10 text-white/80"
                : "border-white/40 bg-white/95 text-ink hover:bg-white",
            )}
          >
            {followed ? "Suivi" : "Suivre"}
          </button>
        </div>
        <Menu
          label="Options du Reel"
          trigger={
            <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur">
              <Ellipsis className="size-4" />
            </span>
          }
          items={[
            { label: "Copier le lien", onClick: () => showToast("Lien du Reel copié.", "success") },
            { label: "Masquer ce Reel", onClick: () => showToast("Vous verrez moins de Reels comme celui-ci.", "info") },
            { label: "Signaler", danger: true, onClick: () => showToast("Signalement envoyé à la modération.", "info") },
          ]}
        />
      </header>

      <button
        type="button"
        onClick={onActivate}
        aria-label={active ? "Mettre le Reel en pause" : "Lire le Reel"}
        className="absolute inset-0 z-10 grid place-items-center"
      >
        {!active && (
          <span className="grid size-16 place-items-center rounded-full bg-black/25 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/35">
            <Play className="ml-1 size-7" fill="currentColor" />
          </span>
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Avatar
              name={reel.author.name}
              src={reel.author.avatar}
              tone={reel.author.tone}
              size="xs"
              ring
            />
            <span className="text-[10px] font-semibold text-white/90">{reel.author.name}</span>
            <span className="size-1 rounded-full bg-white/35" />
            <span className="text-[8.5px] text-white/50">Reel · {formatCount(reel.likes)} J’aime</span>
          </div>
          <p className="mt-2 max-w-[92%] text-[12px] leading-relaxed text-white/90">
            {reel.caption}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {reel.tags.map((tag) => (
              <Link
                key={tag}
                to={`/recherche?q=${encodeURIComponent(tag)}`}
                className="text-[10px] font-semibold text-[color:var(--color-mali-yellow)] hover:underline"
              >
                {tag}
              </Link>
            ))}
          </div>
          <div className="mt-2.5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/25 px-2.5 py-1.5 backdrop-blur">
            <Music2 className="size-3 shrink-0 text-[color:var(--color-mali-yellow)]" />
            <span className="truncate text-[9px] font-medium text-white/80">{reel.audio}</span>
            <Volume2 className="size-3 shrink-0 text-white/50" />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3.5 pb-1">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => toggleReelLike(reel.id)}
              aria-label="J’aime le Reel"
              aria-pressed={reel.liked}
              className={cn(
                "grid size-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur transition hover:scale-105 hover:bg-black/40",
                reel.liked ? "text-[color:var(--color-mali-red)]" : "text-white",
              )}
            >
              <Heart className={cn("size-[18px]", reel.liked && "fill-current")} />
            </button>
            <span className="text-[8.5px] font-semibold text-white/70">
              {formatCount(reel.likes)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              aria-label="Commentaires du Reel"
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur transition hover:scale-105 hover:bg-black/40"
            >
              <MessageCircle className="size-[18px]" />
            </button>
            <span className="text-[8.5px] font-semibold text-white/70">
              {formatCount(reel.comments + comments.length - 2)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setShares((current) => current + 1);
                showToast("Lien du Reel copié. Partage prêt !");
              }}
              aria-label="Partager le Reel"
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur transition hover:scale-105 hover:bg-black/40"
            >
              <Share2 className="size-[18px]" />
            </button>
            <span className="text-[8.5px] font-semibold text-white/70">{formatCount(shares)}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleReelSave(reel.id)}
            aria-label="Enregistrer le Reel"
            aria-pressed={reel.saved}
            className={cn(
              "grid size-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur transition hover:scale-105 hover:bg-black/40",
              reel.saved ? "text-[color:var(--color-mali-yellow)]" : "text-white",
            )}
          >
            {reel.saved ? <BookmarkCheck className="size-[18px]" /> : <Bookmark className="size-[18px]" />}
          </button>

          <span className={cn("relative size-10 rounded-full border-2 border-white/30 bg-white/10", active && "animate-[spin_8s_linear_infinite]")}>
            <Avatar name={reel.author.name} src={reel.author.avatar} tone={reel.author.tone} size="md" className="size-full border-0" />
          </span>
          <button
            type="button"
            onClick={() => document.getElementById(`reel-${reel.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
            aria-label="Reel suivant"
            className="grid size-8 place-items-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      <Modal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        title={`Commentaires · ${formatCount(reel.comments + comments.length - 2)}`}
        description="Discussion de la communauté N’Teriface."
        size="md"
        footer={
          <form onSubmit={submitComment} className="flex w-full items-center gap-2">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Ajouter un commentaire…"
              aria-label="Ajouter un commentaire"
              className={cn(fieldClass, "h-10 flex-1")}
            />
            <IconButton label="Envoyer le commentaire" type="submit" className="bg-brand text-white hover:bg-brand-deep hover:text-white">
              <Send className="size-4" />
            </IconButton>
          </form>
        }
      >
        <div className="space-y-4">
          {comments.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              <Avatar name={item.name} tone="green" size="sm" />
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl rounded-tl-md bg-surface-muted px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold text-ink">{item.name}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">{item.text}</p>
                </div>
                <p className="mt-1 text-[9px] text-muted">{item.time} · J’aime · Répondre</p>
              </div>
            </div>
          ))}
          <p className="text-center text-[9px] text-muted">
            Les commentaires sont simulés et stockés localement pour la démo.
          </p>
        </div>
      </Modal>
    </article>
  );
}

export default function ReelsPage() {
  const { state, openComposer } = useApp();
  const [filter, setFilter] = useState<ReelFilter>("for-you");
  const [activeId, setActiveId] = useState<string | null>(state.reels[0]?.id ?? null);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(["ibrahim"]));

  const reels = filter === "saved" ? state.reels.filter((reel) => reel.saved) : state.reels;

  const toggleFollow = (authorId: string) => {
    setFollowedIds((current) => {
      const next = new Set(current);
      if (next.has(authorId)) next.delete(authorId);
      else next.add(authorId);
      return next;
    });
  };

  return (
    <div>
      <PageIntro
        eyebrow="N’Teriface Reels"
        title="Reels"
        description="Des formats courts, verticaux et vivants, signés par les créateurs du Mali."
        action={
          <Button size="sm" onClick={() => openComposer("reel")}>
            <Clapperboard className="size-3.5" />
            Créer un Reel
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {filters.map((item) => (
            <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <DemoTag />
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[9px] font-semibold text-muted">
            <Play className="size-2.5" fill="currentColor" />
            Lecture simulée
          </span>
        </div>
      </div>

      {reels.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bookmark className="size-6" />}
            title="Aucun Reel enregistré"
            description="Touchez le signet sous un Reel pour le retrouver ici, même hors connexion."
            action={
              <Button variant="secondary" onClick={() => setFilter("for-you")}>
                Explorer les Reels
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {reels.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              active={activeId === reel.id}
              onActivate={() => setActiveId((current) => (current === reel.id ? null : reel.id))}
              followed={followedIds.has(reel.author.id)}
              onFollow={() => toggleFollow(reel.author.id)}
            />
          ))}
          <Card className="p-4 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
              <Sparkles className="size-4" />
            </span>
            <p className="mt-2 font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
              Vous avez vu les Reels du moment
            </p>
            <p className="mx-auto mt-1 max-w-xs text-[10.5px] leading-relaxed text-muted">
              Revenez plus tard pour de nouvelles créations, ou partagez les vôtres avec la communauté.
            </p>
            <Button className="mt-3" size="sm" variant="secondary" onClick={() => openComposer("reel")}>
              <Clapperboard className="size-3.5" />
              Publier un Reel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
