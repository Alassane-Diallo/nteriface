import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Heart,
  Landmark,
  LocateFixed,
  MapPin,
  Music2,
  Navigation,
  Palette,
  Plus,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Ticket,
  Utensils,
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
  Photo,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { cn, formatCount, formatPrice, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";

const cities = ["Bamako", "Ségou", "Mopti", "Sikasso", "Kayes"] as const;
type City = (typeof cities)[number];

const categories = [
  { id: "Tout", icon: Compass },
  { id: "Restaurants", icon: Utensils },
  { id: "Cafés", icon: Coffee },
  { id: "Marchés", icon: ShoppingBasket },
  { id: "Culture", icon: Landmark },
  { id: "Artisanat", icon: Palette },
  { id: "Sorties", icon: Music2 },
] as const;

type Category = (typeof categories)[number]["id"];

const places = [
  {
    id: "place-baobab",
    name: "Baobab Café",
    category: "Restaurants" as Category,
    city: "Bamako" as City,
    address: "Hamdallaye ACI 2000, Bamako",
    description: "Cuisine malienne de saison, terrasse ombragée et brunch du dimanche.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=82",
    rating: 4.8,
    reviews: 326,
    distance: "1,2 km",
    open: true,
    hours: "Ouvert · jusqu’à 23 h",
    price: "12 000 – 25 000 FCFA",
    tag: "Coup de cœur",
    x: 38,
    y: 44,
  },
  {
    id: "place-marche",
    name: "Marché de Médine",
    category: "Marchés" as Category,
    city: "Bamako" as City,
    address: "Médine, Bamako",
    description: "Le grand marché aux tissus, aux épices et aux trésors du quotidien.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=82",
    rating: 4.5,
    reviews: 892,
    distance: "3,4 km",
    open: true,
    hours: "Ouvert · jusqu’à 18 h",
    price: "Entrée libre",
    tag: "Incontournable",
    x: 64,
    y: 38,
  },
  {
    id: "place-faso",
    name: "Atelier Faso Kréa",
    category: "Artisanat" as Category,
    city: "Bamako" as City,
    address: "Badalabougou Est, Bamako",
    description: "Bogolan contemporain, coupes sur mesure et rencontres avec les artisans.",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=82",
    rating: 4.9,
    reviews: 148,
    distance: "2,1 km",
    open: false,
    hours: "Ouvre demain à 9 h",
    price: "À partir de 8 500 FCFA",
    tag: "Fait main",
    x: 26,
    y: 66,
  },
  {
    id: "place-palais",
    name: "Palais de la Culture Amadou Hampâté Bâ",
    category: "Culture" as Category,
    city: "Bamako" as City,
    address: "Quartier du Fleuve, Bamako",
    description: "Concerts, expositions et grands rendez-vous de la scène malienne.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=82",
    rating: 4.7,
    reviews: 512,
    distance: "4,8 km",
    open: true,
    hours: "Ouvert · jusqu’à 22 h",
    price: "Selon l’événement",
    tag: "Ce soir",
    x: 72,
    y: 62,
  },
  {
    id: "place-fleuve",
    name: "Guinguette du Fleuve",
    category: "Sorties" as Category,
    city: "Ségou" as City,
    address: "Bords du Niger, Ségou",
    description: "Coucher de soleil sur le fleuve, grillades et musique live le vendredi.",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=82",
    rating: 4.6,
    reviews: 204,
    distance: "0,8 km",
    open: true,
    hours: "Ouvert · jusqu’à minuit",
    price: "8 000 – 18 000 FCFA",
    tag: "Vue fleuve",
    x: 52,
    y: 52,
  },
  {
    id: "place-bogolan",
    name: "Maison du Bogolan",
    category: "Artisanat" as Category,
    city: "Ségou" as City,
    address: "Quartier Administratif, Ségou",
    description: "Ateliers de teinture, visite des ateliers et pièces uniques en coton.",
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=900&q=82",
    rating: 4.8,
    reviews: 117,
    distance: "1,6 km",
    open: true,
    hours: "Ouvert · jusqu’à 17 h 30",
    price: "Visite : 2 000 FCFA",
    tag: "Artisanat",
    x: 34,
    y: 42,
  },
  {
    id: "place-djenne",
    name: "Café Djenné",
    category: "Cafés" as Category,
    city: "Mopti" as City,
    address: "Port de Mopti, Mopti",
    description: "Café de spécialité, pâtisseries et vue sur les pinasses du port.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=82",
    rating: 4.4,
    reviews: 86,
    distance: "2,3 km",
    open: true,
    hours: "Ouvert · jusqu’à 20 h",
    price: "1 500 – 5 000 FCFA",
    tag: "Nouveau",
    x: 58,
    y: 36,
  },
  {
    id: "place-sikasso",
    name: "Jardin de Sikasso",
    category: "Sorties" as Category,
    city: "Sikasso" as City,
    address: "Route de Bobo, Sikasso",
    description: "Un écrin de verdure pour pique-niquer en famille, à l’ombre des manguiers.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=82",
    rating: 4.3,
    reviews: 64,
    distance: "5,1 km",
    open: true,
    hours: "Ouvert · jusqu’à 19 h",
    price: "Entrée : 1 000 FCFA",
    tag: "Famille",
    x: 44,
    y: 68,
  },
  {
    id: "place-table",
    name: "La Table de Kayes",
    category: "Restaurants" as Category,
    city: "Kayes" as City,
    address: "Centre-ville, Kayes",
    description: "Poisson braisé, riz au gras et accueil chaleureux au bord du fleuve.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
    rating: 4.5,
    reviews: 132,
    distance: "1,9 km",
    open: true,
    hours: "Ouvert · jusqu’à 22 h",
    price: "7 500 – 15 000 FCFA",
    tag: "Local",
    x: 48,
    y: 46,
  },
];

const cityMood: Record<City, { temp: string; sky: string; note: string }> = {
  Bamako: { temp: "34 °C", sky: "Ciel dégagé", note: "Bonne journée pour une terrasse à l’ombre." },
  Ségou: { temp: "35 °C", sky: "Ensoleillé", note: "Le fleuve est magnifique en fin de journée." },
  Mopti: { temp: "33 °C", sky: "Vent léger", note: "Idéal pour une balade au port." },
  Sikasso: { temp: "31 °C", sky: "Quelques nuages", note: "Les jardins sont frais cet après-midi." },
  Kayes: { temp: "38 °C", sky: "Très chaud", note: "Privilégiez les sorties après 18 h." },
};

export default function LocalPage() {
  const { state, showToast } = useApp();
  const [city, setCity] = useState<City>("Bamako");
  const [category, setCategory] = useState<Category>("Tout");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("place-baobab");
  const [saved, setSaved] = useState<string[]>(["place-baobab"]);

  const mood = cityMood[city];

  const filtered = useMemo(() => {
    const term = searchNormalize(query);
    return places.filter(
      (place) =>
        place.city === city &&
        (category === "Tout" || place.category === category) &&
        (!term ||
          searchNormalize(place.name).includes(term) ||
          searchNormalize(place.address).includes(term) ||
          searchNormalize(place.description).includes(term)),
    );
  }, [category, city, query]);

  const active = places.find((place) => place.id === activeId) ?? filtered[0] ?? places[0];
  const cityPlaces = places.filter((place) => place.city === city);
  const nearbyEvents = state.events.slice(0, 3);
  const nearbyListings = state.listings.filter((listing) => listing.location.includes(city)).slice(0, 3);
  const localPages = state.pages.slice(0, 3);
  const featured = filtered[0] ?? cityPlaces[0];

  const toggleSaved = (id: string) => {
    setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    showToast(saved.includes(id) ? "Lieu retiré de vos favoris." : "Lieu enregistré dans vos favoris.", "info");
  };

  const selectCity = (next: City) => {
    setCity(next);
    const first = places.find((place) => place.city === next);
    if (first) setActiveId(first.id);
    showToast(`Exploration de ${next} activée.`, "info");
  };

  return (
    <div>
      <PageIntro
        eyebrow="Autour de vous"
        title="Local & Explorer"
        description="Les bonnes adresses, les événements et les talents qui font vivre votre ville — de Bamako à Kayes."
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[9px] font-semibold text-muted sm:inline-flex">
              <Sun className="size-3 text-[color:var(--color-gold)]" />
              {mood.temp} · {city}
            </span>
            <Button size="sm" onClick={() => showToast("Ajout d’un lieu bientôt disponible dans la démo.", "info")}>
              <Plus className="size-3.5" />
              Ajouter un lieu
            </Button>
          </div>
        }
      />

      <Card className="mb-3 overflow-hidden">
        <div className="relative h-[264px] overflow-hidden bg-[#e9ecda] sm:h-[300px]">
          {/* Stylized map */}
          <svg viewBox="0 0 700 300" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="local-map-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eef0df" />
                <stop offset="100%" stopColor="#e1e5cf" />
              </linearGradient>
            </defs>
            <rect width="700" height="300" fill="url(#local-map-bg)" />
            <path d="M-40 245 C 90 190, 180 260, 280 220 S 470 150, 560 185 S 680 230, 760 195" fill="none" stroke="#c9dce5" strokeWidth="34" strokeLinecap="round" />
            <path d="M-40 245 C 90 190, 180 260, 280 220 S 470 150, 560 185 S 680 230, 760 195" fill="none" stroke="#dfeaf0" strokeWidth="20" strokeLinecap="round" />
            <g stroke="#d4d7bd" strokeWidth="5" strokeLinecap="round">
              <path d="M90 0 40 300" />
              <path d="M210 0 260 300" />
              <path d="M370 0 330 300" />
              <path d="M520 0 560 300" />
              <path d="M650 0 690 300" />
              <path d="M0 80 700 110" />
              <path d="M0 165 700 140" />
              <path d="M0 260 700 230" />
            </g>
            <g fill="#dfe2ca" opacity="0.8">
              <rect x="104" y="96" width="58" height="34" rx="5" />
              <rect x="180" y="122" width="42" height="26" rx="5" />
              <rect x="286" y="88" width="54" height="32" rx="5" />
              <rect x="402" y="152" width="46" height="28" rx="5" />
              <rect x="468" y="94" width="38" height="24" rx="5" />
              <rect x="558" y="132" width="52" height="30" rx="5" />
              <rect x="206" y="186" width="44" height="28" rx="5" />
              <rect x="590" y="204" width="50" height="26" rx="5" />
            </g>
            <g fill="#c7cfaf" opacity="0.7">
              <circle cx="142" cy="220" r="13" />
              <circle cx="442" cy="48" r="16" />
              <circle cx="338" cy="248" r="11" />
            </g>
            <path d="M0 80 700 110" stroke="#fffefa" strokeWidth="1.4" opacity="0.7" />
            <path d="M210 0 260 300" stroke="#fffefa" strokeWidth="1.4" opacity="0.7" />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {cities.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectCity(option)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[8.5px] font-semibold backdrop-blur transition",
                  city === option
                    ? "border-brand bg-brand text-white shadow-sm"
                    : "border-white/60 bg-white/75 text-ink-soft hover:bg-white",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/80 px-2.5 py-1 text-[8px] font-semibold text-ink-soft backdrop-blur">
            <Compass className="size-3 text-brand" />
            Carte interactive
          </span>

          {(filtered.length > 0 ? filtered : cityPlaces).slice(0, 5).map((place, index) => {
            const isActive = place.id === active.id;
            const Icon = categories.find((item) => item.id === place.category)?.icon ?? MapPin;
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => setActiveId(place.id)}
                aria-label={`Voir ${place.name} sur la carte`}
                className={cn(
                  "absolute z-10 -translate-x-1/2 -translate-y-full transition duration-300",
                  isActive ? "scale-110" : "hover:scale-105",
                )}
                style={{
                  left: `${place.x}%`,
                  top: `${place.y + (index % 2 === 0 ? 0 : 3)}%`,
                }}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full border-2 border-white shadow-float transition",
                    isActive ? "bg-brand text-white" : "bg-surface text-brand",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className={cn("mx-auto block h-2 w-2 -translate-y-1 rotate-45 border-b-2 border-r-2 border-white", isActive ? "bg-brand" : "bg-surface")} />
                {isActive && (
                  <span className="absolute left-1/2 top-[calc(100%+5px)] w-max max-w-[150px] -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[8px] font-semibold text-surface shadow-float">
                    {place.name}
                  </span>
                )}
              </button>
            );
          })}

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
            {active && (
              <div className="flex max-w-[320px] items-center gap-2 rounded-2xl border border-white/40 bg-surface/95 p-2 shadow-float backdrop-blur">
                <Photo src={active.image} alt={active.name} className="size-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold text-ink">{active.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[8px] text-muted">
                    <Star className="size-2.5 fill-[color:var(--color-gold)] text-[color:var(--color-gold)]" />
                    {active.rating.toLocaleString("fr-FR")} · {active.category} · {active.distance}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast(`Itinéraire vers ${active.name} lancé (simulation).`, "info")}
                  aria-label={`Itinéraire vers ${active.name}`}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:brightness-110"
                >
                  <Navigation className="size-3.5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => showToast(`Vous êtes autour de ${city}. Position simulée.`, "info")}
              className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-white/50 bg-surface/90 px-2.5 text-[8.5px] font-semibold text-ink-soft shadow-card backdrop-blur transition hover:bg-surface"
            >
              <LocateFixed className="size-3" />
              Ma position
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2">
          <p className="text-[8.5px] text-muted">
            <strong className="font-semibold text-ink">{cityPlaces.length} adresses</strong> à {city} · {cityMood[city].sky} · {mood.note}
          </p>
          <div className="flex items-center gap-2 text-[8px] font-semibold text-brand">
            <span className="inline-flex items-center gap-1"><Ticket className="size-3" />{nearbyEvents.length} événements</span>
            <span className="inline-flex items-center gap-1"><Users className="size-3" />{formatCount(1240)} membres actifs</span>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {categories.map((item) => (
            <Chip key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>
              <item.icon className="size-3" />
              {item.id}
            </Chip>
          ))}
        </div>
        <div className="relative w-full sm:w-[190px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Un lieu, une adresse…"
            aria-label="Rechercher un lieu"
            className={cn(fieldClass, "h-9 rounded-full pl-8 text-[10.5px]")}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-2 flex items-end justify-between gap-2 px-1">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Adresses recommandées</p>
          <h2 className="mt-0.5 font-display text-[18px] font-semibold tracking-[-0.035em] text-ink">
            À découvrir à {city}
          </h2>
        </div>
        <Link to="/pages" className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
          Toutes les pages <ChevronRight className="size-2.5" />
        </Link>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((place) => (
            <Card key={place.id} hover className="group overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Photo src={place.image} alt={place.name} className="size-full" imgClassName="transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
                <span className={cn(
                  "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em] backdrop-blur",
                  place.open ? "bg-white/90 text-brand-ink" : "bg-black/45 text-white",
                )}>
                  {place.open ? "Ouvert" : "Fermé"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSaved(place.id)}
                  aria-label={saved.includes(place.id) ? `Retirer ${place.name} des favoris` : `Enregistrer ${place.name}`}
                  className={cn(
                    "absolute right-2 top-2 grid size-7 place-items-center rounded-full border border-white/40 backdrop-blur transition",
                    saved.includes(place.id) ? "bg-white text-[color:var(--color-mali-red)]" : "bg-black/25 text-white hover:bg-black/40",
                  )}
                >
                  <Heart className="size-3.5" fill={saved.includes(place.id) ? "currentColor" : "none"} />
                </button>
                <span className="absolute bottom-2 left-2 rounded-full bg-black/30 px-2 py-0.5 text-[7.5px] font-semibold text-white backdrop-blur">
                  {place.tag}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[13px] font-semibold tracking-[-0.02em] text-ink">{place.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-[8.5px] text-muted">
                      <MapPin className="size-2.5" />
                      {place.address}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[9px] font-semibold text-ink">
                    <Star className="size-3 fill-[color:var(--color-gold)] text-[color:var(--color-gold)]" />
                    {place.rating.toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[9px] leading-relaxed text-ink-soft">{place.description}</p>
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                  <span className="inline-flex items-center gap-1 text-[8px] text-muted">
                    <Clock className="size-2.5" />
                    {place.hours}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(`Fiche de ${place.name} ouverte (simulation).`, "info")}
                    className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline"
                  >
                    Voir la fiche <ArrowUpRight className="size-2.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Search className="size-6" />}
            title="Aucune adresse trouvée"
            description={`Nous n’avons pas encore de lieu « ${query} » dans la catégorie ${category} à ${city}.`}
            action={
              <Button variant="secondary" onClick={() => { setQuery(""); setCategory("Tout"); }}>
                Réinitialiser les filtres
              </Button>
            }
          />
        </Card>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Agenda local</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Près de chez vous</h2>
            </div>
            <Link to="/evenements" className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</Link>
          </div>
          <div className="divide-y divide-line px-4 pb-2 pt-2">
            {nearbyEvents.map((event) => (
              <Link key={event.id} to={`/evenements/${event.id}`} className="flex items-center gap-2.5 py-2.5">
                <span className="grid h-11 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-muted text-center">
                  <span className="text-[13px] font-bold leading-none text-ink">{event.date.split(" ")[0]}</span>
                  <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-muted">{event.date.split(" ")[1]}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[10px] font-semibold text-ink">{event.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[8px] text-muted"><MapPin className="size-2.5" />{event.location}</span>
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Bonnes affaires</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Marketplace près de vous</h2>
            </div>
            <Link to="/marketplace" className="text-[8.5px] font-semibold text-brand hover:underline">Explorer</Link>
          </div>
          <div className="divide-y divide-line px-4 pb-2 pt-2">
            {(nearbyListings.length > 0 ? nearbyListings : state.listings.slice(0, 3)).map((listing) => (
              <Link key={listing.id} to={`/marketplace/${listing.id}`} className="flex items-center gap-2.5 py-2.5">
                <Photo src={listing.image} alt={listing.title} className="size-10 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[10px] font-semibold text-ink">{listing.title}</span>
                  <span className="mt-0.5 block text-[8.5px] font-semibold text-brand">{formatPrice(listing.price)}</span>
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-3 overflow-hidden p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Talents du coin</p>
            <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">Les pages qui font {city}</h2>
          </div>
          <Link to="/pages" className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-brand hover:underline">
            Annuaire <ChevronRight className="size-2.5" />
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {localPages.map((page) => (
            <Link key={page.id} to={`/pages/${page.id}`} className="group rounded-2xl border border-line p-2.5 transition hover:border-line-strong hover:bg-surface-muted/50">
              <Avatar name={page.name} src={page.cover} tone={page.tone} size="lg" shape="squircle" />
              <p className="mt-2 flex items-center gap-1 truncate text-[10px] font-semibold text-ink">
                {page.name}
                {page.verified && <VerifiedBadge className="size-3" />}
              </p>
              <p className="mt-0.5 truncate text-[8px] text-muted">{page.category} · {formatCount(page.followers)} abonnés</p>
              <p className="mt-1.5 inline-flex items-center gap-0.5 text-[7.5px] font-semibold text-brand">Voir la page <ArrowUpRight className="size-2.5" /></p>
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
        <Card className="relative overflow-hidden p-4">
          <div className="relative z-10 max-w-[330px]">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brand">
              <Sparkles className="size-3" />
              Propriétaires & créateurs
            </p>
            <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.035em] text-ink">
              Votre lieu mérite d’être vu.
            </h2>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Créez la page de votre restaurant, atelier ou boutique et touchez les habitants de votre ville.
            </p>
            <Button size="sm" className="mt-3" onClick={() => showToast("Formulaire de référencement ouvert (simulation).", "info")}>
              Référencer mon lieu
              <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <span className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full border border-brand/15" />
          <span className="pointer-events-none absolute -bottom-12 -right-2 size-32 rounded-full border border-brand/10" />
        </Card>

        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
            <Sun className="size-3 text-[color:var(--color-gold)]" />
            Météo & affluence
          </p>
          <p className="mt-2 font-display text-[28px] font-semibold leading-none tracking-[-0.05em] text-ink">{mood.temp}</p>
          <p className="mt-1 text-[9px] font-medium text-ink-soft">{mood.sky} · {city}</p>
          <div className="mt-3 space-y-2 border-t border-line pt-2.5">
            {[
              { hour: "10 h", level: 35 },
              { hour: "13 h", level: 78 },
              { hour: "17 h", level: 54 },
              { hour: "20 h", level: 86 },
            ].map((item) => (
              <div key={item.hour} className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-[8px] text-muted">{item.hour}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className={cn("block h-full rounded-full", item.level > 70 ? "bg-[color:var(--color-mali-yellow)]" : "bg-brand")}
                    style={{ width: `${item.level}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-[7.5px] font-semibold text-muted">{item.level}%</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[7.5px] text-muted">Affluence estimée dans les lieux publics.</p>
        </Card>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1"><DemoTag /> Lieux fictifs · Bamako, Mali</span>
        <span className="inline-flex items-center gap-1"><SlidersHorizontal className="size-3" />Données de fréquentation simulées</span>
      </div>
    </div>
  );
}
