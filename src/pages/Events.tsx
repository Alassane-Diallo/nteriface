import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  MapPin,
  Plus,
  Search,
  Share2,
  Sparkles,
  Ticket,
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
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { cn, formatCount } from "@/lib/utils";
import { useApp } from "@/store";
import type { EventItem } from "@/types";

const categories = ["Tout", "Communauté", "Concert", "Technologie", "Environnement", "Festival", "Gastronomie"] as const;

function EventDateBadge({ event }: { event: EventItem }) {
  const day = event.date.match(/\d+/)?.[0] ?? "31";
  const month = event.date.includes("nov")
    ? "NOV"
    : event.date.includes("déc")
      ? "DÉC"
      : "OCT";

  return (
    <span className="flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <span className="w-full bg-[color:var(--color-mali-red)] py-0.5 text-center text-[7.5px] font-bold uppercase tracking-[0.1em] text-white">
        {month}
      </span>
      <span className="py-1 font-display text-[16px] font-semibold leading-none text-ink">{day}</span>
    </span>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const { toggleGoing } = useApp();

  return (
    <article className="group overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <Link to={`/evenements/${event.id}`} className="block">
        <ArtCover art={event.art} className="h-[104px]" label={event.category}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[8.5px] font-semibold text-white/80">
            <CalendarDays className="size-2.5" />
            {event.date}
            {event.online && <><span className="mx-0.5">·</span><Globe className="size-2.5" /> En ligne</>}
          </span>
        </ArtCover>
      </Link>
      <div className="p-3">
        <div className="flex gap-2.5">
          <EventDateBadge event={event} />
          <div className="min-w-0 flex-1">
            <Link
              to={`/evenements/${event.id}`}
              className="line-clamp-2 text-[11.5px] font-semibold leading-snug text-ink transition hover:text-brand"
            >
              {event.title}
            </Link>
            <p className="mt-1 flex items-center gap-1 truncate text-[8.5px] text-muted">
              <Clock className="size-2.5 shrink-0" />
              {event.time}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[8.5px] text-muted">
              <MapPin className="size-2.5 shrink-0" />
              {event.location}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
          <span className="flex items-center gap-1 text-[8.5px] font-medium text-muted">
            <Users className="size-2.5" />
            {formatCount(event.attendees)} participants
          </span>
          <button
            type="button"
            onClick={() => toggleGoing(event.id)}
            className={cn(
              "h-7 rounded-full px-3 text-[9px] font-semibold transition",
              event.going
                ? "border border-brand/20 bg-brand-soft text-brand-ink"
                : "button-brand hover:brightness-105",
            )}
          >
            {event.going ? "Inscrit" : "Participer"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CreateEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createEvent } = useApp();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [location, setLocation] = useState("Bamako, Mali");
  const [category, setCategory] = useState("Communauté");
  const [description, setDescription] = useState("");
  const [online, setOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDate("");
      setTime("18:00");
      setLocation("Bamako, Mali");
      setCategory("Communauté");
      setDescription("");
      setOnline(false);
      setError(null);
    }
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Donnez un titre à votre événement.");
      return;
    }
    if (!date) {
      setError("Choisissez une date.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Ajoutez une courte description.");
      return;
    }
    const created = createEvent({
      title: title.trim(),
      date,
      time,
      location: online ? "En ligne · N’Teriface Live" : location.trim(),
      description: description.trim(),
      category,
      online,
    });
    onClose();
    navigate(`/evenements/${created.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Créer un événement"
      description="Rassemblez votre communauté autour d’une date, en ligne ou au Mali."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="create-event-form">
            <CalendarPlus className="size-3.5" />
            Créer l’événement
          </Button>
        </>
      }
    >
      <form id="create-event-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div>
          <label htmlFor="event-title" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Titre</label>
          <input
            id="event-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex. Atelier bogolan à Ségou"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="event-date" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Date</label>
            <input
              id="event-date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              placeholder="Sam. 7 novembre"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="event-time" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Heure</label>
            <input
              id="event-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="event-category" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Catégorie</label>
            <select
              id="event-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={fieldClass}
            >
              {categories.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="event-location" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Lieu</label>
            <input
              id="event-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              disabled={online}
              className={cn(fieldClass, online && "opacity-50")}
            />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-surface-muted/50 p-3">
          <input
            type="checkbox"
            checked={online}
            onChange={(event) => setOnline(event.target.checked)}
            className="size-4 accent-[color:var(--color-brand)]"
          />
          <span>
            <span className="block text-[10.5px] font-semibold text-ink">Événement en ligne</span>
            <span className="mt-0.5 block text-[9px] text-muted">Diffusé sur N’Teriface Live, sans déplacement.</span>
          </span>
        </label>
        <div>
          <label htmlFor="event-description" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Description</label>
          <textarea
            id="event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Programme, invités, accès…"
            className={cn(fieldClass, "h-auto resize-none py-2.5")}
          />
        </div>
        <InlineNotice tone="info">La billetterie et les rappels sont simulés dans cette démonstration.</InlineNotice>
      </form>
    </Modal>
  );
}

export default function EventsPage() {
  const { state } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scope, setScope] = useState<"upcoming" | "online" | "saved">("upcoming");
  const [category, setCategory] = useState<(typeof categories)[number]>("Tout");
  const [query, setQuery] = useState("");
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

  const events = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.events.filter((event) => {
      const matchesScope =
        scope === "upcoming" ||
        (scope === "online" && event.online) ||
        (scope === "saved" && state.savedEventIds.includes(event.id));
      const matchesCategory = category === "Tout" || event.category === category;
      const matchesQuery =
        !normalized ||
        event.title.toLowerCase().includes(normalized) ||
        event.location.toLowerCase().includes(normalized);
      return matchesScope && matchesCategory && matchesQuery;
    });
  }, [category, query, scope, state.events, state.savedEventIds]);

  const featured = state.events[0];

  return (
    <div>
      <PageIntro
        eyebrow="Agenda malien"
        title="Événements"
        description="Concerts, ateliers, rencontres et sorties. Ce qui rassemble le Mali, près de chez vous."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Créer un événement
          </Button>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <ArtCover art={featured.art} className="relative h-[230px] sm:h-[270px]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,24,16,0.86)_0%,rgba(8,24,16,0.28)_66%,rgba(8,24,16,0.1)_100%)]" />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                <Sparkles className="size-3 text-[color:var(--color-mali-yellow)]" />
                À la une cette semaine
              </span>
              <span className="rounded-full bg-black/25 px-2.5 py-1 text-[8.5px] font-semibold text-white/85 backdrop-blur">
                {featured.price}
              </span>
            </div>
            <div className="max-w-[440px]">
              <h2 className="font-display text-[26px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[32px]">
                {featured.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-white/75">
                <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />{featured.fullDate}</span>
                <span className="inline-flex items-center gap-1"><Clock className="size-3" />{featured.time}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{featured.location}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  to={`/evenements/${featured.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[10.5px] font-semibold text-ink transition hover:bg-white/90"
                >
                  Voir l’événement
                  <ArrowLeft className="size-3 rotate-180" />
                </Link>
                <span className="inline-flex items-center gap-1.5 text-[9.5px] font-medium text-white/70">
                  <Users className="size-3" />
                  {formatCount(featured.attendees)} participants
                </span>
              </div>
            </div>
          </div>
        </ArtCover>
      </Card>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-1.5">
          <Chip active={scope === "upcoming"} onClick={() => setScope("upcoming")}>À venir</Chip>
          <Chip active={scope === "online"} onClick={() => setScope("online")}>
            <Globe className="size-3" />
            En ligne
          </Chip>
          <Chip active={scope === "saved"} onClick={() => setScope("saved")}>
            <Bookmark className="size-3" />
            Enregistrés
          </Chip>
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un événement…"
            aria-label="Rechercher un événement"
            className={cn(fieldClass, "h-10 pl-9 text-[11px]")}
          />
        </div>
      </div>

      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
        {categories.map((item) => (
          <Chip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</Chip>
        ))}
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="Aucun événement dans cette sélection"
            description="Changez de filtre, explorez une autre catégorie ou créez votre propre événement."
            action={<Button onClick={() => setCreateOpen(true)}>Créer un événement</Button>}
          />
        </Card>
      )}

      <Card className="mt-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-tone-red text-tone-red-ink">
              <Ticket className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-ink">Vos billets</p>
              <p className="mt-0.5 text-[9px] text-muted">Retrouvez vos réservations et rappels d’événements.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScope("saved")}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
          >
            Voir mes événements
            <ChevronRight className="size-3" />
          </button>
        </div>
      </Card>

      <CreateEventModal open={createOpen} onClose={closeCreate} />
    </div>
  );
}

