import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Accessibility,
  AppWindow,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  HardDriveDownload,
  Info,
  KeyRound,
  Laptop,
  Languages,
  Link2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  MonitorSmartphone,
  Moon,
  Palette,
  Phone,
  RefreshCw,
  Save,
  ScanFace,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Trash2,
  TriangleAlert,
  UserRound,
  UserX,
  Users,
  Volume2,
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
  ProgressBar,
  Switch,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { activeDevices, loginHistory } from "@/data";
import { cn, formatCount } from "@/lib/utils";
import { useApp } from "@/store";

type SettingsSection =
  | "compte"
  | "confidentialite"
  | "securite"
  | "notifications"
  | "apparence"
  | "langue"
  | "accessibilite"
  | "applications"
  | "donnees"
  | "aide";

const sections: Array<{
  id: SettingsSection;
  label: string;
  icon: typeof UserRound;
  group: string;
}> = [
  { id: "compte", label: "Compte", icon: UserRound, group: "Votre compte" },
  { id: "confidentialite", label: "Confidentialité", icon: Lock, group: "Votre compte" },
  { id: "securite", label: "Sécurité et connexion", icon: ShieldCheck, group: "Votre compte" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Préférences" },
  { id: "apparence", label: "Apparence", icon: Palette, group: "Préférences" },
  { id: "langue", label: "Langue et région", icon: Languages, group: "Préférences" },
  { id: "accessibilite", label: "Accessibilité", icon: Accessibility, group: "Préférences" },
  { id: "applications", label: "Applications et sites", icon: AppWindow, group: "Vos données" },
  { id: "donnees", label: "Vos informations", icon: Database, group: "Vos données" },
  { id: "aide", label: "Aide et assistance", icon: CircleHelp, group: "Ressources" },
];

const privacyAudiences = ["Public", "Amis", "Amis sauf…", "Personnes sélectionnées", "Personne"];
const friendRequestOptions = ["Tout le monde", "Amis de mes amis", "Personne"];
const searchOptions = ["Tout le monde", "Amis", "Personne"];
const groupOptions = ["Amis", "Tout le monde", "Personnes sélectionnées"];
const mentionOptions = ["Amis et Pages", "Amis", "Personne"];
const messageOptions = ["Amis et Pages", "Amis", "Personne"];
const locationOptions = ["Amis", "Personnes sélectionnées", "Personne"];

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        <h1 className="mt-0.5 font-display text-[22px] font-semibold tracking-[-0.045em] text-ink">{title}</h1>
        <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

function PrivacyRow({
  icon: Icon,
  title,
  description,
  value,
  options,
  onChange,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-start gap-2.5 border-b border-line py-3 last:border-0 last:pb-0 first:pt-0">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-[8.5px] leading-relaxed text-muted">{description}</p>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-[132px] shrink-0 rounded-lg border border-line bg-surface px-2 text-[9px] font-semibold text-ink-soft outline-none focus:border-brand"
        aria-label={title}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function NotificationRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line py-2.5 last:border-0 last:pb-0 first:pt-0">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-[8px] text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition",
          checked ? "bg-brand" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ToggleLine({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return <Switch checked={checked} onChange={onChange} label={label} description={description} />;
}

function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = "danger",
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "brand";
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button
            size="sm"
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[11px] leading-relaxed text-ink-soft">{description}</p>
    </Modal>
  );
}

function DeleteAccountModal({
  open,
  onClose,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (open) setValue("");
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Supprimer définitivement mon compte"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" variant="danger" disabled={value !== "SUPPRIMER"} onClick={() => { onDelete(); onClose(); }}>
            Supprimer mon compte
          </Button>
        </>
      }
    >
      <InlineNotice tone="danger">
        Cette action est irréversible. Dans cette démonstration, elle efface les données locales et vous déconnecte.
      </InlineNotice>
      <p className="mt-3 text-[10.5px] leading-relaxed text-ink-soft">
        Vos publications, messages et enregistrements seront supprimés. Tapez <strong className="font-semibold text-ink">SUPPRIMER</strong> pour confirmer.
      </p>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="SUPPRIMER"
        className={cn(fieldClass, "mt-3 font-semibold tracking-[0.08em]")}
        aria-label="Confirmer la suppression du compte"
        autoFocus
      />
    </Modal>
  );
}

function TwoFactorModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { showToast } = useApp();
  const [sms, setSms] = useState(true);
  const [app, setApp] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Authentification à deux facteurs"
      description="Ajoutez une deuxième preuve d’identité pour protéger votre compte."
      footer={<Button size="sm" onClick={() => { showToast("Paramètres de double authentification enregistrés."); onClose(); }}>Enregistrer</Button>}
    >
      <div className="rounded-2xl border border-line bg-surface-muted/60 p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink">
          <ShieldCheck className="size-3.5 text-brand" />
          Votre compte est actuellement protégé
        </p>
        <p className="mt-1 text-[8.5px] text-muted">Méthode active : SMS au +223 70 •• •• 18</p>
      </div>
      <div className="mt-2">
        <ToggleLine checked={sms} onChange={setSms} label="Code par SMS" description="Un code à 6 chiffres est envoyé à chaque nouvelle connexion." />
        <ToggleLine checked={app} onChange={setApp} label="Application d’authentification" description="Utilisez une application comme Authy ou Google Authenticator." />
      </div>
      <InlineNotice tone="info" className="mt-1">
        Aucun code réel n’est envoyé dans cette démonstration.
      </InlineNotice>
    </Modal>
  );
}

