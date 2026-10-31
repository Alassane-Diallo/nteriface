/**
 * Client HTTP de N’Teriface.
 *
 * Le frontend fonctionne en mode démo local quand l’API n’est pas joignable.
 * Toutes les requêtes utilisent la session Django (cookie HttpOnly) et le
 * jeton CSRF renvoyé par `/api/auth/csrf/`. Aucun secret n’est stocké côté
 * navigateur.
 */

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
const DEFAULT_TIMEOUT = 4500;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  csrf?: boolean;
  timeout?: number;
};

let csrfToken: string | null = null;

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const value = part.trim();
    if (value.startsWith(prefix)) {
      return decodeURIComponent(value.slice(prefix.length));
    }
  }
  return null;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string" && payload.detail.trim()) {
      return payload.detail;
    }
  } catch {
    // La réponse n’est pas du JSON : on garde un message générique.
  }
  return response.status === 403
    ? "Jeton de sécurité invalide ou expiré. Rechargez la page."
    : "La requête n’a pas pu aboutir.";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeout ?? DEFAULT_TIMEOUT,
  );

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (options.csrf) {
      const token = await getCsrfToken();
      headers["X-CSRFToken"] = token;
    }

    let response: Response;
    try {
      response = await fetch(apiUrl(path), {
        method: options.method ?? "GET",
        credentials: "include",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(0, "Le serveur N’Teriface est injoignable.");
    }

    if (!response.ok) {
      throw new ApiError(response.status, await parseError(response));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const fromCookie = readCookie("csrftoken");
  if (fromCookie) {
    csrfToken = fromCookie;
    return csrfToken;
  }
  const payload = await request<{ csrfToken: string }>("/api/auth/csrf/", {
    timeout: 2500,
  });
  csrfToken = payload.csrfToken;
  return csrfToken;
}

export async function login(identifier: string, password: string): Promise<void> {
  const payload = await request<{ csrfToken?: string }>("/api/auth/login/", {
    method: "POST",
    body: { username: identifier.trim(), password },
    csrf: true,
  });
  if (payload.csrfToken) csrfToken = payload.csrfToken;
}

export async function register(payload: {
  username: string;
  name: string;
  phone: string;
  email: string;
  password: string;
}): Promise<void> {
  const response = await request<{ csrfToken?: string }>("/api/auth/register/", {
    method: "POST",
    body: payload,
    csrf: true,
  });
  if (response.csrfToken) csrfToken = response.csrfToken;
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/api/auth/logout/", { method: "POST", csrf: true });
  } finally {
    csrfToken = null;
  }
}

export interface ApiAuthor {
  id: string;
  name: string;
  handle?: string;
  subtitle?: string;
  avatar?: string;
  verified?: boolean;
  kind?: string;
  tone?: string;
  href?: string;
}

export interface ApiMedia {
  id: string;
  url: string;
  alt: string;
  tall?: boolean;
}

export interface ApiPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface ApiPoll {
  question: string;
  options: ApiPollOption[];
  voted?: string | null;
  ends?: string;
}

export interface ApiVideo {
  poster: string;
  title: string;
  duration: string;
  views: string | number;
  live?: boolean;
}

export interface ApiComment {
  id: string;
  author: ApiAuthor;
  text: string;
  time: string;
  likes: number;
  likedByMe?: boolean;
  replies?: ApiComment[];
}

export interface ApiPost {
  id: string;
  author: ApiAuthor;
  time: string;
  createdAt?: string;
  audience: string;
  text?: string;
  media?: ApiMedia[];
  kind: string;
  poll?: ApiPoll | null;
  eventId?: string | null;
  listingId?: string | null;
  sharedFrom?: ApiAuthor | null;
  sharedText?: string;
  video?: ApiVideo | null;
  feeling?: string;
  location?: string;
  reactions: { counts: Record<string, number>; mine?: string | null };
  comments?: ApiComment[];
  shares: number;
  saved?: boolean;
  pinned?: boolean;
  sponsored?: { label: string; cta: string; url: string } | null;
  groupId?: string | null;
  pageId?: string | null;
  profileId?: string | null;
}

export interface ApiPerson {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  cover?: string;
  tone?: string;
  verified?: boolean;
  bio?: string;
  location?: string;
  hometown?: string;
  work?: string;
  education?: string;
  website?: string;
  followers: number;
  following: number;
  online?: boolean;
  presence?: string;
  mutual?: number;
  friend?: boolean;
  followingMe?: boolean;
  professional?: boolean;
}

export interface ApiMe extends ApiPerson {
  email?: string;
  isStaff?: boolean;
  settings?: Record<string, unknown>;
  joinedAt?: string;
}

export interface ApiNotification {
  id: string;
  type: string;
  actor: ApiAuthor | null;
  text: string;
  time: string;
  read: boolean;
  image?: string | null;
  href?: string | null;
}

export interface ApiMessage {
  id: string;
  chatId: string;
  authorId: string;
  body: string;
  sentAt?: string | null;
  kind?: string;
}

export interface ApiConversation {
  id: string;
  kind: "direct" | "group";
  name: string;
  title: string;
  avatar?: string;
  memberIds: string[];
  memberCount: number;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: ApiMessage | null;
  unread: number;
  isOnline?: boolean;
}

export interface ApiFeed {
  results: ApiPost[];
  count?: number;
  hasMore?: boolean;
}

export interface ApiFriendRequest {
  id: string;
  person: ApiPerson;
  direction?: string;
  status?: string;
  mutual?: number;
  time?: string;
}

export async function socialMe(): Promise<ApiMe> {
  return request<ApiMe>("/api/social/me/");
}

export async function socialFeed(limit = 40): Promise<ApiFeed> {
  return request<ApiFeed>(`/api/social/feed/?limit=${limit}`);
}

export async function socialPeople(): Promise<ApiPerson[]> {
  return request<ApiPerson[]>("/api/social/people/");
}

export async function socialFriendRequests(): Promise<{
  incoming: ApiFriendRequest[];
  outgoing: ApiFriendRequest[];
}> {
  return request("/api/social/friend-requests/");
}

export async function socialNotifications(): Promise<ApiNotification[]> {
  return request<ApiNotification[]>("/api/social/notifications/");
}

export async function conversations(): Promise<ApiConversation[]> {
  return request<ApiConversation[]>("/api/conversations/");
}

export async function conversationMessages(
  conversationId: string,
): Promise<{ messages: ApiMessage[]; hasMore: boolean }> {
  return request(`/api/conversations/${conversationId}/messages/?limit=100`);
}

export async function sendConversationMessage(
  conversationId: string,
  body: string,
): Promise<ApiMessage> {
  return request<ApiMessage>(`/api/conversations/${conversationId}/messages/`, {
    method: "POST",
    body: { body },
    csrf: true,
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await request<void>(`/api/conversations/${conversationId}/read/`, {
    method: "POST",
    csrf: true,
  });
}

export async function createPost(payload: {
  text?: string;
  audience?: string;
  kind?: string;
  media?: string[];
  video?: Record<string, unknown>;
  poll?: { question: string; options: string[]; ends?: string };
  feeling?: string;
  location?: string;
  groupId?: string;
  pageId?: string;
}): Promise<ApiPost> {
  return request<ApiPost>("/api/social/posts/", {
    method: "POST",
    body: payload,
    csrf: true,
  });
}

export async function reactToPost(postId: string, type: string): Promise<void> {
  await request(`/api/social/posts/${postId}/reaction/`, {
    method: "POST",
    body: { type },
    csrf: true,
  });
}

export async function commentOnPost(
  postId: string,
  text: string,
  parentId?: string,
): Promise<void> {
  await request(`/api/social/posts/${postId}/comments/`, {
    method: "POST",
    body: { text, parentId: parentId ?? null },
    csrf: true,
  });
}

export async function likeComment(commentId: string): Promise<void> {
  await request(`/api/social/comments/${commentId}/like/`, {
    method: "POST",
    csrf: true,
  });
}

export async function savePost(postId: string): Promise<void> {
  await request(`/api/social/posts/${postId}/save/`, {
    method: "POST",
    csrf: true,
  });
}

export async function hidePost(postId: string): Promise<void> {
  await request(`/api/social/posts/${postId}/hide/`, {
    method: "POST",
    csrf: true,
  });
}

export async function sharePost(postId: string): Promise<void> {
  await request(`/api/social/posts/${postId}/share/`, {
    method: "POST",
    csrf: true,
  });
}

export async function votePoll(postId: string, optionId: string): Promise<void> {
  await request(`/api/social/posts/${postId}/vote/`, {
    method: "POST",
    body: { optionId },
    csrf: true,
  });
}

export async function followPerson(username: string): Promise<void> {
  await request(`/api/social/people/${encodeURIComponent(username)}/follow/`, {
    method: "POST",
    csrf: true,
  });
}

export async function friendAction(
  username: string,
  action: "request" | "accept" | "decline" | "remove",
): Promise<void> {
  await request(`/api/social/people/${encodeURIComponent(username)}/friend/`, {
    method: "POST",
    body: { action },
    csrf: true,
  });
}

export async function joinGroup(
  slug: string,
  action: "join" | "leave",
): Promise<void> {
  await request(`/api/social/groups/${encodeURIComponent(slug)}/join/`, {
    method: "POST",
    body: { action },
    csrf: true,
  });
}

export async function likePage(slug: string): Promise<void> {
  await request(`/api/social/pages/${encodeURIComponent(slug)}/like/`, {
    method: "POST",
    csrf: true,
  });
}

export async function eventAttendance(slug: string): Promise<void> {
  await request(`/api/social/events/${encodeURIComponent(slug)}/attendance/`, {
    method: "POST",
    csrf: true,
  });
}

export async function saveEvent(slug: string): Promise<void> {
  await request(`/api/social/events/${encodeURIComponent(slug)}/save/`, {
    method: "POST",
    csrf: true,
  });
}

export async function saveListing(slug: string): Promise<void> {
  await request(`/api/social/marketplace/${encodeURIComponent(slug)}/save/`, {
    method: "POST",
    csrf: true,
  });
}

export async function likeReel(reelId: string): Promise<void> {
  await request(`/api/social/reels/${reelId}/like/`, {
    method: "POST",
    csrf: true,
  });
}

export async function saveReel(reelId: string): Promise<void> {
  await request(`/api/social/reels/${reelId}/save/`, {
    method: "POST",
    csrf: true,
  });
}

export async function saveVideo(videoId: string): Promise<void> {
  await request(`/api/social/videos/${videoId}/save/`, {
    method: "POST",
    csrf: true,
  });
}

export async function readNotification(notificationId: string): Promise<void> {
  await request(`/api/social/notifications/${notificationId}/read/`, {
    method: "POST",
    csrf: true,
  });
}

export async function readAllNotifications(): Promise<void> {
  await request("/api/social/notifications/read/", {
    method: "POST",
    csrf: true,
  });
}

export interface InboxEvent {
  type: string;
  conversationId?: string;
  message?: ApiMessage;
  notification?: ApiNotification;
  unread?: number;
  call?: {
    id?: string;
    kind?: string;
    caller?: ApiPerson;
  };
  detail?: string;
}

function websocketUrl(): string {
  if (/^https?:\/\//.test(API_BASE)) {
    const url = new URL(API_BASE);
    return `${url.protocol === "https:" ? "wss" : "ws"}://${url.host}/ws/inbox/`;
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/inbox/`;
}

/**
 * Ouvre le canal temps réel authentifié par la session Django.
 *
 * Le serveur ne fait confiance qu’au cookie de session : l’URL ne contient
 * aucun identifiant utilisateur. Le client envoie uniquement un `ping` pour
 * maintenir la connexion et détecter l’expiration de session.
 */
export function openInboxSocket(
  onEvent: (event: InboxEvent) => void,
): WebSocket | null {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    return null;
  }

  let socket: WebSocket;
  try {
    socket = new WebSocket(websocketUrl());
  } catch {
    return null;
  }

  const ping = window.setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }, 25_000);

  socket.addEventListener("message", (message) => {
    try {
      const payload = JSON.parse(String(message.data)) as InboxEvent;
      if (payload && typeof payload.type === "string") {
        onEvent(payload);
      }
    } catch {
      // Un événement non JSON est ignoré sans interrompre le canal.
    }
  });

  socket.addEventListener("close", () => window.clearInterval(ping));
  socket.addEventListener("error", () => window.clearInterval(ping));

  return socket;
}
