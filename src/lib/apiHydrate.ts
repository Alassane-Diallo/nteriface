/**
 * Conversion des contrats JSON de l’API vers les types du frontend.
 *
 * Les identifiants locaux de la démo (`awa`, `post-1`, `conv-moussa`) sont
 * conservés quand la ressource correspondante existe déjà. Cela permet aux
 * écrans, aux routes et aux actions optimistes de continuer à fonctionner
 * pendant que les données viennent du backend.
 */

import {
  conversations as seedConversations,
  groups as seedGroups,
  pages as seedPages,
  people,
} from "@/data";
import type {
  Author,
  AvatarTone,
  Comment,
  Conversation,
  ID,
  Message,
  Notification,
  Person,
  Post,
  PostKind,
  ReactionType,
} from "@/types";

import type {
  ApiAuthor,
  ApiComment,
  ApiConversation,
  ApiFriendRequest,
  ApiMe,
  ApiMessage,
  ApiNotification,
  ApiPerson,
  ApiPost,
} from "./api";

const TONES: AvatarTone[] = ["green", "yellow", "red", "clay", "river", "indigo"];
const POST_KINDS: PostKind[] = [
  "text",
  "photo",
  "video",
  "poll",
  "event",
  "listing",
  "shared",
  "reel",
  "ad",
  "live",
];
const REACTIONS: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];
const NOTIFICATION_TYPES: Notification["type"][] = [
  "friend_request",
  "friend_accept",
  "reaction",
  "comment",
  "mention",
  "message",
  "event",
  "marketplace",
  "live",
  "security",
  "group",
  "system",
];

const peopleByUsername = new Map(people.map((person) => [person.username, person]));
const pagesById = new Map(seedPages.map((page) => [page.id, page]));
const groupsById = new Map(seedGroups.map((group) => [group.id, group]));
const systemAuthor: Author = {
  id: "nteriface-system",
  name: "N’Teriface",
  handle: "@nteriface",
  kind: "brand",
  tone: "green",
  verified: true,
};

export function asTone(value?: string | null): AvatarTone | undefined {
  return TONES.includes(value as AvatarTone) ? (value as AvatarTone) : undefined;
}

function asPostKind(value: string): PostKind {
  return POST_KINDS.includes(value as PostKind) ? (value as PostKind) : "text";
}

function asReaction(value?: string | null): ReactionType | undefined {
  return REACTIONS.includes(value as ReactionType) ? (value as ReactionType) : undefined;
}

function asNotificationType(value: string): Notification["type"] {
  return NOTIFICATION_TYPES.includes(value as Notification["type"])
    ? (value as Notification["type"])
    : "system";
}

function asAudience(value: string): Post["audience"] {
  if (
    value === "public" ||
    value === "friends" ||
    value === "group" ||
    value === "page" ||
    value === "private"
  ) {
    return value;
  }
  return "public";
}

function authorKind(value?: string): Author["kind"] {
  if (value === "user" || value === "page" || value === "group" || value === "brand") {
    return value;
  }
  return undefined;
}

function slugFromHref(href: string | undefined, prefix: string): string | undefined {
  if (!href) return undefined;
  const marker = `/${prefix}/`;
  const index = href.indexOf(marker);
  return index >= 0 ? href.slice(index + marker.length).replace(/\/$/, "") : undefined;
}

export function localPersonForUsername(username?: string | null): Person | undefined {
  if (!username) return undefined;
  return peopleByUsername.get(username.replace(/^@/, ""));
}

export function localPersonIdForUsername(username?: string | null): ID | undefined {
  return localPersonForUsername(username)?.id;
}

