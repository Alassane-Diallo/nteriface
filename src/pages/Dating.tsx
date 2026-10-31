import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  BadgeCheck,
  Cake,
  Camera,
  Check,
  ChevronRight,
  CircleAlert,
  Coffee,
  Crown,
  Eye,
  EyeOff,
  Heart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Music2,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import {
  Avatar,
  Button,
  Card,
  Chip,
  DemoTag,
  Field,
  InlineNotice,
  Modal,
  Photo,
  ProgressBar,
  SegmentedTabs,
  Switch,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { people } from "@/data";
import { cn, formatCount, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";
import type { Person } from "@/types";

type DatingTab = "discover" | "matches" | "profile";

interface DatingProfile {
  id: string;
  name: string;
  age: number;
  role: string;
  bio: string;
  image: string;
  interests: string[];
  distance: number;
  mutual: number;
  verified?: boolean;
  online?: boolean;
}

const interestCatalog = [
  "Photographie",
  "Voyages",
  "Cuisine",
  "Musique",
  "Lecture",
  "Sport",
  "Artisanat",
  "Cinéma",
  "Danse",
  "Randonnée",
  "Mode",
  "Tech",
];

const baseProfiles: DatingProfile[] = [
  {
    id: "dating-1",
    name: "Mariam",
    age: 28,
    role: "Architecte · Bamako",
    bio: "Passionnée de photo, de thé et de longues discussions au bord du fleuve. Je cherche quelqu’un de curieux, qui aime rire et découvrir les petites adresses de Bamako.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=82",
    interests: ["Photographie", "Voyages", "Cuisine"],
    distance: 3,
    mutual: 4,
    verified: true,
    online: true,
  },
  {
    id: "dating-2",
    name: "Ibrahim",
    age: 31,
    role: "Chef de projet · Bamako",
    bio: "Je cuisine mieux que je ne danse. Amateur de musique malienne et de randonnées à Bandiagara. Mon dimanche idéal : un marché, un concert, un bon repas partagé.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=82",
    interests: ["Randonnée", "Musique", "Cuisine"],
    distance: 5,
    mutual: 2,
    online: false,
  },
  {
    id: "dating-3",
    name: "Aïssata",
    age: 26,
    role: "Médecine · Bamako",
    bio: "Beaucoup de livres, un peu de course à pied, et toujours une playlist prête. Dis-moi ton morceau préféré : c’est une bonne façon de commencer.",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=82",
    interests: ["Lecture", "Sport", "Musique"],
    distance: 2,
    mutual: 7,
    verified: true,
    online: true,
  },
  {
    id: "dating-4",
    name: "Hawa",
    age: 29,
    role: "Designer textile · Ségou",
    bio: "Je dessine des motifs inspirés du bogolan et je crois aux rencontres simples. Un café, une expo, une balade : les meilleures choses commencent petit.",
    image: people[13].avatar ?? "",
    interests: ["Mode", "Artisanat", "Cinéma"],
    distance: 7,
    mutual: 9,
    online: true,
  },
  {
    id: "dating-5",
    name: "Lassana",
    age: 33,
    role: "Ingénieur · Bamako",
    bio: "Geek assumé, grand amateur de thé et de discussions qui durent. Je cherche une complicité sincère, pas une performance.",
    image: people[9].avatar ?? "",
    interests: ["Tech", "Voyages", "Cuisine"],
    distance: 4,
    mutual: 5,
    verified: true,
    online: false,
  },
  {
    id: "dating-6",
    name: "Djénéba",
    age: 27,
    role: "Journaliste culture · Bamako",
    bio: "Je raconte les artistes du Sahel. Curieuse de tout, surtout des gens qui ne ressemblent pas à leur photo de profil.",
    image: people[12].avatar ?? "",
    interests: ["Musique", "Lecture", "Danse"],
    distance: 6,
    mutual: 3,
    online: true,
  },
];

const safetyTips = [
  { title: "Premier rendez-vous public", text: "Choisissez un lieu fréquenté, comme un café ou un restaurant que vous connaissez." },
  { title: "Prévenez un proche", text: "Partagez le lieu et l’heure avec une personne de confiance." },
  { title: "Prenez votre temps", text: "Aucune pression : la meilleure connexion est celle qui se construit." },
];

function profileName(profile: DatingProfile) {
  return `${profile.name}, ${profile.age}`;
}

function toPerson(profile: DatingProfile): Person {
  return {
    id: profile.id,
    name: profile.name,
    username: `${searchNormalize(profile.name).replace(/\s+/g, ".")}.rencontre`,
    avatar: profile.image,
    tone: "red",
    verified: profile.verified,
    bio: profile.bio,
    location: profile.role.split("·")[1]?.trim() ?? "Bamako, Mali",
    followers: 120 + profile.mutual * 12,
    following: 98,
    online: profile.online,
  };
}

function FilterModal({
  open,
  onClose,
  distance,
  ageMin,
  ageMax,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  distance: number;
  ageMin: number;
  ageMax: number;
  onApply: (values: { distance: number; ageMin: number; ageMax: number }) => void;
}) {
  const [nextDistance, setNextDistance] = useState(distance);
  const [nextMin, setNextMin] = useState(ageMin);
  const [nextMax, setNextMax] = useState(ageMax);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Affiner mes rencontres"
      description="Ces préférences restent privées et modifiables à tout moment."
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button
            size="sm"
            onClick={() => {
              onApply({ distance: nextDistance, ageMin: nextMin, ageMax: nextMax });
              onClose();
            }}
          >
            Appliquer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-soft">Distance maximale</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-bold text-brand-ink">{nextDistance} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={nextDistance}
            onChange={(event) => setNextDistance(Number(event.target.value))}
            className="w-full accent-[color:var(--color-brand)]"
            aria-label="Distance maximale en kilomètres"
          />
          <div className="flex justify-between text-[8px] text-muted"><span>1 km</span><span>50 km</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Âge minimum">
            <select value={nextMin} onChange={(event) => setNextMin(Number(event.target.value))} className={fieldClass}>
              {Array.from({ length: 34 }, (_, index) => index + 18).map((age) => (
                <option key={age} value={age}>{age} ans</option>
              ))}
            </select>
          </Field>
          <Field label="Âge maximum">
            <select value={nextMax} onChange={(event) => setNextMax(Number(event.target.value))} className={fieldClass}>
              {Array.from({ length: 47 }, (_, index) => index + 24).map((age) => (
                <option key={age} value={age}>{age} ans</option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Je recherche</span>
          <div className="flex flex-wrap gap-1.5">
            {["Une relation sérieuse", "Des rencontres", "De nouvelles amitiés"].map((label, index) => (
              <Chip key={label} active={index === 0}>{label}</Chip>
            ))}
          </div>
        </div>
        <InlineNotice tone="info">
          N’Teriface ne partage jamais votre position exacte. Seule une distance approximative est affichée.
        </InlineNotice>
      </div>
    </Modal>
  );
}

function MatchModal({
  profile,
  onClose,
  onMessage,
  onContinue,
}: {
  profile: DatingProfile | null;
  onClose: () => void;
  onMessage: (profile: DatingProfile) => void;
  onContinue: () => void;
}) {
  if (!profile) return null;
  return (
    <Modal open={Boolean(profile)} onClose={onClose} size="sm" hideClose>
      <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#0b7a45,#075c35)] px-5 py-7 text-center text-white">
        <span className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full border border-white/10" />
        <span className="pointer-events-none absolute -bottom-16 -right-10 size-48 rounded-full border border-white/10" />
        <span className="relative mx-auto grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur">
          <HeartHandshake className="size-6 text-[color:var(--color-mali-yellow)]" />
        </span>
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">C’est un match</p>
        <h2 className="mt-1 font-display text-[25px] font-semibold tracking-[-0.045em]">Vous vous êtes plu·es !</h2>
        <p className="mx-auto mt-1.5 max-w-[250px] text-[10px] leading-relaxed text-white/75">
          {profile.name} a aussi aimé votre profil. À vous d’écrire la suite.
        </p>
        <div className="mt-5 flex items-center justify-center">
          <Avatar name="Awa Traoré" size="3xl" className="translate-x-3 rotate-[-6deg] border-4 border-white/80" src={people[0].avatar} tone="green" />
          <span className="z-10 -mx-1 grid size-8 place-items-center rounded-full border-2 border-white bg-[color:var(--color-mali-red)] text-white">
            <Heart className="size-4" fill="currentColor" />
          </span>
          <Avatar name={profile.name} src={profile.image} size="3xl" className="-translate-x-3 rotate-[6deg] border-4 border-white/80" tone="red" />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onMessage(profile)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-[11.5px] font-semibold text-brand-ink transition hover:bg-cream"
          >
            <MessageCircle className="size-4" />
            Envoyer un message
          </button>
          <button type="button" onClick={onContinue} className="inline-flex h-9 items-center justify-center rounded-full border border-white/25 px-4 text-[10.5px] font-semibold text-white/85 transition hover:bg-white/10">
            Continuer à explorer
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetailModal({
  profile,
  onClose,
  onLike,
  onPass,
}: {
  profile: DatingProfile | null;
  onClose: () => void;
  onLike: (profile: DatingProfile) => void;
  onPass: (profile: DatingProfile) => void;
}) {
  if (!profile) return null;
  return (
    <Modal open={Boolean(profile)} onClose={onClose} size="md" hideClose bodyClassName="p-0">
      <div className="relative aspect-[4/5] max-h-[62vh] w-full sm:aspect-[16/11]">
        <Photo src={profile.image} alt={profileName(profile)} className="size-full" eager />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50">
          <X className="size-4" />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/20 px-2 py-0.5 text-[8px] font-semibold backdrop-blur">
            <MapPin className="size-2.5" /> À {profile.distance} km
          </p>
          <h2 className="mt-2 flex items-center gap-1.5 font-display text-[24px] font-semibold tracking-[-0.04em]">
            {profileName(profile)}
            {profile.verified && <VerifiedBadge className="size-4" />}
          </h2>
          <p className="text-[10px] text-white/70">{profile.role}</p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-[11px] leading-relaxed text-ink-soft">{profile.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <span key={interest} className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[8.5px] font-semibold text-ink-soft">{interest}</span>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[9px] text-muted">
          <Users className="size-3" />
          {profile.mutual} ami·es en commun · profil de démonstration
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" variant="secondary" className="flex-1" onClick={() => { onPass(profile); onClose(); }}>
            <X className="size-3.5" />
            Passer
          </Button>
          <Button size="sm" className="flex-1" onClick={() => { onLike(profile); onClose(); }}>
            <Heart className="size-3.5" fill="currentColor" />
            J’aime
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditDatingProfileModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: { bio: string; city: string; age: number; interests: string[] };
  onSave: (value: { bio: string; city: string; age: number; interests: string[] }) => void;
}) {
  const [bio, setBio] = useState(initial.bio);
  const [city, setCity] = useState(initial.city);
  const [age, setAge] = useState(initial.age);
  const [interests, setInterests] = useState<string[]>(initial.interests);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest].slice(0, 6),
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mon profil Rencontres"
      description="Montrez qui vous êtes, sans masquer ce qui compte pour vous."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="dating-profile-form">Enregistrer</Button>
        </>
      }
    >
      <form
        id="dating-profile-form"
        className="space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          onSave({ bio: bio.trim(), city: city.trim(), age, interests });
          onClose();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Prénom affiché">
            <input value="Awa" readOnly className={cn(fieldClass, "opacity-70")} />
          </Field>
          <Field label="Âge">
            <input type="number" min={18} max={99} value={age} onChange={(event) => setAge(Number(event.target.value))} className={fieldClass} />
          </Field>
        </div>
        <Field label="Ville">
          <input value={city} onChange={(event) => setCity(event.target.value)} className={fieldClass} placeholder="Bamako, Mali" />
        </Field>
        <Field label="À propos de moi" hint={`${bio.length}/240 caractères`}>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value.slice(0, 240))}
            rows={4}
            className={cn(fieldClass, "h-auto resize-none py-2.5")}
            placeholder="Ce qui vous fait sourire, vos passions, ce que vous recherchez…"
          />
        </Field>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Mes centres d’intérêt</span>
          <div className="flex flex-wrap gap-1.5">
            {interestCatalog.map((interest) => (
              <Chip key={interest} active={interests.includes(interest)} onClick={() => toggleInterest(interest)}>
                {interests.includes(interest) && <Check className="size-2.5" />}
                {interest}
              </Chip>
            ))}
          </div>
          <p className="mt-1.5 text-[8.5px] text-muted">Choisissez jusqu’à 6 centres d’intérêt.</p>
        </div>
      </form>
    </Modal>
  );
}

function PremiumModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useApp();
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Rencontres Or" description="Plus de visibilité, plus de connexions sincères.">
      <div className="rounded-[22px] bg-[linear-gradient(150deg,#3a2b0c,#755600)] px-4 py-5 text-white">
        <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-[color:var(--color-mali-yellow)]">
          <Crown className="size-5" />
        </span>
        <p className="mt-3 font-display text-[32px] font-semibold leading-none tracking-[-0.05em]">4 900 <span className="font-sans text-[11px] font-medium tracking-normal text-white/60">FCFA / mois</span></p>
        <p className="mt-1 text-[9px] text-white/60">Sans engagement · résiliable à tout moment</p>
        <ul className="mt-4 space-y-2">
          {[
            "Voir qui a aimé votre profil",
            "Un Super Like chaque jour",
            "Votre profil mis en avant à Bamako",
            "Retour en arrière sur un choix",
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[10px] text-white/85">
              <Check className="mt-0.5 size-3.5 shrink-0 text-[color:var(--color-mali-yellow)]" />
              {feature}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => { showToast("Rencontres Or activé pour la démo. Aucun paiement effectué.", "info"); onClose(); }}
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-mali-yellow)] text-[11px] font-bold text-[#3a2b0c] transition hover:brightness-105"
        >
          <Sparkles className="size-3.5" />
          Essayer 7 jours gratuitement
        </button>
      </div>
      <p className="mt-3 text-center text-[8px] leading-relaxed text-muted">
        Démonstration : aucune donnée bancaire n’est demandée et aucun abonnement n’est créé.
      </p>
    </Modal>
  );
}

