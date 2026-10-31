import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Eye,
  Filter,
  HeartHandshake,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import {
  Avatar,
  Button,
  Card,
  Chip,
  DemoTag,
  EmptyState,
  IconButton,
  InlineNotice,
  Menu,
  Modal,
  Photo,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import {
  ArtCover,
} from "@/components/ui";
import { cn, formatFullNumber, formatPrice, formatCount } from "@/lib/utils";
import { useApp } from "@/store";
import type { Listing } from "@/types";

const categories = ["Tout", "Électronique", "Mode", "Maison", "Véhicules", "Immobilier", "Services"] as const;
const conditions = ["Toutes", "Neuf", "Comme neuf", "Très bon état", "Bon état", "À rénover"] as const;
const imagePresets = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80",
];

function ListingCard({ listing }: { listing: Listing }) {
  const { toggleListingSaved } = useApp();

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <Link to={`/marketplace/${listing.id}`} className="block">
        <div className="relative">
          <Photo
            src={listing.image}
            alt={listing.title}
            className="aspect-[4/3] w-full"
            imgClassName="transition duration-500 group-hover:scale-[1.03]"
          />
          {listing.status && listing.status !== "Disponible" && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/80 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur">
              {listing.status}
            </span>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleListingSaved(listing.id);
            }}
            aria-label={listing.saved ? "Retirer des favoris" : "Sauvegarder l’annonce"}
            className={cn(
              "absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full backdrop-blur transition",
              listing.saved ? "bg-brand text-white" : "bg-black/35 text-white hover:bg-black/55",
            )}
          >
            {listing.saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
          </button>
        </div>
        <div className="p-3">
          <p className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
            {formatPrice(listing.price)}
            {listing.negotiable && (
              <span className="ml-1 text-[8.5px] font-medium uppercase tracking-[0.08em] text-muted">négociable</span>
            )}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug text-ink-soft transition group-hover:text-brand">
            {listing.title}
          </h3>
          <p className="mt-1.5 flex items-center gap-1 truncate text-[8.5px] text-muted">
            <MapPin className="size-2.5 shrink-0" />
            {listing.location}
            <span className="mx-0.5">·</span>
            {listing.distance}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[8px] font-semibold text-muted">
              <Tag className="size-2.5" />
              {listing.condition}
            </span>
            <span className="truncate text-[8px] text-muted">{listing.time}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CreateListingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createListing } = useApp();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mode");
  const [condition, setCondition] = useState<Listing["condition"]>("Neuf");
  const [location, setLocation] = useState("Bamako, Mali");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(imagePresets[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setPrice("");
      setCategory("Mode");
      setCondition("Neuf");
      setLocation("Bamako, Mali");
      setDescription("");
      setImage(imagePresets[0]);
      setError(null);
    }
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Donnez un titre clair à votre annonce.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Indiquez un prix valide en FCFA.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Ajoutez une description d’au moins 10 caractères.");
      return;
    }
    createListing({
      title: title.trim(),
      price: Number(price),
      category,
      condition,
      location: location.trim(),
      description: description.trim(),
      image,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vendre sur Marketplace"
      description="Publiez une annonce près de chez vous. La vente est simulée."
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" type="submit" form="create-listing-form">
            <Plus className="size-3.5" />
            Publier l’annonce
          </Button>
        </>
      }
    >
      <form id="create-listing-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div>
          <label htmlFor="listing-title" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
            Titre de l’annonce
          </label>
          <input
            id="listing-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex. Ensemble bazin riche — collection Harmattan"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="listing-price" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
              Prix (FCFA)
            </label>
            <input
              id="listing-price"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="47500"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="listing-condition" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
              État
            </label>
            <select
              id="listing-condition"
              value={condition}
              onChange={(event) => setCondition(event.target.value as Listing["condition"])}
              className={fieldClass}
            >
              {conditions.slice(1).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="listing-category" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
              Catégorie
            </label>
            <select
              id="listing-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={fieldClass}
            >
              {categories.slice(1).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="listing-location" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
              Localisation
            </label>
            <input
              id="listing-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="listing-description" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
            Description
          </label>
          <textarea
            id="listing-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Décrivez l’article, son état, les accessoires inclus, les modalités de remise…"
            className={cn(fieldClass, "h-auto resize-none py-2.5")}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-ink-soft">Photo de l’article</p>
          <div className="grid grid-cols-4 gap-2">
            {imagePresets.map((preset, index) => (
              <button
                key={preset}
                type="button"
                onClick={() => setImage(preset)}
                aria-label={`Choisir la photo ${index + 1}`}
                aria-pressed={image === preset}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border-2 transition",
                  image === preset ? "border-brand" : "border-transparent hover:border-line-strong",
                )}
              >
                <img src={preset} alt="" className="size-full object-cover" />
                {image === preset && (
                  <span className="absolute inset-0 grid place-items-center bg-brand/25 text-white">
                    <BadgeCheck className="size-5" />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[9px] text-muted">
            <ImagePlus className="size-3" />
            Dans la démo, choisissez un visuel parmi les propositions.
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default function MarketplacePage() {
  const { state, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Tout");
  const [condition, setCondition] = useState<(typeof conditions)[number]>("Toutes");
  const [sort, setSort] = useState<"recent" | "price-asc" | "price-desc">("recent");
  const [savedOnly, setSavedOnly] = useState(false);
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

  const listings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = state.listings.filter((listing) => {
      const matchesCategory = category === "Tout" || listing.category === category;
      const matchesCondition = condition === "Toutes" || listing.condition === condition;
      const matchesSaved = !savedOnly || listing.saved;
      const matchesQuery =
        !normalized ||
        listing.title.toLowerCase().includes(normalized) ||
        listing.description.toLowerCase().includes(normalized) ||
        listing.location.toLowerCase().includes(normalized);
      return matchesCategory && matchesCondition && matchesSaved && matchesQuery;
    });
    if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [category, condition, query, savedOnly, sort, state.listings]);

  const spotlight = state.listings.slice(0, 3);
  const myListings = state.listings.filter((listing) => listing.seller.id === state.me.id);

  return (
    <div>
      <PageIntro
        eyebrow="Acheter · Vendre · Échanger"
        title="Marketplace"
        description="Les bonnes affaires et le savoir-faire malien, près de chez vous. Paiement et livraison simulés."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Vendre un article
          </Button>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <div className="relative bg-[linear-gradient(115deg,#0e2c1d_0%,#0b7a45_58%,#1a9158_100%)] px-5 py-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-20 right-16 size-44 rounded-full border border-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-[390px]">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-mali-yellow)]">
                Le marché de proximité
              </p>
              <h2 className="mt-1.5 font-display text-[22px] font-semibold leading-tight tracking-[-0.04em]">
                Vendez ce qui ne vous sert plus. Trouvez ce qui compte.
              </h2>
              <p className="mt-2 text-[10.5px] leading-relaxed text-white/65">
                Des milliers d’annonces à Bamako, Ségou et Mopti. Photos, prix et vendeurs vérifiés.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="gold" onClick={() => setCreateOpen(true)}>
                  <ShoppingBag className="size-3.5" />
                  Publier gratuitement
                </Button>
                <button
                  type="button"
                  onClick={() => showToast("La livraison est simulée dans cette démo.", "info")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 text-[10.5px] font-semibold text-white/85 backdrop-blur transition hover:bg-white/20"
                >
                  <ShieldCheck className="size-3.5" />
                  Achat protégé
                </button>
              </div>
            </div>
            <div className="hidden w-[220px] shrink-0 sm:block">
              <div className="grid grid-cols-2 gap-2">
                {spotlight.map((listing, index) => (
                  <Link
                    key={listing.id}
                    to={`/marketplace/${listing.id}`}
                    className={cn(
                      "group overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur transition hover:border-white/30",
                      index === 0 ? "col-span-2 flex items-center gap-2.5 p-2" : "p-1.5",
                    )}
                  >
                    <img
                      src={listing.image}
                      alt=""
                      className={cn("object-cover", index === 0 ? "size-12 rounded-xl" : "aspect-square w-full rounded-lg")}
                    />
                    {index === 0 && (
                      <span className="min-w-0">
                        <span className="block truncate text-[9.5px] font-semibold">{listing.title}</span>
                        <span className="mt-0.5 block text-[9px] font-semibold text-[color:var(--color-mali-yellow)]">
                          {formatPrice(listing.price)}
                        </span>
                      </span>
                    )}
                  </Link>
                ))}
              </div>
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
            placeholder="Que recherchez-vous ?"
            aria-label="Rechercher une annonce"
            className={cn(fieldClass, "h-10 pl-9 text-[11px]")}
          />
        </div>
        <div className="flex items-center gap-2">
          <Chip active={savedOnly} onClick={() => setSavedOnly((current) => !current)}>
            <Bookmark className="size-3" />
            Enregistrées
          </Chip>
          <Menu
            label="Trier les annonces"
            trigger={
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[10.5px] font-semibold text-ink-soft transition hover:border-line-strong hover:text-ink">
                <SlidersHorizontal className="size-3.5" />
                Trier
                <ChevronDown className="size-3" />
              </span>
            }
            items={[
              { label: "Plus récentes", onClick: () => setSort("recent") },
              { label: "Prix croissant", onClick: () => setSort("price-asc") },
              { label: "Prix décroissant", onClick: () => setSort("price-desc") },
            ]}
          />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="relative">
          <span className="sr-only">Catégorie</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
            className={cn(fieldClass, "h-9 cursor-pointer appearance-none pr-8 text-[10.5px]")}
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === "Tout" ? "Toutes catégories" : item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-muted" />
        </label>
        <label className="relative">
          <span className="sr-only">État</span>
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value as (typeof conditions)[number])}
            className={cn(fieldClass, "h-9 cursor-pointer appearance-none pr-8 text-[10.5px]")}
          >
            {conditions.map((item) => (
              <option key={item} value={item}>{item === "Toutes" ? "Tout état" : item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-muted" />
        </label>
        <div className="col-span-2 flex items-center justify-between rounded-2xl border border-line bg-surface-muted px-3">
          <span className="text-[9.5px] font-medium text-muted">Résultats</span>
          <span className="font-display text-[13px] font-semibold text-ink">{listings.length}</span>
        </div>
      </div>

      {myListings.length > 0 && (
        <Card className="mb-4 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Vos annonces</p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
            >
              <Plus className="size-3" />
              Nouvelle annonce
            </button>
          </div>
          <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto">
            {myListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/marketplace/${listing.id}`}
                className="flex w-[230px] shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-surface-muted/60 p-2 transition hover:border-line-strong"
              >
                <img src={listing.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10.5px] font-semibold text-ink">{listing.title}</span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-brand">{formatPrice(listing.price)}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[8px] text-muted">
                    <Eye className="size-2.5" /> {listing.time}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Store className="size-6" />}
            title="Aucune annonce trouvée"
            description="Modifiez vos filtres ou publiez la première annonce de cette catégorie."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("Tout");
                  setCondition("Toutes");
                  setSavedOnly(false);
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        </Card>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
            <HeartHandshake className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-ink">Achetez en toute confiance</p>
            <p className="mt-0.5 text-[9px] text-muted">Rencontrez le vendeur dans un lieu public et inspectez l’article.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => showToast("Conseils de sécurité Marketplace : vérifiez toujours l’article avant paiement.", "info")}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
        >
          Nos conseils
          <ChevronRight className="size-3" />
        </button>
      </div>

      <CreateListingModal open={createOpen} onClose={closeCreate} />
    </div>
  );
}

export function ListingDetail() {
  const { listingId } = useParams();
  const { state, toggleListingSaved, startConversation, showToast } = useApp();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);

  const listing = state.listings.find((item) => item.id === listingId);

  if (!listing) {
    return (
      <Card>
        <EmptyState
          icon={<ShoppingBag className="size-6" />}
          title="Annonce introuvable"
          description="Cette annonce a peut-être été vendue ou retirée de la démonstration."
          action={<Button onClick={() => navigate("/marketplace")}>Retour au Marketplace</Button>}
        />
      </Card>
    );
  }

  const seller = listing.seller;

  const contactSeller = () => {
    const conversationId = startConversation(seller);
    navigate(`/messages?conv=${conversationId}`);
  };

  const similar = state.listings.filter((item) => item.id !== listing.id && item.category === listing.category).slice(0, 2);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" />
          Retour au Marketplace
        </Link>
        <DemoTag />
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-surface-muted/40 p-3">
            <Photo
              src={listing.images[activeImage] ?? listing.image}
              alt={listing.title}
              className="aspect-[4/3] w-full rounded-[18px]"
              eager
            />
            {listing.images.length > 1 && (
              <div className="mt-2 flex gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Voir la photo ${index + 1}`}
                    className={cn(
                      "aspect-square w-16 overflow-hidden rounded-xl border-2 transition",
                      activeImage === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={image} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col p-4">
            <p className="font-display text-[25px] font-semibold leading-none tracking-[-0.04em] text-ink">
              {formatPrice(listing.price)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] text-brand-ink">
                {listing.condition}
              </span>
              {listing.negotiable && (
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[8.5px] font-semibold text-[color:var(--color-gold)]">
                  Négociable
                </span>
              )}
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[8.5px] font-semibold text-muted">
                {listing.category}
              </span>
            </div>
            <h1 className="mt-2.5 font-display text-[19px] font-semibold leading-snug tracking-[-0.03em] text-ink">
              {listing.title}
            </h1>
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted">
              <MapPin className="size-3" />
              {listing.location} · {listing.distance} · {listing.time}
            </p>

            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={contactSeller}>
                <MessageCircle className="size-4" />
                Contacter le vendeur
              </Button>
              <IconButton
                label={listing.saved ? "Retirer des favoris" : "Sauvegarder"}
                onClick={() => toggleListingSaved(listing.id)}
                className={cn("border", listing.saved ? "border-brand/25 bg-brand-soft text-brand" : "border-line bg-surface")}
              >
                {listing.saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
              </IconButton>
              <IconButton
                label="Partager l’annonce"
                onClick={() => showToast("Lien de l’annonce copié.")}
                className="border border-line bg-surface"
              >
                <span className="text-[13px] font-semibold">↗</span>
              </IconButton>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-surface-muted/60 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Vendeur</p>
              <Link to={`/profil/${seller.username}`} className="mt-2 flex items-center gap-2.5">
                <Avatar name={seller.name} src={seller.avatar} tone={seller.tone} size="md" online />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[11.5px] font-semibold text-ink">
                    {seller.name}
                    {seller.verified && <VerifiedBadge className="size-3" />}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-muted">
                    {seller.work ?? "Membre N’Teriface"} · {formatCount(seller.followers)} abonnés
                  </span>
                </span>
                <ChevronRight className="size-3.5 text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3 grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-4">
          <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">Description</h2>
          <p className="mt-2 whitespace-pre-line text-[11.5px] leading-relaxed text-ink-soft">{listing.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
            {[
              ["Catégorie", listing.category],
              ["État", listing.condition],
              ["Localisation", listing.location],
              ["Publiée", listing.time],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
                <p className="mt-0.5 text-[10.5px] font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="overflow-hidden">
            <ArtCover art="river" className="h-[110px]" label="Bamako">
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-10 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur">
                  <MapPin className="size-4" />
                </span>
              </div>
            </ArtCover>
            <div className="p-3">
              <p className="text-[10.5px] font-semibold text-ink">Point de rencontre suggéré</p>
              <p className="mt-1 text-[9px] leading-relaxed text-muted">
                Centre commercial ACI 2000 · lieu public, proche du vendeur.
              </p>
              <button
                type="button"
                onClick={() => showToast("Itinéraire simulé : place de l’Indépendance, Bamako.", "info")}
                className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-semibold text-brand hover:underline"
              >
                Voir l’itinéraire
                <ChevronRight className="size-3" />
              </button>
            </div>
          </Card>

          <div className="rounded-2xl border border-gold/25 bg-gold-soft/50 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink">
              <ShieldCheck className="size-3.5 text-[color:var(--color-gold)]" />
              Conseils de sécurité
            </p>
            <ul className="mt-1.5 space-y-1 text-[9px] leading-relaxed text-muted">
              <li>• Rencontrez le vendeur dans un lieu public.</li>
              <li>• Inspectez l’article avant de payer.</li>
              <li>• Ne partagez jamais vos codes Mobile Money.</li>
            </ul>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">Annonces similaires</h2>
            <Link to="/marketplace" className="text-[9.5px] font-semibold text-brand hover:underline">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {similar.map((item) => <ListingCard key={item.id} listing={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
