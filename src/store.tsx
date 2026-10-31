import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  activeDevices,
  conversations as seedConversations,
  currentUser,
  events as seedEvents,
  friendRequests as seedRequests,
  groups as seedGroups,
  listings as seedListings,
  notifications as seedNotifications,
  pages as seedPages,
  people,
  posts as seedPosts,
  reels as seedReels,
  stories as seedStories,
} from "./data";
import type {
  Author,
  Conversation,
  EventItem,
  Group,
  ID,
  Listing,
  Notification,
  Page,
  Person,
  Post,
  ReactionType,
  Reel,
  Story,
} from "./types";
import * as api from "./lib/api";
import {
  friendIdsFromPeople,
  mapApiMessage,
  mapConversation,
  mapFriendRequest,
  mapMe,
  mapNotification,
  mapPost,
  usernamesById,
} from "./lib/apiHydrate";

type ComposerKind =
  | "post"
  | "story"
  | "reel"
  | "live"
  | "listing"
  | "event"
  | "page"
  | "group"
  | "ad";

interface Toast {
  id: string;
  message: string;
  tone: "success" | "info" | "danger";
}

interface PrivacySettings {
  defaultAudience: string;
  friendRequests: string;
  searchable: string;
  friendList: string;
  mentions: string;
  stories: string;
  photos: string;
  messages: string;
  location: string;
}

interface SecuritySettings {
  twoFactor: boolean;
  loginAlerts: boolean;
  trustedDevices: boolean;
  suspiciousActivity: boolean;
}

interface NotificationSettings {
  reactions: boolean;
  comments: boolean;
  friendRequests: boolean;
  messages: boolean;
  events: boolean;
  marketplace: boolean;
  email: boolean;
  push: boolean;
}

interface AppSettings {
  privacy: PrivacySettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
}

interface ComposerState {
  open: boolean;
  kind: ComposerKind;
  contextId?: string;
}

interface AppState {
  signedIn: boolean;
  me: Person;
  posts: Post[];
  stories: Story[];
  reels: Reel[];
  groups: Group[];
  events: EventItem[];
  pages: Page[];
  listings: Listing[];
  conversations: Conversation[];
  notifications: Notification[];
  friendIds: ID[];
  requests: { personId: ID; mutual: number; time: string }[];
  savedEventIds: ID[];
  settings: AppSettings;
}

const STORAGE_KEY = "nteriface:demo:v1";

const defaultSettings: AppSettings = {
  privacy: {
    defaultAudience: "Amis",
    friendRequests: "Tout le monde",
    searchable: "Tout le monde",
    friendList: "Amis",
    mentions: "Amis et Pages",
    stories: "Amis",
    photos: "Amis",
    messages: "Amis et Pages",
    location: "Amis",
  },
  security: {
    twoFactor: true,
    loginAlerts: true,
    trustedDevices: true,
    suspiciousActivity: true,
  },
  notifications: {
    reactions: true,
    comments: true,
    friendRequests: true,
    messages: true,
    events: true,
    marketplace: true,
    email: false,
    push: true,
  },
};

