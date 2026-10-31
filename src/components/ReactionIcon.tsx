import { Heart, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReactionType } from "@/types";

const labels: Record<ReactionType, string> = {
  like: "J’aime",
  love: "J’adore",
  haha: "Haha",
  wow: "Wouah",
  sad: "Triste",
  angry: "En colère",
};

const backgrounds: Record<ReactionType, string> = {
  like: "bg-[linear-gradient(145deg,#14935a,#087243)]",
  love: "bg-[linear-gradient(145deg,#e5324c,#b80f2a)]",
  haha: "bg-[linear-gradient(145deg,#f7c81d,#e09b00)]",
  wow: "bg-[linear-gradient(145deg,#f7c81d,#e09b00)]",
  sad: "bg-[linear-gradient(145deg,#f7c81d,#e09b00)]",
  angry: "bg-[linear-gradient(145deg,#f26b3a,#c62d18)]",
};

function Face({ type }: { type: ReactionType }) {
  if (type === "like") return <ThumbsUp className="size-[11px] text-white" fill="currentColor" strokeWidth={0} />;
  if (type === "love") return <Heart className="size-[11px] text-white" fill="currentColor" strokeWidth={0} />;
  if (type === "haha") {
    return (
      <svg viewBox="0 0 16 16" className="size-[13px]" fill="none" aria-hidden="true">
        <circle cx="4.8" cy="6.2" r="0.9" fill="#fff" />
        <circle cx="11.2" cy="6.2" r="0.9" fill="#fff" />
        <path d="M4.2 9.4c.7 1.7 2 2.5 3.8 2.5s3.1-.8 3.8-2.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M3.8 4.2c.7-.8 1.8-1 2.7-.5M12.2 4.2c-.7-.8-1.8-1-2.7-.5" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M2.6 8.9c-.3 1.1-.1 2.1.6 2.9" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "wow") {
    return (
      <svg viewBox="0 0 16 16" className="size-[13px]" fill="none" aria-hidden="true">
        <circle cx="5" cy="6" r="1.2" fill="#fff" />
        <circle cx="11" cy="6" r="1.2" fill="#fff" />
        <ellipse cx="8" cy="10.7" rx="2" ry="2.4" stroke="#fff" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === "sad") {
    return (
      <svg viewBox="0 0 16 16" className="size-[13px]" fill="none" aria-hidden="true">
        <circle cx="5.2" cy="6.1" r="0.9" fill="#fff" />
        <circle cx="10.8" cy="6.1" r="0.9" fill="#fff" />
        <path d="M4.5 9.7c.9-1 2-1.4 3.5-1.4s2.6.4 3.5 1.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M11.7 8.1c.8.9 1.2 1.6 1.2 2.2a1.2 1.2 0 1 1-2.4 0c0-.6.4-1.3 1.2-2.2Z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="size-[13px]" fill="none" aria-hidden="true">
      <path d="M4.1 4.7c.8-.4 1.8-.2 2.3.4M11.9 4.7c-.8-.4-1.8-.2-2.3.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5.1" cy="7" r="0.9" fill="#fff" />
      <circle cx="10.9" cy="7" r="0.9" fill="#fff" />
      <path d="M4.8 11.1c.8-1.2 1.9-1.8 3.2-1.8s2.4.6 3.2 1.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ReactionIcon({
  type,
  size = "md",
  className,
  showBorder = true,
}: {
  type: ReactionType;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showBorder?: boolean;
}) {
  const sizeClass = {
    xs: "size-4",
    sm: "size-5",
    md: "size-[22px]",
    lg: "size-10 rounded-full",
  }[size];

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full shadow-sm",
        backgrounds[type],
        showBorder && size !== "lg" && "ring-2 ring-surface",
        sizeClass,
        className,
      )}
      aria-hidden="true"
    >
      <Face type={type} />
    </span>
  );
}

export function reactionLabel(type: ReactionType) {
  return labels[type];
}

export const reactionOrder: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];
