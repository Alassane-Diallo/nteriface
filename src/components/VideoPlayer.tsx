import { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
  Captions,
  Settings,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";

import { useApp } from "@/store";
import { formatCount } from "@/lib/utils";
import type { Author } from "@/types";
import { Avatar, VerifiedBadge } from "@/components/ui";

export function VideoPlayer({
  open,
  onClose,
  poster,
  title,
  author,
  views,
  duration,
  live,
  subtitle,
  accent = "video",
}: {
  open: boolean;
  onClose: () => void;
  poster: string;
  title: string;
  author?: Author;
  views?: string | number;
  duration?: string;
  live?: boolean;
  subtitle?: string;
  accent?: "video" | "reel";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(12);
  const { showToast } = useApp();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPlaying(true);
      setProgress(12);
      setMuted(true);
      return;
    }
    if (!playing || live) return;
    const timer = window.setInterval(() => {
      setProgress((current) => (current >= 99 ? 0 : current + 0.35));
    }, 240);
    return () => window.clearInterval(timer);
  }, [open, playing, live]);

  const handleClose = () => {
    document.body.style.overflow = "";
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      className="dialog-in m-auto w-[calc(100vw-1rem)] max-w-5xl overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0f0c] p-0 text-white shadow-pop sm:w-[calc(100vw-3rem)]"
    >
      <div className="relative">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer la vidéo"
          className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
        >
          <X className="size-4.5" />
        </button>

        <div className={accent === "reel" ? "aspect-[9/13] max-h-[78dvh] w-full sm:mx-auto sm:w-auto" : "aspect-video w-full"}>
          <div className="relative size-full">
            {poster ? (
              <img src={poster} alt="" className="size-full object-cover" />
            ) : (
              <div className="size-full bg-[#14231a]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35" />

            {(live || accent === "video") && (
              <div className="absolute left-3 top-3 flex items-center gap-2">
                {live && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-mali-red)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] shadow-sm">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" />
                    En direct
                  </span>
                )}
                <span className="rounded-full bg-black/35 px-2 py-1 text-[9px] font-medium text-white/80 backdrop-blur">
                  Aperçu · démo
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPlaying((current) => !current)}
              aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
              className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/25"
            >
              {playing ? <Pause className="size-7" fill="currentColor" /> : <Play className="ml-1 size-7" fill="currentColor" />}
            </button>

            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
              {!live && (
                <div className="mb-3">
                  <div className="h-1 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[9px] font-medium text-white/70">
                    <span>
                      {Math.floor((progress / 100) * 38)
                        .toString()
                        .padStart(2, "0")}
                      :12
                    </span>
                    <span>{duration ?? "0:38"}</span>
                  </div>
                </div>
              )}

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  {author && (
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={author.name}
                        src={author.avatar}
                        tone={author.tone}
                        size="sm"
                        shape={author.kind === "page" ? "squircle" : "circle"}
                      />
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
                        {author.name}
                        {author.verified && <VerifiedBadge />}
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast("Abonnement simulé dans la démo.", "info")}
                        className="rounded-full border border-white/30 px-2 py-0.5 text-[9px] font-semibold text-white/90 transition hover:bg-white/15"
                      >
                        Suivre
                      </button>
                    </div>
                  )}
                  <h2 className="mt-2 font-display text-[18px] font-semibold leading-snug tracking-[-0.03em] sm:text-[22px]">
                    {title}
                  </h2>
                  {subtitle && <p className="mt-1 line-clamp-2 text-[11px] text-white/65">{subtitle}</p>}
                  <p className="mt-1.5 text-[10px] text-white/60">
                    {typeof views === "number" ? `${formatCount(views)} vues` : views}
                    {live ? " · En direct maintenant" : " · Il y a 2 h"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => showToast("Vidéo ajoutée à vos favoris.", "success")}
                    aria-label="J’aime la vidéo"
                    className="grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <Heart className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Panneau de commentaires simulé.", "info")}
                    aria-label="Commentaires"
                    className="grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <MessageCircle className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Lien de la vidéo copié.", "success")}
                    aria-label="Partager"
                    className="hidden size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:grid"
                  >
                    <Share2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0b0f0c] px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPlaying((current) => !current)}
              aria-label={playing ? "Pause" : "Lecture"}
              className="grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((current) => !current)}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            {!live && (
              <span className="ml-1 hidden text-[9px] text-white/55 sm:inline">
                Lecture simulée · 1080p
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => showToast("Sous-titres français activés (démo).", "info")}
              aria-label="Sous-titres"
              className="grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Captions className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => showToast("Réglages de qualité simulés.", "info")}
              aria-label="Qualité vidéo"
              className="grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Settings className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => showToast("Plein écran simulé dans la démo.", "info")}
              aria-label="Plein écran"
              className="grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
