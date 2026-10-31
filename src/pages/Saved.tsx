import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clapperboard,
  FolderPlus,
  Image as ImageIcon,
  LayoutGrid,
  MapPin,
  Play,
  Plus,
  Search,
  Sparkles,
  Store,
  Trash2,
  Users,
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
  DemoTag,
  EmptyState,
  InlineNotice,
  Modal,
  Photo,
  SegmentedTabs,
  fieldClass,
} from "@/components/ui";
import { savedCollections } from "@/data";
import { cn, formatCount, formatPrice, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";
import type { AvatarTone, SavedCollection } from "@/types";

type SavedTab = "all" | "posts" | "marketplace" | "reels" | "events";

const toneOptions: AvatarTone[] = ["green", "yellow", "clay", "indigo", "river", "red"];

const toneLabels: Record<AvatarTone, string> = {
  green: "Forêt",
  yellow: "Soleil",
  red: "Terracotta",
  clay: "Argile",
  river: "Fleuve",
  indigo: "Indigo",
};

function CollectionModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (collection: SavedCollection) => void;
}) {
  const { showToast } = useApp();
  const [name, setName] = useState("");
  const [tone, setTone] = useState<AvatarTone>("green");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Donnez un nom d’au moins 2 caractères à votre collection.");
      return;
    }
    onCreate({
      id: `collection-${Date.now()}`,
      name: name.trim(),
      count: 0,
      tone,
    });
    setName("");
    setTone("green");
    setError(null);
    onClose();
    showToast("Collection créée. Ajoutez-y vos prochaines trouvailles.");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle collection"
      description="Regroupez vos enregistrements par envie, projet ou inspiration."
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="collection-form">Créer la collection</Button>
        </>
      }
    >
      <form id="collection-form" onSubmit={submit} className="space-y-4">
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Nom de la collection</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Intérieur & bogolan"
            maxLength={40}
            className={fieldClass}
            autoFocus
          />
        </label>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Couleur</span>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTone(option)}
                aria-label={`Couleur ${toneLabels[option]}`}
                aria-pressed={tone === option}
                className={cn(
                  "grid size-9 place-items-center rounded-full border-2 transition",
                  tone === option ? "border-ink" : "border-transparent",
                  option === "green" && "bg-tone-green text-tone-green-ink",
                  option === "yellow" && "bg-tone-yellow text-tone-yellow-ink",
                  option === "red" && "bg-tone-red text-tone-red-ink",
                  option === "clay" && "bg-tone-clay text-tone-clay-ink",
                  option === "river" && "bg-tone-river text-tone-river-ink",
                  option === "indigo" && "bg-tone-indigo text-tone-indigo-ink",
                )}
              >
                {tone === option && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </div>
        <InlineNotice tone="info">
          Les collections sont privées par défaut. Vous pourrez les partager plus tard depuis les paramètres.
        </InlineNotice>
      </form>
    </Modal>
  );
}

