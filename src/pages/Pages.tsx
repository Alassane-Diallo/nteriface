import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronRight,
  Clock,
  Flag,
  Globe,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
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
  ProgressBar,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { cn, formatCount } from "@/lib/utils";
import { useApp } from "@/store";
import type { Page } from "@/types";

const pageCategories = ["Tout", "Marque", "Restaurant", "Radio", "Tourisme", "Sport", "Art"] as const;

function PageCard({ page }: { page: Page }) {
  const { togglePageLike } = useApp();

  return (
    <article className="group overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <Link to={`/pages/${page.id}`} className="block">
        <ArtCover art={page.art} className="h-[96px]" label={page.category}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </ArtCover>
      </Link>
      <div className="p-3">
        <div className="-mt-7 flex items-end gap-2.5">
          <span className="rounded-[16px] border-[3px] border-surface bg-surface shadow-sm">
            <Avatar name={page.name} tone={page.tone} size="lg" shape="squircle" />
          </span>
          <div className="min-w-0 flex-1 pb-0.5">
            <Link
              to={`/pages/${page.id}`}
              className="flex items-center gap-1 truncate text-[11.5px] font-semibold text-ink transition hover:text-brand"
            >
              {page.name}
              {page.verified && <VerifiedBadge className="size-3" />}
            </Link>
            <p className="mt-0.5 truncate text-[8.5px] text-muted">{page.category}</p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 min-h-[28px] text-[9.5px] leading-relaxed text-muted">{page.description}</p>
        <div className="mt-2 flex items-center gap-2 text-[8.5px] text-muted">
          <span className="inline-flex items-center gap-1"><Users className="size-2.5" />{formatCount(page.followers)}</span>
          <span className="inline-flex items-center gap-1 text-[color:var(--color-gold)]"><Star className="size-2.5 fill-current" />{page.rating || "—"}</span>
        </div>
        <button
          type="button"
          onClick={() => togglePageLike(page.id)}
          className={cn(
            "mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-full text-[10px] font-semibold transition",
            page.liked
              ? "border border-brand/20 bg-brand-soft text-brand-ink"
              : "button-brand hover:brightness-105",
          )}
        >
          {page.liked ? <ThumbsUp className="size-3" /> : <Heart className="size-3" />}
          {page.liked ? "J’aime déjà" : "J’aime la Page"}
        </button>
      </div>
    </article>
  );
}

function CreatePageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createPage } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Marque");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setCategory("Marque");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Indiquez le nom de votre Page.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Présentez votre activité en quelques mots.");
      return;
    }
    createPage({ name: name.trim(), category, description: description.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Créer une Page"
      description="Donnez une voix à votre activité, votre marque ou votre projet."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="create-page-form">
            <Flag className="size-3.5" />
            Créer la Page
          </Button>
        </>
      }
    >
      <form id="create-page-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div>
          <label htmlFor="page-name" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Nom de la Page</label>
          <input
            id="page-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Atelier N’Goni Bamako"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="page-category" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Catégorie</label>
          <select
            id="page-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={fieldClass}
          >
            {["Marque", "Restaurant", "Artisanat", "Musique", "Tourisme", "Sport", "Média", "Association"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="page-description" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Présentation</label>
          <textarea
            id="page-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Ce que vous faites, où vous êtes, ce qui vous rend unique…"
            className={cn(fieldClass, "h-auto resize-none py-2.5")}
          />
        </div>
        <InlineNotice tone="info">
          Vous devenez propriétaire de la Page. Statistiques, publications et réponses sont accessibles dans Creator Studio.
        </InlineNotice>
      </form>
    </Modal>
  );
}

export default function PagesPage() {
  const { state } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof pageCategories)[number]>("Tout");
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

  const pages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.pages.filter((page) => {
      const matchesCategory = category === "Tout" || page.category.toLowerCase().includes(category.toLowerCase());
      const matchesQuery =
        !normalized ||
        page.name.toLowerCase().includes(normalized) ||
        page.category.toLowerCase().includes(normalized) ||
        page.description.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, state.pages]);

  const liked = state.pages.filter((page) => page.liked);
  const hero = state.pages[0];

  return (
    <div>
      <PageIntro
        eyebrow="Entreprises & créateurs"
        title="Pages"
        description="Suivez les marques, restaurants et talents qui font bouger le Mali."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Créer une Page
          </Button>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <ArtCover art={hero.art} className="relative h-[200px] sm:h-[230px]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <span className="rounded-[20px] border-4 border-surface bg-surface">
                <Avatar name={hero.name} tone={hero.tone} size="3xl" shape="squircle" />
              </span>
              <div className="pb-1">
                <p className="flex items-center gap-1.5 font-display text-[20px] font-semibold tracking-[-0.04em] text-white sm:text-[24px]">
                  {hero.name}
                  {hero.verified && <VerifiedBadge className="size-4" />}
                </p>
                <p className="mt-0.5 text-[9.5px] font-medium text-white/70">{hero.category} · {formatCount(hero.followers)} abonnés</p>
                <p className="mt-1 max-w-[420px] line-clamp-2 text-[10px] leading-relaxed text-white/65">{hero.description}</p>
              </div>
            </div>
            <Link
              to={`/pages/${hero.id}`}
              className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-[10.5px] font-semibold text-ink transition hover:bg-white/90 sm:inline-flex"
            >
              Voir la Page
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </ArtCover>
      </Card>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une Page…"
            aria-label="Rechercher une Page"
            className={cn(fieldClass, "h-10 pl-9 text-[11px]")}
          />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[9.5px] font-semibold text-muted">
          <Heart className="size-3 text-[color:var(--color-mali-red)]" />
          {liked.length} Pages aimées
        </span>
      </div>

      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
        {pageCategories.map((item) => (
          <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
        ))}
      </div>

      {pages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {pages.map((page) => <PageCard key={page.id} page={page} />)}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Flag className="size-6" />}
            title="Aucune Page trouvée"
            description="Essayez une autre catégorie ou créez votre Page en quelques secondes."
            action={<Button onClick={() => setCreateOpen(true)}>Créer une Page</Button>}
          />
        </Card>
      )}

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-ink">Développez votre audience</p>
            <p className="mt-0.5 text-[9px] text-muted">Creator Studio vous aide à comprendre vos abonnés et à planifier vos publications.</p>
          </div>
          <Link to="/createur" className="shrink-0 text-[9.5px] font-semibold text-brand hover:underline">Ouvrir</Link>
        </div>
      </Card>

      <CreatePageModal open={createOpen} onClose={closeCreate} />
    </div>
  );
}

type PageTab = "home" | "about" | "photos" | "reviews" | "offers";

