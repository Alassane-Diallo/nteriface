import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  Flag,
  Globe,
  Lock,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import {
  ArtCover,
  Avatar,
  Button,
  Card,
  Chip,
  DemoTag,
  EmptyState,
  InlineNotice,
  Menu,
  Modal,
  Switch,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { cn, formatCount } from "@/lib/utils";
import { useApp } from "@/store";
import type { Group } from "@/types";

const groupCategories = ["Tout", "Business", "Cuisine", "Sport", "Technologie", "Art", "Famille", "Musique"] as const;

function PrivacyIcon({ privacy }: { privacy: Group["privacy"] }) {
  if (privacy === "privé") return <Lock className="size-2.5" />;
  if (privacy === "caché") return <EyeOffIcon />;
  return <Globe className="size-2.5" />;
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.9 10.9 0 0112 5c5.5 0 9 5.5 9 7a12 12 0 01-2.1 2.9M6.6 6.7C4 8.2 3 10.6 3 12c0 1.5 3.5 7 9 7 1.3 0 2.5-.3 3.6-.8" />
    </svg>
  );
}

function GroupCard({ group }: { group: Group }) {
  const { toggleGroupJoin } = useApp();

  return (
    <article className="group overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <Link to={`/groupes/${group.id}`} className="block">
        <ArtCover art={group.cover as "sahel" | "indigo" | "green" | "clay" | "river"} className="relative h-[92px]" label={group.category}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1 text-[8.5px] font-semibold text-white/80">
            <PrivacyIcon privacy={group.privacy} />
            Groupe {group.privacy} · {formatCount(group.members)} membres
          </span>
        </ArtCover>
      </Link>
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-surface-muted text-brand">
            <UsersRound className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <Link
              to={`/groupes/${group.id}`}
              className="line-clamp-1 text-[11.5px] font-semibold text-ink transition hover:text-brand"
            >
              {group.name}
            </Link>
            <p className="mt-0.5 line-clamp-1 text-[8.5px] text-muted">
              {group.postsToday} publications aujourd’hui
            </p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 min-h-[28px] text-[9.5px] leading-relaxed text-muted">
          {group.description}
        </p>
        <button
          type="button"
          onClick={() => toggleGroupJoin(group.id)}
          className={cn(
            "mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-full text-[10px] font-semibold transition",
            group.joined
              ? "border border-line bg-surface text-ink-soft hover:bg-surface-muted"
              : "button-brand hover:brightness-105",
          )}
        >
          {group.joined ? (
            <>
              <Check className="size-3" />
              Membre
            </>
          ) : (
            <>
              <Plus className="size-3" />
              Rejoindre
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createGroup } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<Group["privacy"]>("public");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setPrivacy("public");
      setError(null);
    }
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError("Choisissez un nom de groupe d’au moins 3 caractères.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Décrivez votre groupe en quelques mots.");
      return;
    }
    createGroup({ name: name.trim(), description: description.trim(), privacy });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Créer un groupe"
      description="Un espace pour rassembler votre communauté autour d’un sujet."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="create-group-form">
            <UsersRound className="size-3.5" />
            Créer le groupe
          </Button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div>
          <label htmlFor="group-name" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Nom du groupe</label>
          <input
            id="group-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Créateurs de Bamako"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="group-description" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Description</label>
          <textarea
            id="group-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="À quoi sert ce groupe ? Qui peut le rejoindre ?"
            className={cn(fieldClass, "h-auto resize-none py-2.5")}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-ink-soft">Confidentialité</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "public" as const, label: "Public", hint: "Tout le monde peut voir et rejoindre", icon: Globe },
              { id: "privé" as const, label: "Privé", hint: "Visible sur demande uniquement", icon: Lock },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPrivacy(item.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  privacy === item.id ? "border-brand bg-brand-soft/60" : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
                  <item.icon className="size-3.5 text-brand" />
                  {item.label}
                  {privacy === item.id && <Check className="ml-auto size-3 text-brand" />}
                </span>
                <span className="mt-1 block text-[8.5px] leading-relaxed text-muted">{item.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <InlineNotice tone="info">
          Vous serez propriétaire du groupe. Les règles et invitations se gèrent ensuite depuis l’onglet Administration.
        </InlineNotice>
      </form>
    </Modal>
  );
}

export default function GroupsPage() {
  const { state } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof groupCategories)[number]>("Tout");
  const [scope, setScope] = useState<"discover" | "mine">("discover");
  const [createOpen, setCreateOpen] = useState(searchParams.get("new") === "1");

  useEffect(() => {
    if (searchParams.get("new") === "1") setCreateOpen(true);
  }, [searchParams]);

  const closeCreate = () => {
    setCreateOpen(false);
    if (searchParams.has("new")) {
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  };

  const groups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.groups.filter((group) => {
      const matchesScope = scope === "discover" || group.joined;
      const matchesCategory =
        category === "Tout" ||
        group.category.toLowerCase().includes(category.toLowerCase());
      const matchesQuery =
        !normalized ||
        group.name.toLowerCase().includes(normalized) ||
        group.description.toLowerCase().includes(normalized);
      return matchesScope && matchesCategory && matchesQuery;
    });
  }, [category, query, scope, state.groups]);

  const joined = state.groups.filter((group) => group.joined);
  const suggestions = state.groups.filter((group) => !group.joined).slice(0, 2);

  return (
    <div>
      <PageIntro
        eyebrow="Communautés"
        title="Groupes"
        description="Des espaces pour apprendre, s’entraider et faire vivre les passions du Mali."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Créer un groupe
          </Button>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <div className="relative bg-[linear-gradient(115deg,#efe9da_0%,#f7f0df_55%,#e6f3ea_100%)] px-4 py-4">
          <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full border border-brand/15" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Vos communautés</p>
              <h2 className="mt-1 font-display text-[19px] font-semibold tracking-[-0.035em] text-ink">
                {joined.length} groupes rejoins · {formatCount(joined.reduce((total, group) => total + group.members, 0))} membres
              </h2>
              <p className="mt-1 text-[10px] text-muted">
                {joined.reduce((total, group) => total + group.postsToday, 0)} publications aujourd’hui dans vos groupes.
              </p>
            </div>
            <div className="flex -space-x-2">
              {joined.slice(0, 4).map((group) => (
                <Avatar key={group.id} name={group.name} tone={group.tone} size="md" shape="group" ring />
              ))}
              {joined.length > 4 && (
                <span className="grid size-10 place-items-center rounded-[14px] bg-surface text-[10px] font-semibold text-muted ring-2 ring-surface">
                  +{joined.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un groupe…"
            aria-label="Rechercher un groupe"
            className={cn(fieldClass, "h-10 pl-9 text-[11px]")}
          />
        </div>
        <div className="flex gap-1.5">
          <Chip active={scope === "discover"} onClick={() => setScope("discover")}>Découvrir</Chip>
          <Chip active={scope === "mine"} onClick={() => setScope("mine")}>Mes groupes</Chip>
        </div>
      </div>

      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
        {groupCategories.map((item) => (
          <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
        ))}
      </div>

      {suggestions.length > 0 && scope === "discover" && (
        <Card className="mb-3 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand">Suggestions pour vous</p>
            <Sparkles className="size-3.5 text-[color:var(--color-gold)]" />
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {suggestions.map((group) => (
              <Link
                key={group.id}
                to={`/groupes/${group.id}`}
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface-muted/50 p-2 transition hover:border-line-strong"
              >
                <Avatar name={group.name} tone={group.tone} shape="group" size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10.5px] font-semibold text-ink">{group.name}</span>
                  <span className="mt-0.5 block text-[8.5px] text-muted">{formatCount(group.members)} membres</span>
                </span>
                <ChevronRight className="size-3 text-muted" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {groups.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {groups.map((group) => <GroupCard key={group.id} group={group} />)}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<UsersRound className="size-6" />}
            title="Aucun groupe trouvé"
            description="Essayez une autre catégorie ou créez votre propre communauté."
            action={<Button onClick={() => setCreateOpen(true)}>Créer un groupe</Button>}
          />
        </Card>
      )}

      <CreateGroupModal open={createOpen} onClose={closeCreate} />
    </div>
  );
}

type GroupTab = "discussion" | "members" | "about" | "admin";

export function GroupDetail() {
  const { groupId } = useParams();
  const { state, toggleGroupJoin, approveGroupMember, declineGroupMember, openComposer, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<GroupTab>("discussion");
  const [postApproval, setPostApproval] = useState(true);
  const [wordFilter, setWordFilter] = useState(false);

  const group = state.groups.find((item) => item.id === groupId);

  if (!group) {
    return (
      <Card>
        <EmptyState
          icon={<UsersRound className="size-6" />}
          title="Groupe introuvable"
          description="Ce groupe n’existe pas dans la démonstration ou a été retiré."
          action={<Button onClick={() => navigate("/groupes")}>Tous les groupes</Button>}
        />
      </Card>
    );
  }

  const posts = state.posts.filter((post) => post.groupId === group.id);
  const canManage = group.role === "Administrateur" || group.role === "Propriétaire" || group.role === "Modérateur";
  const members = state.friendIds
    .map((id) => state.me.id === id ? state.me : undefined)
    .filter(Boolean);

  const tabs: { id: GroupTab; label: string; count?: number; show?: boolean }[] = [
    { id: "discussion", label: "Discussion" },
    { id: "members", label: "Membres", count: group.members },
    { id: "about", label: "À propos" },
    { id: "admin", label: "Administration", show: canManage },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link to="/groupes" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" />
          Tous les groupes
        </Link>
        <DemoTag />
      </div>

      <Card className="overflow-hidden">
        <ArtCover art={group.cover as "sahel" | "indigo" | "green" | "clay" | "river"} className="h-[180px] sm:h-[220px]" overlay>
          <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[8.5px] font-semibold text-white backdrop-blur">
            <PrivacyIcon privacy={group.privacy} />
            Groupe {group.privacy}
          </span>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3">
              <span className="grid size-16 place-items-center rounded-[20px] border-4 border-surface bg-brand text-white shadow-float sm:size-20">
                <UsersRound className="size-7" />
              </span>
              <div className="pb-1">
                <h1 className="font-display text-[20px] font-semibold leading-tight tracking-[-0.04em] text-white drop-shadow sm:text-[24px]">
                  {group.name}
                </h1>
                <p className="mt-0.5 text-[9.5px] font-medium text-white/75">
                  {group.category} · {formatCount(group.members)} membres
                </p>
              </div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button
                size="sm"
                variant={group.joined ? "secondary" : "primary"}
                onClick={() => toggleGroupJoin(group.id)}
              >
                {group.joined ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                {group.joined ? "Membre" : "Rejoindre"}
              </Button>
              <Button
                size="sm"
                variant="gold"
                onClick={() => showToast("Invitation envoyée à 3 amis (simulation).")}
              >
                <UserPlus className="size-3.5" />
                Inviter
              </Button>
            </div>
          </div>
        </ArtCover>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 sm:px-4">
          <div className="no-scrollbar flex overflow-x-auto">
            {tabs.filter((item) => item.show !== false).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative inline-flex h-11 items-center gap-1.5 whitespace-nowrap px-3 text-[10.5px] font-semibold transition",
                  tab === item.id ? "text-brand" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {item.count !== undefined && <span className="text-[8.5px] text-muted">{formatCount(item.count)}</span>}
                {tab === item.id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => showToast("Notifications du groupe activées.", "success")}
              aria-label="Notifications du groupe"
              className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <Bell className="size-3.5" />
            </button>
            <Menu
              label="Options du groupe"
              trigger={<span className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"><Ellipsis className="size-3.5" /></span>}
              items={[
                { label: "Partager le groupe", onClick: () => showToast("Lien du groupe copié.") },
                { label: "Ajouter aux raccourcis", onClick: () => showToast("Groupe ajouté à vos raccourcis.") },
                { label: "Signaler le groupe", danger: true, onClick: () => showToast("Signalement transmis à l’administration.", "info") },
              ]}
            />
          </div>
        </div>

        <div className="flex gap-2 border-b border-line p-3 sm:hidden">
          <Button size="sm" className="flex-1" onClick={() => toggleGroupJoin(group.id)}>
            {group.joined ? "Quitter" : "Rejoindre"}
          </Button>
          <Button size="sm" variant="gold" onClick={() => showToast("Invitation envoyée (simulation).")}>
            <UserPlus className="size-3.5" />
            Inviter
          </Button>
        </div>
      </Card>

      <div className="mt-3">
        {tab === "discussion" && (
          <div className="space-y-3.5">
            {group.joined ? (
              <Card className="p-3">
                <button
                  type="button"
                  onClick={() => openComposer("post", `group-${group.id}`)}
                  className="flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface-muted px-3 py-2.5 text-left transition hover:border-line-strong"
                >
                  <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="md" />
                  <span className="text-[11px] text-muted">Écrire quelque chose dans {group.name}…</span>
                </button>
                <div className="mt-2 flex gap-1 overflow-x-auto">
                  {["Photo", "Sondage", "Question", "Événement"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => openComposer("post", `group-${group.id}`)}
                      className="rounded-full px-2.5 py-1.5 text-[9.5px] font-semibold text-muted transition hover:bg-surface-muted hover:text-ink"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </Card>
            ) : (
              <InlineNotice tone="info">
                Rejoignez le groupe pour publier et commenter. Les publications restent visibles en lecture seule.
              </InlineNotice>
            )}

            {canManage && group.pending.length > 0 && (
              <Card className="p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-ink">Demandes d’adhésion · {group.pending.length}</p>
                  <button type="button" onClick={() => setTab("admin")} className="text-[9.5px] font-semibold text-brand hover:underline">
                    Gérer
                  </button>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {group.pending.map((person) => (
                    <div key={person.id} className="flex w-[170px] shrink-0 items-center gap-2 rounded-xl border border-line p-2">
                      <Avatar name={person.name} src={person.avatar} tone={person.tone} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-[9.5px] font-semibold text-ink">{person.name}</span>
                      <button
                        type="button"
                        onClick={() => approveGroupMember(group.id, person.id)}
                        aria-label={`Approuver ${person.name}`}
                        className="grid size-6 place-items-center rounded-full bg-brand-soft text-brand"
                      >
                        <Check className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <Card>
                <EmptyState
                  icon={<MessageCircle className="size-6" />}
                  title="Lancez la première discussion"
                  description="Partagez une question, une photo ou une annonce avec les membres du groupe."
                  action={
                    group.joined ? (
                      <Button onClick={() => openComposer("post", `group-${group.id}`)}>
                        <Plus className="size-4" />
                        Publier
                      </Button>
                    ) : (
                      <Button onClick={() => toggleGroupJoin(group.id)}>Rejoindre le groupe</Button>
                    )
                  }
                />
              </Card>
            )}

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">Règles du groupe</h2>
                <ShieldCheck className="size-4 text-brand" />
              </div>
              <ol className="mt-2 space-y-1.5">
                {group.rules.map((rule, index) => (
                  <li key={rule} className="flex gap-2 text-[10px] leading-relaxed text-muted">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-brand-soft text-[8px] font-bold text-brand">
                      {index + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}

        {tab === "members" && (
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">
                  Membres · {formatCount(group.members)}
                </h2>
                <Button size="sm" variant="secondary" onClick={() => showToast("Invitation envoyée (simulation).")}>
                  <UserPlus className="size-3.5" />
                  Inviter
                </Button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {members.length > 0 ? members.map((person) => (
                  <Link
                    key={person!.id}
                    to={`/profil/${person!.username}`}
                    className="flex items-center gap-2.5 rounded-2xl border border-line p-2.5 transition hover:border-line-strong hover:bg-surface-muted"
                  >
                    <Avatar name={person!.name} src={person!.avatar} tone={person!.tone} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 truncate text-[10.5px] font-semibold text-ink">
                        {person!.name}
                        {person!.verified && <VerifiedBadge className="size-2.5" />}
                      </span>
                      <span className="mt-0.5 block text-[8.5px] text-muted">{person!.work ?? "Membre du groupe"}</span>
                    </span>
                  </Link>
                )) : (
                  <p className="text-[10px] text-muted">La liste détaillée des membres est simulée.</p>
                )}
                {["Aminata Cissé", "Moussa Diarra", "Fatoumata Keïta", "Oumar Diallo", "Kadidia Sangaré"].map((name, index) => (
                  <div key={name} className="flex items-center gap-2.5 rounded-2xl border border-line p-2.5">
                    <Avatar name={name} tone={(["green", "river", "yellow", "indigo", "clay"] as const)[index]} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10.5px] font-semibold text-ink">{name}</p>
                      <p className="mt-0.5 text-[8.5px] text-muted">{index === 0 ? "Modératrice" : "Membre"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "about" && (
          <div className="space-y-3">
            <Card className="p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">À propos du groupe</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{group.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
                {[
                  ["Catégorie", group.category],
                  ["Confidentialité", group.privacy],
                  ["Membres", formatCount(group.members)],
                  ["Publications aujourd’hui", String(group.postsToday)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
                    <p className="mt-0.5 text-[10.5px] font-medium capitalize text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">Règles</h2>
              <ol className="mt-2 space-y-1.5">
                {group.rules.map((rule, index) => (
                  <li key={rule} className="flex gap-2 text-[10px] leading-relaxed text-muted">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-brand-soft text-[8px] font-bold text-brand">{index + 1}</span>
                    {rule}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}

        {tab === "admin" && canManage && (
          <div className="space-y-3">
            <Card className="p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">Administration</h2>
              <p className="mt-1 text-[10px] text-muted">Votre rôle : {group.role}. Toutes les actions sont locales à la démo.</p>
              <div className="mt-2 divide-y divide-line">
                <Switch
                  checked={postApproval}
                  onChange={setPostApproval}
                  label="Approbation des publications"
                  description="Les publications des membres doivent être validées par un modérateur."
                />
                <Switch
                  checked={wordFilter}
                  onChange={setWordFilter}
                  label="Filtre de mots-clés"
                  description="Masquer automatiquement les contenus signalés comme sensibles."
                />
              </div>
              <Button size="sm" className="mt-3" onClick={() => showToast("Paramètres d’administration enregistrés.")}>
                Enregistrer les réglages
              </Button>
            </Card>

            <Card className="p-4">
              <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
                Demandes d’adhésion · {group.pending.length}
              </h2>
              <div className="mt-3 space-y-2">
                {group.pending.length > 0 ? group.pending.map((person) => (
                  <div key={person.id} className="flex items-center gap-2.5 rounded-2xl border border-line p-2.5">
                    <Avatar name={person.name} src={person.avatar} tone={person.tone} size="md" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/profil/${person.username}`} className="truncate text-[10.5px] font-semibold text-ink hover:underline">
                        {person.name}
                      </Link>
                      <p className="mt-0.5 text-[8.5px] text-muted">{person.mutual ?? 0} amis en commun</p>
                    </div>
                    <Button size="sm" className="h-8 px-3 text-[9.5px]" onClick={() => approveGroupMember(group.id, person.id)}>
                      Approuver
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 px-3 text-[9.5px]" onClick={() => declineGroupMember(group.id, person.id)}>
                      Refuser
                    </Button>
                  </div>
                )) : (
                  <p className="text-[10px] text-muted">Aucune demande en attente. Tout est à jour.</p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">Journal du groupe</h2>
              <div className="mt-2 space-y-2">
                {[
                  [`Awa Traoré a approuvé ${group.pending[0]?.name ?? "un membre"}`, "Il y a 12 min"],
                  ["Règles du groupe mises à jour", "Hier, 18:04"],
                  ["3 publications masquées par le filtre automatique", "Hier, 09:22"],
                ].map(([label, time]) => (
                  <div key={label} className="flex items-start gap-2 text-[9.5px] text-muted">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="flex-1">{label}</span>
                    <span className="shrink-0 text-[8.5px]">{time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