type EventTab = "details" | "discussion" | "participants";

export function EventDetail() {
  const { eventId } = useParams();
  const { state, toggleGoing, toggleSavedEvent, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<EventTab>("details");
  const [interested, setInterested] = useState(false);

  const event = state.events.find((item) => item.id === eventId);

  if (!event) {
    return (
      <Card>
        <EmptyState
          icon={<CalendarDays className="size-6" />}
          title="Événement introuvable"
          description="Cet événement n’existe pas dans la démonstration ou a été annulé."
          action={<Button onClick={() => navigate("/evenements")}>Voir l’agenda</Button>}
        />
      </Card>
    );
  }

  const saved = state.savedEventIds.includes(event.id);
  const posts = state.posts.filter((post) => post.eventId === event.id);
  const attendees = ["Aminata Cissé", "Moussa Diarra", "Fatoumata Keïta", "Oumar Diallo", "Kadidia Sangaré", "Hawa Tall"];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link to="/evenements" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" />
          Tous les événements
        </Link>
        <DemoTag />
      </div>

      <Card className="overflow-hidden">
        <ArtCover art={event.art} className="relative h-[230px] sm:h-[280px]">
          <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[8.5px] font-semibold text-white backdrop-blur">
            {event.category}
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
            <h1 className="max-w-[500px] font-display text-[25px] font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-[32px]">
              {event.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-white/75">
              <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />{event.fullDate}</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-3" />{event.time}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{event.location}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex -space-x-2">
                {[0, 1, 2, 3].map((index) => (
                  <Avatar key={index} name={attendees[index]} tone={(["green", "river", "yellow", "indigo"] as const)[index]} size="sm" ring />
                ))}
              </span>
              <span className="text-[9.5px] font-medium text-white/70">
                {formatCount(event.attendees)} personnes participent
              </span>
            </div>
          </div>
        </ArtCover>

        <div className="flex flex-wrap items-center gap-2 p-3.5">
          <Button size="sm" onClick={() => toggleGoing(event.id)}>
            {event.going ? <Check className="size-3.5" /> : <CalendarPlus className="size-3.5" />}
            {event.going ? "Vous participez" : "Participer"}
          </Button>
          <Button
            size="sm"
            variant={interested ? "gold" : "secondary"}
            onClick={() => {
              setInterested((current) => !current);
              showToast(interested ? "Retiré de vos événements intéressants." : "Ajouté à vos événements intéressants.", "info");
            }}
          >
            <Heart className={cn("size-3.5", interested && "fill-current")} />
            {interested ? "Intéressé" : "Intéressé ?"}
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => showToast("Lien de l’événement copié.")}
              aria-label="Partager l’événement"
              className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <Share2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleSavedEvent(event.id)}
              aria-label={saved ? "Retirer des événements enregistrés" : "Enregistrer l’événement"}
              className={cn(
                "grid size-9 place-items-center rounded-full border transition",
                saved ? "border-brand/25 bg-brand-soft text-brand" : "border-line text-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex overflow-x-auto border-t border-line px-2">
          {[
            { id: "details" as const, label: "Détails" },
            { id: "discussion" as const, label: "Discussion", count: posts.length },
            { id: "participants" as const, label: "Participants", count: event.attendees },
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

      <div className="mt-3">
        {tab === "details" && (
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">À propos de l’événement</h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">{event.description}</p>
              <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-line bg-surface-muted/50 p-3">
                <Avatar name={event.host.name} src={event.host.avatar} tone={event.host.tone} size="md" shape="squircle" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-[10.5px] font-semibold text-ink">
                    Organisé par {event.host.name}
                    {event.host.verified && <VerifiedBadge className="size-2.5" />}
                  </p>
                  <p className="mt-0.5 text-[8.5px] text-muted">{event.host.subtitle ?? "Hôte"}</p>
                </div>
                <button type="button" onClick={() => showToast("Abonnement à l’hôte simulé.", "info")} className="text-[9.5px] font-semibold text-brand hover:underline">
                  Suivre
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <div>
                  <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">Tarif</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-ink">{event.price ?? "Gratuit"}</p>
                </div>
                <div>
                  <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">Accès</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-ink">{event.online ? "En ligne" : "Sur place"}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Card className="overflow-hidden">
                <ArtCover art="river" className="h-[120px]" label="Lieu">
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="grid size-10 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur">
                      <MapPin className="size-4" />
                    </span>
                  </div>
                </ArtCover>
                <div className="p-3">
                  <p className="text-[10.5px] font-semibold text-ink">{event.location}</p>
                  <p className="mt-1 text-[9px] leading-relaxed text-muted">
                    Retrouvez l’itinéraire et les informations d’accès dans la démo.
                  </p>
                  <button
                    type="button"
                    onClick={() => showToast("Itinéraire simulé vers le lieu de l’événement.", "info")}
                    className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-semibold text-brand hover:underline"
                  >
                    Voir l’itinéraire
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </Card>
              <Card className="p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink">
                  <Users className="size-3.5 text-brand" />
                  Qui participe ?
                </p>
                <div className="mt-2.5 space-y-2">
                  {attendees.slice(0, 4).map((name, index) => (
                    <div key={name} className="flex items-center gap-2">
                      <Avatar name={name} tone={(["green", "river", "yellow", "indigo"] as const)[index]} size="sm" />
                      <span className="truncate text-[9.5px] font-medium text-ink-soft">{name}</span>
                      <span className="ml-auto text-[8px] text-muted">Ami</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "discussion" && (
          <div className="space-y-3">
            <Card className="p-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="md" />
                <button
                  type="button"
                  onClick={() => showToast("Publiez depuis votre fil pour en parler à la communauté.", "info")}
                  className="flex-1 rounded-full border border-line bg-surface-muted px-3 py-2.5 text-left text-[10.5px] text-muted"
                >
                  Poser une question sur l’événement…
                </button>
              </div>
            </Card>
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <Card>
                <EmptyState
                  icon={<CalendarDays className="size-6" />}
                  title="Aucune discussion pour l’instant"
                  description="Soyez la première personne à partager une question ou une photo liée à cet événement."
                />
              </Card>
            )}
          </div>
        )}

        {tab === "participants" && (
          <Card className="p-4">
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">
              {formatCount(event.attendees)} participants
            </h2>
            <p className="mt-1 text-[9.5px] text-muted">{formatCount(event.interested)} personnes sont intéressées.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {attendees.map((name, index) => (
                <div key={name} className="flex items-center gap-2.5 rounded-2xl border border-line p-2.5">
                  <Avatar name={name} tone={(["green", "river", "yellow", "indigo", "clay", "red"] as const)[index]} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-ink">{name}</p>
                    <p className="mt-0.5 text-[8.5px] text-muted">{index < 2 ? "Participe" : "Intéressé·e"}</p>
                  </div>
                  <button type="button" onClick={() => showToast(`Message à ${name} (simulation).`, "info")} className="text-[9px] font-semibold text-brand hover:underline">
                    Message
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
