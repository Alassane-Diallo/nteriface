import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Archive,
  ArrowLeft,
  BellOff,
  Check,
  CheckCheck,
  Ellipsis,
  FileText,
  Image as ImageIcon,
  Info,
  Mic,
  MicOff,
  MessageCircle,
  Paperclip,
  Phone,
  PhoneOff,
  Pin,
  Search,
  Send,
  ShieldCheck,
  Smile,
  SquarePen,
  Trash2,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import {
  Avatar,
  Button,
  Card,
  Chip,
  CountBadge,
  EmptyState,
  IconButton,
  InlineNotice,
  Menu,
  Modal,
  Photo,
  Switch,
  fieldClass,
} from "@/components/ui";
import { contacts, people } from "@/data";
import { cn, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";
import type { Conversation, Person } from "@/types";

type MessageFilter = "all" | "unread" | "groups";

const quickEmojis = ["😊", "🙏", "🔥", "❤️", "😂", "👍", "🎉", "☀️", "🌿", "💬", "✨", "🙌"];

function personById(id: string) {
  return people.find((person) => person.id === id);
}

function conversationPeer(conversation: Conversation) {
  return people.find(
    (person) =>
      conversation.kind === "direct" &&
      conversation.title.toLowerCase().includes(person.name.toLowerCase()),
  );
}

function lastMessagePreview(conversation: Conversation, meId: string) {
  const message = conversation.messages[conversation.messages.length - 1];
  if (!message) return "Démarrez la conversation";
  const prefix =
    message.senderId === meId
      ? "Vous : "
      : conversation.kind === "group"
        ? `${personById(message.senderId)?.name.split(" ")[0] ?? "Membre"} : `
        : "";
  return `${prefix}${message.text ?? (message.attachment ? `📎 ${message.attachment.label}` : "Message")}`;
}

function CallModal({
  call,
  onClose,
}: {
  call: { kind: "audio" | "video"; name: string; avatar?: string; tone?: Person["tone"] } | null;
  onClose: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!call) {
      setSeconds(0);
      setMuted(false);
      setCameraOff(false);
      setSpeaker(true);
      return;
    }
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [call]);

  if (!call) return null;

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Modal open={Boolean(call)} onClose={onClose} size="sm" title={call.kind === "audio" ? "Appel audio" : "Appel vidéo"} description="Appel de démonstration · aucune donnée n’est transmise.">
      <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#173d55,#0d2333)] px-5 pb-5 pt-8 text-center text-white">
        <span className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full border border-white/10" />
        <span className="relative inline-block">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/10" />
          <Avatar name={call.name} src={call.avatar} tone={call.tone} size="4xl" className="relative ring-4 ring-white/15" />
        </span>
        <h3 className="mt-3 font-display text-[18px] font-semibold tracking-[-0.03em]">{call.name}</h3>
        <p className="mt-1 text-[10px] text-white/65">{seconds < 2 ? "Sonnerie…" : `En communication · ${duration}`}</p>

        <div className="mt-6 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "Activer le micro" : "Couper le micro"}
            className={cn(
              "grid size-11 place-items-center rounded-full border border-white/20 backdrop-blur transition",
              muted ? "bg-white text-[#173d55]" : "bg-white/10 hover:bg-white/20",
            )}
          >
            {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setSpeaker((value) => !value)}
            aria-label={speaker ? "Couper le haut-parleur" : "Activer le haut-parleur"}
            className={cn(
              "grid size-11 place-items-center rounded-full border border-white/20 backdrop-blur transition",
              !speaker ? "bg-white text-[#173d55]" : "bg-white/10 hover:bg-white/20",
            )}
          >
            {speaker ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          {call.kind === "video" && (
            <button
              type="button"
              onClick={() => setCameraOff((value) => !value)}
              aria-label={cameraOff ? "Activer la caméra" : "Couper la caméra"}
              className={cn(
                "grid size-11 place-items-center rounded-full border border-white/20 backdrop-blur transition",
                cameraOff ? "bg-white text-[#173d55]" : "bg-white/10 hover:bg-white/20",
              )}
            >
              {cameraOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--color-mali-red)] px-5 text-[11.5px] font-semibold text-white shadow-float transition hover:brightness-110"
        >
          <PhoneOff className="size-4" />
          Terminer
        </button>
      </div>
    </Modal>
  );
}

function NewMessageModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (person: Person) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const term = searchNormalize(query);
    return contacts.filter(
      (person) =>
        !term ||
        searchNormalize(person.name).includes(term) ||
        searchNormalize(person.username).includes(term),
    );
  }, [query]);

  return (
    <Modal open={open} onClose={onClose} title="Nouveau message" description="Choisissez une personne pour démarrer une conversation." size="md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un contact…"
          aria-label="Rechercher un contact"
          className={cn(fieldClass, "pl-9")}
        />
      </div>
      <p className="mb-2 mt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Contacts récents</p>
      <div className="space-y-1">
        {results.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => onSelect(person)}
            className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-surface-muted"
          >
            <Avatar name={person.name} src={person.avatar} tone={person.tone} size="md" online={person.online} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold text-ink">{person.name}</span>
              <span className="mt-0.5 block truncate text-[9px] text-muted">@{person.username} · {person.work}</span>
            </span>
            <Send className="size-3.5 text-muted" />
          </button>
        ))}
        {results.length === 0 && (
          <p className="rounded-2xl bg-surface-muted px-3 py-5 text-center text-[10.5px] text-muted">
            Aucun contact ne correspond à cette recherche.
          </p>
        )}
      </div>
    </Modal>
  );
}