export default function SettingsPage() {
  const {
    state,
    updateProfile,
    setProfessional,
    updateSetting,
    showToast,
    resetDemo,
    logout,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "compte";
  const active: SettingsSection = sections.some((section) => section.id === rawTab)
    ? (rawTab as SettingsSection)
    : "compte";

  const selectSection = (id: SettingsSection) => {
    setSearchParams({ tab: id }, { replace: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [name, setName] = useState(state.me.name);
  const [username, setUsername] = useState(state.me.username);
  const [email, setEmail] = useState("awa.traore@nteriface.ml");
  const [phone, setPhone] = useState("+223 70 12 34 58");
  const [publicEmail, setPublicEmail] = useState(false);

  const [blocked, setBlocked] = useState([
    { id: "blocked-1", name: "Seydou Coulibaly", detail: "Bloqué le 12 octobre 2026", tone: "river" as const },
    { id: "blocked-2", name: "Aminata Diarra", detail: "Bloquée le 3 septembre 2026", tone: "clay" as const },
  ]);
  const [adsPersonalized, setAdsPersonalized] = useState(true);
  const [offPlatform, setOffPlatform] = useState(false);
  const [relationshipAds, setRelationshipAds] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [devices, setDevices] = useState(activeDevices);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [notificationsPaused, setNotificationsPaused] = useState(false);

  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    try {
      const saved = window.localStorage.getItem("nteriface:theme:v1");
      if (saved === "light" || saved === "dark" || saved === "system") return saved;
    } catch {
      // ignore
    }
    return "system";
  });
  const [reduceMotion, setReduceMotion] = useState(() => {
    try {
      return window.localStorage.getItem("nteriface:reduce-motion:v1") === "true";
    } catch {
      return false;
    }
  });
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return window.localStorage.getItem("nteriface:high-contrast:v1") === "true";
    } catch {
      return false;
    }
  });
  const [textSize, setTextSize] = useState<"normal" | "large">(() => {
    try {
      return window.localStorage.getItem("nteriface:text-size:v1") === "large" ? "large" : "normal";
    } catch {
      return "normal";
    }
  });
  const [captions, setCaptions] = useState(true);
  const [keyboardHints, setKeyboardHints] = useState(true);

  const [language, setLanguage] = useState("Français");
  const [region, setRegion] = useState("Mali");
  const [timezone, setTimezone] = useState("GMT (Bamako)");
  const [dateFormat, setDateFormat] = useState("25 octobre 2026");
  const [autoTranslate, setAutoTranslate] = useState(false);

  const [connectedApps, setConnectedApps] = useState([
    { id: "app-1", name: "N’Teriface Music", detail: "Écoute et partage de playlists", icon: "music" as const, tone: "indigo" as const, connected: true },
    { id: "app-2", name: "Sahel Pay", detail: "Paiements et transferts d’argent", icon: "wallet" as const, tone: "green" as const, connected: true },
    { id: "app-3", name: "Baobab Réservations", detail: "Réservation de tables et d’événements", icon: "calendar" as const, tone: "yellow" as const, connected: false },
    { id: "app-4", name: "Faso Kréa Atelier", detail: "Boutique créatrice partenaire", icon: "sparkles" as const, tone: "clay" as const, connected: true },
  ]);
  const [crossPosting, setCrossPosting] = useState([
    { id: "cross-1", name: "Instagram", detail: "Partager automatiquement vos Reels", enabled: true, tone: "clay" as const },
    { id: "cross-2", name: "TikTok", detail: "Publier vos vidéos verticales", enabled: false, tone: "indigo" as const },
    { id: "cross-3", name: "X", detail: "Partager vos publications texte", enabled: false, tone: "river" as const },
  ]);
  const [activityVisibility, setActivityVisibility] = useState(true);

  const [resetOpen, setResetOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sections.filter((section) => !term || section.label.toLowerCase().includes(term));
  }, [search]);

  const groupedSections = ["Votre compte", "Préférences", "Vos données", "Ressources"].map((group) => ({
    group,
    items: filteredSections.filter((section) => section.group === group),
  }));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
    try {
      window.localStorage.setItem("nteriface:theme:v1", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", reduceMotion);
    try {
      window.localStorage.setItem("nteriface:reduce-motion:v1", String(reduceMotion));
    } catch {
      // ignore
    }
  }, [reduceMotion]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("high-contrast", highContrast);
    try {
      window.localStorage.setItem("nteriface:high-contrast:v1", String(highContrast));
    } catch {
      // ignore
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = textSize === "large" ? "17px" : "16px";
    try {
      window.localStorage.setItem("nteriface:text-size:v1", textSize);
    } catch {
      // ignore
    }
  }, [textSize]);

  const saveIdentity = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3 || username.trim().length < 3) {
      showToast("Le nom et le nom d’utilisateur doivent contenir au moins 3 caractères.", "danger");
      return;
    }
    updateProfile({ name: name.trim(), username: username.trim().replace(/^@/, "") });
  };

  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      showToast("Le nouveau mot de passe doit contenir au moins 8 caractères.", "danger");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Les deux mots de passe ne correspondent pas.", "danger");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Mot de passe mis à jour pour la démonstration.");
  };

  const copyAccountId = async () => {
    try {
      await navigator.clipboard.writeText(`NTF-2026-${state.me.id.toUpperCase()}-ML`);
      showToast("Identifiant de compte copié.");
    } catch {
      showToast("Impossible de copier dans le presse-papiers.", "info");
    }
  };

  const exportData = () => {
    const payload = {
      application: "N’Teriface — démonstration",
      exportedAt: new Date().toISOString(),
      profil: state.me,
      parametres: state.settings,
      publications: state.posts,
      groupes: state.groups,
      evenements: state.events,
      pages: state.pages,
      annonces: state.listings,
      conversations: state.conversations,
      notifications: state.notifications,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nteriface-mes-donnees.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Votre archive de données a été téléchargée.");
  };

  const clearSearchHistory = () => {
    try {
      window.localStorage.removeItem("nteriface:searches:v1");
    } catch {
      // ignore
    }
    showToast("Historique de recherche effacé.", "info");
  };

  const appIcons = {
    music: Sparkles,
    wallet: ScanFace,
    calendar: CalendarDays,
    sparkles: Sparkles,
  };

  return (
    <div>
      <PageIntro
        eyebrow="Votre espace, vos règles"
        title="Paramètres et confidentialité"
        description="Gérez votre compte, choisissez qui voit quoi, renforcez votre sécurité et personnalisez votre expérience N’Teriface."
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[8.5px] font-semibold text-muted sm:inline-flex">
              <ShieldCheck className="size-3 text-brand" />
              Compte protégé
            </span>
            <Button size="sm" variant="secondary" onClick={() => selectSection("aide")}>
              <CircleHelp className="size-3.5" />
              Centre d’aide
            </Button>
          </div>
        }
      />

      <div className="mb-3 no-scrollbar flex gap-1 overflow-x-auto pb-1 lg:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => selectSection(section.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold transition",
              active === section.id
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink-soft hover:border-line-strong",
            )}
          >
            <section.icon className="size-3" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[248px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[76px] space-y-2.5">
            <Card className="p-2">
              <div className="relative mb-1.5">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un réglage…"
                  aria-label="Rechercher un réglage"
                  className="h-8 w-full rounded-lg border border-line bg-surface-muted pl-7 pr-2 text-[9.5px] text-ink outline-none placeholder:text-muted focus:border-brand"
                />
              </div>
              <nav className="space-y-2" aria-label="Sections des paramètres">
                {groupedSections.map(({ group, items }) => (
                  items.length > 0 && (
                    <div key={group}>
                      <p className="px-2 pb-1 text-[7px] font-bold uppercase tracking-[0.16em] text-muted">{group}</p>
                      <div className="space-y-0.5">
                        {items.map((section) => (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => selectSection(section.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[10px] font-medium transition",
                              active === section.id
                                ? "bg-brand-soft text-brand-ink"
                                : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                            )}
                          >
                            <section.icon className="size-3.5 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">{section.label}</span>
                            {active === section.id && <ChevronRight className="size-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                {filteredSections.length === 0 && (
                  <p className="px-2 py-4 text-center text-[9px] text-muted">Aucun réglage trouvé.</p>
                )}
              </nav>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-[9.5px] font-semibold text-ink">Votre compte est protégé</p>
                  <p className="mt-0.5 text-[7.5px] text-muted">2FA et alertes activées</p>
                </div>
              </div>
              <ProgressBar value={87} className="mt-2.5" />
              <p className="mt-1.5 text-[7.5px] text-muted">Niveau de sécurité : très bon</p>
              <button type="button" onClick={() => selectSection("securite")} className="mt-1 text-[8px] font-semibold text-brand hover:underline">
                Vérifier mes paramètres
              </button>
            </Card>

            <p className="px-1 text-[7.5px] leading-relaxed text-muted">
              Vos réglages sont enregistrés sur cet appareil uniquement. <DemoTag className="ml-1" />
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          {active === "compte" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Votre compte"
                title="Identité et présence"
                description="Les informations qui vous représentent sur N’Teriface. Vous gardez le contrôle sur ce qui est visible."
              />

              <Card className="overflow-hidden">
                <div className="sahel-art relative h-[74px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                </div>
                <div className="relative px-4 pb-3">
                  <span className="-mt-8 mb-2 inline-block rounded-full border-4 border-surface bg-surface shadow-card">
                    <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="3xl" online />
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-1.5 font-display text-[19px] font-semibold tracking-[-0.04em] text-ink">
                        {state.me.name}
                        <VerifiedBadge className="size-4" />
                      </h2>
                      <p className="mt-0.5 text-[9px] text-muted">@{state.me.username} · {state.me.work ?? "Créatrice de mode"} · Bamako</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Link to={`/profil/${state.me.username}`} className="inline-flex h-8 items-center gap-1 rounded-full bg-brand-soft px-3 text-[9px] font-semibold text-brand-ink transition hover:brightness-95">
                        Voir mon profil
                        <ArrowUpRight className="size-3" />
                      </Link>
                      <Button size="sm" variant="secondary" onClick={() => selectSection("apparence")}>
                        Personnaliser
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
                  {[
                    { label: "Publications", value: state.posts.filter((post) => post.author.id === state.me.id).length },
                    { label: "Abonnés", value: state.me.followers },
                    { label: "Ami·es", value: state.friendIds.length },
                  ].map((stat) => (
                    <div key={stat.label} className="px-3 py-2 text-center">
                      <p className="font-display text-[14px] font-semibold leading-none text-ink">{stat.label === "Abonnés" ? formatCount(stat.value) : stat.value}</p>
                      <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Informations personnelles</p>
                    <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Vos coordonnées</h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-[7.5px] font-semibold text-muted">
                    <Lock className="size-2.5" /> Privé par défaut
                  </span>
                </div>
                <form onSubmit={saveIdentity} className="mt-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nom complet">
                      <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} autoComplete="name" />
                    </Field>
                    <Field label="Nom d’utilisateur">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">@</span>
                        <input value={username} onChange={(event) => setUsername(event.target.value.replace(/^@/, ""))} className={cn(fieldClass, "pl-7")} autoComplete="username" />
                      </div>
                    </Field>
                    <Field label="Adresse e-mail">
                      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} autoComplete="email" />
                    </Field>
                    <Field label="Téléphone">
                      <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} autoComplete="tel" />
                    </Field>
                  </div>
                  <div className="mt-2 border-t border-line pt-1">
                    <Switch
                      checked={publicEmail}
                      onChange={setPublicEmail}
                      label="Afficher mon e-mail sur mon profil"
                      description="Par défaut, seuls vos ami·es peuvent voir votre adresse."
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[8px] text-muted">Votre date de naissance et votre genre restent privés.</p>
                    <Button size="sm" type="submit">
                      <Save className="size-3.5" />
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </Card>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Card className="p-3.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Type de compte</p>
                  <div className="mt-2">
                    <Switch
                      checked={Boolean(state.me.professional)}
                      onChange={setProfessional}
                      label="Compte professionnel"
                      description="Débloquez le Creator Studio, les statistiques et la monétisation."
                    />
                  </div>
                  {state.me.professional && (
                    <Link to="/createur" className="mt-1 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                      Ouvrir le Creator Studio <ArrowUpRight className="size-2.5" />
                    </Link>
                  )}
                </Card>

                <Card className="p-3.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Identifiant du compte</p>
                  <p className="mt-1.5 break-all font-mono text-[10px] font-semibold text-ink">NTF-2026-{state.me.id.toUpperCase()}-ML</p>
                  <p className="mt-1 text-[8px] text-muted">Membre depuis janvier 2023 · Compte vérifié</p>
                  <button type="button" onClick={copyAccountId} className="mt-2 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                    <Copy className="size-3" />
                    Copier l’identifiant
                  </button>
                </Card>
              </div>

              <Card className="border-danger/20 p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-danger">
                  <TriangleAlert className="size-3" />
                  Zone sensible
                </p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Désactiver ou supprimer</h2>
                <p className="mt-1 max-w-lg text-[9px] leading-relaxed text-muted">
                  La désactivation masque votre profil et vos publications. La suppression efface définitivement vos données locales de démonstration.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setDeactivateOpen(true)}>
                    Désactiver temporairement
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="size-3.5" />
                    Supprimer mon compte
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {active === "confidentialite" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Confidentialité"
                title="Qui voit quoi ?"
                description="Choisissez vos audiences par défaut. Chaque publication peut avoir un réglage différent au moment de la création."
                action={<span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[7.5px] font-bold text-brand-ink"><Check className="size-2.5" /> Enregistré automatiquement</span>}
              />

              <Card className="p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-green text-tone-green-ink">
                    <Users className="size-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Audience et visibilité</h2>
                    <p className="mt-0.5 text-[8.5px] text-muted">Ces réglages s’appliquent par défaut à vos prochaines activités.</p>
                  </div>
                </div>
                <div className="mt-3">
                  <PrivacyRow
                    icon={Globe2}
                    title="Qui peut voir mes publications ?"
                    description="L’audience par défaut de votre fil."
                    value={state.settings.privacy.defaultAudience}
                    options={privacyAudiences}
                    onChange={(value) => {
                      updateSetting("privacy", "defaultAudience", value);
                      showToast("Audience par défaut mise à jour.");
                    }}
                  />
                  <PrivacyRow
                    icon={UserRound}
                    title="Qui peut m’envoyer des demandes d’ami ?"
                    description="Limitez les demandes aux personnes que vous connaissez."
                    value={state.settings.privacy.friendRequests}
                    options={friendRequestOptions}
                    onChange={(value) => updateSetting("privacy", "friendRequests", value)}
                  />
                  <PrivacyRow
                    icon={Search}
                    title="Qui peut me trouver ?"
                    description="Via la recherche et mon adresse e-mail."
                    value={state.settings.privacy.searchable}
                    options={searchOptions}
                    onChange={(value) => updateSetting("privacy", "searchable", value)}
                  />
                  <PrivacyRow
                    icon={Users}
                    title="Qui peut voir ma liste d’ami·es ?"
                    description="Masquez vos connexions si vous préférez la discrétion."
                    value={state.settings.privacy.friendList}
                    options={groupOptions}
                    onChange={(value) => updateSetting("privacy", "friendList", value)}
                  />
                  <PrivacyRow
                    icon={MessageCircle}
                    title="Qui peut m’écrire ?"
                    description="Les messages des inconnus peuvent être filtrés."
                    value={state.settings.privacy.messages}
                    options={messageOptions}
                    onChange={(value) => updateSetting("privacy", "messages", value)}
                  />
                  <PrivacyRow
                    icon={MapPin}
                    title="Qui peut voir ma position ?"
                    description="Votre localisation précise n’est jamais partagée."
                    value={state.settings.privacy.location}
                    options={locationOptions}
                    onChange={(value) => updateSetting("privacy", "location", value)}
                  />
                </div>
              </Card>

              <div className="grid gap-2.5 md:grid-cols-2">
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <UserX className="size-3" />
                    Personnes bloquées
                  </p>
                  <p className="mt-1 text-[8.5px] text-muted">Elles ne peuvent plus voir votre profil ni vous contacter.</p>
                  <div className="mt-2 divide-y divide-line">
                    {blocked.length > 0 ? (
                      blocked.map((person) => (
                        <div key={person.id} className="flex items-center gap-2 py-2">
                          <Avatar name={person.name} tone={person.tone} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[9.5px] font-semibold text-ink">{person.name}</p>
                            <p className="text-[7.5px] text-muted">{person.detail}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBlocked((current) => current.filter((item) => item.id !== person.id));
                              showToast(`${person.name} a été débloqué·e.`, "info");
                            }}
                            className="rounded-full border border-line px-2 py-1 text-[7.5px] font-semibold text-ink-soft transition hover:border-line-strong"
                          >
                            Débloquer
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="py-3 text-[8.5px] text-muted">Aucune personne bloquée.</p>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <Sparkles className="size-3" />
                    Publicités et recommandations
                  </p>
                  <div className="mt-1">
                    <ToggleLine checked={adsPersonalized} onChange={setAdsPersonalized} label="Publicités personnalisées" description="Utiliser mes centres d’intérêt pour les annonces." />
                    <ToggleLine checked={relationshipAds} onChange={setRelationshipAds} label="Basées sur mes relations" description="Voir des offres de vos ami·es et Pages suivies." />
                    <ToggleLine checked={offPlatform} onChange={setOffPlatform} label="Activité hors N’Teriface" description="Utiliser les données de sites partenaires (démo)." />
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Autres réglages</p>
                <div className="mt-1">
                  <PrivacyRow icon={ShieldCheck} title="Statut en ligne" description="Qui peut voir quand vous êtes actif·ve." value="Amis" options={["Amis", "Tout le monde", "Personne"]} onChange={() => showToast("Visibilité du statut mise à jour.", "info")} />
                  <PrivacyRow icon={Fingerprint} title="Reconnaissance faciale" description="Désactivée par défaut sur N’Teriface." value="Désactivée" options={["Désactivée", "Activer"]} onChange={() => showToast("La reconnaissance faciale reste désactivée dans la démo.", "info")} />
                  <PrivacyRow icon={MessageCircle} title="Commentaires sur mes publications" description="Choisissez qui peut commenter." value="Amis et Pages" options={["Amis et Pages", "Tout le monde", "Personne"]} onChange={() => showToast("Réglage des commentaires enregistré.", "info")} />
                </div>
              </Card>

              <InlineNotice tone="success">
                <strong className="font-semibold">Vérification de confidentialité :</strong> votre profil est visible par vos ami·es, et vos messages sont limités aux amis et Pages. Aucun réglage public excessif n’a été détecté.
              </InlineNotice>
            </div>
          )}

          {active === "securite" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Sécurité"
                title="Protégez votre compte"
                description="Un mot de passe solide, la double authentification et une surveillance des connexions : les bons réflexes."
                action={<Button size="sm" variant="secondary" onClick={() => setTwoFactorOpen(true)}><KeyRound className="size-3.5" /> Gérer la 2FA</Button>}
              />

              <Card className="overflow-hidden">
                <div className="flex items-center gap-3 border-b border-line bg-brand-soft/50 px-4 py-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-brand text-white">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-brand-ink">Votre compte est bien protégé</p>
                    <p className="mt-0.5 text-[8.5px] text-brand-ink/70">2FA active · Alertes de connexion activées · 4 appareils vérifiés</p>
                  </div>
                  <span className="hidden rounded-full bg-surface px-2 py-1 text-[7px] font-bold uppercase tracking-[0.08em] text-brand-ink sm:block">Niveau élevé</span>
                </div>
                <div className="p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Mot de passe", value: "Mis à jour", icon: KeyRound },
                      { label: "Double authentification", value: "Activée", icon: Fingerprint },
                      { label: "Alertes", value: "3 canaux", icon: Bell },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 rounded-xl border border-line p-2.5">
                        <item.icon className="size-4 text-brand" />
                        <div>
                          <p className="text-[8px] text-muted">{item.label}</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-ink">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <ToggleLine checked={state.settings.security.twoFactor} onChange={(value) => { updateSetting("security", "twoFactor", value); showToast(value ? "Double authentification activée." : "Double authentification désactivée.", value ? "success" : "danger"); }} label="Authentification à deux facteurs" description="Demander un code en plus de votre mot de passe." />
                    <ToggleLine checked={state.settings.security.loginAlerts} onChange={(value) => updateSetting("security", "loginAlerts", value)} label="Alertes de connexion" description="Recevoir un e-mail lors d’une connexion depuis un nouvel appareil." />
                    <ToggleLine checked={state.settings.security.trustedDevices} onChange={(value) => updateSetting("security", "trustedDevices", value)} label="Appareils de confiance" description="Ne pas demander de code sur vos appareils habituels." />
                    <ToggleLine checked={state.settings.security.suspiciousActivity} onChange={(value) => updateSetting("security", "suspiciousActivity", value)} label="Surveillance des activités suspectes" description="Analyses automatiques et conseils de sécurité personnalisés." />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-river text-tone-river-ink"><KeyRound className="size-4" /></span>
                  <div>
                    <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Changer mon mot de passe</h2>
                    <p className="mt-0.5 text-[8.5px] text-muted">Utilisez au moins 8 caractères, avec un chiffre et une majuscule.</p>
                  </div>
                </div>
                <form onSubmit={changePassword} className="mt-3 space-y-3">
                  <Field label="Mot de passe actuel">
                    <input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={fieldClass} autoComplete="current-password" placeholder="••••••••" />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nouveau mot de passe">
                      <input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={fieldClass} autoComplete="new-password" placeholder="••••••••" />
                    </Field>
                    <Field label="Confirmer le mot de passe">
                      <input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={fieldClass} autoComplete="new-password" placeholder="••••••••" />
                    </Field>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-1.5 text-[8.5px] font-semibold text-muted hover:text-ink">
                      {showPasswords ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      {showPasswords ? "Masquer" : "Afficher"} les mots de passe
                    </button>
                    <Button size="sm" type="submit">
                      <Save className="size-3.5" />
                      Mettre à jour
                    </Button>
                  </div>
                  <p className="text-[8px] text-muted">Démonstration : votre mot de passe de connexion reste « nteriface2026 ».</p>
                </form>
              </Card>

              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Connexions actives</p>
                    <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Où vous êtes connecté·e</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDevices((current) => current.filter((device) => device.current));
                      showToast("Toutes les autres sessions ont été fermées.", "info");
                    }}
                    className="text-[8.5px] font-semibold text-danger hover:underline"
                  >
                    Fermer les autres sessions
                  </button>
                </div>
                <div className="mt-2 divide-y divide-line">
                  {devices.map((device) => {
                    const Icon = device.type === "phone" ? Smartphone : device.type === "tablet" ? Tablet : Laptop;
                    return (
                      <div key={device.id} className="flex items-center gap-2.5 py-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted"><Icon className="size-4" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-[9.5px] font-semibold text-ink">
                            {device.name}
                            {device.current && <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.08em] text-brand-ink">Cet appareil</span>}
                          </p>
                          <p className="mt-0.5 truncate text-[7.5px] text-muted">{device.detail}</p>
                        </div>
                        {!device.current && (
                          <button
                            type="button"
                            onClick={() => {
                              setDevices((current) => current.filter((item) => item.id !== device.id));
                              showToast("Session fermée.", "info");
                            }}
                            className="rounded-full border border-line px-2 py-1 text-[7.5px] font-semibold text-muted transition hover:border-danger/30 hover:text-danger"
                          >
                            Déconnecter
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Historique de connexion</p>
                <div className="mt-1 divide-y divide-line">
                  {loginHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 py-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                      <p className="min-w-0 flex-1 truncate text-[8.5px] text-ink-soft">{entry.device} · {entry.place}</p>
                      <span className="shrink-0 text-[7.5px] text-muted">{entry.date}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[7.5px] text-muted">Si vous ne reconnaissez pas une connexion, changez votre mot de passe immédiatement.</p>
              </Card>
            </div>
          )}

          {active === "notifications" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Notifications"
                title="Restez informé·e, sans être submergé·e"
                description="Choisissez ce qui mérite votre attention et le canal par lequel vous souhaitez le recevoir."
                action={
                  <span className={cn("rounded-full px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.08em]", notificationsPaused ? "bg-gold-soft text-[color:var(--color-gold)]" : "bg-brand-soft text-brand-ink")}>
                    {notificationsPaused ? "En pause" : "Actives"}
                  </span>
                }
              />

              <Card className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Sur N’Teriface</p>
                    <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Activité de votre réseau</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsPaused((value) => !value);
                      showToast(notificationsPaused ? "Notifications réactivées." : "Notifications en pause pour 1 heure.", "info");
                    }}
                    className="rounded-full border border-line px-2.5 py-1 text-[8px] font-semibold text-ink-soft transition hover:bg-surface-muted"
                  >
                    {notificationsPaused ? "Reprendre" : "Mettre en pause 1 h"}
                  </button>
                </div>
                <div className="mt-1">
                  <NotificationRow icon={Bell} title="Réactions à mes publications" description="J’aime, amour et autres réactions." checked={state.settings.notifications.reactions} onChange={(value) => updateSetting("notifications", "reactions", value)} />
                  <NotificationRow icon={MessageCircle} title="Commentaires et réponses" description="Quand quelqu’un commente ou répond à un fil." checked={state.settings.notifications.comments} onChange={(value) => updateSetting("notifications", "comments", value)} />
                  <NotificationRow icon={Users} title="Demandes d’ami" description="Nouvelles demandes et acceptations." checked={state.settings.notifications.friendRequests} onChange={(value) => updateSetting("notifications", "friendRequests", value)} />
                  <NotificationRow icon={MessageCircle} title="Messages" description="Nouveaux messages dans Messenger." checked={state.settings.notifications.messages} onChange={(value) => updateSetting("notifications", "messages", value)} />
                  <NotificationRow icon={CalendarDays} title="Événements" description="Rappels et changements pour vos événements." checked={state.settings.notifications.events} onChange={(value) => updateSetting("notifications", "events", value)} />
                  <NotificationRow icon={ShoppingBag} title="Marketplace" description="Offres, messages de vendeurs et baisses de prix." checked={state.settings.notifications.marketplace} onChange={(value) => updateSetting("notifications", "marketplace", value)} />
                </div>
              </Card>

              <div className="grid gap-2.5 md:grid-cols-2">
                <Card className="p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Canaux</p>
                  <div className="mt-1">
                    <NotificationRow icon={Bell} title="Push" description="Sur cet appareil et vos autres appareils." checked={state.settings.notifications.push} onChange={(value) => updateSetting("notifications", "push", value)} />
                    <NotificationRow icon={Mail} title="E-mail" description="Résumé hebdomadaire et alertes de sécurité." checked={state.settings.notifications.email} onChange={(value) => updateSetting("notifications", "email", value)} />
                    <NotificationRow icon={Phone} title="SMS" description="Uniquement pour la sécurité et les paiements." checked onChange={() => showToast("Les SMS de sécurité restent toujours actifs.", "info")} />
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Heures calmes</p>
                  <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Ne pas déranger</h2>
                  <p className="mt-1 text-[8.5px] leading-relaxed text-muted">Les notifications seront regroupées et livrées après cette plage horaire.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Field label="De">
                      <input type="time" value={quietStart} onChange={(event) => setQuietStart(event.target.value)} className={fieldClass} />
                    </Field>
                    <Field label="À">
                      <input type="time" value={quietEnd} onChange={(event) => setQuietEnd(event.target.value)} className={fieldClass} />
                    </Field>
                  </div>
                  <div className="mt-2">
                    <Switch checked label="Regrouper les notifications" description="Recevoir un seul résumé à la fin des heures calmes." onChange={() => showToast("Regroupement des notifications activé.", "info")} />
                  </div>
                </Card>
              </div>

              <InlineNotice tone="info">
                Dans cette démo, les notifications sont simulées localement. Aucun e-mail, SMS ou notification push réel n’est envoyé.
              </InlineNotice>
            </div>
          )}

          {active === "apparence" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Apparence"
                title="Un N’Teriface à votre image"
                description="Choisissez votre thème et ajustez le confort de lecture. Vos préférences s’appliquent immédiatement."
              />

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Thème</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "system" as const, label: "Automatique", hint: "Suit votre appareil", icon: Monitor, preview: "system" },
                    { id: "light" as const, label: "Clair", hint: "Crème et vert forêt", icon: Sun, preview: "light" },
                    { id: "dark" as const, label: "Sombre", hint: "Pour les soirées", icon: Moon, preview: "dark" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setTheme(option.id);
                        showToast(`Thème « ${option.label} » appliqué.`, "info");
                      }}
                      className={cn(
                        "overflow-hidden rounded-2xl border text-left transition",
                        theme === option.id ? "border-brand ring-2 ring-brand/15" : "border-line hover:border-line-strong",
                      )}
                    >
                      <div className={cn("relative h-[56px] p-2", option.preview === "dark" ? "bg-[#101a14]" : "bg-[#f4f0e7]")}>
                        {option.preview === "system" && <span className="absolute inset-y-0 right-0 w-1/2 bg-[#101a14]" />}
                        <span className={cn("block h-2 w-10 rounded-full", option.preview === "dark" ? "bg-white/25" : "bg-[#12211a]/20")} />
                        <span className={cn("mt-1.5 block h-3 w-16 rounded", option.preview === "dark" ? "bg-[#58c98b]" : "bg-[#0b7a45]")} />
                        <span className={cn("mt-1 block h-2 w-20 rounded", option.preview === "dark" ? "bg-white/10" : "bg-[#12211a]/10")} />
                        <span className={cn("absolute bottom-2 left-2 grid size-5 place-items-center rounded-md", option.preview === "dark" ? "bg-white/10 text-white" : "bg-white text-[#0b7a45]")}>
                          <option.icon className="size-3" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2.5">
                        <div>
                          <p className="text-[9.5px] font-semibold text-ink">{option.label}</p>
                          <p className="mt-0.5 text-[7.5px] text-muted">{option.hint}</p>
                        </div>
                        {theme === option.id && <Check className="size-3.5 text-brand" />}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Lecture</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-2.5">
                  <div>
                    <p className="text-[10px] font-semibold text-ink">Taille du texte</p>
                    <p className="mt-0.5 text-[8px] text-muted">Agrandissez les textes de l’interface.</p>
                  </div>
                  <div className="flex gap-1 rounded-full bg-surface-muted p-1">
                    {[
                      { id: "normal" as const, label: "Normale" },
                      { id: "large" as const, label: "Grande" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTextSize(option.id)}
                        className={cn("rounded-full px-2.5 py-1 text-[8.5px] font-semibold transition", textSize === option.id ? "bg-surface text-ink shadow-sm" : "text-muted")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-1">
                  <ToggleLine checked={reduceMotion} onChange={setReduceMotion} label="Réduire les animations" description="Limiter les mouvements et transitions." />
                  <ToggleLine checked={highContrast} onChange={setHighContrast} label="Contraste élevé" description="Renforcer les bordures et les textes secondaires." />
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Aperçu</p>
                <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface">
                  <div className="flex items-center gap-2 border-b border-line p-3">
                    <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="sm" />
                    <div>
                      <p className="text-[9.5px] font-semibold text-ink">{state.me.name}</p>
                      <p className="text-[7.5px] text-muted">Il y a 2 min · Public</p>
                    </div>
                  </div>
                  <p className="p-3 text-[10px] leading-relaxed text-ink-soft">
                    Le thème choisi s’applique à toute l’interface, y compris les cartes, les boutons et les formulaires. Les couleurs du Mali restent présentes, quel que soit votre mode.
                  </p>
                  <div className="flex items-center gap-2 border-t border-line bg-surface-muted/50 px-3 py-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[8px] font-semibold text-brand-ink"><Sun className="size-3" /> Votre ambiance</span>
                    <span className="text-[7.5px] text-muted">Enregistré automatiquement</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {active === "langue" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Langue et région"
                title="Parlez votre langue"
                description="N’Teriface est pensé pour le Mali et sa diaspora. Choisissez la langue, le fuseau horaire et les formats qui vous conviennent."
                action={<Button size="sm" onClick={() => showToast("Préférences de langue enregistrées.")}><Save className="size-3.5" /> Enregistrer</Button>}
              />

              <Card className="p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink"><Languages className="size-4" /></span>
                  <div>
                    <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Langue de l’interface</h2>
                    <p className="mt-0.5 text-[8.5px] text-muted">La démonstration reste principalement en français.</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Français", sub: "France · Mali", flag: "🇫🇷" },
                    { label: "Bambara", sub: "Bamanankan", flag: "🇲🇱" },
                    { label: "English", sub: "International", flag: "🌍" },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => { setLanguage(option.label); showToast(`Langue préférée : ${option.label}.`, "info"); }}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border p-2.5 text-left transition",
                        language === option.label ? "border-brand/40 bg-brand-soft/50" : "border-line hover:border-line-strong",
                      )}
                    >
                      <span className="text-[17px]">{option.flag}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold text-ink">{option.label}</span>
                        <span className="block text-[7.5px] text-muted">{option.sub}</span>
                      </span>
                      {language === option.label && <Check className="size-3.5 shrink-0 text-brand" />}
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Formats et localisation</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <Field label="Pays / région">
                    <select value={region} onChange={(event) => setRegion(event.target.value)} className={fieldClass}>
                      {["Mali", "Sénégal", "Côte d’Ivoire", "Burkina Faso", "France", "Canada"].map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </Field>
                  <Field label="Fuseau horaire">
                    <select value={timezone} onChange={(event) => setTimezone(event.target.value)} className={fieldClass}>
                      {["GMT (Bamako)", "GMT+1 (Paris)", "GMT (Dakar)", "GMT+2 (Bruxelles)"].map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </Field>
                  <Field label="Format de date">
                    <select value={dateFormat} onChange={(event) => setDateFormat(event.target.value)} className={fieldClass}>
                      {["25 octobre 2026", "25/10/2026", "dimanche 25 oct."].map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </Field>
                  <Field label="Format de l’heure">
                    <select className={fieldClass} defaultValue="24 h">
                      <option value="24 h">24 heures (18:42)</option>
                      <option value="12 h">12 heures (6:42 PM)</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-2 border-t border-line pt-1">
                  <ToggleLine checked={autoTranslate} onChange={setAutoTranslate} label="Traduire automatiquement" description="Proposer une traduction pour les publications dans une autre langue." />
                  <ToggleLine checked label="Afficher les prix en FCFA" description="Les montants restent dans la monnaie locale." onChange={() => showToast("Le franc CFA reste la devise principale.", "info")} />
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Région du contenu</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Mali", "Sahel", "Afrique de l’Ouest", "Diaspora"].map((item, index) => (
                    <Chip key={item} active={index === 0} onClick={() => { setRegion(item === "Diaspora" ? "Mali" : item); showToast(`Priorité régionale : ${item}.`, "info"); }}>{item}</Chip>
                  ))}
                </div>
                <p className="mt-2 text-[8px] leading-relaxed text-muted">Le contenu local est prioritaire lorsque c’est pertinent. Vous pouvez toujours explorer le monde entier.</p>
              </Card>
            </div>
          )}

          {active === "accessibilite" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Accessibilité"
                title="N’Teriface pour tout le monde"
                description="Adaptez l’interface à vos besoins. Ces réglages concernent cet appareil et peuvent être modifiés à tout moment."
                action={<Button size="sm" variant="secondary" onClick={() => showToast("Merci ! Votre retour accessibilité a été transmis.", "info")}><MessageCircle className="size-3.5" /> Signaler</Button>}
              />

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Confort visuel et mouvement</p>
                <div className="mt-1">
                  <ToggleLine checked={reduceMotion} onChange={setReduceMotion} label="Réduire les animations" description="Supprime les transitions et effets de mouvement non essentiels." />
                  <ToggleLine checked={highContrast} onChange={setHighContrast} label="Contraste élevé" description="Renforce le contraste des textes secondaires et des bordures." />
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2.5">
                    <div>
                      <p className="text-[10.5px] font-semibold text-ink">Taille du texte</p>
                      <p className="mt-0.5 text-[8px] text-muted">Agrandit les éléments textuels de l’interface.</p>
                    </div>
                    <div className="flex gap-1 rounded-full bg-surface-muted p-1">
                      {[{ id: "normal" as const, label: "A" }, { id: "large" as const, label: "A+" }].map((option) => (
                        <button key={option.id} type="button" onClick={() => setTextSize(option.id)} className={cn("grid size-7 place-items-center rounded-full text-[10px] font-semibold transition", textSize === option.id ? "bg-surface text-ink shadow-sm" : "text-muted")}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ToggleLine checked={captions} onChange={setCaptions} label="Sous-titres automatiques" description="Afficher des sous-titres sur les vidéos et Reels lorsque disponibles." />
                  <ToggleLine checked={keyboardHints} onChange={setKeyboardHints} label="Aides à la navigation clavier" description="Afficher les raccourcis et les indices de focus." />
                </div>
              </Card>

              <div className="grid gap-2.5 md:grid-cols-2">
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <Volume2 className="size-3" />
                    Médias
                  </p>
                  <div className="mt-1">
                    <ToggleLine checked label="Décrire les images" description="Afficher le texte alternatif quand il existe." onChange={() => showToast("Les descriptions d’images sont activées.", "info")} />
                    <ToggleLine checked={false} label="Réduire les vidéos en lecture automatique" description="Les vidéos ne démarrent jamais seules." onChange={() => showToast("La lecture automatique est désactivée.", "info")} />
                    <ToggleLine checked label="Transcriptions" description="Proposer une transcription des vidéos longues." onChange={() => showToast("Transcriptions activées.", "info")} />
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <MonitorSmartphone className="size-3" />
                    Navigation
                  </p>
                  <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">N’Teriface prend en charge la navigation au clavier et les lecteurs d’écran.</p>
                  <div className="mt-2.5 space-y-1.5 rounded-xl bg-surface-muted p-2.5 text-[8.5px]">
                    {[
                      { key: "⌘ K", action: "Ouvrir la recherche" },
                      { key: "Échap", action: "Fermer une fenêtre" },
                      { key: "Tab", action: "Passer au contrôle suivant" },
                      { key: "Entrée", action: "Activer l’élément" },
                    ].map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center justify-between gap-2">
                        <span className="text-muted">{shortcut.action}</span>
                        <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans text-[7.5px] font-semibold text-ink-soft">{shortcut.key}</kbd>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <InlineNotice tone="success">
                Astuce : activez « Réduire les animations » si vous êtes sensible aux mouvements, ou si vous consultez N’Teriface sur un appareil moins puissant.
              </InlineNotice>
            </div>
          )}

          {active === "applications" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Applications et sites"
                title="Vos connexions externes"
                description="Gérez les applications qui peuvent accéder à votre compte et les réseaux sur lesquels vous partagez vos contenus."
              />

              <Card className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Applications connectées</p>
                    <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Ce qui utilise votre compte</h2>
                  </div>
                  <button type="button" onClick={() => showToast("Ajout d’application disponible dans la version complète.", "info")} className="text-[8.5px] font-semibold text-brand hover:underline">Ajouter</button>
                </div>
                <div className="mt-2 divide-y divide-line">
                  {connectedApps.map((app) => {
                    const Icon = appIcons[app.icon];
                    return (
                      <div key={app.id} className="flex items-center gap-2.5 py-2.5">
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", app.tone === "indigo" ? "bg-tone-indigo text-tone-indigo-ink" : app.tone === "green" ? "bg-tone-green text-tone-green-ink" : app.tone === "yellow" ? "bg-tone-yellow text-tone-yellow-ink" : "bg-tone-clay text-tone-clay-ink")}>
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-semibold text-ink">{app.name}</p>
                          <p className="mt-0.5 text-[8px] text-muted">{app.detail}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setConnectedApps((current) => current.map((item) => item.id === app.id ? { ...item, connected: !item.connected } : item));
                            showToast(app.connected ? `${app.name} déconnectée.` : `${app.name} reconnectée.`, "info");
                          }}
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-1 text-[7.5px] font-semibold transition",
                            app.connected ? "border-line text-muted hover:border-danger/30 hover:text-danger" : "border-brand/30 bg-brand-soft text-brand-ink",
                          )}
                        >
                          {app.connected ? "Retirer l’accès" : "Connecter"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Publication croisée</p>
                    <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Partager sur d’autres réseaux</h2>
                  </div>
                  <Link2 className="size-4 text-muted" />
                </div>
                <div className="mt-1">
                  {crossPosting.map((network) => (
                    <ToggleLine
                      key={network.id}
                      checked={network.enabled}
                      onChange={(value) => {
                        setCrossPosting((current) => current.map((item) => item.id === network.id ? { ...item, enabled: value } : item));
                        showToast(value ? `Publication croisée vers ${network.name} activée.` : `Publication croisée vers ${network.name} désactivée.`, "info");
                      }}
                      label={network.name}
                      description={network.detail}
                    />
                  ))}
                </div>
                <InlineNotice tone="info" className="mt-2">
                  La publication croisée est simulée. Aucun contenu n’est envoyé vers un réseau externe.
                </InlineNotice>
              </Card>

              <div className="grid gap-2.5 md:grid-cols-2">
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <AppWindow className="size-3" />
                    Sites externes
                  </p>
                  <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">Aucun site externe n’a accès à vos données N’Teriface dans cette démo.</p>
                  <button type="button" onClick={() => showToast("Liste des sites externes vide.", "info")} className="mt-2 text-[8.5px] font-semibold text-brand hover:underline">Gérer les sites</button>
                </Card>
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <Info className="size-3" />
                    Bon à savoir
                  </p>
                  <p className="mt-2 text-[8.5px] leading-relaxed text-muted">
                    Une application connectée peut voir votre nom, votre photo et votre liste d’ami·es. Elle ne voit jamais votre mot de passe.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {active === "donnees" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Vos informations"
                title="Vos données vous appartiennent"
                description="Téléchargez une copie de vos informations, gérez votre activité ou réinitialisez la démonstration."
                action={<Button size="sm" variant="secondary" onClick={exportData}><Download className="size-3.5" /> Télécharger</Button>}
              />

              <Card className="p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-green text-tone-green-ink"><HardDriveDownload className="size-4" /></span>
                  <div>
                    <h2 className="font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Télécharger mes informations</h2>
                    <p className="mt-0.5 text-[8.5px] text-muted">Un fichier JSON contenant votre profil, vos publications et vos réglages.</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={exportData}>
                    <Download className="size-3.5" />
                    Télécharger l’archive
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => showToast("Une copie sera envoyée à votre adresse e-mail (simulation).", "info")}>
                    <Mail className="size-3.5" />
                    Recevoir par e-mail
                  </Button>
                </div>
                <p className="mt-2 text-[8px] text-muted">Dernière demande : jamais · Format : JSON · Données locales de démonstration.</p>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Gérer mon activité</p>
                <div className="mt-1 divide-y divide-line">
                  {[
                    { label: "Publications", count: state.posts.filter((post) => post.author.id === state.me.id).length, action: () => showToast("Vos publications sont accessibles depuis votre profil.", "info"), icon: MessageCircle },
                    { label: "Commentaires", count: 184, action: () => showToast("Journal des commentaires ouvert (simulation).", "info"), icon: MessageCircle },
                    { label: "Réactions", count: 642, action: () => showToast("Journal des réactions ouvert (simulation).", "info"), icon: Sparkles },
                    { label: "Recherches récentes", count: 6, action: clearSearchHistory, icon: Search },
                    { label: "Photos et vidéos", count: 38, action: () => showToast("Galerie de médias ouverte (simulation).", "info"), icon: AppWindow },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 py-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted"><item.icon className="size-3.5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9.5px] font-semibold text-ink">{item.label}</p>
                        <p className="mt-0.5 text-[7.5px] text-muted">{item.count} éléments</p>
                      </div>
                      <button type="button" onClick={item.action} className="rounded-full border border-line px-2 py-1 text-[7.5px] font-semibold text-muted transition hover:border-line-strong hover:text-ink">
                        {item.label === "Recherches récentes" ? "Effacer" : "Gérer"}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid gap-2.5 md:grid-cols-2">
                <Card className="p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Stockage local</p>
                  <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Données de démonstration</h2>
                  <p className="mt-1 text-[8.5px] leading-relaxed text-muted">N’Teriface stocke vos données dans le navigateur, sous la clé <code className="rounded bg-surface-muted px-1 py-0.5 text-[7.5px]">nteriface:demo:v1</code>. Rien n’est envoyé à un serveur.</p>
                  <Button size="sm" variant="secondary" className="mt-2.5" onClick={() => setResetOpen(true)}>
                    <RefreshCw className="size-3.5" />
                    Réinitialiser la démo
                  </Button>
                </Card>

                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <Link2 className="size-3" />
                    Transfert de données
                  </p>
                  <p className="mt-1 text-[8.5px] leading-relaxed text-muted">Demandez une copie transférable de vos données vers un autre service.</p>
                  <Button size="sm" variant="secondary" className="mt-2.5" onClick={() => showToast("Demande de transfert enregistrée (simulation).", "info")}>
                    Demander un transfert
                  </Button>
                </Card>
              </div>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Effacer mes données</p>
                <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Repartir de zéro</h2>
                <p className="mt-1 text-[8.5px] leading-relaxed text-muted">Réinitialiser remet les publications, messages et réglages de démonstration à leur état initial. Cette action est locale et immédiate.</p>
                <Button size="sm" variant="danger" className="mt-2.5" onClick={() => setResetOpen(true)}>
                  <Trash2 className="size-3.5" />
                  Effacer les données locales
                </Button>
              </Card>
            </div>
          )}

          {active === "aide" && (
            <div className="space-y-3">
              <SectionHeading
                eyebrow="Besoin d’un coup de main ?"
                title="Centre d’aide"
                description="Des réponses claires aux questions les plus fréquentes, et une équipe prête à vous accompagner."
                action={<Button size="sm" variant="secondary" onClick={() => showToast("Le support N’Teriface vous répondra sous 24 h (simulation).", "info")}><MessageCircle className="size-3.5" /> Contacter</Button>}
              />

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Questions fréquentes</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { q: "Comment modifier l’audience de mes publications ?", a: "Rendez-vous dans Confidentialité, puis choisissez « Qui peut voir mes publications ». Vous pouvez aussi choisir une audience au moment de publier." },
                    { q: "Pourquoi mon compte n’est-il pas encore vérifié ?", a: "La vérification est réservée aux comptes d’intérêt public. Elle repose sur l’authenticité, l’unicité et la notoriété. Vous pouvez en faire la demande depuis votre profil." },
                    { q: "Comment fonctionne la monétisation créateur ?", a: "Les créateurs éligibles reçoivent des revenus issus des étoiles, des bonus et de la Marketplace. Consultez le Creator Studio pour suivre vos gains." },
                    { q: "Que faire si je vois un contenu inapproprié ?", a: "Utilisez le menu « … » de la publication pour la signaler. Notre équipe de modération examine chaque signalement." },
                    { q: "Mes données sont-elles envoyées sur un serveur ?", a: "Non. Cette démonstration fonctionne uniquement avec le stockage local de votre navigateur. Vous pouvez tout effacer depuis Vos informations." },
                  ].map((item) => (
                    <details key={item.q} className="group rounded-xl border border-line bg-surface transition open:border-line-strong">
                      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-[9.5px] font-semibold text-ink">
                        <span className="min-w-0 flex-1">{item.q}</span>
                        <ChevronRight className="size-3.5 shrink-0 text-muted transition group-open:rotate-90" />
                      </summary>
                      <p className="border-t border-line px-3 py-2.5 text-[9px] leading-relaxed text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </Card>

              <div className="grid gap-2.5 md:grid-cols-2">
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <MessageCircle className="size-3" />
                    Nous écrire
                  </p>
                  <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Une équipe à votre écoute</h2>
                  <p className="mt-1 text-[8.5px] leading-relaxed text-muted">Du lundi au samedi, de 8 h à 20 h (heure de Bamako).</p>
                  <div className="mt-2 space-y-1.5">
                    <button type="button" onClick={() => showToast("Nouveau ticket support créé (simulation).", "info")} className="flex w-full items-center gap-2 rounded-xl border border-line p-2.5 text-left transition hover:bg-surface-muted">
                      <Mail className="size-3.5 text-brand" />
                      <span className="flex-1 text-[8.5px] font-semibold text-ink">Envoyer un message</span>
                      <ChevronRight className="size-3 text-muted" />
                    </button>
                    <button type="button" onClick={() => showToast("Chat support simulé : un conseiller arrive.", "info")} className="flex w-full items-center gap-2 rounded-xl border border-line p-2.5 text-left transition hover:bg-surface-muted">
                      <MessageCircle className="size-3.5 text-brand" />
                      <span className="flex-1 text-[8.5px] font-semibold text-ink">Chat en direct</span>
                      <ChevronRight className="size-3 text-muted" />
                    </button>
                    <a href="mailto:support@nteriface.ml" className="flex w-full items-center gap-2 rounded-xl border border-line p-2.5 text-left transition hover:bg-surface-muted">
                      <Phone className="size-3.5 text-brand" />
                      <span className="flex-1 text-[8.5px] font-semibold text-ink">support@nteriface.ml</span>
                      <ArrowUpRight className="size-3 text-muted" />
                    </a>
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    <ShieldCheck className="size-3" />
                    Sécurité et règles
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { label: "Centre de sécurité", action: () => selectSection("securite") },
                      { label: "Règles communautaires", action: () => showToast("Règles communautaires : respect, authenticité, sécurité.", "info") },
                      { label: "Politique de confidentialité", action: () => showToast("Politique de confidentialité N’Teriface (simulation).", "info") },
                      { label: "Signaler un problème", action: () => showToast("Formulaire de signalement ouvert (simulation).", "info") },
                      { label: "Administration N’Teriface", action: () => window.location.assign("/admin") },
                    ].map((link) => (
                      <button key={link.label} type="button" onClick={link.action} className="flex w-full items-center gap-2 rounded-xl border border-line p-2.5 text-left transition hover:bg-surface-muted">
                        <span className="flex-1 text-[8.5px] font-semibold text-ink">{link.label}</span>
                        <ChevronRight className="size-3 text-muted" />
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink"><Sparkles className="size-4" /></span>
                  <div>
                    <p className="text-[10px] font-semibold text-ink">N’Teri AI peut vous aider</p>
                    <p className="mt-0.5 text-[8.5px] text-muted">Posez une question en français ou en bambara.</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => showToast("Ouvrez l’assistant N’Teri AI depuis la barre de recherche.", "info")}>
                  Ouvrir l’assistant
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </Card>

              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[8px] text-muted">
                <span className="inline-flex items-center gap-1"><DemoTag /> Aide fictive · N’Teriface 2026</span>
                <span>Version de démonstration 1.0 · Bamako, Mali</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface/60 px-3 py-2.5 text-[8px] text-muted">
            <span className="inline-flex items-center gap-1.5"><Lock className="size-3 text-brand" /> Vos réglages sont enregistrés localement sur cet appareil.</span>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1 font-semibold text-danger hover:underline">
              <LogOut className="size-3" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Réinitialiser la démonstration ?"
        description="Toutes les publications, messages et réglages seront remis à leur état initial. Vos préférences de thème sont conservées."
        confirmLabel="Réinitialiser"
        onConfirm={resetDemo}
      />
      <ConfirmModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Désactiver temporairement mon compte ?"
        description="Votre profil sera masqué et vous serez déconnecté·e. Dans cette démonstration, vos données locales restent conservées."
        confirmLabel="Désactiver"
        onConfirm={() => {
          logout();
          showToast("Compte désactivé temporairement.", "info");
        }}
      />
      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={() => {
          try {
            window.localStorage.removeItem("nteriface:demo:v1");
          } catch {
            // ignore
          }
          logout();
        }}
      />
      <TwoFactorModal open={twoFactorOpen} onClose={() => setTwoFactorOpen(false)} />
    </div>
  );
}