export default function SavedPage() {
  const { state, toggleSavePost, toggleListingSaved, toggleReelSave, toggleSavedEvent, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SavedTab>("all");
  const [query, setQuery] = useState("");
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collections, setCollections] = useState<SavedCollection[]>(savedCollections);

  const savedPosts = state.posts.filter((post) => post.saved);
  const savedListings = state.listings.filter((listing) => listing.saved);
  const savedReels = state.reels.filter((reel) => reel.saved);
  const savedEvents = state.events.filter((event) => state.savedEventIds.includes(event.id));
  const total = savedPosts.length + savedListings.length + savedReels.length + savedEvents.length;

  const term = searchNormalize(query);

  const filteredPosts = useMemo(
    () =>
      savedPosts.filter(
        (post) =>
          !term ||
          searchNormalize(post.text ?? "").includes(term) ||
          searchNormalize(post.author.name).includes(term),
      ),
    [savedPosts, term],
  );
  const filteredListings = useMemo(
    () =>
      savedListings.filter(
        (listing) =>
          !term ||
          searchNormalize(listing.title).includes(term) ||
          searchNormalize(listing.category).includes(term) ||
          searchNormalize(listing.location).includes(term),
      ),
    [savedListings, term],
  );
  const filteredReels = useMemo(
    () =>
      savedReels.filter(
        (reel) => !term || searchNormalize(reel.caption).includes(term) || searchNormalize(reel.author.name).includes(term),
      ),
    [savedReels, term],
  );

  const resetSearch = () => setQuery("");

  const tabs = [
    { id: "all" as const, label: "Tout", count: total },
    { id: "posts" as const, label: "Publications", count: savedPosts.length },
    { id: "marketplace" as const, label: "Marketplace", count: savedListings.length },
    { id: "reels" as const, label: "Reels", count: savedReels.length },
    { id: "events" as const, label: "Événements", count: savedEvents.length },
  ];

  const showPosts = tab === "all" || tab === "posts";
  const showListings = tab === "all" || tab === "marketplace";
  const showReels = tab === "all" || tab === "reels";
  const showEvents = tab === "all" || tab === "events";

  const collectionTarget = (collection: SavedCollection): SavedTab => {
    if (collection.id === "produits") return "marketplace";
    if (collection.id === "formation") return "reels";
    if (collection.id === "voyages") return "events";
    return "posts";
  };

  const openCollection = (collection: SavedCollection) => {
    setTab(collectionTarget(collection));
    showToast(`Collection « ${collection.name} » ouverte.`, "info");
  };

  const hasAnyResult =
    filteredPosts.length > 0 || filteredListings.length > 0 || filteredReels.length > 0 || savedEvents.length > 0;

  return (
    <div>
      <PageIntro
        eyebrow="Votre bibliothèque"
        title="Enregistrements"
        description="Retrouvez les publications, annonces, Reels et événements que vous avez gardés pour plus tard."
        action={
          <Button size="sm" onClick={() => setCollectionOpen(true)}>
            <FolderPlus className="size-3.5" />
            Nouvelle collection
          </Button>
        }
      />

      <Card className="mb-3 overflow-hidden">
        <div className="grid sm:grid-cols-[1.35fr_0.65fr]">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-tone-green text-tone-green-ink">
                <BookmarkCheck className="size-4" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold text-ink">Tout ce que vous gardez, au même endroit</p>
                <p className="text-[9px] text-muted">Privé par défaut · visible uniquement par vous</p>
              </div>
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold leading-none tracking-[-0.05em] text-ink">
              {formatCount(total)}
              <span className="ml-1.5 font-sans text-[10px] font-medium tracking-normal text-muted">éléments sauvegardés</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip onClick={() => setTab("posts")}>
                <Bookmark className="size-3" />
                {savedPosts.length} publications
              </Chip>
              <Chip onClick={() => setTab("marketplace")}>
                <Store className="size-3" />
                {savedListings.length} annonces
              </Chip>
              <Chip onClick={() => setTab("reels")}>
                <Play className="size-3" />
                {savedReels.length} Reels
              </Chip>
            </div>
          </div>
          <ArtCover art="indigo" className="relative hidden items-center justify-center p-4 text-white sm:flex">
            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-[18px] border border-white/20 bg-white/10 backdrop-blur">
                <BookmarkCheck className="size-5" />
              </span>
              <p className="mt-2 font-display text-[13px] font-semibold">À lire plus tard</p>
              <p className="mt-1 text-[8.5px] text-white/60">Votre temps, votre rythme.</p>
            </div>
          </ArtCover>
        </div>
      </Card>

      <div className="no-scrollbar mb-2 flex overflow-x-auto">
        <SegmentedTabs items={tabs} value={tab} onChange={setTab} ariaLabel="Filtrer les enregistrements" className="min-w-0 flex-1" />
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher dans vos enregistrements…"
          aria-label="Rechercher dans les enregistrements"
          className={cn(fieldClass, "pl-9")}
        />
        {query && (
          <button type="button" onClick={resetSearch} aria-label="Effacer la recherche" className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-muted">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {!hasAnyResult && (
        <Card>
          <EmptyState
            icon={<Search className="size-6" />}
            title={query ? "Aucun enregistrement trouvé" : "Votre bibliothèque est vide"}
            description={
              query
                ? `Rien ne correspond à « ${query} » dans cette section. Essayez un autre mot-clé.`
                : "Enregistrez une publication, une annonce ou un Reel pour la retrouver ici, hors du brouhaha du fil."
            }
            action={
              query ? (
                <Button variant="secondary" onClick={resetSearch}>Effacer la recherche</Button>
              ) : (
                <Button onClick={() => navigate("/")}>Explorer mon fil</Button>
              )
            }
          />
        </Card>
      )}

      <div className="space-y-3">
        {showPosts && filteredPosts.length > 0 && (
          <section>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                <Bookmark className="size-3 text-brand" />
                Publications
              </h2>
              {tab === "all" && (
                <button type="button" onClick={() => setTab("posts")} className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
                  Tout voir <ChevronRight className="size-2.5" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </section>
        )}

        {showListings && filteredListings.length > 0 && (
          <section>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                <Store className="size-3 text-brand" />
                Marketplace
              </h2>
              {tab === "all" && (
                <button type="button" onClick={() => setTab("marketplace")} className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
                  Tout voir <ChevronRight className="size-2.5" />
                </button>
              )}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {filteredListings.map((listing) => (
                <Card key={listing.id} hover className="overflow-hidden">
                  <Link to={`/marketplace/${listing.id}`} className="block">
                    <div className="relative aspect-[16/10]">
                      <Photo src={listing.image} alt={listing.title} className="size-full" />
                      <span className="absolute left-2 top-2 rounded-full bg-black/35 px-2 py-0.5 text-[8px] font-semibold text-white backdrop-blur">
                        {listing.condition}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">{formatPrice(listing.price)}</p>
                      <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium text-ink-soft">{listing.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-[8px] text-muted">
                        <MapPin className="size-2.5" />
                        {listing.location} · {listing.distance}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between border-t border-line px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <Avatar name={listing.seller.name} src={listing.seller.avatar} tone={listing.seller.tone} size="xs" />
                      <span className="text-[8.5px] text-muted">{listing.seller.name.split(" ")[0]}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleListingSaved(listing.id)}
                      aria-label={`Retirer ${listing.title} des enregistrements`}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-semibold text-brand transition hover:bg-brand-soft"
                    >
                      <BookmarkCheck className="size-3" />
                      Enregistré
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {showReels && filteredReels.length > 0 && (
          <section>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                <Clapperboard className="size-3 text-brand" />
                Reels
              </h2>
              {tab === "all" && (
                <button type="button" onClick={() => setTab("reels")} className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
                  Tout voir <ChevronRight className="size-2.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {filteredReels.map((reel) => (
                <Card key={reel.id} hover className="group overflow-hidden">
                  <Link to="/reels" className="block">
                    <div className="relative aspect-[9/13] overflow-hidden">
                      <Photo src={reel.poster} alt={reel.caption} className="size-full" imgClassName="transition duration-500 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
                      <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/35 text-white backdrop-blur">
                        <Play className="size-3" fill="currentColor" />
                      </span>
                      <span className="absolute inset-x-2 bottom-2">
                        <span className="line-clamp-2 text-[9px] font-medium leading-snug text-white">{reel.caption}</span>
                        <span className="mt-1 flex items-center gap-1 text-[7.5px] text-white/65">
                          <Avatar name={reel.author.name} src={reel.author.avatar} tone={reel.author.tone} size="xs" className="size-4" />
                          {reel.author.name.split(" ")[0]}
                        </span>
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="inline-flex items-center gap-1 text-[8px] text-muted">{reel.views} vues</span>
                    <button type="button" onClick={() => toggleReelSave(reel.id)} aria-label="Retirer des enregistrements" className="text-brand">
                      <BookmarkCheck className="size-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {showEvents && (
          <section>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                <CalendarDays className="size-3 text-brand" />
                Événements
              </h2>
              <Link to="/evenements" className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
                Explorer <ChevronRight className="size-2.5" />
              </Link>
            </div>
            {savedEvents.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {savedEvents.map((event) => (
                  <Card key={event.id} hover className="overflow-hidden">
                    <Link to={`/evenements/${event.id}`} className="block">
                      <div className="relative aspect-[16/8]">
                        <Photo src={event.cover} alt={event.title} className="size-full" />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em] text-ink">
                          {event.date}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-1 text-[11px] font-semibold text-ink">{event.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-[8px] text-muted">
                          <MapPin className="size-2.5" /> {event.location}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between border-t border-line px-3 py-2">
                      <span className="text-[8px] text-muted">{formatCount(event.attendees)} participant·es</span>
                      <button
                        type="button"
                        onClick={() => toggleSavedEvent(event.id)}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-semibold text-brand hover:bg-brand-soft"
                      >
                        <BookmarkCheck className="size-3" /> Enregistré
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-tone-red text-tone-red-ink">
                      <CalendarDays className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-ink">Aucun événement enregistré pour l’instant</p>
                      <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">
                        Gardez les événements qui vous intéressent pour ne pas oublier les dates.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-line border-t border-line">
                  {state.events.slice(0, 2).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3">
                      <Photo src={event.cover} alt={event.title} className="size-12 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <Link to={`/evenements/${event.id}`} className="line-clamp-1 text-[10.5px] font-semibold text-ink hover:underline">{event.title}</Link>
                        <p className="mt-0.5 text-[8.5px] text-muted">{event.fullDate} · {event.location}</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => toggleSavedEvent(event.id)}>
                        <Bookmark className="size-3" />
                        Garder
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Vos collections</p>
            <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">Un rangement à votre image</h2>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setCollectionOpen(true)}>
            <Plus className="size-3.5" />
            Ajouter
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => openCollection(collection)}
              className="group relative overflow-hidden rounded-[22px] border border-line bg-surface p-3.5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float"
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  collection.tone === "green" && "bg-tone-green text-tone-green-ink",
                  collection.tone === "yellow" && "bg-tone-yellow text-tone-yellow-ink",
                  collection.tone === "red" && "bg-tone-red text-tone-red-ink",
                  collection.tone === "clay" && "bg-tone-clay text-tone-clay-ink",
                  collection.tone === "river" && "bg-tone-river text-tone-river-ink",
                  collection.tone === "indigo" && "bg-tone-indigo text-tone-indigo-ink",
                )}
              >
                {collection.id === "all" ? <LayoutGrid className="size-4" /> : collection.id === "inspiration" ? <Sparkles className="size-4" /> : collection.id === "produits" ? <Store className="size-4" /> : collection.id === "formation" ? <Play className="size-4" /> : <MapPin className="size-4" />}
              </span>
              <p className="mt-3 truncate text-[11.5px] font-semibold text-ink">{collection.name}</p>
              <p className="mt-0.5 text-[8.5px] text-muted">{collection.count} éléments</p>
              <ArrowUpRight className="absolute right-3 top-3 size-3.5 text-muted transition group-hover:text-brand" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCollectionOpen(true)}
            className="group flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-line-strong bg-surface-muted/50 p-3 text-center transition hover:border-brand/40 hover:bg-brand-soft/40"
          >
            <span className="grid size-8 place-items-center rounded-full border border-line bg-surface text-muted transition group-hover:border-brand/30 group-hover:text-brand">
              <Plus className="size-4" />
            </span>
            <span className="text-[9.5px] font-semibold text-ink-soft">Créer une collection</span>
          </button>
        </div>
      </div>

      <Card className="mt-3 flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
            <Trash2 className="size-4" />
          </span>
          <div>
            <p className="text-[10.5px] font-semibold text-ink">Faire le tri dans vos enregistrements</p>
            <p className="mt-0.5 text-[8.5px] text-muted">Retirez les éléments que vous n’avez plus besoin de garder.</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            savedPosts.forEach((post) => toggleSavePost(post.id));
            savedListings.forEach((listing) => toggleListingSaved(listing.id));
            savedReels.forEach((reel) => toggleReelSave(reel.id));
            showToast("Tous les enregistrements de la démo ont été retirés.", "info");
          }}
        >
          Tout désenregistrer
        </Button>
      </Card>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1"><DemoTag /> Bibliothèque locale · non synchronisée</span>
        <Link to="/parametres?tab=confidentialite" className="font-semibold text-brand hover:underline">Gérer la confidentialité</Link>
      </div>

      <CollectionModal
        open={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        onCreate={(collection) => setCollections((current) => [...current, collection])}
      />
    </div>
  );
}