function ConversationInfoModal({
  open,
  onClose,
  conversation,
}: {
  open: boolean;
  onClose: () => void;
  conversation: Conversation;
}) {
  const { showToast, state } = useApp();
  const [muted, setMuted] = useState(conversation.muted ?? false);
  const peer = conversationPeer(conversation);

  return (
    <Modal open={open} onClose={onClose} title="Détails de la conversation" description="Informations et réglages de cette discussion." size="md">
      <div className="flex flex-col items-center text-center">
        <Avatar
          name={conversation.title}
          src={conversation.avatar ?? peer?.avatar}
          tone={conversation.tone ?? peer?.tone}
          size="3xl"
          online={conversation.online}
        />
        <h3 className="mt-2.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">{conversation.title}</h3>
        <p className="mt-0.5 text-[10px] text-muted">
          {conversation.kind === "group" ? `${conversation.members ?? 6} membres` : peer?.work ?? `@${peer?.username ?? "contact"}`}
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => showToast("Conversation masquée dans la démo.", "info")}>
            <BellOff className="size-3.5" />
            Masquer
          </Button>
          <Button size="sm" variant="secondary" onClick={() => showToast("Conversation archivée.", "info")}>
            <Archive className="size-3.5" />
            Archiver
          </Button>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-2">
        <Switch checked={muted} onChange={setMuted} label="Mettre en sourdine" description="Aucune notification ne sera affichée pour cette conversation." />
        <Switch checked={false} onChange={() => showToast("N’Teri AI ne résume pas encore les conversations de groupe.", "info")} label="Résumé N’Teri AI" description="Recevez un résumé des messages non lus." />
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Fichiers et liens</p>
        <div className="mt-2 space-y-2">
          {[
            { name: "Dossier_SahelTech_2026.pdf", meta: "PDF · 2,4 Mo" },
            { name: "Planning_production.xlsx", meta: "Feuille de calcul · 184 Ko" },
          ].map((file) => (
            <button
              key={file.name}
              type="button"
              onClick={() => showToast(`Ouverture de ${file.name} (simulation).`, "info")}
              className="flex w-full items-center gap-2.5 rounded-xl border border-line p-2 text-left transition hover:bg-surface-muted"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-tone-red text-tone-red-ink">
                <FileText className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold text-ink">{file.name}</span>
                <span className="text-[8.5px] text-muted">{file.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="flex items-center justify-center gap-1.5 text-[9px] text-muted">
          <ShieldCheck className="size-3.5 text-brand" />
          Conversation chiffrée de bout en bout · {state.me.name.split(" ")[0]}
        </p>
      </div>
    </Modal>
  );
}

export default function MessagesPage() {
  const { state, markConversationRead, sendMessage, startConversation, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialId = searchParams.get("conv") ?? undefined;
  const firstConversation = state.conversations[0]?.id;
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId ?? firstConversation);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(Boolean(initialId));
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [call, setCall] = useState<{ kind: "audio" | "video"; name: string; avatar?: string; tone?: Person["tone"] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = state.conversations.find((conversation) => conversation.id === selectedId);
  const peer = selected ? conversationPeer(selected) : undefined;

  useEffect(() => {
    if (initialId) {
      setSelectedId(initialId);
      setMobileThreadOpen(true);
    }
  }, [initialId]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (selectedId && (isDesktop || mobileThreadOpen)) markConversationRead(selectedId);
  }, [isDesktop, markConversationRead, mobileThreadOpen, selectedId]);

  const conversationFiltered = useMemo(() => {
    const term = searchNormalize(query);
    return state.conversations
      .filter((conversation) => {
        if (filter === "unread" && conversation.unread === 0) return false;
        if (filter === "groups" && conversation.kind !== "group") return false;
        if (!term) return true;
        return (
          searchNormalize(conversation.title).includes(term) ||
          conversation.messages.some((message) => searchNormalize(message.text ?? "").includes(term))
        );
      })
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [filter, query, state.conversations]);

  const displayedMessages = useMemo(() => {
    if (!selected) return [];
    const term = searchNormalize(messageQuery);
    if (!term) return selected.messages;
    return selected.messages.filter((message) => searchNormalize(message.text ?? "").includes(term));
  }, [messageQuery, selected]);

  const unreadTotal = state.conversations.reduce((total, conversation) => total + conversation.unread, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [selected?.messages.length, selected?.typing, selectedId]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setMobileThreadOpen(true);
    setSearchParams({ conv: id }, { replace: true });
    setMessageQuery("");
    setSearchOpen(false);
  };

  const goBack = () => {
    setMobileThreadOpen(false);
    setSearchParams({}, { replace: true });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !draft.trim()) return;
    sendMessage(selected.id, draft);
    setDraft("");
    setEmojiOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 20);
  };

  const startNew = (person: Person) => {
    const id = startConversation(person);
    setSelectedId(id);
    setMobileThreadOpen(true);
    setNewOpen(false);
    setSearchParams({ conv: id }, { replace: true });
  };

  const callPeer = (kind: "audio" | "video") => {
    if (!selected) return;
    setCall({
      kind,
      name: selected.title,
      avatar: selected.avatar ?? peer?.avatar,
      tone: selected.tone ?? peer?.tone,
    });
  };

  return (
    <div>
      <PageIntro
        eyebrow="Vos conversations"
        title="Messenger"
        description="Discutez avec vos proches, partagez des fichiers et passez des appels — même à travers le Sahel."
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[9px] font-semibold text-muted sm:inline-flex">
              <ShieldCheck className="size-3 text-brand" />
              Chiffré de bout en bout
            </span>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <SquarePen className="size-3.5" />
              Nouveau message
            </Button>
          </div>
        }
      />

      <Card className="flex h-[calc(100dvh-330px)] min-h-[320px] overflow-hidden sm:min-h-[420px] lg:h-[calc(100dvh-206px)] lg:max-h-[820px]">
        {/* Conversation list */}
        <aside
          className={cn(
            "w-full shrink-0 flex-col border-line bg-surface-muted/35 md:flex md:w-[238px] md:border-r",
            mobileThreadOpen ? "hidden" : "flex",
          )}
          aria-label="Liste des conversations"
        >
          <div className="border-b border-line px-3 pb-2.5 pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Discussions</h2>
                {unreadTotal > 0 && <CountBadge count={unreadTotal} />}
              </div>
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                aria-label="Nouveau message"
                className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-brand"
              >
                <SquarePen className="size-3.5" />
              </button>
            </div>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher…"
                aria-label="Rechercher une conversation"
                className="h-8 w-full rounded-full border border-line bg-surface pl-8 pr-3 text-[10.5px] text-ink outline-none transition placeholder:text-muted focus:border-brand"
              />
            </div>
            <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto">
              {[
                { id: "all" as const, label: "Tous" },
                { id: "unread" as const, label: "Non lus" },
                { id: "groups" as const, label: "Groupes" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold transition",
                    filter === item.id ? "bg-brand text-white" : "text-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto p-1.5">
            {conversationFiltered.length > 0 ? (
              conversationFiltered.map((conversation) => {
                const active = conversation.id === selectedId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition",
                      active ? "bg-surface shadow-sm" : "hover:bg-surface/80",
                    )}
                  >
                    <span className="relative shrink-0">
                      <Avatar
                        name={conversation.title}
                        src={conversation.avatar}
                        tone={conversation.tone}
                        size="md"
                        online={conversation.online}
                        shape={conversation.kind === "group" ? "group" : "circle"}
                      />
                      {conversation.kind === "group" && (
                        <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border border-surface bg-tone-indigo text-tone-indigo-ink">
                          <Users className="size-2" />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1">
                        <span className={cn("min-w-0 flex-1 truncate text-[10.5px]", conversation.unread > 0 ? "font-semibold text-ink" : "font-medium text-ink-soft")}>
                          {conversation.title}
                        </span>
                        <span className={cn("shrink-0 text-[8px]", conversation.unread > 0 ? "font-semibold text-brand" : "text-muted")}>
                          {conversation.lastTime}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1">
                        <span className={cn("min-w-0 flex-1 truncate text-[8.5px]", conversation.unread > 0 ? "text-ink-soft" : "text-muted")}>
                          {conversation.typing ? "en train d’écrire…" : lastMessagePreview(conversation, state.me.id)}
                        </span>
                        {conversation.pinned && <Pin className="size-2.5 shrink-0 text-muted" />}
                        {conversation.unread > 0 && <CountBadge count={conversation.unread} />}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <EmptyState
                icon={<MessageIcon />}
                title="Aucune conversation"
                description="Essayez un autre filtre ou démarrez une nouvelle discussion."
                className="py-10"
              />
            )}
          </div>

          <div className="border-t border-line px-3 py-2.5">
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-soft py-2 text-[9.5px] font-semibold text-brand-ink transition hover:bg-brand/15"
            >
              <SquarePen className="size-3" />
              Écrire à quelqu’un
            </button>
          </div>
        </aside>

        {/* Thread */}
        <section
          className={cn(
            "min-w-0 flex-1 flex-col md:flex",
            mobileThreadOpen ? "flex" : "hidden",
          )}
          aria-label="Conversation"
        >
          {selected ? (
            <>
              <header className="flex shrink-0 items-center gap-2 border-b border-line px-2.5 py-2.5 sm:px-4">
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="Retour aux conversations"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink md:hidden"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <Link
                  to={peer ? `/profil/${peer.username}` : "#"}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <Avatar
                    name={selected.title}
                    src={selected.avatar}
                    tone={selected.tone}
                    size="md"
                    online={selected.online}
                    shape={selected.kind === "group" ? "group" : "circle"}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-[11.5px] font-semibold text-ink">{selected.title}</span>
                      {selected.kind === "group" && (
                        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[7.5px] font-semibold text-muted">
                          {selected.members ?? 6} membres
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[8.5px] text-muted">
                      {selected.typing ? (
                        <span className="font-semibold text-brand">en train d’écrire…</span>
                      ) : selected.online ? (
                        <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-mali-green" />En ligne</span>
                      ) : (
                        "Actif·ve récemment"
                      )}
                    </span>
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton label="Appel audio" onClick={() => callPeer("audio")} className="size-9">
                    <Phone className="size-4" />
                  </IconButton>
                  <IconButton label="Appel vidéo" onClick={() => callPeer("video")} className="size-9">
                    <Video className="size-4" />
                  </IconButton>
                  <IconButton
                    label={searchOpen ? "Fermer la recherche" : "Rechercher dans la conversation"}
                    onClick={() => {
                      setSearchOpen((value) => !value);
                      setMessageQuery("");
                    }}
                    className="hidden size-9 sm:grid"
                    active={searchOpen}
                  >
                    <Search className="size-4" />
                  </IconButton>
                  <Menu
                    label="Options de la conversation"
                    trigger={
                      <span className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink">
                        <Ellipsis className="size-4" />
                      </span>
                    }
                    items={[
                      { label: "Détails de la conversation", onClick: () => setInfoOpen(true) },
                      { label: "Marquer comme non lue", onClick: () => showToast("Conversation marquée comme non lue.", "info") },
                      { label: "Épingler", onClick: () => showToast("Conversation épinglée en haut de la liste.", "info") },
                      { label: "Mettre en sourdine", onClick: () => showToast("Notifications de cette conversation coupées.", "info") },
                      { label: "", separator: true },
                      { label: "Supprimer la conversation", danger: true, onClick: () => showToast("La conversation est conservée dans cette démo.", "info") },
                    ]}
                  />
                </div>
              </header>

              {searchOpen && (
                <div className="border-b border-line bg-surface-muted/60 px-3 py-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
                    <input
                      value={messageQuery}
                      onChange={(event) => setMessageQuery(event.target.value)}
                      placeholder="Rechercher dans les messages…"
                      aria-label="Rechercher dans la conversation"
                      className="h-8 w-full rounded-full border border-line bg-surface pl-8 pr-8 text-[10px] outline-none focus:border-brand"
                    />
                    {messageQuery && (
                      <button type="button" onClick={() => setMessageQuery("")} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-muted">
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="chat-canvas scrollbar-slim min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5">
                <div className="mb-3 flex items-center justify-center">
                  <span className="rounded-full border border-line bg-surface/80 px-2.5 py-1 text-[8px] font-semibold text-muted backdrop-blur">
                    Aujourd’hui
                  </span>
                </div>

                {selected.kind === "group" && (
                  <div className="mx-auto mb-3 max-w-sm rounded-2xl border border-line bg-surface px-3 py-2 text-center shadow-sm">
                    <p className="flex items-center justify-center gap-1.5 text-[9px] font-semibold text-ink">
                      <Users className="size-3 text-brand" />
                      {selected.title}
                    </p>
                    <p className="mt-0.5 text-[8px] text-muted">
                      Groupe de travail · {selected.members ?? 6} membres · créé par Aminata
                    </p>
                  </div>
                )}

                {displayedMessages.length > 0 ? (
                  displayedMessages.map((message, index) => {
                    const mine = message.senderId === state.me.id;
                    const sender = personById(message.senderId);
                    const previous = displayedMessages[index - 1];
                    const showAvatar = !mine && (!previous || previous.senderId !== message.senderId);
                    return (
                      <div
                        key={message.id}
                        className={cn("mb-1.5 flex items-end gap-1.5", mine ? "justify-end" : "justify-start")}
                      >
                        {!mine && (
                          <span className={cn("mb-0.5 w-6 shrink-0", !showAvatar && "opacity-0")}>
                            {showAvatar && (
                              <Avatar
                                name={sender?.name ?? selected.title}
                                src={sender?.avatar}
                                tone={sender?.tone ?? selected.tone}
                                size="xs"
                              />
                            )}
                          </span>
                        )}
                        <div className={cn("max-w-[82%] sm:max-w-[72%]", mine && "text-right")}>
                          {!mine && selected.kind === "group" && showAvatar && (
                            <p className="mb-0.5 ml-1 text-[7.5px] font-semibold text-muted">{sender?.name ?? "Membre"}</p>
                          )}
                          <div
                            className={cn(
                              "inline-block whitespace-pre-line px-3 py-2 text-left text-[11px] leading-relaxed shadow-sm",
                              mine
                                ? "button-brand rounded-[16px] rounded-br-[5px]"
                                : "rounded-[16px] rounded-bl-[5px] border border-line bg-surface text-ink",
                            )}
                          >
                            {message.text ?? (
                              <span className="inline-flex items-center gap-1.5 text-[10px]">
                                <Paperclip className="size-3" />
                                {message.attachment?.label ?? "Pièce jointe"}
                              </span>
                            )}
                          </div>
                          <div className={cn("mt-0.5 flex items-center gap-1 px-1", mine ? "justify-end" : "justify-start")}>
                            <span className="text-[7px] text-muted">{message.time}</span>
                            {message.reactions && <span className="text-[8px]">{message.reactions}</span>}
                            {mine && (
                              <span className="text-[8px] text-brand">
                                {message.state === "read" ? <CheckCheck className="size-3" /> : <Check className="size-2.5" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                    <span className="grid size-12 place-items-center rounded-[18px] bg-surface-muted text-muted">
                      <MessageIcon />
                    </span>
                    <p className="mt-3 text-[11px] font-semibold text-ink">
                      {messageQuery ? "Aucun message trouvé" : "Dites bonjour 👋"}
                    </p>
                    <p className="mt-1 max-w-[220px] text-[9px] text-muted">
                      {messageQuery
                        ? "Essayez un autre mot-clé pour retrouver ce message."
                        : "C’est le début de votre conversation avec " + selected.title + "."}
                    </p>
                  </div>
                )}

                {selected.typing && (
                  <div className="mb-1 flex items-end gap-1.5">
                    <Avatar name={selected.title} src={selected.avatar} tone={selected.tone} size="xs" />
                    <div className="rounded-[16px] rounded-bl-[5px] border border-line bg-surface px-3 py-2.5 shadow-sm">
                      <span className="typing-dots flex items-center gap-1" aria-label="En train d’écrire">
                        <span /><span /><span />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="relative shrink-0 border-t border-line bg-surface px-2.5 py-2 sm:px-3">
                {emojiOpen && (
                  <div className="pop-in absolute bottom-[calc(100%+6px)] left-3 z-20 grid w-[236px] grid-cols-6 gap-1 rounded-2xl border border-line bg-surface p-2 shadow-pop">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setDraft((value) => `${value}${emoji}`);
                          inputRef.current?.focus();
                        }}
                        className="grid size-8 place-items-center rounded-lg text-[16px] transition hover:bg-surface-muted"
                        aria-label={`Insérer ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={submit} className="flex items-end gap-1">
                  <div className="flex shrink-0 items-center">
                    <IconButton
                      label="Ajouter une photo"
                      className="size-8"
                      onClick={() => showToast("Sélecteur de photos simulé — votre image n’est pas envoyée.", "info")}
                    >
                      <ImageIcon className="size-4" />
                    </IconButton>
                    <IconButton
                      label="Joindre un fichier"
                      className="hidden size-8 sm:grid"
                      onClick={() => showToast("Sélecteur de fichiers simulé.", "info")}
                    >
                      <Paperclip className="size-4" />
                    </IconButton>
                    <IconButton
                      label="Choisir un emoji"
                      className="size-8"
                      active={emojiOpen}
                      onClick={() => setEmojiOpen((value) => !value)}
                    >
                      <Smile className="size-4" />
                    </IconButton>
                  </div>
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Écrire à ${selected.title.split(" ")[0]}…`}
                    aria-label="Votre message"
                    maxLength={1200}
                    className="h-9 min-w-0 flex-1 rounded-full border border-line bg-surface-muted px-3.5 text-[11px] text-ink outline-none transition placeholder:text-muted focus:border-brand focus:bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => showToast("Message vocal simulé — maintenez pour enregistrer.", "info")}
                    aria-label="Enregistrer un message vocal"
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
                  >
                    <Mic className="size-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Envoyer le message"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white shadow-sm transition hover:brightness-110 disabled:opacity-35"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
                <p className="mt-1 px-1 text-center text-[7px] text-muted">
                  Entrée pour envoyer · démonstration locale
                </p>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<MessageIcon />}
              title="Vos messages, au même endroit"
              description="Choisissez une conversation à gauche ou démarrez une nouvelle discussion."
              action={<Button onClick={() => setNewOpen(true)}>Nouveau message</Button>}
              className="h-full"
            />
          )}
        </section>
      </Card>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="inline-flex items-center gap-1.5 text-[8.5px] text-muted">
          <ShieldCheck className="size-3 text-brand" />
          Vos messages restent sur cet appareil. Aucune donnée n’est envoyée.
        </p>
        <Chip onClick={() => navigate("/parametres?tab=confidentialite")}>
          <Info className="size-3" />
          Confidentialité des messages
        </Chip>
      </div>

      <NewMessageModal open={newOpen} onClose={() => setNewOpen(false)} onSelect={startNew} />
      {selected && <ConversationInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} conversation={selected} />}
      <CallModal call={call} onClose={() => setCall(null)} />

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <Card className="flex items-center gap-3 p-3">
          <span className="grid size-9 place-items-center rounded-xl bg-tone-green text-tone-green-ink">
            <Users className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold text-ink">Groupes de discussion</p>
            <p className="mt-0.5 text-[8.5px] text-muted">Créez un espace pour votre équipe ou votre famille.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => showToast("Création de groupe bientôt disponible dans la démo.", "info")}>
            Créer
          </Button>
        </Card>
        <Card className="flex items-center gap-3 p-3">
          <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
            <Archive className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold text-ink">Messages archivés</p>
            <p className="mt-0.5 text-[8.5px] text-muted">Retrouvez les conversations mises de côté.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => showToast("Aucune conversation archivée pour le moment.", "info")}>
            Voir
          </Button>
        </Card>
      </div>
    </div>
  );
}

function MessageIcon() {
  return <MessageCircle className="size-6" />;
}