function createInitialState(): AppState {
  return {
    signedIn: false,
    me: { ...currentUser },
    posts: seedPosts,
    stories: seedStories,
    reels: seedReels,
    groups: seedGroups,
    events: seedEvents,
    pages: seedPages,
    listings: seedListings,
    conversations: seedConversations,
    notifications: seedNotifications,
    friendIds: people.filter((person) => person.friend).map((person) => person.id),
    requests: seedRequests.map((request) => ({
      personId: request.person.id,
      mutual: request.mutual,
      time: request.time,
    })),
    savedEventIds: [],
    settings: defaultSettings,
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || !parsed.me || !Array.isArray(parsed.posts)) {
      return createInitialState();
    }
    const base = createInitialState();
    return {
      ...base,
      ...parsed,
      me: { ...base.me, ...parsed.me },
      settings: {
        privacy: { ...base.settings.privacy, ...parsed.settings?.privacy },
        security: { ...base.settings.security, ...parsed.settings?.security },
        notifications: {
          ...base.settings.notifications,
          ...parsed.settings?.notifications,
        },
      },
    };
  } catch {
    return createInitialState();
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function zeroCounts(): Record<ReactionType, number> {
  return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
}

const autoReplies = [
  "Parfait, je regarde ça et je te reviens dans la journée.",
  "Bonne idée ! On en parle à l’atelier demain ?",
  "Merci beaucoup 🙏 Ça me fait plaisir.",
  "Je viens de voir ton message. Oui, c’est possible pour moi.",
  "Je t’envoie les détails par e-mail dans un instant.",
  "On se retrouve au Baobab à 18h ? Je réserve une table.",
  "Excellente nouvelle. Je partage avec l’équipe.",
];

interface AppContextValue {
  state: AppState;
  toasts: Toast[];
  composer: ComposerState;
  unreadNotifications: number;
  unreadMessages: number;
  friendCount: number;
  showToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
  openComposer: (kind?: ComposerKind, contextId?: string) => void;
  closeComposer: () => void;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  setReaction: (postId: ID, reaction: ReactionType) => void;
  addComment: (postId: ID, text: string, parentId?: ID) => void;
  likeComment: (postId: ID, commentId: ID) => void;
  votePoll: (postId: ID, optionId: ID) => void;
  toggleSavePost: (postId: ID) => void;
  hidePost: (postId: ID) => void;
  sharePost: (postId: ID) => void;
  createPost: (input: {
    text: string;
    audience: Post["audience"];
    feeling?: string;
    location?: string;
    media?: Post["media"];
    poll?: { question: string; options: string[] };
    kind?: Post["kind"];
    contextId?: ID;
  }) => void;
  createStory: (input: { caption: string; image: string; music?: string }) => void;
  createReel: (input: { caption: string; poster: string; audio: string }) => void;
  createListing: (input: {
    title: string;
    price: number;
    category: string;
    condition: Listing["condition"];
    location: string;
    description: string;
    image?: string;
  }) => void;
  createEvent: (input: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    category: string;
    online?: boolean;
  }) => EventItem;
  createGroup: (input: { name: string; description: string; privacy: Group["privacy"] }) => void;
  createPage: (input: { name: string; category: string; description: string }) => void;
  updateProfile: (updates: Partial<Person>) => void;
  setProfessional: (value: boolean) => void;
  updateSetting: <K extends keyof AppSettings>(
    section: K,
    key: keyof AppSettings[K],
    value: AppSettings[K][keyof AppSettings[K]],
  ) => void;
  acceptFriend: (personId: ID) => void;
  declineFriend: (personId: ID) => void;
  addFriend: (personId: ID) => void;
  removeFriend: (personId: ID) => void;
  toggleGroupJoin: (groupId: ID) => void;
  approveGroupMember: (groupId: ID, personId: ID) => void;
  declineGroupMember: (groupId: ID, personId: ID) => void;
  toggleGoing: (eventId: ID) => void;
  toggleSavedEvent: (eventId: ID) => void;
  togglePageLike: (pageId: ID) => void;
  toggleListingSaved: (listingId: ID) => void;
  toggleReelLike: (reelId: ID) => void;
  toggleReelSave: (reelId: ID) => void;
  markNotificationsRead: () => void;
  markNotificationRead: (id: ID) => void;
  markConversationRead: (id: ID) => void;
  sendMessage: (conversationId: ID, text: string) => void;
  startConversation: (person: Person) => ID;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ open: false, kind: "post" });
  const timers = useRef<number[]>([]);
  const backendConversationIds = useRef<Map<ID, ID>>(new Map());
  const usernameById = useRef<Map<string, string>>(new Map());
  const inboxSocket = useRef<WebSocket | null>(null);
  const apiSession = useRef(false);
  const initialSignedIn = useRef(state.signedIn);
  const sessionHydration = useRef<Promise<void> | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Demo data is non-critical if localStorage is unavailable.
    }
  }, [state]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = makeId("toast");
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
    timers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const openComposer = useCallback((kind: ComposerKind = "post", contextId?: string) => {
    setComposer({ open: true, kind, contextId });
  }, []);

  const closeComposer = useCallback(() => setComposer({ open: false, kind: "post" }), []);

  const connectInbox = useCallback(() => {
    if (inboxSocket.current || !apiSession.current) return;

    inboxSocket.current = api.openInboxSocket((event) => {
      if (event.type === "message.created" && event.message && event.conversationId) {
        const backendId = String(event.conversationId);
        const localId = Array.from(backendConversationIds.current.entries()).find(
          ([, value]) => value === backendId,
        )?.[0];
        if (!localId) return;

        const mapped = mapApiMessage(event.message, usernameById.current);
        setState((current) => {
          const conversation = current.conversations.find(
            (item) => item.id === localId,
          );
          if (!conversation) return current;
          if (conversation.messages.some((message) => message.id === mapped.id)) {
            return current;
          }
          return {
            ...current,
            conversations: current.conversations.map((item) =>
              item.id === localId
                ? {
                    ...item,
                    lastTime: mapped.time,
                    unread:
                      mapped.senderId === current.me.id
                        ? 0
                        : event.unread ?? item.unread + 1,
                    messages: [...item.messages, mapped],
                  }
                : item,
            ),
          };
        });
        return;
      }

      if (event.type === "notification.created" && event.notification) {
        const mapped = mapNotification(event.notification);
        if (!mapped) return;
        setState((current) => {
          if (current.notifications.some((item) => item.id === mapped.id)) {
            return current;
          }
          return {
            ...current,
            notifications: [mapped, ...current.notifications],
          };
        });
        return;
      }

      if (event.type === "call.incoming" && event.call) {
        const kind = event.call.kind === "video" ? "vidéo" : "audio";
        showToast(
          `Appel ${kind} entrant de ${event.call.caller?.name ?? "un contact"}.`,
          "info",
        );
      }
    });
  }, [showToast]);

  const hydrateFromApi = useCallback(async () => {
    const me = await api.socialMe();
    const [feedResult, peopleResult, conversationsResult, notificationsResult, requestsResult] =
      await Promise.allSettled([
        api.socialFeed(),
        api.socialPeople(),
        api.conversations(),
        api.socialNotifications(),
        api.socialFriendRequests(),
      ]);

    const apiPeople = peopleResult.status === "fulfilled" ? peopleResult.value : [];
    const usernameMap = usernamesById(apiPeople);
    // `/people/` exclut le compte courant : on l’ajoute pour que ses messages
    // restent alignés à droite dans Messenger.
    usernameMap.set(String(me.id), me.username);
    usernameById.current = usernameMap;
    const rawConversations =
      conversationsResult.status === "fulfilled" ? conversationsResult.value : [];

    backendConversationIds.current.clear();
    const mappedConversations = await Promise.all(
      rawConversations.map(async (raw) => {
        const rawId = String(raw.id);
        let rawMessages: api.ApiMessage[] = [];
        try {
          rawMessages = (await api.conversationMessages(rawId)).messages;
        } catch {
          // La liste reste utilisable même si l’historique est indisponible.
        }
        const mapped = mapConversation(raw, rawMessages, usernameMap);
        backendConversationIds.current.set(mapped.id, rawId);
        return mapped;
      }),
    );

    const mappedPosts =
      feedResult.status === "fulfilled"
        ? feedResult.value.results.map(mapPost)
        : null;
    const mappedNotifications =
      notificationsResult.status === "fulfilled"
        ? notificationsResult.value
            .map(mapNotification)
            .filter((item): item is Notification => Boolean(item))
        : null;
    const mappedRequests =
      requestsResult.status === "fulfilled"
        ? requestsResult.value.incoming
            .map(mapFriendRequest)
            .filter(
              (
                item,
              ): item is { personId: ID; mutual: number; time: string } =>
                Boolean(item),
            )
        : null;

    setState((current) => ({
      ...current,
      signedIn: true,
      me: mapMe(me),
      posts: mappedPosts ?? current.posts,
      conversations:
        conversationsResult.status === "fulfilled"
          ? mappedConversations
          : current.conversations,
      notifications: mappedNotifications ?? current.notifications,
      friendIds:
        peopleResult.status === "fulfilled"
          ? friendIdsFromPeople(apiPeople)
          : current.friendIds,
      requests: mappedRequests ?? current.requests,
    }));
    apiSession.current = true;
    connectInbox();
  }, [connectInbox]);

  useEffect(() => {
    if (!initialSignedIn.current || sessionHydration.current) return;
    sessionHydration.current = hydrateFromApi().catch(() => {
      // L’API est facultative : le mode démo local reste disponible.
    });
  }, [hydrateFromApi]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      if (!identifier.trim() || password.length < 4) {
        showToast("Identifiants incomplets. Utilisez le compte de démonstration.", "danger");
        return false;
      }

      try {
        await api.login(identifier, password);
        await hydrateFromApi();
        showToast("Bienvenue sur N’Teriface.");
        return true;
      } catch (error) {
        const status = error instanceof api.ApiError ? error.status : 0;
        const canUseLocalDemo = status === 0 || status >= 500;

        if (!canUseLocalDemo) {
          showToast(
            error instanceof Error
              ? error.message
              : "Identifiants incorrects. Utilisez le compte de démonstration.",
            "danger",
          );
          return false;
        }

        // L’API est absente ou indisponible : on conserve le parcours de démo
        // local, qui est le comportement historique du frontend.
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        setState((current) => ({
          ...current,
          signedIn: true,
          me: { ...currentUser },
        }));
        showToast(
          "Serveur hors ligne : mode démo local. Les données restent dans ce navigateur.",
          "info",
        );
        return true;
      }
    },
    [hydrateFromApi, showToast],
  );

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      if (
        payload.firstName.trim().length < 2 ||
        payload.lastName.trim().length < 2 ||
        payload.username.trim().length < 3 ||
        payload.phone.trim().length < 8 ||
        payload.password.length < 8
      ) {
        showToast("Vérifiez les informations du formulaire.", "danger");
        return false;
      }

      const name = `${payload.firstName.trim()} ${payload.lastName.trim()}`;
      try {
        await api.register({
          username: payload.username.replace(/^@/, "").trim(),
          name,
          phone: payload.phone.trim(),
          email: payload.email.trim(),
          password: payload.password,
        });
        await hydrateFromApi();
        showToast(`Bienvenue ${payload.firstName.trim()} ! Votre compte est prêt.`);
        return true;
      } catch (error) {
        const status = error instanceof api.ApiError ? error.status : 0;
        const canUseLocalDemo = status === 0 || status >= 500;

        if (!canUseLocalDemo) {
          showToast(
            error instanceof Error
              ? error.message
              : "Impossible de créer le compte. Vérifiez vos informations.",
            "danger",
          );
          return false;
        }

        // Inscription hors ligne : on conserve le parcours local de la démo.
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        setState((current) => ({
          ...current,
          signedIn: true,
          me: {
            ...current.me,
            name,
            username: payload.username.replace(/^@/, ""),
            followers: 0,
            following: 0,
            verified: false,
            professional: false,
            staff: false,
            bio: "Nouveau sur N’Teriface.",
          },
        }));
        showToast("Serveur hors ligne : compte local créé dans ce navigateur.", "info");
        return true;
      }
    },
    [hydrateFromApi, showToast],
  );

  const logout = useCallback(() => {
    void api.logout().catch(() => {
      // La session locale doit pouvoir se fermer même si l’API est absente.
    });
    inboxSocket.current?.close();
    inboxSocket.current = null;
    backendConversationIds.current.clear();
    apiSession.current = false;
    setState((current) => ({ ...current, signedIn: false }));
    showToast("Vous êtes déconnecté. À bientôt.", "info");
  }, [showToast]);

  const setReaction = useCallback((postId: ID, reaction: ReactionType) => {
    setState((current) => ({
      ...current,
      posts: current.posts.map((post) => {
        if (post.id !== postId) return post;
        const counts = { ...post.reactions.counts };
        const previous = post.reactions.mine;
        if (previous) counts[previous] = Math.max(0, counts[previous] - 1);
        const next = previous === reaction ? undefined : reaction;
        if (next) counts[next] += 1;
        return { ...post, reactions: { counts, mine: next } };
      }),
    }));
    if (apiSession.current && /^\d+$/.test(postId)) {
      void api.reactToPost(postId, reaction).catch(() => {
        // L’action optimiste reste visible ; le backend peut être indisponible.
      });
    }
  }, []);

  const addComment = useCallback(
    (postId: ID, text: string, parentId?: ID) => {
      if (!text.trim()) return;
      const author: Author = {
        id: state.me.id,
        name: state.me.name,
        handle: `@${state.me.username}`,
        avatar: state.me.avatar,
        verified: state.me.verified,
        kind: "user",
        tone: state.me.tone,
        href: `/profil/${state.me.username}`,
      };
      const comment = {
        id: makeId("comment"),
        author,
        text: text.trim(),
        time: "À l’instant",
        likes: 0,
      };
      setState((current) => ({
        ...current,
        posts: current.posts.map((post) => {
          if (post.id !== postId) return post;
          if (!parentId) {
            return { ...post, comments: [...post.comments, comment] };
          }
          return {
            ...post,
            comments: post.comments.map((item) =>
              item.id === parentId ? { ...item, replies: [...(item.replies ?? []), comment] } : item,
            ),
          };
        }),
      }));
      if (apiSession.current && /^\d+$/.test(postId)) {
        const backendParent =
          parentId && /^\d+$/.test(parentId) ? parentId : undefined;
        void api.commentOnPost(postId, text.trim(), backendParent).catch(() => {
          // Le commentaire optimiste reste affiché en mode hors ligne.
        });
      }
    },
    [state.me],
  );

  const likeComment = useCallback((postId: ID, commentId: ID) => {
    setState((current) => ({
      ...current,
      posts: current.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    likedByMe: !comment.likedByMe,
                    likes: comment.likes + (comment.likedByMe ? -1 : 1),
                  };
                }
                return comment;
              }),
            }
          : post,
      ),
    }));
    if (apiSession.current && /^\d+$/.test(commentId)) {
      void api.likeComment(commentId).catch(() => {
        // L’action optimiste reste visible.
      });
    }
  }, []);

  const votePoll = useCallback((postId: ID, optionId: ID) => {
    setState((current) => ({
      ...current,
      posts: current.posts.map((post) => {
        if (post.id !== postId || !post.poll || post.poll.voted) return post;
        return {
          ...post,
          poll: {
            ...post.poll,
            voted: optionId,
            options: post.poll.options.map((option) =>
              option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
            ),
          },
        };
      }),
    }));
    if (
      apiSession.current &&
      /^\d+$/.test(postId) &&
      /^\d+$/.test(optionId)
    ) {
      void api.votePoll(postId, optionId).catch(() => {
        // Le vote optimiste reste visible.
      });
    }
  }, []);

  const toggleSavePost = useCallback(
    (postId: ID) => {
      let nowSaved = false;
      setState((current) => ({
        ...current,
        posts: current.posts.map((post) => {
          if (post.id !== postId) return post;
          nowSaved = !post.saved;
          return { ...post, saved: nowSaved };
        }),
      }));
      showToast(nowSaved ? "Publication enregistrée." : "Publication retirée des sauvegardes.", "info");
      if (apiSession.current && /^\d+$/.test(postId)) {
        void api.savePost(postId).catch(() => {
          // La sauvegarde locale reste disponible.
        });
      }
    },
    [showToast],
  );

  const hidePost = useCallback(
    (postId: ID) => {
      setState((current) => ({
        ...current,
        posts: current.posts.filter((post) => post.id !== postId),
      }));
      showToast("Publication masquée. Vous en verrez moins comme celle-ci.", "info");
      if (apiSession.current && /^\d+$/.test(postId)) {
        void api.hidePost(postId).catch(() => {
          // Le masquage local reste disponible.
        });
      }
    },
    [showToast],
  );

  const sharePost = useCallback(
    (postId: ID) => {
      setState((current) => ({
        ...current,
        posts: current.posts.map((post) =>
          post.id === postId ? { ...post, shares: post.shares + 1 } : post,
        ),
      }));
      showToast("Lien de la publication copié. Partage prêt !");
      if (apiSession.current && /^\d+$/.test(postId)) {
        void api.sharePost(postId).catch(() => {
          // Le partage local reste visible.
        });
      }
    },
    [showToast],
  );

  const createPost = useCallback(
    (input: {
      text: string;
      audience: Post["audience"];
      feeling?: string;
      location?: string;
      media?: Post["media"];
      poll?: { question: string; options: string[] };
      kind?: Post["kind"];
      contextId?: ID;
    }) => {
      const author: Author = {
        id: state.me.id,
        name: state.me.name,
        handle: `@${state.me.username}`,
        avatar: state.me.avatar,
        verified: state.me.verified,
        kind: "user",
        tone: state.me.tone,
        subtitle: state.me.work,
        href: `/profil/${state.me.username}`,
      };
      const kind: Post["kind"] = input.poll ? "poll" : input.media?.length ? "photo" : input.kind ?? "text";
      const post: Post = {
        id: makeId("post"),
        author,
        time: "À l’instant",
        audience: input.audience,
        kind,
        text: input.text,
        media: input.media,
        poll: input.poll
          ? {
              question: input.poll.question,
              options: input.poll.options
                .filter((option) => option.trim())
                .map((option, index) => ({ id: `opt-${index}`, label: option.trim(), votes: 0 })),
              ends: "3 jours restants",
            }
          : undefined,
        feeling: input.feeling,
        location: input.location,
        reactions: { counts: zeroCounts() },
        comments: [],
        shares: 0,
        groupId: input.contextId?.startsWith("group-") ? input.contextId.slice(6) : undefined,
        pageId: input.contextId?.startsWith("page-") ? input.contextId.slice(5) : undefined,
      };
      setState((current) => ({ ...current, posts: [post, ...current.posts] }));
      showToast("Votre publication est en ligne.");

      if (apiSession.current) {
        const groupSlug = input.contextId?.startsWith("group-")
          ? input.contextId.slice(6)
          : undefined;
        const pageSlug = input.contextId?.startsWith("page-")
          ? input.contextId.slice(5)
          : undefined;
        const poll = input.poll
          ? {
              question: input.poll.question,
              options: input.poll.options
                .map((option) => option.trim())
                .filter(Boolean),
              ends: "3 jours restants",
            }
          : undefined;
        void api
          .createPost({
            text: input.text,
            audience: input.audience,
            kind,
            media: input.media?.map((item) => item.url) ?? [],
            feeling: input.feeling,
            location: input.location,
            groupId: groupSlug,
            pageId: pageSlug,
            poll,
          })
          .then((raw) => {
            const mapped = mapPost(raw);
            setState((current) => ({
              ...current,
              posts: current.posts.map((item) =>
                item.id === post.id ? mapped : item,
              ),
            }));
          })
          .catch(() => {
            // La publication locale reste affichée en mode hors ligne.
          });
      }
    },
    [showToast, state.me],
  );

  const createStory = useCallback(
    (input: { caption: string; image: string; music?: string }) => {
      const story: Story = {
        id: makeId("story"),
        author: {
          id: state.me.id,
          name: state.me.name,
          handle: `@${state.me.username}`,
          avatar: state.me.avatar,
          kind: "user",
          tone: state.me.tone,
        },
        image: input.image,
        caption: input.caption,
        music: input.music,
        viewers: 0,
        mine: true,
        seen: true,
      };
      setState((current) => ({
        ...current,
        stories: [story, ...current.stories.filter((item) => !item.mine)],
      }));
      showToast("Votre Story est publiée pour 24 h.");
    },
    [showToast, state.me],
  );

  const createReel = useCallback(
    (input: { caption: string; poster: string; audio: string }) => {
      const reel: Reel = {
        id: makeId("reel"),
        author: {
          id: state.me.id,
          name: state.me.name,
          handle: `@${state.me.username}`,
          avatar: state.me.avatar,
          kind: "user",
          tone: state.me.tone,
        },
        poster: input.poster,
        caption: input.caption,
        audio: input.audio || "Son original · N’Teriface",
        tags: ["#Nteriface", "#Mali"],
        likes: 0,
        comments: 0,
        shares: 0,
        views: "0",
        duration: "0:30",
      };
      setState((current) => ({ ...current, reels: [reel, ...current.reels] }));
      showToast("Votre Reel est publié.");
    },
    [showToast, state.me],
  );

  const createListing = useCallback(
    (input: {
      title: string;
      price: number;
      category: string;
      condition: Listing["condition"];
      location: string;
      description: string;
      image?: string;
    }) => {
      const listing: Listing = {
        id: makeId("listing"),
        title: input.title,
        price: input.price,
        category: input.category,
        condition: input.condition,
        location: input.location,
        distance: "Bamako",
        image:
          input.image ??
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        images: [
          input.image ??
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        ],
        seller: state.me,
        saved: false,
        description: input.description,
        time: "À l’instant",
        status: "Disponible",
      };
      setState((current) => ({ ...current, listings: [listing, ...current.listings] }));
      showToast("Annonce publiée dans Marketplace.");
    },
    [showToast, state.me],
  );

  const createEvent = useCallback(
    (input: {
      title: string;
      date: string;
      time: string;
      location: string;
      description: string;
      category: string;
      online?: boolean;
    }) => {
      const event: EventItem = {
        id: makeId("event"),
        title: input.title,
        date: input.date || "Date à confirmer",
        fullDate: input.date || "Date à confirmer",
        time: input.time || "Heure à confirmer",
        location: input.location || "Bamako, Mali",
        online: input.online,
        cover: "sahel",
        art: "sahel",
        host: {
          id: state.me.id,
          name: state.me.name,
          handle: `@${state.me.username}`,
          avatar: state.me.avatar,
          kind: "user",
          tone: state.me.tone,
        },
        attendees: 1,
        interested: 0,
        going: true,
        category: input.category || "Communauté",
        description: input.description,
      };
      setState((current) => ({ ...current, events: [event, ...current.events] }));
      showToast("Votre événement est créé.");
      return event;
    },
    [showToast, state.me],
  );

  const createGroup = useCallback(
    (input: { name: string; description: string; privacy: Group["privacy"] }) => {
      const group: Group = {
        id: makeId("group"),
        name: input.name,
        handle: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: input.description,
        members: 1,
        postsToday: 0,
        privacy: input.privacy,
        category: "Communauté",
        cover: "green",
        tone: "green",
        joined: true,
        role: "Propriétaire",
        rules: ["Respect et bienveillance."],
        pending: [],
      };
      setState((current) => ({ ...current, groups: [group, ...current.groups] }));
      showToast("Votre groupe est créé.");
    },
    [showToast],
  );

  const createPage = useCallback(
    (input: { name: string; category: string; description: string }) => {
      const page: Page = {
        id: makeId("page"),
        name: input.name,
        handle: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: input.category,
        followers: 0,
        tone: "green",
        cover: "green",
        art: "green",
        verified: false,
        description: input.description,
        rating: 0,
        reviews: 0,
        liked: true,
        roles: ["Propriétaire"],
      };
      setState((current) => ({ ...current, pages: [page, ...current.pages] }));
      showToast("Votre Page est créée. Bienvenue !");
    },
    [showToast],
  );

  const updateProfile = useCallback(
    (updates: Partial<Person>) => {
      setState((current) => ({ ...current, me: { ...current.me, ...updates } }));
      showToast("Profil mis à jour.");
    },
    [showToast],
  );

  const setProfessional = useCallback(
    (value: boolean) => {
      setState((current) => ({
        ...current,
        me: { ...current.me, professional: value },
      }));
      showToast(
        value ? "Mode professionnel activé. Votre Creator Studio est prêt." : "Mode professionnel désactivé.",
        "info",
      );
    },
    [showToast],
  );

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(
      section: K,
      key: keyof AppSettings[K],
      value: AppSettings[K][keyof AppSettings[K]],
    ) => {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          [section]: { ...current.settings[section], [key]: value },
        },
      }));
    },
    [],
  );

  const acceptFriend = useCallback(
    (personId: ID) => {
      const person = people.find((item) => item.id === personId);
      setState((current) => ({
        ...current,
        friendIds: Array.from(new Set([...current.friendIds, personId])),
        requests: current.requests.filter((request) => request.personId !== personId),
      }));
      showToast(`${person?.name ?? "La personne"} fait désormais partie de vos amis.`);
      if (apiSession.current && person) {
        void api.friendAction(person.username, "accept").catch(() => {
          // L’amitié locale reste visible.
        });
      }
    },
    [showToast],
  );

  const declineFriend = useCallback(
    (personId: ID) => {
      const person = people.find((item) => item.id === personId);
      setState((current) => ({
        ...current,
        requests: current.requests.filter((request) => request.personId !== personId),
      }));
      showToast("Demande d’ami ignorée.", "info");
      if (apiSession.current && person) {
        void api.friendAction(person.username, "decline").catch(() => {
          // La demande locale reste retirée.
        });
      }
    },
    [showToast],
  );

  const addFriend = useCallback(
    (personId: ID) => {
      const person = people.find((item) => item.id === personId);
      setState((current) => ({
        ...current,
        friendIds: Array.from(new Set([...current.friendIds, personId])),
      }));
      showToast("Demande d’ami envoyée.");
      if (apiSession.current && person) {
        void api.friendAction(person.username, "request").catch(() => {
          // La demande locale reste visible.
        });
      }
    },
    [showToast],
  );

  const removeFriend = useCallback(
    (personId: ID) => {
      const person = people.find((item) => item.id === personId);
      setState((current) => ({
        ...current,
        friendIds: current.friendIds.filter((id) => id !== personId),
      }));
      showToast("Personne retirée de vos amis.", "info");
      if (apiSession.current && person) {
        void api.friendAction(person.username, "remove").catch(() => {
          // Le retrait local reste visible.
        });
      }
    },
    [showToast],
  );

  const toggleGroupJoin = useCallback(
    (groupId: ID) => {
      const group = state.groups.find((item) => item.id === groupId);
      if (!group) return;
      if (!group.joined && group.privacy !== "public") {
        showToast("Demande envoyée. Un administrateur doit l’approuver.", "info");
        if (apiSession.current) {
          void api.joinGroup(groupId, "join").catch(() => {
            // La demande locale reste affichée.
          });
        }
        return;
      }
      setState((current) => ({
        ...current,
        groups: current.groups.map((item) =>
          item.id === groupId
            ? {
                ...item,
                joined: !item.joined,
                members: item.members + (item.joined ? -1 : 1),
                role: item.joined ? undefined : "Membre",
              }
            : item,
        ),
      }));
      showToast(group.joined ? "Vous avez quitté le groupe." : `Bienvenue dans ${group.name} !`, group.joined ? "info" : "success");
      if (apiSession.current) {
        void api.joinGroup(groupId, group.joined ? "leave" : "join").catch(() => {
          // L’adhésion locale reste visible.
        });
      }
    },
    [showToast, state.groups],
  );

  const approveGroupMember = useCallback(
    (groupId: ID, personId: ID) => {
      setState((current) => ({
        ...current,
        groups: current.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                pending: group.pending.filter((person) => person.id !== personId),
                members: group.members + 1,
              }
            : group,
        ),
      }));
      showToast("Demande d’adhésion approuvée.");
    },
    [showToast],
  );

  const declineGroupMember = useCallback(
    (groupId: ID, personId: ID) => {
      setState((current) => ({
        ...current,
        groups: current.groups.map((group) =>
          group.id === groupId
            ? { ...group, pending: group.pending.filter((person) => person.id !== personId) }
            : group,
        ),
      }));
      showToast("Demande d’adhésion refusée.", "info");
    },
    [showToast],
  );

  const toggleGoing = useCallback(
    (eventId: ID) => {
      const event = state.events.find((item) => item.id === eventId);
      setState((current) => ({
        ...current,
        events: current.events.map((item) =>
          item.id === eventId
            ? {
                ...item,
                going: !item.going,
                attendees: item.attendees + (item.going ? -1 : 1),
              }
            : item,
        ),
      }));
      showToast(
        event?.going ? "Vous ne participez plus à l’événement." : "Vous participez à l’événement.",
        event?.going ? "info" : "success",
      );
      if (apiSession.current) {
        void api.eventAttendance(eventId).catch(() => {
          // La participation locale reste visible.
        });
      }
    },
    [showToast, state.events],
  );

  const toggleSavedEvent = useCallback(
    (eventId: ID) => {
      let saved = false;
      setState((current) => {
        saved = !current.savedEventIds.includes(eventId);
        return {
          ...current,
          savedEventIds: saved
            ? [...current.savedEventIds, eventId]
            : current.savedEventIds.filter((id) => id !== eventId),
        };
      });
      showToast(saved ? "Événement enregistré." : "Événement retiré des sauvegardes.", "info");
      if (apiSession.current) {
        void api.saveEvent(eventId).catch(() => {
          // La sauvegarde locale reste visible.
        });
      }
    },
    [showToast],
  );

  const togglePageLike = useCallback(
    (pageId: ID) => {
      const page = state.pages.find((item) => item.id === pageId);
      setState((current) => ({
        ...current,
        pages: current.pages.map((item) =>
          item.id === pageId
            ? {
                ...item,
                liked: !item.liked,
                followers: item.followers + (item.liked ? -1 : 1),
              }
            : item,
        ),
      }));
      showToast(page?.liked ? "Page retirée de vos abonnements." : "Vous suivez désormais cette Page.", page?.liked ? "info" : "success");
      if (apiSession.current) {
        void api.likePage(pageId).catch(() => {
          // L’abonnement local reste visible.
        });
      }
    },
    [showToast, state.pages],
  );

  const toggleListingSaved = useCallback(
    (listingId: ID) => {
      let saved = false;
      setState((current) => ({
        ...current,
        listings: current.listings.map((listing) => {
          if (listing.id !== listingId) return listing;
          saved = !listing.saved;
          return { ...listing, saved };
        }),
      }));
      showToast(saved ? "Annonce sauvegardée." : "Annonce retirée des favoris.", "info");
      if (apiSession.current) {
        void api.saveListing(listingId).catch(() => {
          // La sauvegarde locale reste visible.
        });
      }
    },
    [showToast],
  );

  const toggleReelLike = useCallback((reelId: ID) => {
    setState((current) => ({
      ...current,
      reels: current.reels.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              liked: !reel.liked,
              likes: reel.likes + (reel.liked ? -1 : 1),
            }
          : reel,
      ),
    }));
  }, []);

  const toggleReelSave = useCallback(
    (reelId: ID) => {
      let saved = false;
      setState((current) => ({
        ...current,
        reels: current.reels.map((reel) => {
          if (reel.id !== reelId) return reel;
          saved = !reel.saved;
          return { ...reel, saved };
        }),
      }));
      showToast(saved ? "Reel enregistré." : "Reel retiré des sauvegardes.", "info");
    },
    [showToast],
  );

  const markNotificationsRead = useCallback(() => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
    }));
    if (apiSession.current) {
      void api.readAllNotifications().catch(() => {
        // Les notifications restent lues localement.
      });
    }
  }, []);

  const markNotificationRead = useCallback((id: ID) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    }));
    if (apiSession.current && /^\d+$/.test(id)) {
      void api.readNotification(id).catch(() => {
        // La notification reste lue localement.
      });
    }
  }, []);

  const markConversationRead = useCallback((id: ID) => {
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    }));
    const backendId = backendConversationIds.current.get(id);
    if (apiSession.current && backendId) {
      void api.markConversationRead(backendId).catch(() => {
        // La conversation reste lue localement.
      });
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: ID, text: string) => {
      if (!text.trim()) return;
      const id = makeId("message");
      const time = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                typing: false,
                lastTime: time,
                unread: 0,
                messages: [
                  ...conversation.messages,
                  {
                    id,
                    senderId: current.me.id,
                    text: text.trim(),
                    time,
                    state: "delivered",
                  },
                ],
              }
            : conversation,
        ),
      }));

      const backendId = backendConversationIds.current.get(conversationId);
      if (apiSession.current && backendId) {
        void api
          .sendConversationMessage(backendId, text.trim())
          .then((saved) => {
            const sentTime = saved.sentAt
              ? new Date(saved.sentAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : time;
            setState((current) => ({
              ...current,
              conversations: current.conversations.map((conversation) => {
                if (conversation.id !== conversationId) return conversation;
                const savedId = String(saved.id);
                // Le WebSocket peut avoir déjà livré l’écho du message avant
                // la réponse HTTP : dans ce cas, on retire la copie optimiste
                // au lieu de créer un doublon de clé React.
                const hasSocketEcho = conversation.messages.some(
                  (message) => message.id === savedId,
                );
                const messages: Conversation["messages"] = hasSocketEcho
                  ? conversation.messages.filter((message) => message.id !== id)
                  : conversation.messages.map((message) =>
                      message.id === id
                        ? {
                            ...message,
                            id: savedId,
                            time: sentTime,
                            state: "delivered",
                          }
                        : message,
                    );
                return { ...conversation, lastTime: sentTime, messages };
              }),
            }));
          })
          .catch(() => {
            // Le message optimiste reste affiché si l’API est indisponible.
          });
        return;
      }

      const replyTimer = window.setTimeout(() => {
        setState((current) => ({
          ...current,
          conversations: current.conversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, typing: true }
              : conversation,
          ),
        }));
      }, 900);

      const answerTimer = window.setTimeout(() => {
        setState((current) => {
          const conversation = current.conversations.find((item) => item.id === conversationId);
          if (!conversation) return current;
          const peer =
            people.find((person) =>
              conversation.title.toLowerCase().includes(person.name.split(" ")[0].toLowerCase()),
            ) ?? people[3];
          const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          return {
            ...current,
            conversations: current.conversations.map((item) =>
              item.id === conversationId
                ? {
                    ...item,
                    typing: false,
                    unread: 0,
                    lastTime: time,
                    messages: [
                      ...item.messages,
                      {
                        id: makeId("reply"),
                        senderId: peer.id,
                        text: reply,
                        time,
                        state: "read",
                      },
                    ],
                  }
                : item,
            ),
          };
        });
      }, 2300);

      timers.current.push(replyTimer, answerTimer);
    },
    [],
  );

  const startConversation = useCallback(
    (person: Person) => {
      const existing = state.conversations.find(
        (conversation) =>
          conversation.kind === "direct" &&
          conversation.title.toLowerCase() === person.name.toLowerCase(),
      );
      if (existing) return existing.id;
      const id = makeId("conv");
      const conversation: Conversation = {
        id,
        kind: "direct",
        title: person.name,
        avatar: person.avatar,
        tone: person.tone,
        online: person.online,
        unread: 0,
        lastTime: "Maintenant",
        messages: [],
      };
      setState((current) => ({ ...current, conversations: [conversation, ...current.conversations] }));
      return id;
    },
    [state.conversations],
  );

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    const fresh = createInitialState();
    setState({ ...fresh, signedIn: true, me: { ...fresh.me } });
    showToast("Données de démonstration réinitialisées.", "info");
  }, [showToast]);

  const unreadNotifications = state.notifications.filter((notification) => !notification.read).length;
  const unreadMessages = state.conversations.reduce((total, item) => total + item.unread, 0);
  const friendCount = state.friendIds.length;

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      toasts,
      composer,
      unreadNotifications,
      unreadMessages,
      friendCount,
      showToast,
      dismissToast,
      openComposer,
      closeComposer,
      login,
      register,
      logout,
      setReaction,
      addComment,
      likeComment,
      votePoll,
      toggleSavePost,
      hidePost,
      sharePost,
      createPost,
      createStory,
      createReel,
      createListing,
      createEvent,
      createGroup,
      createPage,
      updateProfile,
      setProfessional,
      updateSetting,
      acceptFriend,
      declineFriend,
      addFriend,
      removeFriend,
      toggleGroupJoin,
      approveGroupMember,
      declineGroupMember,
      toggleGoing,
      toggleSavedEvent,
      togglePageLike,
      toggleListingSaved,
      toggleReelLike,
      toggleReelSave,
      markNotificationsRead,
      markNotificationRead,
      markConversationRead,
      sendMessage,
      startConversation,
      resetDemo,
    }),
    [
      state,
      toasts,
      composer,
      unreadNotifications,
      unreadMessages,
      friendCount,
      showToast,
      dismissToast,
      openComposer,
      closeComposer,
      login,
      register,
      logout,
      setReaction,
      addComment,
      likeComment,
      votePoll,
      toggleSavePost,
      hidePost,
      sharePost,
      createPost,
      createStory,
      createReel,
      createListing,
      createEvent,
      createGroup,
      createPage,
      updateProfile,
      setProfessional,
      updateSetting,
      acceptFriend,
      declineFriend,
      addFriend,
      removeFriend,
      toggleGroupJoin,
      approveGroupMember,
      declineGroupMember,
      toggleGoing,
      toggleSavedEvent,
      togglePageLike,
      toggleListingSaved,
      toggleReelLike,
      toggleReelSave,
      markNotificationsRead,
      markNotificationRead,
      markConversationRead,
      sendMessage,
      startConversation,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp doit être utilisé dans AppProvider");
  }
  return context;
}

export { activeDevices };