export function mapAuthor(raw: ApiAuthor | null | undefined): Author | undefined {
  if (!raw) return undefined;

  const kind = authorKind(raw.kind);
  const username = raw.handle?.replace(/^@/, "");
  const localPerson = kind === "user" ? localPersonForUsername(username) : undefined;

  let id = raw.id;
  let href = raw.href;
  let mappedKind = kind;

  if (localPerson) {
    id = localPerson.id;
    href = `/profil/${localPerson.username}`;
  }

  if (kind === "page") {
    const slug = slugFromHref(raw.href, "pages") ?? raw.id.replace(/^page-/, "");
    const localPage = pagesById.get(slug);
    if (localPage) {
      id = localPage.id;
    } else if (slug === "sahel-telecom") {
      // Le frontend de démonstration affiche Sahel Télécom comme une marque
      // sponsorisée, sans page détaillée.
      id = "brand-saheltelecom";
      mappedKind = "brand";
      href = undefined;
    }
  }

  if (kind === "group") {
    const slug = slugFromHref(raw.href, "groupes") ?? raw.id.replace(/^group-/, "");
    const localGroup = groupsById.get(slug);
    if (localGroup) id = localGroup.id;
  }

  return {
    id,
    name: raw.name,
    handle: raw.handle,
    subtitle: raw.subtitle,
    avatar: raw.avatar || localPerson?.avatar,
    verified: raw.verified ?? localPerson?.verified,
    kind: mappedKind,
    tone: asTone(raw.tone) ?? localPerson?.tone,
    href,
  };
}

export function mapMe(raw: ApiMe): Person {
  const local = localPersonForUsername(raw.username);
  return {
    id: local?.id ?? raw.id,
    name: raw.name || local?.name || "Membre N’Teriface",
    username: raw.username,
    avatar: raw.avatar || local?.avatar,
    cover: raw.cover || local?.cover,
    tone: asTone(raw.tone) ?? local?.tone,
    verified: raw.verified ?? local?.verified,
    bio: raw.bio || local?.bio,
    location: raw.location || local?.location,
    hometown: raw.hometown || local?.hometown,
    work: raw.work || local?.work,
    education: raw.education || local?.education,
    website: raw.website || local?.website,
    followers: raw.followers ?? local?.followers ?? 0,
    following: raw.following ?? local?.following ?? 0,
    online: raw.online ?? local?.online,
    mutual: raw.mutual ?? local?.mutual,
    friend: raw.friend ?? local?.friend,
    followingMe: raw.followingMe ?? local?.followingMe,
    professional: raw.professional ?? local?.professional,
    staff: raw.isStaff ?? local?.staff,
  };
}

function mapComment(raw: ApiComment): Comment {
  return {
    id: String(raw.id),
    author: mapAuthor(raw.author) ?? { id: "unknown", name: "Membre N’Teriface" },
    text: raw.text,
    time: raw.time,
    likes: raw.likes ?? 0,
    likedByMe: raw.likedByMe,
    replies: raw.replies?.map(mapComment),
  };
}

