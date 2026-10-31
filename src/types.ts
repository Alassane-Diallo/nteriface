export type ID = string;

export type AvatarTone =
  | "green"
  | "yellow"
  | "red"
  | "clay"
  | "river"
  | "indigo";

export interface Person {
  id: ID;
  name: string;
  username: string;
  avatar?: string;
  cover?: string;
  tone?: AvatarTone;
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
  mutual?: number;
  friend?: boolean;
  followingMe?: boolean;
  professional?: boolean;
  staff?: boolean;
}

export interface Author {
  id: ID;
  name: string;
  handle?: string;
  subtitle?: string;
  avatar?: string;
  verified?: boolean;
  kind?: "user" | "page" | "group" | "brand";
  tone?: AvatarTone;
  href?: string;
}

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ReactionSummary {
  counts: Record<ReactionType, number>;
  mine?: ReactionType;
}

export interface Comment {
  id: ID;
  author: Author;
  text: string;
  time: string;
  likes: number;
  likedByMe?: boolean;
  replies?: Comment[];
}

export interface Media {
  id: ID;
  url: string;
  alt: string;
  tall?: boolean;
}

export interface Poll {
  question: string;
  options: { id: ID; label: string; votes: number }[];
  voted?: ID;
  ends: string;
}

export type PostKind =
  | "text"
  | "photo"
  | "video"
  | "poll"
  | "event"
  | "listing"
  | "shared"
  | "reel"
  | "ad"
  | "live";

export interface Post {
  id: ID;
  author: Author;
  time: string;
  audience: "public" | "friends" | "group" | "page" | "private";
  text?: string;
  media?: Media[];
  kind: PostKind;
  poll?: Poll;
  eventId?: ID;
  listingId?: ID;
  sharedFrom?: Author;
  sharedText?: string;
  video?: {
    poster: string;
    title: string;
    duration: string;
    views: number;
    live?: boolean;
  };
  feeling?: string;
  location?: string;
  reactions: ReactionSummary;
  comments: Comment[];
  shares: number;
  saved?: boolean;
  pinned?: boolean;
  sponsored?: {
    label: string;
    cta: string;
    url: string;
  };
  groupId?: ID;
  pageId?: ID;
  profileId?: ID;
}

export interface Story {
  id: ID;
  author: Author;
  image: string;
  caption?: string;
  music?: string;
  seen?: boolean;
  mine?: boolean;
  viewers: number;
  isText?: boolean;
  textColor?: string;
  background?: string;
}

export interface Reel {
  id: ID;
  author: Author;
  poster: string;
  caption: string;
  audio: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: string;
  liked?: boolean;
  saved?: boolean;
  duration: string;
}

export interface Video {
  id: ID;
  title: string;
  channel: Author;
  poster: string;
  duration: string;
  views: string;
  live?: boolean;
  category: "Tendances" | "Musique" | "Cuisine" | "Tech" | "Sport" | "Culture";
  description?: string;
  saved?: boolean;
}

export interface Group {
  id: ID;
  name: string;
  handle: string;
  description: string;
  members: number;
  postsToday: number;
  privacy: "public" | "privé" | "visible" | "caché";
  category: string;
  cover: string;
  tone: AvatarTone;
  joined: boolean;
  role?: "Propriétaire" | "Administrateur" | "Modérateur" | "Membre";
  rules: string[];
  pending: Person[];
}

export interface EventItem {
  id: ID;
  title: string;
  date: string;
  fullDate: string;
  time: string;
  location: string;
  online?: boolean;
  cover: string;
  art: "sahel" | "indigo" | "green" | "clay";
  host: Author;
  attendees: number;
  interested: number;
  going: boolean;
  category: string;
  description: string;
  price?: string;
}

export interface Page {
  id: ID;
  name: string;
  handle: string;
  category: string;
  followers: number;
  tone: AvatarTone;
  cover: string;
  art: "sahel" | "indigo" | "green" | "clay";
  verified: boolean;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  rating: number;
  reviews: number;
  liked: boolean;
  roles?: string[];
}

export interface Listing {
  id: ID;
  title: string;
  price: number;
  category: string;
  condition: "Neuf" | "Comme neuf" | "Très bon état" | "Bon état" | "À rénover";
  location: string;
  distance: string;
  image: string;
  images: string[];
  seller: Person;
  saved: boolean;
  description: string;
  time: string;
  negotiable?: boolean;
  status?: "Disponible" | "Vendu" | "Réservé";
}

export interface Message {
  id: ID;
  senderId: ID;
  text?: string;
  time: string;
  state?: "sent" | "delivered" | "read";
  reactions?: string;
  attachment?: { type: "photo" | "audio" | "file"; label: string; url?: string };
}

export interface Conversation {
  id: ID;
  kind: "direct" | "group";
  title: string;
  avatar?: string;
  tone?: AvatarTone;
  members?: number;
  online?: boolean;
  unread: number;
  lastTime: string;
  messages: Message[];
  pinned?: boolean;
  muted?: boolean;
  typing?: boolean;
}

export interface Notification {
  id: ID;
  type:
    | "friend_request"
    | "friend_accept"
    | "reaction"
    | "comment"
    | "mention"
    | "message"
    | "event"
    | "marketplace"
    | "live"
    | "security"
    | "group"
    | "system";
  actor: Author;
  text: string;
  time: string;
  read: boolean;
  image?: string;
  href?: string;
}

export interface Trend {
  tag: string;
  posts: string;
  category: string;
  delta?: string;
}

export interface SavedCollection {
  id: ID;
  name: string;
  count: number;
  tone: AvatarTone;
}
