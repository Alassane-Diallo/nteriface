import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Music2,
  Pause,
  Play,
  Send,
  X,
} from "lucide-react";

import { Avatar, VerifiedBadge } from "@/components/ui";
import { cn, formatCount } from "@/lib/utils";
import type { Story } from "@/types";

const DURATION = 7000;

export function StoryViewer({
  stories,
  initialIndex = 0,
  onClose,
  onSeen,
}: {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onSeen?: (id: string) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);

  const story = stories[index];

  const goNext = () => {
    setLiked(false);
    setSent(false);
    setReply("");
    if (index >= stories.length - 1) {
      onClose();
      return;
    }
    setIndex((current) => current + 1);
  };

  const goPrev = () => {
    setLiked(false);
    setSent(false);
    setReply("");
    setIndex((current) => Math.max(0, current - 1));
  };

  useEffect(() => {
    if (!story) return;
    onSeen?.(story.id);
  }, [story, onSeen]);

  useEffect(() => {
    if (!story) return;
    const timer = window.setTimeout(goNext, DURATION);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, story?.id, paused]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === " ") {
        event.preventDefault();
        setPaused((current) => !current);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, stories.length]);

  if (!story) return null;

  const submitReply = (event: FormEvent) => {
    event.preventDefault();
    if (!reply.trim()) return;
    setSent(true);
    setReply("");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-[#06110c]/94 px-0 py-0 backdrop-blur-md sm:px-6 sm:py-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Story de ${story.author.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la Story"
        className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white sm:right-6 sm:top-6"
      >
        <X className="size-5" />
      </button>

      <button
        type="button"
        onClick={goPrev}
        aria-label="Story précédente"
        className="absolute left-5 top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white sm:grid"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Story suivante"
        className="absolute right-5 top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white sm:grid"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-black sm:h-[min(92dvh,860px)] sm:w-[min(420px,92vw)] sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
        <img
          src={story.image}
          alt={story.caption ?? `Story de ${story.author.name}`}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/0 to-black/85" />

        <div className="relative z-10 flex gap-1 px-3 pt-3.5">
          {stories.map((item, storyIndex) => (
            <span key={item.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              {storyIndex < index && <span className="block h-full w-full rounded-full bg-white" />}
              {storyIndex === index && (
                <span
                  key={`${item.id}-${paused}`}
                  className="story-progress block h-full origin-left rounded-full bg-white"
                  style={{
                    animationDuration: `${DURATION}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              )}
            </span>
          ))}
        </div>

        <header className="relative z-10 flex items-center gap-2.5 px-3.5 pt-3">
          <Avatar
            name={story.author.name}
            src={story.author.avatar}
            tone={story.author.tone}
            size="md"
            ring
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[12px] font-semibold text-white">
              {story.author.name}
              {story.author.verified && <VerifiedBadge className="size-3 bg-white/20" />}
            </p>
            <p className="text-[9px] font-medium text-white/65">
              Il y a 3 h · {story.mine ? "Votre Story" : "Bamako"}
            </p>
          </div>
          {story.mine && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-2 py-1 text-[8.5px] font-semibold text-white/85 backdrop-blur">
              <Eye className="size-3" />
              {formatCount(story.viewers)}
            </span>
          )}
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            aria-label={paused ? "Reprendre la Story" : "Mettre en pause"}
            className="grid size-8 place-items-center rounded-full bg-black/20 text-white/80 backdrop-blur transition hover:bg-black/35 hover:text-white"
          >
            {paused ? <Play className="size-3.5" fill="currentColor" /> : <Pause className="size-3.5" fill="currentColor" />}
          </button>
        </header>

        <button
          type="button"
          onClick={goNext}
          aria-label="Avancer dans la Story"
          className="min-h-0 flex-1"
        />

        <footer className="relative z-10 space-y-3.5 px-4 pb-5">
          {story.caption && (
            <p className="max-w-[92%] font-display text-[16px] font-medium leading-snug tracking-[-0.02em] text-white text-balance drop-shadow">
              {story.caption}
            </p>
          )}

          {story.music && (
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur">
              <Music2 className="size-3.5 shrink-0 text-[color:var(--color-mali-yellow)]" />
              <span className="truncate">{story.music}</span>
              <span className="ml-1 flex items-end gap-[2px]" aria-hidden="true">
                {[6, 10, 4, 8].map((height, barIndex) => (
                  <span
                    key={barIndex}
                    className="w-[2px] rounded-full bg-white/60"
                    style={{ height }}
                  />
                ))}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <form onSubmit={submitReply} className="relative flex min-w-0 flex-1 items-center">
              <input
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={sent ? "Réponse envoyée !" : "Répondre à la Story…"}
                aria-label="Répondre à la Story"
                className="h-10 w-full rounded-full border border-white/20 bg-black/25 pl-4 pr-10 text-[11px] font-medium text-white outline-none backdrop-blur placeholder:text-white/50 focus:border-white/45"
              />
              <button
                type="submit"
                aria-label="Envoyer la réponse"
                className="absolute right-1 grid size-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Send className="size-3.5" />
              </button>
            </form>
            <button
              type="button"
              onClick={() => setLiked((current) => !current)}
              aria-label="Aimer la Story"
              aria-pressed={liked}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur transition",
                liked
                  ? "text-[color:var(--color-mali-red)]"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {["❤️", "🔥", "👏", "😍"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setLiked(true)}
                className="grid size-8 place-items-center rounded-full text-[15px] transition hover:-translate-y-0.5 hover:bg-white/10"
                aria-label={`Réagir ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