export function PageDetail() {
  const { pageId } = useParams();
  const { state, togglePageLike, openComposer, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PageTab>("home");
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([
    { name: "Aminata Cissé", stars: 5, text: "Une équipe à l’écoute et des pièces magnifiques. Je recommande !", time: "Il y a 2 semaines" },
    { name: "Oumar Diallo", stars: 4, text: "Très belle qualité, livraison rapide à Bamako.", time: "Il y a 1 mois" },
  ]);

  const page = state.pages.find((item) => item.id === pageId);

  if (!page) {
    return (
      <Card>
        <EmptyState
          icon={<Flag className="size-6" />}
          title="Page introuvable"
          description="Cette Page n’existe pas dans la démonstration ou a été retirée."
          action={<Button onClick={() => navigate("/pages")}>Toutes les Pages</Button>}
        />
      </Card>
    );
  }

  const posts = state.posts.filter((post) => post.pageId === page.id);
  const manager = page.roles?.includes("Propriétaire") ?? false;
  const photos = posts.flatMap((post) => post.media ?? []);
  const gallery =
    photos.length > 0
      ? photos
      : [
          { id: "g1", url: page.cover, alt: page.name },
          { id: "g2", url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80", alt: "Collection" },
          { id: "g3", url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=900&q=80", alt: "Atelier" },
          { id: "g4", url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80", alt: "Événement" },
        ];

  const submitReview = (event: FormEvent) => {
    event.preventDefault();
    if (!review.trim()) return;
    setReviews((current) => [
      { name: state.me.name, stars: 5, text: review.trim(), time: "À l’instant" },
      ...current,
    ]);
    setReview("");
    showToast("Merci ! Votre avis a été publié (démo).");
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link to="/pages" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" />
          Toutes les Pages
        </Link>
        <DemoTag />
      </div>

      <Card className="overflow-hidden">
        <ArtCover art={page.art} className="relative h-[180px] sm:h-[230px]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[8.5px] font-semibold text-white backdrop-blur">
            {page.category}
          </span>
        </ArtCover>

        <div className="px-4 pb-3">
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <span className="rounded-[20px] border-4 border-surface bg-surface">
                <Avatar name={page.name} tone={page.tone} size="3xl" shape="squircle" />
              </span>
              <div className="min-w-0 pb-0.5">
                <h1 className="flex items-center gap-1.5 font-display text-[21px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[25px]">
                  {page.name}
                  {page.verified && <VerifiedBadge className="size-4" />}
                </h1>
                <p className="mt-0.5 text-[9.5px] font-medium text-muted">
                  {page.category} · {formatCount(page.followers)} abonnés
                </p>
                <div className="mt-1 flex items-center gap-2 text-[9px] text-muted">
                  <span className="flex items-center gap-0.5 text-[color:var(--color-gold)]">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <Star key={index} className={cn("size-3", index < Math.round(page.rating) ? "fill-current" : "opacity-30")} />
                    ))}
                  </span>
                  <span>{page.rating || "Nouveau"} · {page.reviews} avis</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={page.liked ? "secondary" : "primary"} onClick={() => togglePageLike(page.id)}>
                <ThumbsUp className="size-3.5" />
                {page.liked ? "Abonné·e" : "J’aime"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => showToast("Messagerie de Page simulée. Écrivez depuis la section Messages.", "info")}>
                <MessageCircle className="size-3.5" />
                Message
              </Button>
            </div>
          </div>
        </div>

        <div className="no-scrollbar flex overflow-x-auto border-t border-line px-2">
          {[
            { id: "home" as const, label: "Accueil" },
            { id: "about" as const, label: "À propos" },
            { id: "photos" as const, label: "Photos", count: gallery.length },
            { id: "reviews" as const, label: "Avis", count: reviews.length + page.reviews },
            { id: "offers" as const, label: "Offres" },
          ].map((item) => (
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
      </Card>

      <div className="mt-3 grid gap-3 md:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          {tab === "home" && (
            <>
              {page.liked && (
                <Card className="p-3">
                  <button
                    type="button"
                    onClick={() => openComposer("post", `page-${page.id}`)}
                    className="flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface-muted px-3 py-2.5 text-left transition hover:border-line-strong"
                  >
                    <Avatar name={page.name} tone={page.tone} size="md" shape="squircle" />
                    <span className="text-[10.5px] text-muted">Publier en tant que {page.name}…</span>
                  </button>
                </Card>
              )}
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <Card>
                  <EmptyState
                    icon={<Building2 className="size-6" />}
                    title="La Page n’a rien publié récemment"
                    description="Suivez la Page pour être informé·e de ses prochaines publications."
                    action={!page.liked ? <Button onClick={() => togglePageLike(page.id)}>J’aime la Page</Button> : undefined}
                  />
                </Card>
              )}
            </>
          )}

          {tab === "about" && (
            <Card className="p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">À propos de {page.name}</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{page.description}</p>
              <div className="mt-3 space-y-2.5 border-t border-line pt-3">
                {[
                  { icon: MapPin, label: page.address ?? "Bamako, Mali" },
                  { icon: Phone, label: page.phone ?? "Non renseigné" },
                  { icon: Globe, label: page.website ?? "Pas de site web" },
                  { icon: Clock, label: page.hours ?? "Horaires non renseignés" },
                ].map((item) => (
                  <p key={item.label} className="flex items-center gap-2 text-[10px] text-ink-soft">
                    <item.icon className="size-3.5 shrink-0 text-muted" />
                    {item.label}
                  </p>
                ))}
              </div>
              <div className="mt-3 rounded-2xl border border-line bg-surface-muted/50 p-3">
                <div className="flex items-center justify-between text-[9px] font-semibold text-muted">
                  <span>Score de recommandation</span>
                  <span className="text-brand">{Math.round((page.rating / 5) * 100)} %</span>
                </div>
                <ProgressBar value={page.rating} max={5} className="mt-1.5" />
                <p className="mt-1 text-[8.5px] text-muted">Basé sur {page.reviews} avis de la communauté.</p>
              </div>
            </Card>
          )}

          {tab === "photos" && (
            <Card className="p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gallery.map((photo) => (
                  <Photo key={photo.id} src={photo.url} alt={photo.alt} className="aspect-square rounded-xl" />
                ))}
              </div>
            </Card>
          )}

          {tab === "reviews" && (
            <div className="space-y-3">
              <Card className="p-4">
                <form onSubmit={submitReview} className="flex items-center gap-2">
                  <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="md" />
                  <input
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    placeholder={`Donner votre avis sur ${page.name}…`}
                    aria-label="Donner votre avis"
                    className={cn(fieldClass, "h-10 flex-1")}
                  />
                  <Button size="sm" type="submit">Publier</Button>
                </form>
              </Card>
              {reviews.map((item) => (
                <Card key={`${item.name}-${item.time}`} className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={item.name} tone="green" size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-semibold text-ink">{item.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[8.5px] text-muted">
                        <span className="flex text-[color:var(--color-gold)]">
                          {[0, 1, 2, 3, 4].map((index) => (
                            <Star key={index} className={cn("size-2.5", index < item.stars ? "fill-current" : "opacity-25")} />
                          ))}
                        </span>
                        · {item.time}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">{item.text}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === "offers" && (
            <div className="space-y-3">
              {[
                { title: "−20 % sur la collection Harmattan", detail: "Valable jusqu’au 31 octobre en boutique et en ligne.", tone: "bg-tone-clay text-tone-clay-ink" },
                { title: "Livraison offerte à Bamako", detail: "Pour toute commande supérieure à 25 000 FCFA.", tone: "bg-tone-green text-tone-green-ink" },
              ].map((offer) => (
                <Card key={offer.title} className="flex items-center gap-3 p-3.5">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", offer.tone)}>
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-ink">{offer.title}</p>
                    <p className="mt-0.5 text-[9px] leading-relaxed text-muted">{offer.detail}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => showToast("Offre de démonstration — aucune commande réelle.", "info")}>
                    Voir
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Card className="p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Informations</p>
            <div className="mt-2 space-y-2">
              <p className="flex items-center gap-2 text-[9.5px] text-ink-soft"><MapPin className="size-3.5 shrink-0 text-muted" />{page.address ?? "Bamako, Mali"}</p>
              {page.website && <p className="flex items-center gap-2 text-[9.5px] text-ink-soft"><Link2 className="size-3.5 shrink-0 text-muted" />{page.website}</p>}
              <p className="flex items-center gap-2 text-[9.5px] text-ink-soft"><Clock className="size-3.5 shrink-0 text-muted" />{page.hours ?? "Ouvert aujourd’hui"}</p>
            </div>
          </Card>
          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Cette semaine</p>
              <Settings className="size-3.5 text-muted" />
            </div>
            <p className="mt-2 font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">{formatCount(page.followers)}</p>
            <p className="text-[9px] text-muted">abonnés au total</p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-semibold text-brand">
              <Sparkles className="size-3" />
              +{formatCount(Math.round(page.followers * 0.018))} cette semaine
            </div>
          </Card>
          <Card className="p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Partager</p>
            <button
              type="button"
              onClick={() => showToast("Lien de la Page copié.")}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-surface-muted py-2 text-[9.5px] font-semibold text-ink-soft transition hover:border-line-strong"
            >
              <Share2 className="size-3.5" />
              Copier le lien de la Page
            </button>
            {manager && (
              <p className="mt-2 flex items-center gap-1 text-[8.5px] font-semibold text-brand">
                <BadgeCheck className="size-3" />
                Vous gérez cette Page
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