function parseViews(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = value
    .toLowerCase()
    .replace(/de\s*vues?/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const match = cleaned.match(/^([\d.]+)([km])?$/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return 0;
  const multiplier = match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Math.round(amount * multiplier);
}

export function mapPost(raw: ApiPost): Post {
  const author = mapAuthor(raw.author) ?? { id: "unknown", name: "Membre N’Teriface" };
  const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  for (const key of REACTIONS) {
    counts[key] = Number(raw.reactions?.counts?.[key] ?? 0);
  }

  return {
    id: String(raw.id),
    author,
    time: raw.time || "À l’instant",
    audience: asAudience(raw.audience),
    text: raw.text || undefined,
    media: raw.media?.length
      ? raw.media.map((item) => ({
          id: String(item.id),
          url: item.url,
          alt: item.alt || "",
          tall: item.tall,
        }))
      : undefined,
    kind: asPostKind(raw.kind),
    poll: raw.poll
      ? {
          question: raw.poll.question,
          options: raw.poll.options.map((option) => ({
            id: String(option.id),
            label: option.label,
            votes: Number(option.votes ?? 0),
          })),
          voted: raw.poll.voted ?? undefined,
          ends: raw.poll.ends || "Sondage",
        }
      : undefined,
    eventId: raw.eventId ?? undefined,
    listingId: raw.listingId ?? undefined,
    sharedFrom: mapAuthor(raw.sharedFrom),
    sharedText: raw.sharedText || undefined,
    video: raw.video
      ? {
          poster: raw.video.poster,
          title: raw.video.title,
          duration: raw.video.duration,
          views: parseViews(raw.video.views),
          live: raw.video.live,
        }
      : undefined,
    feeling: raw.feeling || undefined,
    location: raw.location || undefined,
    reactions: { counts, mine: asReaction(raw.reactions?.mine) },
    comments: (raw.comments ?? []).map(mapComment),
    shares: Number(raw.shares ?? 0),
    saved: raw.saved,
    pinned: raw.pinned,
    sponsored: raw.sponsored ?? undefined,
    groupId: raw.groupId ?? undefined,
    pageId: raw.pageId ?? undefined,
    profileId: raw.profileId ?? undefined,
  };
}

function formatClock(value?: string | null): string {
  if (!value) return "Maintenant";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Maintenant";
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(value?: string | null): string {
  if (!value) return "Récemment";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Récemment";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "À l’instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function mapApiMessage(
  raw: ApiMessage,
  usernamesById: Map<string, string>,
): Message {
  const username = usernamesById.get(String(raw.authorId));
  const localId = localPersonIdForUsername(username);
  return {
    id: String(raw.id),
    senderId: localId ?? String(raw.authorId),
    text: raw.body,
    time: formatClock(raw.sentAt),
    state: "read",
  };
}

export function mapConversation(
  raw: ApiConversation,
  rawMessages: ApiMessage[],
  usernamesById: Map<string, string>,
): Conversation {
  const title = raw.title || raw.name || "Conversation";
  const local = seedConversations.find((item) => item.title === title);
  const messages = rawMessages.map((message) => mapApiMessage(message, usernamesById));
  const lastTime =
    messages.length > 0 ? messages[messages.length - 1].time : local?.lastTime ?? "Maintenant";

  return {
    id: local?.id ?? String(raw.id),
    kind: raw.kind,
    title,
    avatar: local?.avatar ?? raw.avatar ?? undefined,
    tone: local?.tone ?? "green",
    members: raw.memberCount,
    online: raw.isOnline ?? local?.online,
    unread: Number(raw.unread ?? 0),
    lastTime,
    messages: messages.length > 0 ? messages : local?.messages ?? [],
    pinned: local?.pinned,
    muted: local?.muted,
  };
}

export function mapNotification(raw: ApiNotification): Notification {
  return {
    id: String(raw.id),
    type: asNotificationType(raw.type),
    actor: mapAuthor(raw.actor) ?? systemAuthor,
    text: raw.text,
    time: raw.time,
    read: Boolean(raw.read),
    image: raw.image ?? undefined,
    href: raw.href ?? undefined,
  };
}

export function mapFriendRequest(raw: ApiFriendRequest): {
  personId: ID;
  mutual: number;
  time: string;
} | undefined {
  const person = localPersonForUsername(raw.person.username);
  if (!person) return undefined;
  return {
    personId: person.id,
    mutual: raw.mutual ?? raw.person.mutual ?? 0,
    time: formatRelative(raw.time),
  };
}

export function friendIdsFromPeople(apiPeople: ApiPerson[]): ID[] {
  const ids = new Set<ID>();
  for (const apiPerson of apiPeople) {
    if (!apiPerson.friend) continue;
    const local = localPersonForUsername(apiPerson.username);
    if (local) ids.add(local.id);
  }
  return Array.from(ids);
}

export function usernamesById(apiPeople: ApiPerson[]): Map<string, string> {
  return new Map(apiPeople.map((person) => [String(person.id), person.username]));
}