export default function DatingPage() {
  const { state, showToast, startConversation } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DatingTab>("discover");
  const [distance, setDistance] = useState(20);
  const [ageMin, setAgeMin] = useState(24);
  const [ageMax, setAgeMax] = useState(38);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [detail, setDetail] = useState<DatingProfile | null>(null);
  const [matched, setMatched] = useState<DatingProfile | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>(["dating-3"]);
  const [profileVisible, setProfileVisible] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [myProfile, setMyProfile] = useState({
    bio: "Créatrice, curieuse et toujours partante pour un bon thé. J’aime les marchés de Bamako, les projets qui ont du sens et les gens qui rient fort.",
    city: "Bamako, Mali",
    age: 27,
    interests: ["Artisanat", "Photographie", "Cuisine"],
  });

  const filtered = useMemo(
    () =>
      baseProfiles.filter(
        (profile) => profile.distance <= distance && profile.age >= ageMin && profile.age <= ageMax,
      ),
    [ageMax, ageMin, distance],
  );

  const queue = filtered.filter((profile) => !seen.includes(profile.id));
  const active = queue[0];
  const matchedProfiles = matches
    .map((id) => baseProfiles.find((profile) => profile.id === id))
    .filter((profile): profile is DatingProfile => Boolean(profile));

  const implementLike = (profile: DatingProfile) => {
    setSeen((current) => [...new Set([...current, profile.id])]);
    if (matches.length < 3) {
      setMatches((current) => [...new Set([...current, profile.id])]);
      setMatched(profile);
    } else {
      showToast(`Like envoyé à ${profile.name}. Croisons les doigts !`);
    }
  };

  const implementPass = (profile: DatingProfile) => {
    setSeen((current) => [...new Set([...current, profile.id])]);
    showToast("Profil passé. Vous pouvez revenir en arrière avec Rencontres Or.", "info");
  };

  const messageProfile = (profile: DatingProfile) => {
    const person = toPerson(profile);
    const id = startConversation(person);
    setMatched(null);
    navigate(`/messages?conv=${id}`);
  };

  const resetDeck = () => {
    setSeen([]);
    showToast("La sélection est réinitialisée.", "info");
  };

  const completion = 52 + (myProfile.bio.length > 80 ? 16 : 8) + (myProfile.interests.length >= 3 ? 16 : 8) + (profileVisible ? 8 : 0);

  return (
    <div>
      <PageIntro
        eyebrow="N’Teriface Rencontres"
        title="Rencontres"
        description="Des connexions sincères, à votre rythme. Découvrez des personnes qui partagent vos valeurs à Bamako et partout au Mali."
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[9px] font-semibold text-muted sm:inline-flex">
              <ShieldCheck className="size-3 text-brand" />
              Profils vérifiés
            </span>
            <Button size="sm" variant="gold" onClick={() => setPremiumOpen(true)}>
              <Crown className="size-3.5" />
              Rencontres Or
            </Button>
          </div>
        }
      />

      <div className="mb-3">
        <SegmentedTabs
          items={[
            { id: "discover", label: "Découvrir", icon: <Heart className="size-3.5" /> },
            { id: "matches", label: "Mes matchs", count: matches.length, icon: <HeartHandshake className="size-3.5" /> },
            { id: "profile", label: "Mon profil", icon: <UserIcon /> },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Sections de N’Teriface Rencontres"
        />
      </div>

      {tab === "discover" && (
        <div className="space-y-3">
          {active ? (
            <>
              <div className="grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
                <Card className="group overflow-hidden">
                  <div className="relative aspect-[4/5] w-full sm:aspect-[4/4.6]">
                    <Photo src={active.image} alt={profileName(active)} className="size-full" imgClassName="transition duration-700 group-hover:scale-[1.03]" eager />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10" />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[8px] font-semibold text-brand-ink backdrop-blur">
                        <Sparkles className="size-2.5" />
                        Profil du jour
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/25 px-2 py-1 text-[8px] font-medium text-white backdrop-blur">
                        <MapPin className="size-2.5" /> À {active.distance} km
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <h2 className="flex items-center gap-1.5 font-display text-[26px] font-semibold leading-none tracking-[-0.05em]">
                            {profileName(active)}
                            {active.verified && <VerifiedBadge className="size-4" />}
                          </h2>
                          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-white/75">
                            <BadgeCheck className="size-3" />
                            {active.role}
                          </p>
                        </div>
                        {active.online && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[7.5px] font-semibold text-white backdrop-blur">
                            <span className="size-1.5 rounded-full bg-mali-green" />
                            En ligne
                          </span>
                        )}
                      </div>
                      <p className="mt-2.5 line-clamp-3 text-[10px] leading-relaxed text-white/80">{active.bio}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {active.interests.map((interest) => (
                          <span key={interest} className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-medium text-white/85 backdrop-blur">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 border-t border-line px-4 py-3">
                    <button
                      type="button"
                      onClick={() => implementPass(active)}
                      aria-label={`Passer le profil de ${active.name}`}
                      className="grid size-12 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition hover:scale-105 hover:border-danger/30 hover:text-danger"
                    >
                      <X className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetail(active)}
                      aria-label="Voir le profil en entier"
                      className="grid size-9 place-items-center rounded-full border border-line bg-surface-muted text-muted transition hover:text-ink"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPremiumOpen(true)}
                      aria-label="Envoyer un Super Like"
                      className="grid size-9 place-items-center rounded-full border border-gold/25 bg-gold-soft text-[color:var(--color-gold)] transition hover:scale-105"
                    >
                      <Star className="size-4" fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      onClick={() => implementLike(active)}
                      aria-label={`Aimer le profil de ${active.name}`}
                      className="grid size-12 place-items-center rounded-full bg-[linear-gradient(145deg,var(--color-mali-red),#a50d1f)] text-white shadow-float transition hover:scale-105"
                    >
                      <Heart className="size-5" fill="currentColor" />
                    </button>
                  </div>
                </Card>

                <div className="space-y-3">
                  <Card className="p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Votre profil</p>
                      <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[8px] font-bold text-brand-ink">{completion}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="lg" online />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-ink">{state.me.name.split(" ")[0]}, {myProfile.age}</p>
                        <p className="mt-0.5 truncate text-[8px] text-muted">{myProfile.city}</p>
                      </div>
                    </div>
                    <ProgressBar value={completion} className="mt-2.5" />
                    <p className="mt-1.5 text-[8px] leading-relaxed text-muted">
                      {completion < 80 ? "Ajoutez une photo et complétez votre bio pour attirer plus de profils." : "Votre profil inspire confiance. Continuez à être vous-même."}
                    </p>
                    <button type="button" onClick={() => setEditOpen(true)} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-surface-muted py-2 text-[9px] font-semibold text-ink-soft transition hover:border-line-strong">
                      <Pencil className="size-3" />
                      Modifier mon profil
                    </button>
                  </Card>

                  <Card className="p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Ma sélection</p>
                      <button type="button" onClick={() => setFiltersOpen(true)} aria-label="Modifier les filtres" className="grid size-7 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink">
                        <SlidersHorizontal className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Chip active>{ageMin}–{ageMax} ans</Chip>
                      <Chip active>{distance} km</Chip>
                      <Chip active>Bamako</Chip>
                    </div>
                    <p className="mt-2.5 text-[8.5px] text-muted">
                      <strong className="font-semibold text-ink">{queue.length} profils</strong> correspondent à vos critères.
                    </p>
                    <button type="button" onClick={() => setFiltersOpen(true)} className="mt-2 text-[8.5px] font-semibold text-brand hover:underline">
                      Affiner ma recherche
                    </button>
                  </Card>

                  <Card className="p-3.5">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                      <ShieldCheck className="size-3 text-brand" />
                      Rencontres sereines
                    </p>
                    <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">
                      Choisissez un lieu public pour le premier rendez-vous et prévenez un proche. Votre sécurité passe avant tout.
                    </p>
                    <button type="button" onClick={() => showToast("Les conseils de sécurité ont été ajoutés à vos favoris.", "info")} className="mt-2 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                      Lire les conseils <ChevronRight className="size-2.5" />
                    </button>
                  </Card>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Card className="flex items-center gap-3 p-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-red text-tone-red-ink">
                    <HeartHandshake className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold text-ink">{matches.length} matchs</p>
                    <p className="mt-0.5 text-[8.5px] text-muted">Des personnes qui ont aussi aimé votre profil.</p>
                  </div>
                  <button type="button" onClick={() => setTab("matches")} className="text-[8.5px] font-semibold text-brand hover:underline">Voir</button>
                </Card>
                <Card className="flex items-center gap-3 p-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold text-ink">Votre profil gagne en visibilité</p>
                    <p className="mt-0.5 text-[8.5px] text-muted">+{formatCount(38)} vues cette semaine.</p>
                  </div>
                  <button type="button" onClick={() => setPremiumOpen(true)} className="text-[8.5px] font-semibold text-brand hover:underline">Boost</button>
                </Card>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between px-1">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Encore soif de découvertes</p>
                    <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">D’autres profils près de vous</h2>
                  </div>
                  <span className="text-[8.5px] text-muted">{queue.length} restants</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {queue.slice(1, 3).map((profile) => (
                    <button key={profile.id} type="button" onClick={() => setDetail(profile)} className="group relative overflow-hidden rounded-[22px] border border-line bg-surface text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-float">
                      <div className="relative aspect-[4/5]">
                        <Photo src={profile.image} alt={profileName(profile)} className="size-full" imgClassName="transition duration-500 group-hover:scale-105" />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/5" />
                        <span className="absolute inset-x-2.5 bottom-2.5 text-white">
                          <span className="flex items-center gap-1 text-[11px] font-semibold">
                            {profileName(profile)}
                            {profile.verified && <VerifiedBadge className="size-3" />}
                          </span>
                          <span className="mt-0.5 block truncate text-[8px] text-white/65">{profile.role}</span>
                        </span>
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[7px] font-bold text-brand-ink backdrop-blur">
                          <MapPin className="size-2" /> {profile.distance} km
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Card>
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-[20px] bg-tone-red text-tone-red-ink">
                  <HeartHandshake className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">Vous avez vu tous les profils</h2>
                <p className="mt-1 max-w-[300px] text-[10px] leading-relaxed text-muted">
                  Élargissez vos critères pour découvrir d’autres personnes, ou revenez plus tard : de nouveaux profils arrivent chaque jour.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
                    <SlidersHorizontal className="size-3.5" />
                    Élargir mes critères
                  </Button>
                  <Button onClick={resetDeck}>
                    <RotateCcw className="size-3.5" />
                    Recommencer
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="grid gap-0 sm:grid-cols-[1.35fr_0.65fr]">
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-gold)]">
                  <Crown className="size-3" />
                  Rencontres Or
                </p>
                <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.035em] text-ink">
                  Et si vous voyiez qui vous aime ?
                </h2>
                <p className="mt-1 max-w-md text-[10px] leading-relaxed text-muted">
                  Débloquez les likes reçus, envoyez un Super Like chaque jour et donnez à votre profil une visibilité supplémentaire à Bamako.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="gold" onClick={() => setPremiumOpen(true)}>
                    <Sparkles className="size-3.5" />
                    Découvrir Or
                  </Button>
                  <span className="text-[8.5px] font-semibold text-muted">4 900 FCFA / mois</span>
                </div>
              </div>
              <div className="relative hidden items-center justify-center bg-[linear-gradient(150deg,#3a2b0c,#755600)] text-white sm:flex">
                <div className="text-center">
                  <Crown className="mx-auto size-6 text-[color:var(--color-mali-yellow)]" />
                  <p className="mt-2 font-display text-[22px] font-semibold leading-none">{formatCount(24)}</p>
                  <p className="mt-1 text-[7.5px] uppercase tracking-[0.16em] text-white/55">likes à découvrir</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {safetyTips.map((tip) => (
              <Card key={tip.title} className="p-3">
                <ShieldCheck className="size-4 text-brand" />
                <p className="mt-2 text-[10px] font-semibold text-ink">{tip.title}</p>
                <p className="mt-1 text-[8.5px] leading-relaxed text-muted">{tip.text}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "matches" && (
        <div className="space-y-3">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-tone-red text-tone-red-ink">
                <HeartHandshake className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">{matches.length} matchs</h2>
                <p className="mt-0.5 text-[9px] text-muted">Vos connexions mutuelles, à faire grandir.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setTab("discover")}>
              <Heart className="size-3.5" />
              Découvrir des profils
            </Button>
          </Card>

          {matchedProfiles.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {matchedProfiles.map((profile) => (
                <Card key={profile.id} hover className="overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <Photo src={profile.image} alt={profileName(profile)} className="size-full" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute left-2 top-2 rounded-full bg-[color:var(--color-mali-red)] px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-white">
                      Nouveau match
                    </span>
                    <div className="absolute inset-x-3 bottom-2.5 text-white">
                      <p className="flex items-center gap-1 text-[13px] font-semibold">
                        {profileName(profile)}
                        {profile.verified && <VerifiedBadge className="size-3" />}
                      </p>
                      <p className="mt-0.5 text-[8px] text-white/65">{profile.role}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-[9px] leading-relaxed text-ink-soft">{profile.bio}</p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <Button size="sm" className="flex-1" onClick={() => messageProfile(profile)}>
                        <MessageCircle className="size-3.5" />
                        Envoyer un message
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDetail(profile)}
                        aria-label={`Voir le profil de ${profile.name}`}
                        className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:bg-surface-muted hover:text-ink"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-[20px] bg-tone-red text-tone-red-ink">
                  <Heart className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">Pas encore de match</h2>
                <p className="mt-1 max-w-[280px] text-[10px] leading-relaxed text-muted">
                  Aimez des profils qui vous ressemblent : quand l’intérêt est réciproque, la conversation peut commencer.
                </p>
                <Button className="mt-4" onClick={() => setTab("discover")}>Découvrir des profils</Button>
              </div>
            </Card>
          )}

          <InlineNotice tone="info">
            Un match n’est pas une obligation. Prenez le temps de discuter et d’écouter votre intuition.
          </InlineNotice>
        </div>
      )}

      {tab === "profile" && (
        <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            <Card className="overflow-hidden">
              <div className="sahel-art relative h-[110px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button type="button" onClick={() => showToast("Changement de photo de couverture simulé.", "info")} className="absolute right-2 top-2 inline-flex h-7 items-center gap-1 rounded-full border border-white/30 bg-black/20 px-2.5 text-[8px] font-semibold text-white backdrop-blur">
                  <Camera className="size-3" />
                  Modifier
                </button>
              </div>
              <div className="relative px-4 pb-4">
                <span className="-mt-9 mb-2 inline-block rounded-full border-4 border-surface bg-surface shadow-card">
                  <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="3xl" online />
                </span>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="flex items-center gap-1.5 font-display text-[19px] font-semibold tracking-[-0.035em] text-ink">
                      {state.me.name.split(" ")[0]}, {myProfile.age}
                      <VerifiedBadge className="size-3.5" />
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted"><MapPin className="size-2.5" />{myProfile.city} · à 2 km</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                </div>
                <p className="mt-2.5 text-[10px] leading-relaxed text-ink-soft">{myProfile.bio}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {myProfile.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[8px] font-semibold text-ink-soft">{interest}</span>
                  ))}
                </div>
              </div>
              <div className="border-t border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Complétude du profil</span>
                  <span className="text-[9px] font-bold text-brand">{completion}%</span>
                </div>
                <ProgressBar value={completion} className="mt-2" />
                <div className="mt-2.5 space-y-1.5">
                  {[
                    { label: "Photo de profil", done: true },
                    { label: "Bio de 80 caractères", done: myProfile.bio.length > 80 },
                    { label: "Au moins 3 centres d’intérêt", done: myProfile.interests.length >= 3 },
                    { label: "Profil visible", done: profileVisible },
                  ].map((item) => (
                    <p key={item.label} className="flex items-center gap-1.5 text-[8.5px] text-muted">
                      <span className={cn("grid size-3.5 place-items-center rounded-full", item.done ? "bg-brand text-white" : "border border-line bg-surface-muted text-muted")}>
                        {item.done && <Check className="size-2.5" />}
                      </span>
                      {item.label}
                    </p>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand">Photos</p>
                  <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Votre galerie</h2>
                </div>
                <button type="button" onClick={() => showToast("Ajout de photo simulé — 6 photos maximum.", "info")} className="grid size-8 place-items-center rounded-full border border-dashed border-line-strong text-muted transition hover:border-brand/40 hover:text-brand">
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {[state.me.avatar, ...baseProfiles.slice(0, 2).map((profile) => profile.image)].map((image, index) => (
                  <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl">
                    <Photo src={image} alt={`Photo ${index + 1} du profil`} className="size-full" />
                    {index === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-black/40 px-1.5 py-0.5 text-[7px] font-semibold text-white backdrop-blur">Principale</span>}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[8px] text-muted">Des photos authentiques et récentes inspirent confiance.</p>
            </Card>
          </div>

          <div className="space-y-3">
            <Card className="p-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Visibilité</p>
              <div className="mt-1.5">
                <Switch
                  checked={profileVisible}
                  onChange={(value) => {
                    setProfileVisible(value);
                    showToast(value ? "Votre profil est visible dans Rencontres." : "Votre profil est masqué. Vous pouvez continuer à explorer.", "info");
                  }}
                  label="Afficher mon profil"
                  description="Les autres membres peuvent vous découvrir."
                />
                <Switch checked={false} onChange={() => showToast("Option Rencontres Or : masquer mon âge.", "info")} label="Masquer mon âge" description="Disponible avec Rencontres Or." />
                <Switch checked onChange={() => showToast("Seules les personnes que vous aimez peuvent vous écrire.", "info")} label="Messages des matchs uniquement" description="Réduisez les messages non sollicités." />
              </div>
            </Card>

            <Card className="p-3.5">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                <SlidersHorizontal className="size-3" />
                Préférences
              </p>
              <div className="mt-2 space-y-2">
                {[
                  { label: "Tranche d’âge", value: `${ageMin}–${ageMax} ans` },
                  { label: "Distance", value: `${distance} km` },
                  { label: "Localisation", value: "Bamako, Mali" },
                  { label: "Je recherche", value: "Une relation sérieuse" },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
                    <span className="text-[9px] text-muted">{pref.label}</span>
                    <span className="text-[9px] font-semibold text-ink">{pref.value}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => setFiltersOpen(true)}>
                Modifier mes préférences
              </Button>
            </Card>

            <Card className="p-3.5">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                <ShieldCheck className="size-3" />
                Sécurité
              </p>
              <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">
                Votre position exacte n’est jamais partagée. Vous pouvez bloquer ou signaler un profil à tout moment.
              </p>
              <button type="button" onClick={() => showToast("Centre de sécurité ouvert (simulation).", "info")} className="mt-2 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                Centre de sécurité <ArrowRight className="size-2.5" />
              </button>
            </Card>

            <Card className="p-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Statistiques</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                {[
                  { value: "38", label: "vues" },
                  { value: formatCount(matches.length), label: "matchs" },
                  { value: "12", label: "likes" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-surface-muted px-1 py-2">
                    <p className="font-display text-[15px] font-semibold leading-none text-ink">{stat.value}</p>
                    <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1"><DemoTag /> Profils fictifs · Rencontres N’Teriface</span>
        <Link to="/parametres?tab=confidentialite" className="font-semibold text-brand hover:underline">Conseils et confidentialité</Link>
      </div>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        distance={distance}
        ageMin={ageMin}
        ageMax={ageMax}
        onApply={(values) => {
          setDistance(values.distance);
          setAgeMin(values.ageMin);
          setAgeMax(values.ageMax);
          setSeen([]);
          showToast("Vos préférences de rencontre ont été mises à jour.");
        }}
      />
      <MatchModal
        profile={matched}
        onClose={() => setMatched(null)}
        onMessage={messageProfile}
        onContinue={() => setMatched(null)}
      />
      <DetailModal profile={detail} onClose={() => setDetail(null)} onLike={implementLike} onPass={implementPass} />
      <EditDatingProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={myProfile}
        onSave={(value) => {
          setMyProfile(value);
          showToast("Votre profil Rencontres a été mis à jour.");
        }}
      />
      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}

function UserIcon() {
  return <Users className="size-3.5" />;
}
