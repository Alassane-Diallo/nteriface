import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  Ellipsis,
  EyeOff,
  Flag,
  Globe,
  Image as ImageIcon,
  Languages,
  Link2,
  Lock,
  MapPin,
  MessageCircle,
  Play,
  Send,
  Share2,
  Smile,
  Sparkles,
  Store,
  UserMinus,
  Users,
  X,
} from "lucide-react";

import { useApp } from "@/store";
import type { Post, ReactionType } from "@/types";
import {
  Avatar,
  Button,
  Card,
  IconButton,
  InlineNotice,
  Modal,
  Photo,
  PhotoCount,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import {
  ReactionIcon,
  reactionLabel,
  reactionOrder,
} from "@/components/ReactionIcon";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn, formatCount, formatPrice } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Rich text                                                           */
/* ------------------------------------------------------------------ */

function RichText({ text, expanded }: { text: string; expanded: boolean }) {
  const parts = text.split(/((?:#|@)[\p{L}\p{N}_]+)/gu);

  return (
    <p
      className={cn(
        "whitespace-pre-line text-[13px] leading-[1.55] text-ink-soft",
        !expanded && "line-clamp-6",
      )}
    >
      {parts.map((part, index) =>
        part.startsWith("#") || part.startsWith("@") ? (
          <Link
            key={`${part}-${index}`}
            to={`/recherche?q=${encodeURIComponent(part)}`}
            className="font-semibold text-brand hover:underline"
          >
            {part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function audienceIcon(post: Post) {
  if (post.audience === "private") return <Lock className="size-3" />;
  if (post.audience === "friends") return <Users className="size-3" />;
  return <Globe className="size-3" />;
}

function audienceLabel(post: Post) {
  if (post.audience === "private") return "Privé";
  if (post.audience === "friends") return "Amis";
  if (post.audience === "group") return "Groupe";
  if (post.audience === "page") return "Page";
  return "Public";
}

function PostHeader({
  post,
  onOpenReport,
  onOpenWhy,
}: {
  post: Post;
  onOpenReport: () => void;
  onOpenWhy: () => void;
}) {
  const { toggleSavePost, hidePost, showToast } = useApp();
  const authorLink = post.author.href ?? "#";

  return (
    <div className="flex items-start gap-2.5 px-4 pb-2 pt-4">
      <Link to={authorLink} aria-label={`Voir le profil de ${post.author.name}`}>
        <Avatar
          name={post.author.name}
          src={post.author.avatar}
          tone={post.author.tone}
          size="lg"
          shape={post.author.kind === "page" || post.author.kind === "brand" ? "squircle" : "circle"}
          online={post.author.kind === "user" ? undefined : undefined}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Link to={authorLink} className="truncate text-[12.5px] font-semibold text-ink hover:underline">
            {post.author.name}
          </Link>
          {post.author.verified && <VerifiedBadge />}
          {post.sponsored && (
            <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[color:var(--color-gold)]">
              Sponsorisé
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[9.5px] text-muted">
          <span>{post.time}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1" title={`Visibilité : ${audienceLabel(post)}`}>
            {audienceIcon(post)}
            {audienceLabel(post)}
          </span>
          {post.location && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="size-2.5" />
                {post.location}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        {post.feeling && (
          <span className="hidden items-center gap-1 text-[9.5px] text-muted sm:flex">
            <Sparkles className="size-3 text-brand" />
            {post.feeling}
          </span>
        )}
        <MenuButton
          items={[
            {
              label: post.saved ? "Retirer des enregistrements" : "Enregistrer la publication",
              icon: post.saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />,
              onClick: () => toggleSavePost(post.id),
            },
            {
              label: "Copier le lien",
              icon: <Copy className="size-4" />,
              onClick: () => {
                void navigator.clipboard?.writeText(window.location.href);
                showToast("Lien de la publication copié.", "success");
              },
            },
            {
              label: "Traduire la publication",
              icon: <Languages className="size-4" />,
              onClick: () => showToast("Traduction automatique simulée : la publication est déjà en français.", "info"),
            },
            {
              label: "Ne plus suivre cet auteur",
              icon: <UserMinus className="size-4" />,
              onClick: () => showToast("Vous verrez moins de publications de cet auteur.", "info"),
            },
            { label: "", separator: true },
            {
              label: "Pourquoi je vois cette publication ?",
              icon: <CircleHelp className="size-4" />,
              onClick: onOpenWhy,
            },
            {
              label: "Masquer la publication",
              icon: <EyeOff className="size-4" />,
              onClick: () => hidePost(post.id),
            },
            {
              label: "Signaler",
              icon: <Flag className="size-4" />,
              danger: true,
              onClick: onOpenReport,
            },
          ]}
          label="Options de la publication"
        />
      </div>
    </div>
  );
}

function MenuButton({
  items,
  label,
}: {
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
    separator?: boolean;
  }>;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="size-9"
      >
        <Ellipsis className="size-4" />
      </IconButton>
      {open && (
        <div
          role="menu"
          className="pop-in absolute right-0 top-[calc(100%+4px)] z-40 w-[270px] rounded-2xl border border-line bg-surface p-1.5 shadow-pop"
        >
          {items.map((item, index) =>
            item.separator ? (
              <div key={`sep-${index}`} className="my-1 h-px bg-line" role="separator" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[11.5px] font-medium transition",
                  item.danger ? "text-danger hover:bg-danger-soft" : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

function MediaGallery({ post, onOpen }: { post: Post; onOpen: (index: number) => void }) {
  const media = post.media ?? [];
  if (media.length === 0) return null;

  if (media.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="mx-4 mt-1 block overflow-hidden rounded-2xl border border-line text-left"
      >
        <Photo src={media[0].url} alt={media[0].alt} className="aspect-[16/10] w-full" />
      </button>
    );
  }

  if (media.length === 2) {
    return (
      <div className="mx-4 mt-1 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl border border-line">
        {media.map((item, index) => (
          <button key={item.id} type="button" onClick={() => onOpen(index)} className="block">
            <Photo src={item.url} alt={item.alt} className="aspect-square w-full" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-4 mt-1 grid h-[320px] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-2xl border border-line sm:h-[380px]">
      {media.slice(0, 4).map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(index)}
          className={cn("relative block h-full overflow-hidden", index === 0 && media.length === 3 && "row-span-2")}
        >
          <Photo src={item.url} alt={item.alt} className="size-full" />
          {index === 3 && media.length > 4 && <PhotoCount count={media.length - 4} />}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Embeds                                                              */
/* ------------------------------------------------------------------ */

function PollBlock({ post }: { post: Post }) {
  const { votePoll } = useApp();
  if (!post.poll) return null;
  const poll = post.poll;
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const voted = Boolean(poll.voted);
  const max = Math.max(...poll.options.map((option) => option.votes), 1);

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-line bg-surface-muted/50 p-3.5">
      <p className="text-[12.5px] font-semibold text-ink">{poll.question}</p>
      <div className="mt-3 space-y-1.5">
        {poll.options.map((option) => {
          const isMine = poll.voted === option.id;
          const percent = voted ? Math.round((option.votes / Math.max(total, 1)) * 100) : 0;
          return (
            <button
              key={option.id}
              type="button"
              disabled={voted}
              onClick={() => votePoll(post.id, option.id)}
              className={cn(
                "relative flex h-10 w-full items-center justify-between overflow-hidden rounded-xl border px-3 text-left transition",
                voted
                  ? "border-line bg-surface"
                  : "border-line bg-surface hover:border-brand/40 hover:bg-brand-soft/40",
                isMine && "border-brand/40",
              )}
            >
              {voted && (
                <span
                  className={cn("absolute inset-y-0 left-0 bg-brand/10", isMine && "bg-brand/20")}
                  style={{ width: `${Math.max((option.votes / max) * 100, 2)}%` }}
                  aria-hidden="true"
                />
              )}
              <span className="relative flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
                {isMine && <Check className="size-3 text-brand" />}
                {option.label}
              </span>
              {voted && <span className="relative text-[11px] font-semibold text-muted">{percent} %</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[9.5px] text-muted">
        {formatCount(total)} vote{total > 1 ? "s" : ""} · {poll.ends}
        {voted && " · Merci pour votre vote"}
      </p>
    </div>
  );
}

function EventEmbed({ post }: { post: Post }) {
  const { state, toggleGoing } = useApp();
  const event = state.events.find((item) => item.id === post.eventId);
  if (!event) return null;

  return (
    <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-line">
      <Link to={`/evenements/${event.id}`} className="block">
        <div className="relative">
          <div
            className={cn(
              "h-28 w-full",
              event.art === "indigo" && "indigo-art",
              event.art === "green" && "bg-[linear-gradient(150deg,#0b7a45,#075c35)]",
              event.art === "clay" && "bogolan",
              event.art === "sahel" && "sahel-art",
            )}
          />
          <div className="absolute left-3 top-3 rounded-xl border border-white/20 bg-black/25 px-2.5 py-1.5 text-center backdrop-blur-sm">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/75">{event.date.split(" ")[0]}</p>
            <p className="text-[18px] font-semibold leading-none text-white">{event.date.split(" ")[1]}</p>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/evenements/${event.id}`}>
          <h3 className="text-[12.5px] font-semibold text-ink hover:underline">{event.title}</h3>
        </Link>
        <p className="mt-1 text-[9.5px] text-muted">
          {event.fullDate} · {event.time}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-muted">
          <MapPin className="size-2.5" /> {event.location}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-[9px] text-muted">{formatCount(event.attendees)} participants</p>
          <Button
            size="sm"
            variant={event.going ? "secondary" : "primary"}
            className="h-8 px-3 text-[10px]"
            onClick={() => toggleGoing(event.id)}
          >
            {event.going ? "Je participe" : "Participer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ListingEmbed({ post }: { post: Post }) {
  const { state } = useApp();
  const listing = state.listings.find((item) => item.id === post.listingId);
  if (!listing) return null;

  return (
    <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-line">
      <div className="flex items-stretch">
        <Link to={`/marketplace/${listing.id}`} className="block w-[38%] shrink-0">
          <Photo src={listing.image} alt={listing.title} className="size-full min-h-28" />
        </Link>
        <div className="min-w-0 flex-1 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand">Marketplace</p>
          <Link to={`/marketplace/${listing.id}`}>
            <h3 className="mt-1 line-clamp-2 text-[12px] font-semibold text-ink hover:underline">{listing.title}</h3>
          </Link>
          <p className="mt-1 font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
            {formatPrice(listing.price)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted">
            <Store className="size-2.5" /> {listing.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comments                                                            */
/* ------------------------------------------------------------------ */

function CommentBubble({
  comment,
  postId,
  onReply,
}: {
  comment: Post["comments"][number];
  postId: string;
  onReply: (comment: Post["comments"][number]) => void;
}) {
  const { likeComment } = useApp();

  return (
    <div className="flex items-start gap-2">
      <Avatar name={comment.author.name} src={comment.author.avatar} tone={comment.author.tone} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="w-fit max-w-full rounded-2xl rounded-tl-md bg-surface-muted px-3 py-2">
          <p className="flex items-center gap-1 text-[10.5px] font-semibold text-ink">
            {comment.author.name}
            {comment.author.verified && <VerifiedBadge className="size-3" />}
          </p>
          <p className="mt-0.5 whitespace-pre-line text-[11px] leading-relaxed text-ink-soft">{comment.text}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 pl-1 text-[9px] font-semibold text-muted">
          <span>{comment.time}</span>
          <button
            type="button"
            onClick={() => likeComment(postId, comment.id)}
            className={cn("transition hover:text-ink", comment.likedByMe && "text-brand")}
          >
            J’aime{comment.likes > 0 ? ` · ${comment.likes}` : ""}
          </button>
          <button type="button" onClick={() => onReply(comment)} className="transition hover:text-ink">
            Répondre
          </button>
        </div>
        {comment.replies?.map((reply) => (
          <div key={reply.id} className="mt-2.5 flex items-start gap-2 pl-4">
            <div className="w-0.5 self-stretch rounded-full bg-line" aria-hidden="true" />
            <Avatar name={reply.author.name} src={reply.author.avatar} tone={reply.author.tone} size="xs" />
            <div className="min-w-0 flex-1">
              <div className="w-fit rounded-2xl rounded-tl-md bg-surface-muted px-3 py-2">
                <p className="text-[10px] font-semibold text-ink">{reply.author.name}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-soft">{reply.text}</p>
              </div>
              <p className="mt-0.5 pl-1 text-[8.5px] font-medium text-muted">
                {reply.time} · J’aime
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Post card                                                           */
/* ------------------------------------------------------------------ */

export function PostCard({ post }: { post: Post }) {
  const {
    state,
    setReaction,
    addComment,
    toggleSavePost,
    sharePost,
    hidePost,
    showToast,
    openComposer,
  } = useApp();
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<Post["comments"][number] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Harcèlement ou intimidation");
  const [sort, setSort] = useState<"relevant" | "recent">("relevant");
  const hideTimer = useRef<number | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    },
    [],
  );

  const media = post.media ?? [];
  const isLong = Boolean(post.text && post.text.length > 320);
  const totalReactions = Object.values(post.reactions.counts).reduce((sum, value) => sum + value, 0);
  const topReactions = reactionOrder
    .filter((type) => post.reactions.counts[type] > 0)
    .sort((a, b) => post.reactions.counts[b] - post.reactions.counts[a])
    .slice(0, 3);
  const sortedComments = [...post.comments].sort((a, b) =>
    sort === "relevant" ? b.likes - a.likes : 0,
  );

  const handlePickerEnter = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setPickerOpen(true);
  };

  const handlePickerLeave = () => {
    hideTimer.current = window.setTimeout(() => setPickerOpen(false), 260);
  };

  const chooseReaction = (type: ReactionType) => {
    setReaction(post.id, type);
    setPickerOpen(false);
    showToast(`Réaction « ${reactionLabel(type)} » ajoutée.`, "success");
  };

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText("");
    setCommentsOpen(true);
  };

  const submitReply = (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyTo || !replyText.trim()) return;
    addComment(post.id, replyText, replyTo.id);
    setReplyText("");
    setReplyTo(null);
  };

  const openComments = () => {
    setCommentsOpen(true);
    window.setTimeout(() => commentInputRef.current?.focus(), 80);
  };

  return (
    <>
      <Card as="article" className="fade-up">
        <PostHeader post={post} onOpenReport={() => setReportOpen(true)} onOpenWhy={() => setWhyOpen(true)} />

        {post.text && (
          <div className="px-4 pb-1">
            {post.sharedFrom && (
              <div className="mb-2 rounded-2xl border border-line bg-surface-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={post.sharedFrom.name}
                    src={post.sharedFrom.avatar}
                    tone={post.sharedFrom.tone}
                    size="sm"
                    shape="squircle"
                  />
                  <div>
                    <p className="flex items-center gap-1 text-[10.5px] font-semibold text-ink">
                      {post.sharedFrom.name}
                      {post.sharedFrom.verified && <VerifiedBadge className="size-3" />}
                    </p>
                    <p className="text-[8.5px] text-muted">Publication partagée</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{post.sharedText}</p>
              </div>
            )}
            <RichText text={post.text} expanded={expanded || !isLong} />
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="mt-1 text-[10.5px] font-semibold text-brand hover:underline"
              >
                {expanded ? "Voir moins" : "Voir plus"}
              </button>
            )}
            {post.location && (
              <p className="mt-1.5 flex items-center gap-1 text-[9px] font-medium text-muted">
                <MapPin className="size-2.5" />
                {post.location}
              </p>
            )}
          </div>
        )}

        {post.kind === "video" && post.video ? (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="group relative mx-4 mt-1 block overflow-hidden rounded-2xl border border-line text-left"
          >
            <Photo src={post.video.poster} alt={post.video.title} className="aspect-[16/10] w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur">
              <Play className="size-2.5" fill="currentColor" />
              {formatCount(post.video.views)} vues · {post.video.duration}
            </span>
            <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition group-hover:scale-105 group-hover:bg-white/30">
              <Play className="ml-0.5 size-6" fill="currentColor" />
            </span>
            <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
              <span className="text-[11px] font-semibold leading-snug text-white drop-shadow">{post.video.title}</span>
              <span className="rounded-full bg-[color:var(--color-mali-red)] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white">
                Reel
              </span>
            </span>
          </button>
        ) : (
          <>
            {post.kind === "poll" && <PollBlock post={post} />}
            {post.kind === "event" && <EventEmbed post={post} />}
            {post.kind === "listing" && <ListingEmbed post={post} />}
            {media.length > 0 && <MediaGallery post={post} onOpen={setLightbox} />}
          </>
        )}

        {post.sponsored && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface-muted/50 p-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Sahel Télécom</p>
              <p className="mt-0.5 truncate text-[10.5px] font-medium text-ink-soft">50 Go + appels illimités à 5 000 FCFA / mois</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 shrink-0 px-3 text-[10px]"
              onClick={() => showToast("Annonce de démonstration — aucun achat réel.", "info")}
            >
              {post.sponsored.cta}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <div className="flex items-center gap-1.5">
            {topReactions.length > 0 ? (
              <>
                <div className="flex -space-x-1.5">
                  {topReactions.map((type) => (
                    <ReactionIcon key={type} type={type} size="sm" />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-muted">{formatCount(totalReactions)}</span>
              </>
            ) : (
              <span className="text-[10px] font-medium text-muted">Soyez le premier à réagir</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-[9.5px] font-medium text-muted">
            <button type="button" onClick={() => setCommentsOpen((current) => !current)} className="hover:text-ink hover:underline">
              {post.comments.length} commentaire{post.comments.length > 1 ? "s" : ""}
            </button>
            <span aria-hidden="true">·</span>
            <span>{formatCount(post.shares)} partage{post.shares > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 border-t border-line px-2 py-1.5">
          <div
            className="relative"
            onMouseEnter={handlePickerEnter}
            onMouseLeave={handlePickerLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (post.reactions.mine) {
                  setReaction(post.id, post.reactions.mine);
                } else {
                  setReaction(post.id, "like");
                }
              }}
              onFocus={handlePickerEnter}
              aria-label={post.reactions.mine ? `Retirer la réaction ${reactionLabel(post.reactions.mine)}` : "Réagir à la publication"}
              aria-expanded={pickerOpen}
              className={cn(
                "flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold transition hover:bg-surface-muted",
                post.reactions.mine ? "text-brand" : "text-ink-soft",
              )}
            >
              {post.reactions.mine ? (
                <ReactionIcon type={post.reactions.mine} size="sm" showBorder={false} />
              ) : (
                <Sparkles className="size-4" />
              )}
              {post.reactions.mine ? reactionLabel(post.reactions.mine) : "J’aime"}
            </button>

            {pickerOpen && (
              <div
                className="reaction-pop absolute bottom-full left-0 z-30 mb-1.5 flex items-center gap-0.5 rounded-full border border-line bg-surface px-1.5 py-1 shadow-pop"
                onMouseEnter={handlePickerEnter}
                onMouseLeave={handlePickerLeave}
                role="group"
                aria-label="Choisir une réaction"
              >
                {reactionOrder.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => chooseReaction(type)}
                    title={reactionLabel(type)}
                    aria-label={reactionLabel(type)}
                    className="group/reaction grid size-8 place-items-center rounded-full transition hover:-translate-y-1 hover:bg-surface-muted"
                  >
                    <ReactionIcon type={type} size="md" showBorder={false} />
                    <span className="pointer-events-none absolute -top-7 hidden rounded-md bg-ink px-1.5 py-0.5 text-[8px] font-semibold text-canvas group-hover/reaction:block">
                      {reactionLabel(type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setCommentsOpen(true);
              openComments();
            }}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted"
          >
            <MessageCircle className="size-4" />
            Commenter
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted"
          >
            <Share2 className="size-4" />
            Partager
          </button>
        </div>

        {commentsOpen && (
          <div className="border-t border-line px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted">Commentaires</p>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as "relevant" | "recent")}
                  className="h-7 appearance-none rounded-full border border-line bg-surface pl-2.5 pr-6 text-[9.5px] font-semibold text-ink-soft outline-none focus:border-brand"
                  aria-label="Trier les commentaires"
                >
                  <option value="relevant">Les plus pertinents</option>
                  <option value="recent">Les plus récents</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-muted" />
              </div>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-slim">
              {sortedComments.map((comment) => (
                <div key={comment.id}>
                  <CommentBubble
                    comment={comment}
                    postId={post.id}
                    onReply={(target) => {
                      setReplyTo(target);
                      setReplyText(`@${target.author.name.split(" ")[0]} `);
                    }}
                  />
                  {replyTo?.id === comment.id && (
                    <form onSubmit={submitReply} className="mt-2 flex items-center gap-2 pl-10">
                      <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="xs" />
                      <input
                        autoFocus
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder={`Répondre à ${replyTo.author.name.split(" ")[0]}…`}
                        className="h-8 min-w-0 flex-1 rounded-full border border-line bg-surface-muted px-3 text-[10.5px] text-ink outline-none focus:border-brand"
                        aria-label="Votre réponse"
                      />
                      <IconButton
                        label="Envoyer la réponse"
                        type="submit"
                        className="size-8 bg-brand-soft text-brand disabled:opacity-40"
                        disabled={!replyText.trim()}
                      >
                        <Send className="size-3.5" />
                      </IconButton>
                    </form>
                  )}
                </div>
              ))}
              {post.comments.length === 0 && (
                <p className="py-2 text-center text-[10.5px] text-muted">Soyez la première personne à commenter.</p>
              )}
            </div>

            <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
              <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="sm" />
              <div className="flex h-10 min-w-0 flex-1 items-center rounded-full border border-line bg-surface-muted px-3 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                <input
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder={`Commenter en tant que ${state.me.name.split(" ")[0]}…`}
                  className="h-full min-w-0 flex-1 bg-transparent text-[11px] text-ink outline-none placeholder:text-muted"
                  aria-label="Écrire un commentaire"
                />
                <button type="button" aria-label="Ajouter un smiley" className="grid size-7 place-items-center rounded-full text-muted hover:text-ink">
                  <Smile className="size-3.5" />
                </button>
                <button type="button" aria-label="Ajouter une image" className="grid size-7 place-items-center rounded-full text-muted hover:text-ink">
                  <ImageIcon className="size-3.5" />
                </button>
              </div>
              <IconButton
                label="Publier le commentaire"
                type="submit"
                className="size-9 text-brand hover:bg-brand-soft disabled:opacity-40"
                disabled={!commentText.trim()}
              >
                <Send className="size-4" />
              </IconButton>
            </form>
            <button
              type="button"
              onClick={() => toggleSavePost(post.id)}
              className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-semibold text-muted hover:text-ink"
            >
              {post.saved ? <BookmarkCheck className="size-3" /> : <Bookmark className="size-3" />}
              {post.saved ? "Enregistrée" : "Enregistrer la publication"}
            </button>
          </div>
        )}
      </Card>

      <VideoPlayer
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        poster={post.video?.poster ?? media[0]?.url ?? ""}
        title={post.video?.title ?? "Vidéo"}
        author={post.author}
        views={post.video?.views}
        duration={post.video?.duration}
        subtitle={post.text}
        accent="reel"
      />

      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Partager la publication"
        description="Faites circuler ce contenu dans votre communauté."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShareOpen(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={() => {
                sharePost(post.id);
                setShareOpen(false);
              }}
            >
              Partager maintenant
            </Button>
          </>
        }
      >
        <div className="rounded-2xl border border-line bg-surface-muted/60 p-3">
          <div className="flex items-center gap-2">
            <Avatar name={post.author.name} src={post.author.avatar} tone={post.author.tone} size="sm" />
            <div>
              <p className="text-[11px] font-semibold text-ink">{post.author.name}</p>
              <p className="text-[9px] text-muted">{post.time}</p>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-[10.5px] leading-relaxed text-ink-soft">{post.text}</p>
        </div>
        <div className="mt-3 space-y-1">
          {[
            {
              label: "Copier le lien",
              icon: <Link2 className="size-4" />,
              onClick: () => {
                void navigator.clipboard?.writeText(window.location.href);
                showToast("Lien copié dans le presse-papiers.");
                setShareOpen(false);
              },
            },
            {
              label: "Envoyer dans Messenger",
              icon: <MessageCircle className="size-4" />,
              onClick: () => {
                setShareOpen(false);
                navigate("/messages");
              },
            },
            {
              label: "Ajouter à votre Story",
              icon: <Sparkles className="size-4" />,
              onClick: () => {
                setShareOpen(false);
                openComposer("story");
              },
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11.5px] font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={whyOpen}
        onClose={() => setWhyOpen(false)}
        title="Pourquoi je vois cette publication ?"
        description="N’Teriface classe le fil selon vos relations, vos intérêts et la qualité du contenu."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setWhyOpen(false)}>
              Fermer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                hidePost(post.id);
                setWhyOpen(false);
              }}
            >
              Voir moins de publications comme celle-ci
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <Avatar name={post.author.name} src={post.author.avatar} tone={post.author.tone} size="md" />
            <p className="text-[11.5px] leading-relaxed text-ink-soft">
              Vous voyez cette publication de <strong className="text-ink">{post.author.name}</strong> parce
              que vous êtes ami{post.author.id === "awa" ? "e" : ""} avec cette personne ou que vous suivez
              cette Page, et parce qu’elle suscite un engagement élevé dans votre région.
            </p>
          </div>
          <InlineNotice tone="info">
            Votre fil est personnalisé à partir de vos interactions, de votre localisation (Bamako) et de
            la langue de votre compte.
          </InlineNotice>
          <div className="rounded-2xl border border-line p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Ce que cela signifie</p>
            <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-ink-soft">
              <li>• Les contenus de vos amis et Pages sont prioritaires.</li>
              <li>• Les publications locales et culturelles maliennes sont mises en avant.</li>
              <li>• Les publicités sont identifiées comme sponsorisées.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Signaler la publication"
        description="Votre signalement est anonyme. Notre équipe de modération l’examinera."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReportOpen(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setReportOpen(false);
                showToast("Signalement transmis à la modération. Merci.", "success");
              }}
            >
              Envoyer le signalement
            </Button>
          </>
        }
      >
        <fieldset className="space-y-1">
          <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Motif du signalement
          </legend>
          {[
            "Harcèlement ou intimidation",
            "Contenu dangereux ou choquant",
            "Arnaque ou fraude",
            "Fausses informations",
            "Spam",
            "Atteinte à la propriété intellectuelle",
          ].map((reason) => (
            <label
              key={reason}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11.5px] font-medium transition",
                reportReason === reason ? "bg-danger-soft text-danger" : "text-ink-soft hover:bg-surface-muted",
              )}
            >
              <input
                type="radio"
                name="report-reason"
                value={reason}
                checked={reportReason === reason}
                onChange={() => setReportReason(reason)}
                className="size-3.5 accent-[color:var(--color-danger)]"
              />
              {reason}
            </label>
          ))}
        </fieldset>
        <p className="mt-3 text-[9px] leading-relaxed text-muted">
          Les signalements abusifs peuvent entraîner une restriction de compte. Consultez nos règles
          communautaires.
        </p>
      </Modal>

      <Modal
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
        hideClose
        size="full"
        className="max-w-5xl"
        bodyClassName="p-0"
      >
        {lightbox !== null && media[lightbox] && (
          <div className="relative bg-[#0b0f0c]">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Avatar name={post.author.name} src={post.author.avatar} tone={post.author.tone} size="sm" />
                <div>
                  <p className="text-[11px] font-semibold text-white">{post.author.name}</p>
                  <p className="text-[9px] text-white/55">{post.time}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Fermer l’image"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative flex max-h-[72dvh] items-center justify-center bg-black">
              <img
                src={media[lightbox].url}
                alt={media[lightbox].alt}
                className="max-h-[72dvh] w-auto max-w-full object-contain"
              />
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightbox((current) => ((current ?? 0) - 1 + media.length) % media.length)}
                    aria-label="Image précédente"
                    className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightbox((current) => ((current ?? 0) + 1) % media.length)}
                    aria-label="Image suivante"
                    className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="line-clamp-2 text-[10.5px] text-white/65">{media[lightbox].alt}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => showToast("Image enregistrée dans votre galerie (démo).", "success")}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-[9.5px] font-semibold text-white hover:bg-white/20"
                >
                  Télécharger
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(media[lightbox].url);
                    showToast("Lien de l’image copié.", "success");
                  }}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-[9.5px] font-semibold text-white hover:bg-white/20"
                >
                  Copier le lien
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
