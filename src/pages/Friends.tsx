import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowUpRight,
  Briefcase,
  Cake,
  Check,
  Copy,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
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
  SegmentedTabs,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { people, suggestedFriends } from "@/data";
import { cn, formatCount, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";
import type { Person } from "@/types";

type FriendTab = "requests" | "friends" | "suggestions" | "birthdays";

const covers = [
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
];

function PersonCard({
  person,
  mutual,
  action,
  secondary,
  compact,
}: {
  person: Person;
  mutual?: number;
  action: ReactNode;
  secondary?: ReactNode;
  compact?: boolean;
}) {
  return (
    <Card hover className="group overflow-hidden">
      <Link to={`/profil/${person.username}`} className="block">
        <div className="relative h-[76px] overflow-hidden">
          <img
            src={person.cover ?? covers[person.id.length % covers.length]}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          {person.professional && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-1.5 py-0.5 text-[7.5px] font-semibold text-white backdrop-blur">
              <Sparkles className="size-2.5 text-[color:var(--color-mali-yellow)]" />
              Créateur
            </span>
          )}
        </div>
        <div className="relative px-3 pb-2.5">
          <span className="-mt-6 mb-1.5 inline-block rounded-full border-4 border-surface bg-surface">
            <Avatar
              name={person.name}
              src={person.avatar}
              tone={person.tone}
              size={compact ? "lg" : "xl"}
              online={person.online}
            />
          </span>
          <p className="flex items-center gap-1 truncate text-[12px] font-semibold text-ink">
            {person.name}
            {person.verified && <VerifiedBadge className="size-3.5" />}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[9px] text-muted">
            {person.work ?? person.bio ?? `@${person.username}`}
          </p>
          {mutual !== undefined && (
            <p className="mt-1 flex items-center gap-1 text-[8.5px] font-medium text-muted">
              <Users className="size-2.5" />
              {mutual} amis en commun
            </p>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-1.5 border-t border-line px-3 py-2.5">
        <div className="min-w-0 flex-1">{action}</div>
        {secondary}
      </div>
    </Card>
  );
}

function BirthdaysPanel() {
  const { showToast } = useApp();
  const today = [people[5], people[9], people[12]];
  const week = [people[7], people[10], people[13], people[8]];

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <ArtCover art="sahel" className="p-4 text-white" label="Aujourd’hui">
          <div className="relative mt-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Anniversaires</p>
              <h2 className="mt-1 font-display text-[21px] font-semibold tracking-[-0.04em]">
                3 ami·es soufflent leurs bougies
              </h2>
              <p className="mt-1 text-[10px] text-white/70">
                Un petit mot fait toujours plaisir. Envoyez un message ou une Story.
              </p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Cake className="size-5" />
            </span>
          </div>
        </ArtCover>
        <div className="divide-y divide-line">
          {today.map((person) => (
            <div key={person.id} className="flex items-center gap-3 p-3">
              <Link to={`/profil/${person.username}`}>
                <Avatar name={person.name} src={person.avatar} tone={person.tone} size="lg" online={person.online} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/profil/${person.username}`} className="flex items-center gap-1 text-[11.5px] font-semibold text-ink hover:underline">
                  {person.name}
                  {person.verified && <VerifiedBadge className="size-3" />}
                </Link>
                <p className="mt-0.5 text-[9px] text-muted">Aujourd’hui · {person.location ?? "Bamako, Mali"}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => showToast(`Message d’anniversaire envoyé à ${person.name.split(" ")[0]} 🎉`)}
              >
                <Cake className="size-3.5" />
                Souhaiter
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Cette semaine</p>
        <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Ne manquez aucune célébration
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {week.map((person, index) => (
            <div key={person.id} className="flex items-center gap-2 rounded-2xl border border-line bg-surface-muted p-2">
              <Avatar name={person.name} src={person.avatar} tone={person.tone} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[9.5px] font-semibold text-ink">{person.name}</p>
                <p className="text-[8px] text-muted">
                  {["Demain", "Vendredi 26", "Samedi 27", "Dimanche 28"][index]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast(`Rappel activé pour l’anniversaire de ${person.name.split(" ")[0]}.`, "info")}
                aria-label={`Activer le rappel pour ${person.name}`}
                className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-brand"
              >
                <Heart className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function FriendsPage() {
  const {
    state,
    friendCount,
    acceptFriend,
    declineFriend,
    addFriend,
    removeFriend,
    startConversation,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<FriendTab>("requests");
  const [query, setQuery] = useState("");

  const requests = state.requests
    .map((request) => ({
      ...request,
      person: people.find((person) => person.id === request.personId),
    }))
    .filter((request): request is typeof request & { person: Person } => Boolean(request.person));

  const friends = useMemo(() => {
    const list = state.friendIds
      .map((id) => people.find((person) => person.id === id))
      .filter((person): person is Person => Boolean(person))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const term = searchNormalize(query);
    if (!term) return list;
    return list.filter(
      (person) =>
        searchNormalize(person.name).includes(term) ||
        searchNormalize(person.username).includes(term) ||
        searchNormalize(person.work ?? "").includes(term),
    );
  }, [query, state.friendIds]);

  const suggestions = useMemo(() => {
    const existing = new Set(state.friendIds);
    const list = suggestedFriends.filter((person) => !existing.has(person.id));
    const term = searchNormalize(query);
    if (!term) return list;
    return list.filter((person) => searchNormalize(person.name).includes(term));
  }, [query, state.friendIds]);

  const openChat = (person: Person) => {
    const id = startConversation(person);
    navigate(`/messages?conv=${id}`);
  };

  const copyInvite = async () => {
    const message = `Rejoins-moi sur N’Teriface, le réseau social malien. Mon profil : @${state.me.username}`;
    try {
      await navigator.clipboard.writeText(message);
      showToast("Lien d’invitation copié dans le presse-papiers.");
    } catch {
      showToast("Invitation prête : partagez @awa.traore autour de vous.", "info");
    }
  };

  return (
    <div>
      <PageIntro
        eyebrow="Votre cercle"
        title="Amis"
        description="Gérez vos demandes, retrouvez vos proches et découvrez des personnes qui partagent vos passions au Mali."
        action={
          <Link
            to="/recherche?q=personnes"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink-soft shadow-card transition hover:border-line-strong hover:text-ink"
          >
            <Search className="size-3.5" />
            Trouver des ami·es
          </Link>
        }
      />

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Ami·es", value: formatCount(friendCount), icon: Users, tone: "bg-tone-green text-tone-green-ink" },
          { label: "Demandes", value: requests.length, icon: UserPlus, tone: "bg-tone-yellow text-tone-yellow-ink" },
          { label: "Anniversaires", value: 3, icon: Cake, tone: "bg-tone-red text-tone-red-ink" },
        ].map((item) => (
          <Card key={item.label} className="flex items-center gap-2.5 p-3">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", item.tone)}>
              <item.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[19px] font-semibold leading-none tracking-[-0.04em] text-ink">{item.value}</p>
              <p className="mt-1 truncate text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SegmentedTabs
          items={[
            { id: "requests", label: "Demandes", count: requests.length },
            { id: "friends", label: "Mes ami·es", count: friendCount },
            { id: "suggestions", label: "Suggestions" },
            { id: "birthdays", label: "Anniversaires" },
          ]}
          value={tab}
          onChange={(value) => {
            setTab(value);
            setQuery("");
          }}
          ariaLabel="Sections de la page Amis"
          className="min-w-0 flex-1"
        />
      </div>

      {(tab === "friends" || tab === "suggestions") && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tab === "friends" ? "Rechercher parmi vos ami·es…" : "Rechercher une personne…"}
            aria-label="Rechercher une personne"
            className={cn(fieldClass, "h-10 pl-9")}
          />
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10.5px] text-muted">
                  <strong className="font-semibold text-ink">{requests.length} demandes</strong> en attente de votre réponse
                </p>
                <button
                  type="button"
                  onClick={() => {
                    requests.forEach((request) => acceptFriend(request.personId));
                    showToast("Toutes les demandes ont été acceptées.");
                  }}
                  className="text-[10px] font-semibold text-brand hover:underline"
                >
                  Tout accepter
                </button>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {requests.map(({ person, mutual, time }) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    mutual={mutual}
                    action={
                      <div className="flex gap-1.5">
                        <Button size="sm" className="flex-1 px-2" onClick={() => acceptFriend(person.id)}>
                          <Check className="size-3.5" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="px-2"
                          aria-label={`Refuser la demande de ${person.name}`}
                          onClick={() => declineFriend(person.id)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    }
                    secondary={
                      <span className="shrink-0 text-[8px] text-muted" title={time}>
                        {time}
                      </span>
                    }
                  />
                ))}
              </div>
              <InlineNotice tone="info">
                Astuce : les demandes acceptées apparaissent immédiatement dans votre fil et dans Messenger.
              </InlineNotice>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={<UserCheck className="size-6" />}
                title="Aucune demande en attente"
                description="Vous êtes à jour. Découvrez des suggestions de personnes qui pourraient vous plaire."
                action={<Button onClick={() => setTab("suggestions")}>Voir les suggestions</Button>}
              />
            </Card>
          )}
        </div>
      )}

      {tab === "friends" && (
        <div className="space-y-3">
          {friends.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] text-muted">
                  {friends.length} ami·es · triés par ordre alphabétique
                </p>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-brand">
                  <UserCheck className="size-3" />
                  À jour
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {friends.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    compact
                    action={
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full px-2"
                        onClick={() => openChat(person)}
                      >
                        <MessageCircle className="size-3.5" />
                        Message
                      </Button>
                    }
                    secondary={
                      <Menu
                        label={`Options pour ${person.name}`}
                        trigger={
                          <span className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink">
                            <span className="text-[16px] leading-none">···</span>
                          </span>
                        }
                        items={[
                          { label: "Voir le profil", onClick: () => navigate(`/profil/${person.username}`) },
                          { label: "Ajouter à une liste", onClick: () => showToast("Contact ajouté à « Proches ».", "info") },
                          { label: "Retirer de mes ami·es", danger: true, onClick: () => removeFriend(person.id) },
                        ]}
                      />
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={<Search className="size-6" />}
                title="Aucun résultat"
                description={`Aucun·e ami·e ne correspond à « ${query} ». Essayez un autre nom.`}
                action={<Button variant="secondary" onClick={() => setQuery("")}>Effacer la recherche</Button>}
              />
            </Card>
          )}
        </div>
      )}

      {tab === "suggestions" && (
        <div className="space-y-3">
          <Card className="flex flex-wrap items-center gap-3 p-3.5">
            <span className="grid size-9 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-ink">Suggestions pour vous</p>
              <p className="mt-0.5 text-[9px] text-muted">
                Des personnes de votre ville, de vos groupes ou de vos pages préférées.
              </p>
            </div>
            <Chip active onClick={() => showToast("Filtres de suggestions actualisés.", "info")}>
              <MapPin className="size-3" />
              Bamako
            </Chip>
          </Card>
          {suggestions.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {suggestions.map((person) => {
                const isFriend = state.friendIds.includes(person.id);
                return (
                  <PersonCard
                    key={person.id}
                    person={person}
                    mutual={person.mutual ?? 8}
                    action={
                      <Button
                        size="sm"
                        variant={isFriend ? "secondary" : "primary"}
                        className="w-full px-2"
                        onClick={() => (isFriend ? removeFriend(person.id) : addFriend(person.id))}
                      >
                        {isFriend ? <UserCheck className="size-3.5" /> : <UserPlus className="size-3.5" />}
                        {isFriend ? "Ami·e" : "Ajouter"}
                      </Button>
                    }
                    secondary={
                      <button
                        type="button"
                        onClick={() => showToast("Suggestion masquée pour cette session.", "info")}
                        aria-label={`Masquer la suggestion de ${person.name}`}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
                      >
                        <X className="size-3.5" />
                      </button>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Sparkles className="size-6" />}
                title="Plus de suggestions pour le moment"
                description="Nous vous proposerons de nouvelles personnes dès que votre cercle s’agrandira."
                action={<Button onClick={() => navigate("/recherche")}>Explorer N’Teriface</Button>}
              />
            </Card>
          )}
        </div>
      )}

      {tab === "birthdays" && <BirthdaysPanel />}

      <Card className="mt-3 overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-[1.4fr_0.6fr]">
          <div className="p-4">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand">
              <Link2 className="size-3" />
              Inviter vos proches
            </p>
            <h2 className="mt-1.5 font-display text-[18px] font-semibold tracking-[-0.035em] text-ink">
              Un réseau, c’est fait pour être partagé.
            </h2>
            <p className="mt-1 max-w-md text-[10.5px] leading-relaxed text-muted">
              Envoyez votre lien personnel à vos ami·es. Vous apparaîtrez directement dans leurs suggestions.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg border border-line bg-surface-muted px-2.5 py-1.5 text-[10px] font-semibold text-ink-soft">
                nteriface.ml/@{state.me.username}
              </code>
              <Button size="sm" onClick={copyInvite}>
                <Copy className="size-3.5" />
                Copier
              </Button>
            </div>
          </div>
          <div className="sahel-art relative hidden min-h-[160px] items-center justify-center sm:flex">
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative text-center text-white">
              <Users className="mx-auto size-7" />
              <p className="mt-2 font-display text-[24px] font-semibold leading-none">{formatCount(284)}</p>
              <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-white/70">invitations envoyées</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1">
          <DemoTag />
          Données fictives · Bamako, Mali
        </span>
        <Link to="/parametres?tab=confidentialite" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
          Gérer la visibilité de ma liste d’ami·es
          <ArrowUpRight className="size-2.5" />
        </Link>
      </div>
    </div>
  );
}
