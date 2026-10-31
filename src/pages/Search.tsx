import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Clapperboard,
  Compass,
  Flag,
  Hash,
  MapPin,
  Play,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingUp,
  UserPlus,
  UserCheck,
  Users,
  UsersRound,
  X,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import {
  ArtCover,
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Photo,
  SegmentedTabs,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { people, suggestedFriends, trends, videos as seedVideos } from "@/data";
import { cn, formatCount, formatPrice, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";
import type { Person } from "@/types";

type Scope = "all" | "people" | "posts" | "groups" | "pages" | "events" | "marketplace" | "videos" | "reels";

const scopeLabels: Record<Exclude<Scope, "all">, string> = {
  people: "Personnes",
  posts: "Publications",
  groups: "Groupes",
  pages: "Pages",
  events: "Événements",
  marketplace: "Marketplace",
  videos: "Vidéos",
  reels: "Reels",
};

const STORAGE_KEY = "nteriface:searches:v1";

const discoveryTopics = [
  { label: "Cuisine malienne", query: "cuisine", icon: "🍲", tone: "bg-tone-clay text-tone-clay-ink" },
  { label: "Musique du Sahel", query: "musique", icon: "🎶", tone: "bg-tone-indigo text-tone-indigo-ink" },
  { label: "Tech & startup", query: "Sahel Tech", icon: "💡", tone: "bg-tone-green text-tone-green-ink" },
  { label: "Aigles du Mali", query: "Aigles", icon: "⚽", tone: "bg-tone-red text-tone-red-ink" },
  { label: "Artisanat", query: "bogolan", icon: "🧵", tone: "bg-tone-yellow text-tone-yellow-ink" },
  { label: "Voyager au Mali", query: "Mali Tourisme", icon: "🏛️", tone: "bg-tone-river text-tone-river-ink" },
];

function SectionLink({ scope, onScope }: { scope: Exclude<Scope, "all">; onScope: (scope: Scope) => void }) {
  return (
    <button type="button" onClick={() => onScope(scope)} className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
      Tout voir <ChevronRight className="size-2.5" />
    </button>
  );
}

export default function SearchPage() {
  const { state, addFriend, removeFriend, showToast, startConversation } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryParam);
  const [scope, setScope] = useState<Scope>("all");
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string").slice(0, 6);
      }
    } catch {
      // ignore local storage failure
    }
    return ["bogolan", "Bamako", "Aigles du Mali", "cuisine malienne"];
  });

  useEffect(() => {
    setQuery(queryParam);
    setScope("all");
  }, [queryParam]);

  const term = searchNormalize(queryParam);

  const matches = (value: string | undefined) => Boolean(value && searchNormalize(value).includes(term));

  const peopleResults = useMemo(() => {
    if (!term) return [];
    return people
      .filter(
        (person) =>
          matches(person.name) ||
          matches(person.username) ||
          matches(person.bio) ||
          matches(person.work) ||
          matches(person.location) ||
          matches(person.hometown),
      )
      .sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))
      .slice(0, 24);
  }, [term]);

  const postResults = useMemo(() => {
    if (!term) return [];
    return state.posts.filter(
      (post) =>
        matches(post.text) ||
        matches(post.author.name) ||
        matches(post.author.handle) ||
        matches(post.feeling) ||
        matches(post.location),
    );
  }, [state.posts, term]);

  const groupResults = useMemo(() => {
    if (!term) return [];
    return state.groups.filter(
      (group) => matches(group.name) || matches(group.description) || matches(group.category) || matches(group.handle),
    );
  }, [state.groups, term]);

  const pageResults = useMemo(() => {
    if (!term) return [];
    return state.pages.filter(
      (page) => matches(page.name) || matches(page.category) || matches(page.description) || matches(page.handle),
    );
  }, [state.pages, term]);

  const eventResults = useMemo(() => {
    if (!term) return [];
    return state.events.filter(
      (event) => matches(event.title) || matches(event.description) || matches(event.location) || matches(event.category),
    );
  }, [state.events, term]);

  const listingResults = useMemo(() => {
    if (!term) return [];
    return state.listings.filter(
      (listing) =>
        matches(listing.title) || matches(listing.description) || matches(listing.category) || matches(listing.location),
    );
  }, [state.listings, term]);

  const videoResults = useMemo(() => {
    if (!term) return [];
    return seedVideos.filter(
      (video) =>
        matches(video.title) ||
        matches(video.channel.name) ||
        matches(video.category) ||
        matches(video.description ?? ""),
    );
  }, [term]);

  const reelResults = useMemo(() => {
    if (!term) return [];
    return state.reels.filter(
      (reel) => matches(reel.caption) || matches(reel.author.name) || reel.tags.some((tag) => matches(tag)) || matches(reel.audio),
    );
  }, [state.reels, term]);

  const counts: Record<Exclude<Scope, "all">, number> = {
    people: peopleResults.length,
    posts: postResults.length,
    groups: groupResults.length,
    pages: pageResults.length,
    events: eventResults.length,
    marketplace: listingResults.length,
    videos: videoResults.length,
    reels: reelResults.length,
  };

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const tabs = [
    { id: "all" as const, label: "Tout", count: total },
    ...(Object.keys(scopeLabels) as Array<Exclude<Scope, "all">>).map((id) => ({
      id,
      label: scopeLabels[id],
      count: counts[id],
    })),
  ];

  const persistRecent = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setRecent((current) => {
      const next = [clean, ...current.filter((item) => searchNormalize(item) !== searchNormalize(clean))].slice(0, 6);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const runSearch = (value: string) => {
    const clean = value.trim();
    setQuery(value);
    setScope("all");
    setSearchParams(clean ? { q: clean } : {}, { replace: true });
    persistRecent(clean);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    runSearch(query);
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast("Historique de recherche effacé.", "info");
  };

  const openChat = (person: Person) => {
    const id = startConversation(person);
    navigate(`/messages?conv=${id}`);
  };

  const hasResults = total > 0;
  const showAll = scope === "all";

  return (
    <div>
      <PageIntro
        eyebrow="Explorer N’Teriface"
        title="Recherche"
        description="Personnes, publications, groupes, événements ou bonnes affaires : trouvez ce qui compte pour vous, au Mali et au-delà."
      />

      <form onSubmit={submit} className="mb-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher sur N’Teriface…"
            aria-label="Rechercher sur N’Teriface"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-24 text-[12.5px] text-ink shadow-card outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchParams({}, { replace: true });
                }}
                aria-label="Effacer la recherche"
                className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
            <Button size="sm" type="submit" className="h-8 px-3.5">Rechercher</Button>
          </div>
        </div>
      </form>

      {!term ? (
        <div className="space-y-3">
          <ArtCover art="sahel" className="overflow-hidden rounded-[24px] p-5 text-white" label="Bamako · Mali">
            <div className="relative mt-8 grid gap-4 sm:grid-cols-[1.3fr_0.7fr] sm:items-end">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">Tout commence ici</p>
                <h2 className="mt-1.5 max-w-sm font-display text-[23px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[27px]">
                  Le Mali qui crée, qui cuisine et qui rêve.
                </h2>
                <p className="mt-2 max-w-sm text-[10px] leading-relaxed text-white/75">
                  Explorez les talents, les lieux et les conversations qui font vibrer le Sahel.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-center">
                {[
                  { value: "1,2 M", label: "membres" },
                  { value: "6,4 k", label: "groupes" },
                  { value: "24 k", label: "pages" },
                  { value: "38 k", label: "événements" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/15 bg-black/10 px-2 py-1.5 backdrop-blur-sm">
                    <p className="font-display text-[14px] font-semibold leading-none">{stat.value}</p>
                    <p className="mt-0.5 text-[7px] uppercase tracking-[0.14em] text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ArtCover>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Explorer par envie</p>
                <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">Des idées pour commencer</h2>
              </div>
              <Compass className="size-4 text-muted" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {discoveryTopics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => runSearch(topic.query)}
                  className="group flex items-center gap-2 rounded-2xl border border-line bg-surface-muted/60 p-2.5 text-left transition hover:border-line-strong hover:bg-surface"
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl text-[15px]", topic.tone)}>{topic.icon}</span>
                  <span className="min-w-0 flex-1 text-[9.5px] font-semibold leading-tight text-ink">{topic.label}</span>
                  <ArrowUpRight className="size-3 shrink-0 text-muted transition group-hover:text-brand" />
                </button>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">
                  <TrendingUp className="size-4 text-brand" />
                  Tendances au Mali
                </h2>
                <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-brand-ink">Aujourd’hui</span>
              </div>
              <div className="mt-2 divide-y divide-line">
                {trends.slice(0, 5).map((trend, index) => (
                  <button
                    key={trend.tag}
                    type="button"
                    onClick={() => runSearch(trend.tag.replace("#", ""))}
                    className="group flex w-full items-center gap-2.5 py-2 text-left"
                  >
                    <span className="w-3 shrink-0 font-display text-[12px] font-semibold text-line-strong">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-[10.5px] font-semibold text-ink group-hover:text-brand">
                        <Hash className="size-3 text-brand" />
                        {trend.tag.replace("#", "")}
                        {trend.delta && <span className="ml-auto text-[7.5px] font-bold text-brand">{trend.delta}</span>}
                      </span>
                      <span className="mt-0.5 block text-[8px] text-muted">{trend.posts} · {trend.category}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Recherches récentes</h2>
                {recent.length > 0 && (
                  <button type="button" onClick={clearRecent} className="text-[8.5px] font-semibold text-muted hover:text-danger">Effacer</button>
                )}
              </div>
              {recent.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {recent.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => runSearch(value)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1.5 text-[9px] font-medium text-ink-soft transition hover:border-line-strong hover:bg-surface hover:text-ink"
                    >
                      <SearchIcon className="size-2.5 text-muted" />
                      {value}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[9.5px] text-muted">Votre historique apparaîtra ici.</p>
              )}
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Suggestions</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chip onClick={() => runSearch("bogolan")}>Bogolan</Chip>
                  <Chip onClick={() => runSearch("Sahel Tech")}>Sahel Tech</Chip>
                  <Chip onClick={() => runSearch("Baobab Café")}>Baobab Café</Chip>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Votre réseau s’agrandit</p>
                <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">Personnes à découvrir</h2>
              </div>
              <Link to="/amis" className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
                Tout voir <ChevronRight className="size-2.5" />
              </Link>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {suggestedFriends.slice(0, 4).map((person) => {
                const isFriend = state.friendIds.includes(person.id);
                return (
                  <div key={person.id} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface-muted/40 p-2.5">
                    <Link to={`/profil/${person.username}`}>
                      <Avatar name={person.name} src={person.avatar} tone={person.tone} size="lg" online={person.online} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/profil/${person.username}`} className="flex items-center gap-1 truncate text-[10.5px] font-semibold text-ink hover:underline">
                        {person.name}
                        {person.verified && <VerifiedBadge className="size-3" />}
                      </Link>
                      <p className="mt-0.5 truncate text-[8px] text-muted">{person.mutual ?? 10} ami·es en commun</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (isFriend ? removeFriend(person.id) : addFriend(person.id))}
                      aria-label={isFriend ? `Retirer ${person.name}` : `Ajouter ${person.name}`}
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full transition",
                        isFriend ? "bg-brand-soft text-brand-ink" : "bg-brand text-white hover:brightness-110",
                      )}
                    >
                      {isFriend ? <UserCheck className="size-3.5" /> : <UserPlus className="size-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10.5px] text-muted">
              {hasResults ? (
                <>
                  <strong className="font-semibold text-ink">{formatCount(total)} résultats</strong> pour « {queryParam} »
                </>
              ) : (
                <>Aucun résultat pour « {queryParam} »</>
              )}
            </p>
            <div className="flex items-center gap-1.5">
              <Chip active onClick={() => showToast("Filtres de recherche : tout le Mali · tous les contenus.", "info")}>
                <SlidersHorizontal className="size-3" />
                Filtres
              </Chip>
              <span className="text-[8px] text-muted">Tri : pertinence</span>
            </div>
          </div>

          <SegmentedTabs
            items={tabs}
            value={scope}
            onChange={setScope}
            ariaLabel="Filtrer les résultats par type"
            size="sm"
            className="mb-3"
          />

          {!hasResults ? (
            <Card>
              <EmptyState
                icon={<SearchIcon className="size-6" />}
                title="Cette recherche ne donne rien"
                description="Vérifiez l’orthographe, essayez des mots-clés plus courts ou explorez les tendances du moment."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" onClick={() => runSearch("Bamako")}>Rechercher « Bamako »</Button>
                    <Button onClick={() => { setQuery(""); setSearchParams({}, { replace: true }); }}>Explorer</Button>
                  </div>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {(showAll || scope === "people") && peopleResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <Users className="size-3 text-brand" />
                      Personnes · {peopleResults.length}
                    </h2>
                    {showAll && <SectionLink scope="people" onScope={setScope} />}
                  </div>
                  <Card className="divide-y divide-line overflow-hidden">
                    {peopleResults.slice(0, showAll ? 4 : 24).map((person) => {
                      const isFriend = state.friendIds.includes(person.id);
                      return (
                        <div key={person.id} className="flex items-center gap-3 p-3">
                          <Link to={`/profil/${person.username}`} className="shrink-0">
                            <Avatar name={person.name} src={person.avatar} tone={person.tone} size="lg" online={person.online} />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link to={`/profil/${person.username}`} className="flex items-center gap-1 truncate text-[11.5px] font-semibold text-ink hover:underline">
                              {person.name}
                              {person.verified && <VerifiedBadge className="size-3.5" />}
                            </Link>
                            <p className="mt-0.5 truncate text-[9px] text-muted">
                              @{person.username} · {person.work ?? person.bio}
                            </p>
                            <p className="mt-0.5 flex items-center gap-2 text-[8px] text-muted">
                              <span className="inline-flex items-center gap-1"><MapPin className="size-2.5" />{person.location ?? "Bamako, Mali"}</span>
                              <span>{formatCount(person.followers)} abonnés</span>
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <div className="flex gap-1">
                              {isFriend ? (
                                <Button size="sm" variant="secondary" onClick={() => removeFriend(person.id)}>
                                  <UserCheck className="size-3.5" />
                                  Ami·e
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => addFriend(person.id)}>
                                  <UserPlus className="size-3.5" />
                                  Ajouter
                                </Button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => openChat(person)}
                              aria-label={`Envoyer un message à ${person.name}`}
                              className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:bg-surface-muted hover:text-ink"
                            >
                              <MessageIcon />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </section>
              )}

              {(showAll || scope === "posts") && postResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <Hash className="size-3 text-brand" />
                      Publications · {postResults.length}
                    </h2>
                    {showAll && <SectionLink scope="posts" onScope={setScope} />}
                  </div>
                  <div className="space-y-3">
                    {postResults.slice(0, showAll ? 2 : postResults.length).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {(showAll || scope === "groups") && groupResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <UsersRound className="size-3 text-brand" />
                      Groupes · {groupResults.length}
                    </h2>
                    {showAll && <SectionLink scope="groups" onScope={setScope} />}
                  </div>
                  <Card className="divide-y divide-line overflow-hidden">
                    {groupResults.slice(0, showAll ? 3 : 20).map((group) => (
                      <Link key={group.id} to={`/groupes/${group.id}`} className="flex items-center gap-3 p-3 transition hover:bg-surface-muted/50">
                        <Photo src={group.cover} alt={group.name} className="size-12 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-ink">{group.name}</p>
                          <p className="mt-0.5 text-[8.5px] text-muted">{formatCount(group.members)} membres · {group.privacy} · {group.postsToday} publications aujourd’hui</p>
                          <p className="mt-0.5 line-clamp-1 text-[8.5px] text-ink-soft">{group.description}</p>
                        </div>
                        <span className={cn("shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold", group.joined ? "bg-brand-soft text-brand-ink" : "bg-surface-muted text-muted")}>
                          {group.joined ? "Membre" : group.privacy}
                        </span>
                      </Link>
                    ))}
                  </Card>
                </section>
              )}

              {(showAll || scope === "pages") && pageResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <Flag className="size-3 text-brand" />
                      Pages · {pageResults.length}
                    </h2>
                    {showAll && <SectionLink scope="pages" onScope={setScope} />}
                  </div>
                  <Card className="divide-y divide-line overflow-hidden">
                    {pageResults.slice(0, showAll ? 3 : 20).map((page) => (
                      <Link key={page.id} to={`/pages/${page.id}`} className="flex items-center gap-3 p-3 transition hover:bg-surface-muted/50">
                        <Avatar name={page.name} src={page.cover} tone={page.tone} size="lg" shape="squircle" />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-ink">
                            {page.name}
                            {page.verified && <VerifiedBadge className="size-3" />}
                          </p>
                          <p className="mt-0.5 text-[8.5px] text-muted">{page.category} · {formatCount(page.followers)} abonnés</p>
                          <p className="mt-0.5 line-clamp-1 text-[8.5px] text-ink-soft">{page.description}</p>
                        </div>
                        <span className="shrink-0 text-[8px] font-semibold text-brand">Voir la page</span>
                      </Link>
                    ))}
                  </Card>
                </section>
              )}

              {(showAll || scope === "events") && eventResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <CalendarDays className="size-3 text-brand" />
                      Événements · {eventResults.length}
                    </h2>
                    {showAll && <SectionLink scope="events" onScope={setScope} />}
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {eventResults.slice(0, showAll ? 2 : eventResults.length).map((event) => (
                      <Link key={event.id} to={`/evenements/${event.id}`}>
                        <Card hover className="overflow-hidden">
                          <div className="relative aspect-[16/7]">
                            <Photo src={event.cover} alt={event.title} className="size-full" />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em] text-ink">{event.date}</span>
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-1 text-[10.5px] font-semibold text-ink">{event.title}</p>
                            <p className="mt-1 flex items-center gap-1 text-[8px] text-muted"><MapPin className="size-2.5" />{event.location}</p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(showAll || scope === "marketplace") && listingResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <Store className="size-3 text-brand" />
                      Marketplace · {listingResults.length}
                    </h2>
                    {showAll && <SectionLink scope="marketplace" onScope={setScope} />}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {listingResults.slice(0, showAll ? 3 : listingResults.length).map((listing) => (
                      <Link key={listing.id} to={`/marketplace/${listing.id}`}>
                        <Card hover className="overflow-hidden">
                          <Photo src={listing.image} alt={listing.title} className="aspect-[4/3]" />
                          <div className="p-2.5">
                            <p className="font-display text-[13px] font-semibold tracking-[-0.02em] text-ink">{formatPrice(listing.price)}</p>
                            <p className="mt-0.5 line-clamp-1 text-[9.5px] text-ink-soft">{listing.title}</p>
                            <p className="mt-1 flex items-center gap-1 text-[7.5px] text-muted"><MapPin className="size-2.5" />{listing.location}</p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(showAll || scope === "videos") && videoResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <Clapperboard className="size-3 text-brand" />
                      Vidéos · {videoResults.length}
                    </h2>
                    {showAll && <SectionLink scope="videos" onScope={setScope} />}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {videoResults.slice(0, showAll ? 3 : videoResults.length).map((video) => (
                      <Link key={video.id} to="/videos">
                        <Card hover className="group overflow-hidden">
                          <div className="relative aspect-video">
                            <Photo src={video.poster} alt={video.title} className="size-full" imgClassName="transition group-hover:scale-105" />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1 py-0.5 text-[7px] font-semibold text-white">{video.duration}</span>
                            <span className="absolute left-1/2 top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur"><Play className="ml-0.5 size-3.5" fill="currentColor" /></span>
                          </div>
                          <div className="p-2">
                            <p className="line-clamp-2 text-[9px] font-semibold leading-snug text-ink">{video.title}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <Avatar name={video.channel.name} src={video.channel.avatar} tone={video.channel.tone} size="xs" className="size-4" />
                              <span className="truncate text-[7.5px] text-muted">{video.channel.name} · {video.views}</span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(showAll || scope === "reels") && reelResults.length > 0 && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <Play className="size-3 text-brand" />
                      Reels · {reelResults.length}
                    </h2>
                    {showAll && <SectionLink scope="reels" onScope={setScope} />}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {reelResults.slice(0, showAll ? 3 : reelResults.length).map((reel) => (
                      <Link key={reel.id} to="/reels">
                        <Card hover className="group overflow-hidden">
                          <div className="relative aspect-[9/12]">
                            <Photo src={reel.poster} alt={reel.caption} className="size-full" imgClassName="transition group-hover:scale-105" />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/35 text-white backdrop-blur"><Play className="size-3" fill="currentColor" /></span>
                            <span className="absolute inset-x-2 bottom-2 line-clamp-2 text-[9px] font-medium text-white">{reel.caption}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1.5">
                            <Avatar name={reel.author.name} src={reel.author.avatar} tone={reel.author.tone} size="xs" className="size-4" />
                            <span className="truncate text-[8px] text-muted">{reel.author.name.split(" ")[0]} · {reel.views} vues</span>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <Card className="flex flex-wrap items-center justify-between gap-2 p-3">
                <p className="text-[9px] text-muted">
                  Vous ne trouvez pas ce que vous cherchez ? Essayez une recherche plus large ou explorez le fil.
                </p>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setQuery("Bamako")}>Bamako</Button>
                  <Link to="/" className="inline-flex h-9 items-center gap-1 rounded-full bg-brand-soft px-3 text-[10px] font-semibold text-brand-ink">
                    <Bookmark className="size-3" />
                    Mon fil
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MessageIcon() {
  return <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3.1A2.5 2.5 0 0 1 3 11.5v-6Z" strokeLinejoin="round" /></svg>;
}
