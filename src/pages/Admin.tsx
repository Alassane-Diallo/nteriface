import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  ChartLine,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Cloud,
  Database,
  Download,
  Ellipsis,
  Eye,
  FileCheck2,
  FileX2,
  Flag,
  Gauge,
  Globe2,
  Heart,
  Info,
  ListChecks,
  Lock,
  MapPin,
  Megaphone,
  MessageCircle,
  Radio,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  TriangleAlert,
  UserCheck,
  UserRoundCheck,
  Users,
  UserX,
  Wifi,
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
  Field,
  InlineNotice,
  Menu,
  Modal,
  ProgressBar,
  SegmentedTabs,
  Sparkline,
  StatCard,
  Switch,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { adminUsers, analytics, reportQueue } from "@/data";
import { cn, formatCount, formatFullNumber } from "@/lib/utils";
import { useApp } from "@/store";

type AdminTab = "overview" | "reports" | "users" | "verifications" | "analytics" | "system";
type ReportStatus = "open" | "resolved" | "dismissed";
type Severity = "Critique" | "Élevée" | "Moyenne";
type VerificationStatus = "pending" | "verified" | "rejected";

interface AdminReport {
  id: string;
  type: string;
  content: string;
  reporter: string;
  target: string;
  severity: Severity;
  time: string;
  status: ReportStatus;
  resolution?: string;
}

interface AdminUser {
  id: string;
  name: string;
  handle: string;
  role: string;
  status: string;
  joined: string;
  reports: number;
}

interface VerificationRequest {
  id: string;
  name: string;
  handle: string;
  type: string;
  followers: number;
  submitted: string;
  reason: string;
  documents: string[];
  status: VerificationStatus;
  tone: "green" | "river" | "clay" | "indigo";
}

const severityTone: Record<Severity, string> = {
  Critique: "bg-danger-soft text-danger",
  Élevée: "bg-gold-soft text-[color:var(--color-gold)]",
  Moyenne: "bg-tone-river text-tone-river-ink",
};

const growthSeries = [142, 146, 151, 149, 157, 162, 166, 170, 168, 175, 181, 179, 184];
const signupSeries = [412, 468, 520, 494, 610, 655, 718, 692, 760, 822, 910, 878, 1024];
const growthLabels = ["13 oct", "14 oct", "15 oct", "16 oct", "17 oct", "18 oct", "19 oct", "20 oct", "21 oct", "22 oct", "23 oct", "24 oct", "25 oct"];

const initialReportStates = reportQueue.map((report) => ({
  ...report,
  severity: report.severity as Severity,
  status: "open" as ReportStatus,
}));

const initialUsers: AdminUser[] = adminUsers.map((user) => ({ ...user }));

const initialVerifications: VerificationRequest[] = [
  {
    id: "ver-1",
    name: "Faso Kréa",
    handle: "@fasokrea",
    type: "Page · Marque de mode",
    followers: 24800,
    submitted: "Il y a 2 jours",
    reason: "Marque malienne de mode éthique, présente dans 4 villes et régulièrement reprise par les médias culturels.",
    documents: ["Registre de commerce", "Pièce d’identité", "Lien presse"],
    status: "pending",
    tone: "clay",
  },
  {
    id: "ver-2",
    name: "Sahel Tech",
    handle: "@saheltech",
    type: "Page · Média tech",
    followers: 12400,
    submitted: "Il y a 5 jours",
    reason: "Média indépendant qui couvre l’écosystème tech et l’entrepreneuriat au Sahel depuis 2021.",
    documents: ["Justificatif d’activité", "Lien site web", "2 articles de référence"],
    status: "pending",
    tone: "indigo",
  },
  {
    id: "ver-3",
    name: "Djénéba Konaté",
    handle: "@djeneba.k",
    type: "Créatrice · Journalisme culture",
    followers: 8600,
    submitted: "Il y a 1 jour",
    reason: "Journaliste culture reconnue, couvre les festivals et les artistes émergents du Mali.",
    documents: ["Carte de presse", "Pièce d’identité"],
    status: "pending",
    tone: "river",
  },
];

const initialAudit = [
  { id: "audit-1", actor: "Awa Traoré", action: "a validé la vérification de", target: "Baobab Café", time: "Il y a 18 min", tone: "green" },
  { id: "audit-2", actor: "Système N’Teri AI", action: "a masqué automatiquement 14 spams dans", target: "Groupes publics", time: "Il y a 42 min", tone: "indigo" },
  { id: "audit-3", actor: "Moussa Diarra", action: "a suspendu le compte de", target: "@promo_sahel", time: "Il y a 2 h", tone: "red" },
  { id: "audit-4", actor: "Fatoumata Keïta", action: "a publié une annonce système pour", target: "Tous les membres", time: "Il y a 5 h", tone: "yellow" },
  { id: "audit-5", actor: "Awa Traoré", action: "a approuvé une campagne publicitaire de", target: "Faso Kréa", time: "Hier, 16:20", tone: "green" },
];

const initialFlags = {
  live: true,
  marketplace: true,
  dating: true,
  ai: true,
  reels: true,
  groups: true,
};

function GrowthChart() {
  const [hover, setHover] = useState<number | null>(null);
  const width = 560;
  const height = 168;
  const pad = 12;
  const step = (width - pad * 2) / (growthSeries.length - 1);
  const maxDau = Math.max(...growthSeries) * 1.08;
  const maxSignup = Math.max(...signupSeries) * 1.12;
  const dauPoints = growthSeries.map((value, index) => ({
    x: pad + index * step,
    y: height - 18 - (value / maxDau) * (height - 34),
  }));
  const signupPoints = signupSeries.map((value, index) => ({
    x: pad + index * step,
    y: height - 18 - (value / maxSignup) * (height - 34),
  }));
  const dauLine = dauPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const signupLine = signupPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const dauArea = `${pad},${height - 18} ${dauLine} ${width - pad},${height - 18}`;
  const current = Math.min(hover ?? growthSeries.length - 1, growthSeries.length - 1);
  const toPercent = (visible: number) => `${(visible / (growthSeries.length - 1)) * 100}%`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[7.5px] text-muted">
          <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-brand" />Membres actifs</span>
          <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-[color:var(--color-mali-yellow)]" />Inscriptions</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[7.5px] font-bold text-brand-ink">
          <TrendingUp className="size-2.5" /> +18,4 %
        </span>
      </div>
      <div className="relative mt-3">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-[168px] w-full" role="img" aria-label="Croissance de la communauté sur treize jours">
          <defs>
            <linearGradient id="admin-growth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b7a45" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#0b7a45" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <line key={ratio} x1={pad} x2={width - pad} y1={height * ratio} y2={height * ratio} stroke="currentColor" className="text-line" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={dauArea} fill="url(#admin-growth)" />
          <polyline points={dauLine} fill="none" stroke="#0b7a45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <polyline points={signupLine} fill="none" stroke="#d29a12" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {dauPoints.map((point, index) => (
            <g key={growthLabels[index]}>
              <circle cx={point.x} cy={point.y} r={hover === index ? 4.5 : 2.4} fill="#0b7a45" stroke="#fffefa" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              <circle cx={point.x} cy={point.y} r="9" fill="transparent" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} className="cursor-crosshair" />
            </g>
          ))}
        </svg>
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-line bg-surface/95 px-2 py-1 text-[7.5px] font-semibold text-ink shadow-card backdrop-blur"
          style={{ left: toPercent(current), transform: "translateX(-50%)" }}
        >
          {formatFullNumber(growthSeries[current] * 1000)}
          <span className="ml-1 font-normal text-muted">· {growthLabels[current]}</span>
        </div>
        <div className="mt-1 flex justify-between">
          {growthLabels.map((label, index) => (
            <span key={label} className={cn("text-[6px] text-muted", index % 2 !== 0 && "hidden sm:block")}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportDetailModal({
  report,
  onClose,
  onAction,
}: {
  report: AdminReport | null;
  onClose: () => void;
  onAction: (report: AdminReport, action: "hide" | "restrict" | "ignore" | "escalate") => void;
}) {
  if (!report) return null;
  return (
    <Modal
      open={Boolean(report)}
      onClose={onClose}
      size="md"
      title="Examiner le signalement"
      description={`Signalement ${report.id.replace("report-", "NTF-")} · ${report.time}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onAction(report, "ignore")}>Ignorer</Button>
          <Button variant="secondary" size="sm" onClick={() => onAction(report, "escalate")}>Escalader</Button>
          <Button size="sm" variant="danger" onClick={() => onAction(report, "restrict")}>
            <Ban className="size-3.5" />
            Restreindre le compte
          </Button>
          <Button size="sm" onClick={() => onAction(report, "hide")}>
            <Eye className="size-3.5" />
            Masquer le contenu
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded-full px-2 py-1 text-[8px] font-bold", severityTone[report.severity])}>{report.severity}</span>
          <span className="rounded-full bg-surface-muted px-2 py-1 text-[8px] font-semibold text-ink-soft">{report.type}</span>
          <span className="rounded-full bg-surface-muted px-2 py-1 text-[8px] font-semibold text-muted">Statut : {report.status === "open" ? "À traiter" : report.status === "resolved" ? "Traité" : "Ignoré"}</span>
        </div>
        <div className="rounded-2xl border border-line bg-surface-muted/60 p-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted">Contenu signalé</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink">{report.content}</p>
          <p className="mt-2 text-[8.5px] text-muted">Cible : <span className="font-semibold text-ink-soft">{report.target}</span> · Signalé par : {report.reporter}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Règle concernée", value: report.type === "Harcèlement" ? "Sécurité · Harcèlement" : report.type === "Arnaque" ? "Intégrité · Fraude" : "Contenu · Spam" },
            { label: "Historique de la cible", value: report.target === "@promo_sahel" ? "14 signalements" : "Aucun antécédent" },
            { label: "Détection", value: report.reporter === "Système" ? "Automatique · N’Teri AI" : "Signalement humain" },
            { label: "Priorité", value: report.severity },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-line p-2.5">
              <p className="text-[7px] font-semibold uppercase tracking-[0.1em] text-muted">{item.label}</p>
              <p className="mt-1 text-[9px] font-semibold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
        <InlineNotice tone="info">
          Vérifiez le contexte complet avant toute action. Les décisions sont consignées dans le journal d’audit.
        </InlineNotice>
      </div>
    </Modal>
  );
}

function UserDetailModal({
  user,
  onClose,
  onAction,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onAction: (user: AdminUser, action: "verify" | "restrict" | "ban") => void;
}) {
  if (!user) return null;
  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      size="sm"
      title="Fiche membre"
      description="Informations de démonstration — aucune donnée personnelle réelle."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onAction(user, "restrict")}>
            {user.status === "Restreint" ? "Lever la restriction" : "Restreindre"}
          </Button>
          <Button size="sm" onClick={() => onAction(user, "verify")}>
            <BadgeCheck className="size-3.5" />
            Accorder la vérification
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar name={user.name} tone="green" size="xl" />
        <div>
          <p className="flex items-center gap-1.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            {user.name}
            {user.role.includes("vérifié") && <VerifiedBadge className="size-3.5" />}
          </p>
          <p className="mt-0.5 text-[9px] text-muted">{user.handle} · {user.role}</p>
          <p className="mt-0.5 text-[8px] text-muted">Membre depuis le {user.joined}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Statut", value: user.status },
          { label: "Signalements", value: String(user.reports) },
          { label: "Ancienneté", value: "3 ans" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface-muted p-2">
            <p className="text-[11px] font-semibold text-ink">{stat.value}</p>
            <p className="mt-0.5 text-[7px] uppercase tracking-[0.08em] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-xl border border-line p-2.5 text-[8.5px] leading-relaxed text-muted">
        Dernière activité : aujourd’hui, 08:42 à Bamako. Appareils vérifiés : 2. Aucune restriction de paiement.
      </div>
      <button
        type="button"
        onClick={() => onAction(user, "ban")}
        className="mt-2 inline-flex items-center gap-1.5 text-[8.5px] font-semibold text-danger hover:underline"
      >
        <Ban className="size-3" />
        Bannir définitivement ce compte
      </button>
    </Modal>
  );
}

export default function AdminPage() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [reports, setReports] = useState<AdminReport[]>(initialReportStates);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [reportQuery, setReportQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"Toutes" | Severity>("Toutes");
  const [reportStatusFilter, setReportStatusFilter] = useState<"open" | "all" | "resolved">("open");
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("Tous");
  const [verifications, setVerifications] = useState<VerificationRequest[]>(initialVerifications);
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | "all">("pending");
  const [flags, setFlags] = useState(initialFlags);
  const [audit, setAudit] = useState(initialAudit);
  const [announcement, setAnnouncement] = useState("");

  const openReports = reports.filter((report) => report.status === "open");
  const pendingVerifications = verifications.filter((request) => request.status === "pending");

  const filteredReports = useMemo(() => {
    const term = reportQuery.trim().toLowerCase();
    return reports.filter(
      (report) =>
        (severityFilter === "Toutes" || report.severity === severityFilter) &&
        (reportStatusFilter === "all" ||
          (reportStatusFilter === "open" ? report.status === "open" : report.status !== "open")) &&
        (!term ||
          report.type.toLowerCase().includes(term) ||
          report.content.toLowerCase().includes(term) ||
          report.target.toLowerCase().includes(term)),
    );
  }, [reportQuery, reportStatusFilter, reports, severityFilter]);

  const filteredUsers = useMemo(() => {
    const term = userQuery.trim().toLowerCase();
    return users.filter(
      (user) =>
        (userStatusFilter === "Tous" || user.status === userStatusFilter) &&
        (!term ||
          user.name.toLowerCase().includes(term) ||
          user.handle.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)),
    );
  }, [userQuery, userStatusFilter, users]);

  const filteredVerifications = verifications.filter(
    (request) => verificationFilter === "all" || request.status === verificationFilter,
  );

  const addAudit = (action: string, target: string, tone = "green") => {
    setAudit((current) => [
      { id: `audit-${Date.now()}`, actor: "Awa Traoré", action, target, time: "À l’instant", tone },
      ...current,
    ].slice(0, 8));
  };

  const handleReportAction = (report: AdminReport, action: "hide" | "restrict" | "ignore" | "escalate") => {
    if (action === "escalate") {
      showToast("Signalement escaladé à l’équipe sécurité.", "info");
      addAudit("a escaladé un signalement concernant", report.target, "yellow");
      setSelectedReport(null);
      return;
    }
    const nextStatus: ReportStatus = action === "ignore" ? "dismissed" : "resolved";
    setReports((current) =>
      current.map((item) =>
        item.id === report.id
          ? {
              ...item,
              status: nextStatus,
              resolution:
                action === "hide"
                  ? "Contenu masqué"
                  : action === "restrict"
                    ? "Compte restreint"
                    : "Signalement ignoré",
            }
          : item,
      ),
    );
    showToast(
      action === "hide"
        ? "Contenu masqué. La décision est consignée."
        : action === "restrict"
          ? "Compte restreint pendant 7 jours."
          : "Signalement ignoré.",
      action === "ignore" ? "info" : "success",
    );
    addAudit(
      action === "hide" ? "a masqué un contenu signalé pour" : action === "restrict" ? "a restreint le compte" : "a ignoré un signalement de",
      report.target,
      action === "ignore" ? "yellow" : "red",
    );
    setSelectedReport(null);
  };

  const handleUserAction = (user: AdminUser, action: "verify" | "restrict" | "ban") => {
    setUsers((current) =>
      current.map((item) => {
        if (item.id !== user.id) return item;
        if (action === "verify") return { ...item, role: "Créateur vérifié", status: "Actif" };
        if (action === "restrict") return { ...item, status: item.status === "Restreint" ? "Actif" : "Restreint" };
        return { ...item, status: "Banni" };
      }),
    );
    setSelectedUser(null);
    if (action === "verify") {
      showToast(`${user.name} est désormais vérifié·e.`, "success");
      addAudit("a accordé la vérification à", user.name);
    } else if (action === "restrict") {
      showToast(user.status === "Restreint" ? "Restriction levée." : "Compte restreint pour 7 jours.", "info");
      addAudit(user.status === "Restreint" ? "a levé la restriction de" : "a restreint le compte de", user.name, "red");
    } else {
      showToast(`${user.name} a été banni·e de la démonstration.`, "danger");
      addAudit("a banni le compte de", user.name, "red");
    }
  };

  const decideVerification = (request: VerificationRequest, status: VerificationStatus) => {
    setVerifications((current) => current.map((item) => item.id === request.id ? { ...item, status } : item));
    if (status === "verified") {
      showToast(`${request.name} est désormais vérifié·e.`, "success");
      addAudit("a validé la vérification de", request.name);
    } else {
      showToast(`Demande de ${request.name} refusée. Un e-mail explicatif sera envoyé.`, "info");
      addAudit("a refusé la vérification de", request.name, "yellow");
    }
  };

  const toggleFlag = (key: keyof typeof flags, label: string) => {
    setFlags((current) => ({ ...current, [key]: !current[key] }));
    showToast(`Fonctionnalité « ${label} » ${flags[key] ? "désactivée" : "activée"} pour la démonstration.`, "info");
    addAudit(flags[key] ? "a désactivé la fonctionnalité" : "a activé la fonctionnalité", label, "indigo");
  };

  const publishAnnouncement = () => {
    if (announcement.trim().length < 10) {
      showToast("L’annonce doit contenir au moins 10 caractères.", "danger");
      return;
    }
    showToast("Annonce système publiée à tous les membres (simulation).");
    addAudit("a publié une annonce système :", announcement.trim().slice(0, 40), "yellow");
    setAnnouncement("");
  };

  return (
    <div>
      <PageIntro
        eyebrow="Espace équipe · Accès restreint"
        title="Administration"
        description="Modération, vérifications, santé de la plateforme et indicateurs clés — une console unique pour prendre soin de N’Teriface."
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-gold/25 bg-gold-soft px-2.5 py-1.5 text-[8.5px] font-bold text-[color:var(--color-gold)] sm:inline-flex">
              <ShieldCheck className="size-3" />
              Accès administrateur
            </span>
            <Button size="sm" variant="secondary" onClick={() => showToast("Rapport d’administration exporté (simulation).", "info")}>
              <Download className="size-3.5" />
              Exporter
            </Button>
          </div>
        }
      />

      <Card className="mb-3 overflow-hidden">
        <div className="relative overflow-hidden bg-[linear-gradient(122deg,#0d2117,#0b3b26_58%,#0b5c37)] p-4 text-white">
          <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border border-white/10" />
          <span className="pointer-events-none absolute -bottom-24 right-20 size-40 rounded-full border border-white/5" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white/50">
                <Activity className="size-3 text-[color:var(--color-mali-yellow)]" />
                Console équipe · Bamako
              </p>
              <h2 className="mt-1.5 font-display text-[24px] font-semibold tracking-[-0.045em] sm:text-[28px]">
                Le réseau se porte bien.
              </h2>
              <p className="mt-1 max-w-md text-[9.5px] leading-relaxed text-white/60">
                {formatFullNumber(analytics.dau)} membres actifs aujourd’hui. La modération respecte ses objectifs et tous les services sont opérationnels.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[7.5px] font-semibold text-white/80 backdrop-blur">
                  <span className="size-1.5 rounded-full bg-[#58c98b]" />Tous les services opérationnels
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[7.5px] font-semibold text-white/80 backdrop-blur">
                  <TriangleAlert className="size-2.5 text-[color:var(--color-mali-yellow)]" />{openReports.length} signalements à traiter
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[7.5px] font-semibold text-white/80 backdrop-blur">
                  <Sparkles className="size-2.5 text-[color:var(--color-mali-yellow)]" />IA de modération active
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { label: "MAU", value: "1,24 M" },
                { label: "SLA modération", value: "96 %" },
                { label: "Uptime", value: "99,98 %" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 backdrop-blur">
                  <p className="font-display text-[14px] font-semibold leading-none sm:text-[16px]">{item.value}</p>
                  <p className="mt-1 text-[6.5px] uppercase tracking-[0.1em] text-white/50">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-3">
        <SegmentedTabs
          items={[
            { id: "overview", label: "Vue d’ensemble" },
            { id: "reports", label: "Signalements", count: openReports.length },
            { id: "users", label: "Utilisateurs", count: users.length },
            { id: "verifications", label: "Vérifications", count: pendingVerifications.length },
            { id: "analytics", label: "Analytics" },
            { id: "system", label: "Système" },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Sections de l’administration"
          size="sm"
        />
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Membres actifs / jour" value={formatFullNumber(analytics.dau)} delta="+8,2 %" hint="vs semaine dernière" icon={<Users className="size-4" />} tone="green" sparkline={[12, 14, 13, 16, 15, 17, 18, 19]} />
            <StatCard label="Nouveaux membres" value={`+${formatCount(analytics.newUsers)}`} delta="+14 %" hint="30 derniers jours" icon={<UserRoundCheck className="size-4" />} tone="river" sparkline={[4, 5, 6, 5, 7, 8, 8, 10]} />
            <StatCard label="Signalements ouverts" value={String(openReports.length)} delta="−12 %" hint="moins qu’hier" icon={<Flag className="size-4" />} tone="yellow" sparkline={[9, 8, 9, 7, 7, 6, 6, 5]} />
            <StatCard label="SLA de modération" value="96 %" delta="+2 pts" hint="objectif : 95 %" icon={<Gauge className="size-4" />} tone="indigo" sparkline={[7, 8, 8, 9, 9, 9, 10, 10]} />
          </div>

          <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Croissance</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">La communauté en mouvement</h2>
                </div>
                <span className="rounded-full bg-surface-muted px-2 py-1 text-[7px] font-semibold text-muted">13 jours</span>
              </div>
              <GrowthChart />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Modération</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">File de traitement</h2>
                </div>
                <span className="grid size-8 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink"><ListChecks className="size-4" /></span>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  { label: "Critique", value: openReports.filter((report) => report.severity === "Critique").length, tone: "bg-[color:var(--color-mali-red)]" },
                  { label: "Élevée", value: openReports.filter((report) => report.severity === "Élevée").length, tone: "bg-[color:var(--color-gold)]" },
                  { label: "Moyenne", value: openReports.filter((report) => report.severity === "Moyenne").length, tone: "bg-tone-river-ink" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-[8px]"><span className="text-muted">{item.label}</span><span className="font-semibold text-ink">{item.value}</span></div>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <span className={cn("block h-full rounded-full", item.tone)} style={{ width: `${Math.min(100, item.value * 20)}%` }} />
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-2.5 text-center">
                <div><p className="text-[12px] font-semibold text-ink">14 min</p><p className="mt-0.5 text-[7px] text-muted">temps moyen</p></div>
                <div><p className="text-[12px] font-semibold text-ink">128</p><p className="mt-0.5 text-[7px] text-muted">traités aujourd’hui</p></div>
              </div>
              <Button size="sm" className="mt-2.5 w-full" onClick={() => { setTab("reports"); setReportStatusFilter("open"); }}>
                Ouvrir la file
                <ArrowRight className="size-3.5" />
              </Button>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.12fr_0.88fr]">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Priorités</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Signalements récents</h2>
                </div>
                <button type="button" onClick={() => setTab("reports")} className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</button>
              </div>
              <div className="mt-2 divide-y divide-line">
                {openReports.slice(0, 3).map((report) => (
                  <button key={report.id} type="button" onClick={() => setSelectedReport(report)} className="flex w-full items-center gap-2.5 py-2.5 text-left">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", severityTone[report.severity])}>
                      <Flag className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[9.5px] font-semibold text-ink"><span className="truncate">{report.type}</span><span className="shrink-0 text-[7px] font-bold text-muted">{report.time}</span></span>
                      <span className="mt-0.5 block truncate text-[8px] text-muted">{report.content}</span>
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-muted" />
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Infrastructure</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Santé de la plateforme</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[7px] font-bold text-brand-ink"><span className="size-1 rounded-full bg-brand" />Stable</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {[
                  { label: "API N’Teriface", value: "82 ms", icon: Server },
                  { label: "Messagerie", value: "64 ms", icon: MessageCircle },
                  { label: "Stockage médias", value: "120 ms", icon: Cloud },
                  { label: "Paiements", value: "98 ms", icon: Database },
                ].map((service) => (
                  <div key={service.label} className="flex items-center gap-2 border-b border-line py-1.5 last:border-0">
                    <service.icon className="size-3.5 text-muted" />
                    <span className="min-w-0 flex-1 text-[8.5px] text-ink-soft">{service.label}</span>
                    <span className="text-[7.5px] text-muted">{service.value}</span>
                    <span className="size-1.5 rounded-full bg-brand" />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setTab("system")} className="mt-2 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                Voir le statut détaillé <ChevronRight className="size-2.5" />
              </button>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Raccourcis</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Actions rapides</h2>
              </div>
              <span className="text-[8px] text-muted">Accès administrateur</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Traiter les signalements", hint: `${openReports.length} en attente`, icon: Flag, tone: "bg-tone-red text-tone-red-ink", action: () => setTab("reports") },
                { label: "Vérifier les demandes", hint: `${pendingVerifications.length} en attente`, icon: BadgeCheck, tone: "bg-tone-green text-tone-green-ink", action: () => setTab("verifications") },
                { label: "Publier une annonce", hint: "Tous les membres", icon: Megaphone, tone: "bg-tone-yellow text-tone-yellow-ink", action: () => setTab("system") },
                { label: "Voir les analytics", hint: "Tendances 30 j", icon: ChartLine, tone: "bg-tone-indigo text-tone-indigo-ink", action: () => setTab("analytics") },
              ].map((action) => (
                <button key={action.label} type="button" onClick={action.action} className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-surface p-2.5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float">
                  <span className={cn("grid size-8 place-items-center rounded-xl", action.tone)}><action.icon className="size-4" /></span>
                  <span>
                    <span className="block text-[8.5px] font-semibold leading-tight text-ink">{action.label}</span>
                    <span className="mt-0.5 block text-[7px] text-muted">{action.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[8px] text-muted">
            <span className="inline-flex items-center gap-1"><DemoTag /> Tableau de bord fictif · N’Teriface Admin</span>
            <span>Dernière synchronisation : aujourd’hui, 09:45</span>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "À traiter", value: openReports.length, icon: Flag, tone: "bg-tone-red text-tone-red-ink" },
              { label: "Critiques", value: openReports.filter((report) => report.severity === "Critique").length, icon: ShieldAlert, tone: "bg-danger-soft text-danger" },
              { label: "Temps moyen", value: "14 min", icon: Clock, tone: "bg-tone-yellow text-tone-yellow-ink" },
            ].map((stat) => (
              <Card key={stat.label} className="flex items-center gap-2 p-2.5">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", stat.tone)}><stat.icon className="size-4" /></span>
                <div className="min-w-0">
                  <p className="font-display text-[16px] font-semibold leading-none text-ink">{stat.value}</p>
                  <p className="mt-1 text-[7px] uppercase tracking-[0.08em] text-muted">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
                <input value={reportQuery} onChange={(event) => setReportQuery(event.target.value)} placeholder="Rechercher un signalement…" aria-label="Rechercher un signalement" className={cn(fieldClass, "h-9 rounded-full pl-8 text-[10px]")} />
              </div>
              <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto">
                {(["open", "all", "resolved"] as const).map((status) => (
                  <Chip key={status} active={reportStatusFilter === status} onClick={() => setReportStatusFilter(status)}>
                    {status === "open" ? "À traiter" : status === "all" ? "Tous" : "Traités"}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[8px] font-semibold text-muted">Priorité :</span>
              {(["Toutes", "Critique", "Élevée", "Moyenne"] as const).map((severity) => (
                <Chip key={severity} active={severityFilter === severity} onClick={() => setSeverityFilter(severity)}>{severity}</Chip>
              ))}
              <span className="ml-auto text-[8px] text-muted">{filteredReports.length} résultat{filteredReports.length !== 1 ? "s" : ""}</span>
            </div>
          </Card>

          {filteredReports.length > 0 ? (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <div className="flex items-start gap-2.5 p-3.5">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", severityTone[report.severity])}>
                      <Flag className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10.5px] font-semibold text-ink">{report.type}</span>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.06em]", severityTone[report.severity])}>{report.severity}</span>
                        {report.status !== "open" && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[6.5px] font-bold", report.status === "resolved" ? "bg-brand-soft text-brand-ink" : "bg-surface-muted text-muted")}>
                            {report.resolution ?? (report.status === "resolved" ? "Traité" : "Ignoré")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-ink-soft">{report.content}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[7.5px] text-muted">
                        <span>Cible : <strong className="font-semibold text-ink-soft">{report.target}</strong></span>
                        <span className="size-1 rounded-full bg-line-strong" />
                        <span>{report.reporter}</span>
                        <span className="size-1 rounded-full bg-line-strong" />
                        <span>{report.time}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => setSelectedReport(report)} className="rounded-full bg-surface-muted px-2.5 py-1.5 text-[8px] font-semibold text-ink-soft transition hover:bg-brand-soft hover:text-brand-ink">
                        Examiner
                      </button>
                      <Menu
                        label={`Options du signalement ${report.id}`}
                        trigger={<span className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"><Ellipsis className="size-4" /></span>}
                        items={[
                          { label: "Masquer le contenu", icon: <Eye className="size-3.5" />, onClick: () => handleReportAction(report, "hide") },
                          { label: "Restreindre le compte", icon: <Ban className="size-3.5" />, onClick: () => handleReportAction(report, "restrict") },
                          { label: "Escalader", icon: <ArrowUpRight className="size-3.5" />, onClick: () => handleReportAction(report, "escalate") },
                          { label: "", separator: true },
                          { label: "Ignorer", danger: true, onClick: () => handleReportAction(report, "ignore") },
                        ]}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState icon={<CircleCheck className="size-6" />} title="Rien à traiter ici" description="Aucun signalement ne correspond à ces filtres. La file est peut-être déjà vide." action={<Button variant="secondary" onClick={() => { setReportStatusFilter("all"); setSeverityFilter("Toutes"); setReportQuery(""); }}>Réinitialiser les filtres</Button>} />
            </Card>
          )}

          <InlineNotice tone="success">
            <strong className="font-semibold">Objectif du jour :</strong> {openReports.length} signalements restants. Le temps de traitement moyen de 14 minutes est conforme à l’engagement de 30 minutes pour les cas critiques.
          </InlineNotice>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          <Card className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
                <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Rechercher un membre, un rôle…" aria-label="Rechercher un membre" className={cn(fieldClass, "h-9 rounded-full pl-8 text-[10px]")} />
              </div>
              <div className="flex gap-1">
                {["Tous", "Actif", "Restreint", "Banni"].map((status) => (
                  <Chip key={status} active={userStatusFilter === status} onClick={() => setUserStatusFilter(status)}>{status}</Chip>
                ))}
              </div>
              <Button size="sm" onClick={() => showToast("Invitation d’administrateur simulée. Rôles gérés par l’équipe.", "info")}>
                <UserCheck className="size-3.5" />
                Inviter
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1.4fr_0.9fr_0.65fr_0.6fr_42px] gap-2 border-b border-line bg-surface-muted/60 px-3 py-2 text-[7px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
              <span>Membre</span>
              <span>Rôle</span>
              <span>Inscription</span>
              <span>Statut</span>
              <span />
            </div>
            <div className="divide-y divide-line">
              {filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 transition hover:bg-surface-muted/30 sm:grid-cols-[1.4fr_0.9fr_0.65fr_0.6fr_42px]">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={user.name} tone={user.id === "u-4" ? "red" : "green"} size="md" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-ink">
                        {user.name}
                        {user.role.includes("vérifié") && <VerifiedBadge className="size-3" />}
                      </p>
                      <p className="mt-0.5 truncate text-[8px] text-muted">{user.handle} · {user.reports} signalement{user.reports > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="hidden truncate text-[8.5px] text-ink-soft sm:block">{user.role}</span>
                  <span className="hidden text-[8px] text-muted sm:block">{user.joined}</span>
                  <span className={cn("hidden w-fit rounded-full px-1.5 py-0.5 text-[7px] font-bold sm:block", user.status === "Actif" ? "bg-brand-soft text-brand-ink" : user.status === "Restreint" ? "bg-gold-soft text-[color:var(--color-gold)]" : "bg-danger-soft text-danger")}>{user.status}</span>
                  <Menu
                    label={`Options pour ${user.name}`}
                    trigger={<span className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"><Ellipsis className="size-4" /></span>}
                    items={[
                      { label: "Voir la fiche", icon: <Eye className="size-3.5" />, onClick: () => setSelectedUser(user) },
                      { label: "Accorder la vérification", icon: <BadgeCheck className="size-3.5" />, onClick: () => handleUserAction(user, "verify") },
                      { label: user.status === "Restreint" ? "Lever la restriction" : "Restreindre", icon: <UserX className="size-3.5" />, onClick: () => handleUserAction(user, "restrict") },
                      { label: "", separator: true },
                      { label: "Bannir le compte", icon: <Ban className="size-3.5" />, danger: true, onClick: () => handleUserAction(user, "ban") },
                    ]}
                  />
                </div>
              ))}
            </div>
            {filteredUsers.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="text-[11px] font-semibold text-ink">Aucun membre trouvé</p>
                <p className="mt-1 text-[9px] text-muted">Essayez un autre nom ou filtre.</p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Comptes vérifiés", value: "12 480", icon: BadgeCheck, tone: "bg-tone-green text-tone-green-ink" },
              { label: "Comptes restreints", value: "342", icon: UserX, tone: "bg-tone-yellow text-tone-yellow-ink" },
              { label: "Nouveaux ce mois", value: "+4 820", icon: Users, tone: "bg-tone-river text-tone-river-ink" },
              { label: "Taux de rétention", value: "68 %", icon: Heart, tone: "bg-tone-red text-tone-red-ink" },
            ].map((stat) => (
              <Card key={stat.label} className="flex items-center gap-2.5 p-2.5">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", stat.tone)}><stat.icon className="size-4" /></span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-semibold leading-none text-ink">{stat.value}</p>
                  <p className="mt-1 truncate text-[7px] uppercase tracking-[0.08em] text-muted">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>

          <InlineNotice tone="info">
            Les actions de modération sont simulées localement. Aucune notification réelle n’est envoyée aux membres concernés.
          </InlineNotice>
        </div>
      )}

      {tab === "verifications" && (
        <div className="space-y-3">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-tone-green text-tone-green-ink"><BadgeCheck className="size-5" /></span>
              <div>
                <h2 className="font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">{pendingVerifications.length} demandes en attente</h2>
                <p className="mt-0.5 text-[8.5px] text-muted">Vérifiez l’authenticité, l’unicité et l’intérêt public des comptes.</p>
              </div>
            </div>
            <div className="flex gap-1">
              {([
                { id: "pending" as const, label: "En attente" },
                { id: "verified" as const, label: "Validées" },
                { id: "rejected" as const, label: "Refusées" },
                { id: "all" as const, label: "Toutes" },
              ]).map((item) => (
                <Chip key={item.id} active={verificationFilter === item.id} onClick={() => setVerificationFilter(item.id)}>{item.label}</Chip>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-2.5">
              {filteredVerifications.length > 0 ? (
                filteredVerifications.map((request) => (
                  <Card key={request.id} className="p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Avatar name={request.name} tone={request.tone} size="lg" shape="squircle" />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink">
                          {request.name}
                          {request.status === "verified" && <VerifiedBadge className="size-3.5" />}
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.06em]", request.status === "pending" ? "bg-gold-soft text-[color:var(--color-gold)]" : request.status === "verified" ? "bg-brand-soft text-brand-ink" : "bg-danger-soft text-danger")}>
                            {request.status === "pending" ? "En attente" : request.status === "verified" ? "Vérifié" : "Refusé"}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[8px] text-muted">{request.handle} · {request.type} · {formatCount(request.followers)} abonnés</p>
                        <p className="mt-1 text-[8.5px] text-muted">Demandé {request.submitted}</p>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[9px] leading-relaxed text-ink-soft">{request.reason}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {request.documents.map((document) => (
                        <span key={document} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-muted px-2 py-1 text-[7.5px] font-medium text-ink-soft">
                          <FileCheck2 className="size-2.5 text-brand" />
                          {document}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 rounded-full bg-tone-indigo px-2 py-1 text-[7.5px] font-semibold text-tone-indigo-ink">
                        <Sparkles className="size-2.5" />
                        Pré-vérifié par IA
                      </span>
                    </div>
                    {request.status === "pending" ? (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
                        <Button size="sm" onClick={() => decideVerification(request, "verified")}>
                          <Check className="size-3.5" />
                          Valider
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => decideVerification(request, "rejected")}>
                          <FileX2 className="size-3.5" />
                          Refuser
                        </Button>
                        <button type="button" onClick={() => showToast(`Profil de ${request.name} ouvert dans un nouvel onglet (simulation).`, "info")} className="ml-auto text-[8px] font-semibold text-brand hover:underline">
                          Voir le profil
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 border-t border-line pt-2 text-[8px] text-muted">
                        {request.status === "verified" ? "Vérification accordée. Le badge est visible sur le profil." : "Demande refusée. Un e-mail de motivation a été simulé."}
                      </p>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <EmptyState icon={<BadgeCheck className="size-6" />} title="Aucune demande ici" description="Toutes les demandes de cette catégorie ont été traitées." />
                </Card>
              )}
            </div>

            <div className="space-y-2.5">
              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  <ListChecks className="size-3" />
                  Critères de vérification
                </p>
                <div className="mt-2 space-y-2">
                  {[
                    "Authenticité du compte",
                    "Unicité de la présence",
                    "Notoriété et intérêt public",
                    "Respect des règles communautaires",
                    "Compte actif et complet",
                  ].map((criterion) => (
                    <p key={criterion} className="flex items-start gap-1.5 text-[8.5px] text-ink-soft">
                      <span className="mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink"><Check className="size-2.5" /></span>
                      {criterion}
                    </p>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  <Sparkles className="size-3" />
                  Assistance IA
                </p>
                <p className="mt-2 text-[8.5px] leading-relaxed text-muted">
                  N’Teri AI vérifie automatiquement les documents, détecte les doublons et signale les incohérences. La décision finale reste humaine.
                </p>
                <div className="mt-2.5 rounded-xl bg-surface-muted p-2.5 text-[8px] text-muted">
                  <p className="flex justify-between"><span>Documents contrôlés</span><span className="font-semibold text-ink">3 / 3</span></p>
                  <p className="mt-1 flex justify-between"><span>Score de confiance</span><span className="font-semibold text-brand">92 %</span></p>
                </div>
              </Card>

              <InlineNotice tone="info">
                La vérification ne donne pas plus de droits de publication. Elle confirme l’identité et l’authenticité du compte.
              </InlineNotice>
            </div>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] text-muted">Données agrégées et anonymisées · 30 derniers jours</p>
            <Button size="sm" variant="secondary" onClick={() => showToast("Rapport analytique hebdomadaire généré (simulation).", "info")}>
              <Download className="size-3.5" />
              Rapport hebdomadaire
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: "Membres actifs / jour", value: formatCount(analytics.dau), delta: "+8,2 %", icon: Users, tone: "bg-tone-green text-tone-green-ink" },
              { label: "Membres / semaine", value: formatCount(analytics.wau), delta: "+11 %", icon: UserRoundCheck, tone: "bg-tone-river text-tone-river-ink" },
              { label: "Publications", value: formatCount(analytics.posts), delta: "+6,4 %", icon: MessageCircle, tone: "bg-tone-indigo text-tone-indigo-ink" },
              { label: "Réactions", value: formatCount(analytics.reactions), delta: "+19 %", icon: Heart, tone: "bg-tone-red text-tone-red-ink" },
            ].map((stat) => (
              <Card key={stat.label} className="p-3">
                <span className={cn("grid size-7 place-items-center rounded-lg", stat.tone)}><stat.icon className="size-3.5" /></span>
                <p className="mt-2 font-display text-[16px] font-semibold leading-none tracking-[-0.03em] text-ink">{stat.value}</p>
                <p className="mt-1 truncate text-[7px] uppercase tracking-[0.08em] text-muted">{stat.label}</p>
                <p className="mt-1 text-[7.5px] font-semibold text-brand">{stat.delta}</p>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Activité de la plateforme</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Une croissance régulière</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[7.5px] font-bold text-brand-ink"><TrendingUp className="size-2.5" />+18,4 % ce mois</span>
            </div>
            <GrowthChart />
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Contenus</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Le format qui rassemble</h2>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative size-[104px] shrink-0">
                  <svg viewBox="0 0 42 42" className="size-full -rotate-90">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-surface-muted)" strokeWidth="6" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-brand)" strokeWidth="6" strokeDasharray="50 50" strokeLinecap="round" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-mali-yellow)" strokeWidth="6" strokeDasharray="27 73" strokeDashoffset="-52" strokeLinecap="round" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-tone-river-ink)" strokeWidth="6" strokeDasharray="14 86" strokeDashoffset="-81" strokeLinecap="round" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-tone-indigo-ink)" strokeWidth="6" strokeDasharray="9 91" strokeDashoffset="-97" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-[17px] font-semibold leading-none text-ink">96,8 k</span>
                    <span className="mt-0.5 text-[6.5px] uppercase tracking-[0.08em] text-muted">contenus</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {[
                    { label: "Publications", value: "50 %", color: "bg-brand" },
                    { label: "Reels", value: "27 %", color: "bg-[color:var(--color-mali-yellow)]" },
                    { label: "Vidéos", value: "14 %", color: "bg-tone-river-ink" },
                    { label: "Stories", value: "9 %", color: "bg-tone-indigo-ink" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", item.color)} />
                      <span className="flex-1 text-[8px] text-muted">{item.label}</span>
                      <span className="text-[8.5px] font-semibold text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 border-t border-line pt-2 text-[7.5px] text-muted">Les Reels gagnent 4 points de part de contenu par rapport au mois dernier.</p>
            </Card>

            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Géographie</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">D’où vient la communauté</h2>
              <div className="mt-3 space-y-2.5">
                {[
                  { city: "Bamako", percent: 42, count: "520 800" },
                  { city: "Ségou", percent: 16, count: "198 400" },
                  { city: "Mopti", percent: 11, count: "136 200" },
                  { city: "Sikasso", percent: 9, count: "111 600" },
                  { city: "Kayes", percent: 7, count: "86 800" },
                  { city: "Diaspora", percent: 15, count: "186 000" },
                ].map((city) => (
                  <div key={city.city}>
                    <div className="mb-1 flex items-center justify-between text-[8px]"><span className="text-muted">{city.city}</span><span className="font-semibold text-ink">{city.count} · {city.percent} %</span></div>
                    <ProgressBar value={city.percent} max={50} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Engagement</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Les interactions en un coup d’œil</h2>
              </div>
              <span className="text-[8px] text-muted">Moyenne par membre / mois</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: "Publications", value: formatCount(analytics.posts), sub: "1,7 / membre", icon: MessageCircle, tone: "bg-tone-green text-tone-green-ink" },
                { label: "Commentaires", value: formatCount(analytics.comments), sub: "212 k ce mois", icon: MessageCircle, tone: "bg-tone-river text-tone-river-ink" },
                { label: "Réactions", value: formatCount(analytics.reactions), sub: "2,1 M au total", icon: Heart, tone: "bg-tone-red text-tone-red-ink" },
                { label: "Messages", value: formatCount(analytics.messages), sub: "4,86 M échangés", icon: MessageCircle, tone: "bg-tone-indigo text-tone-indigo-ink" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-line p-2.5">
                  <span className={cn("grid size-7 place-items-center rounded-lg", item.tone)}><item.icon className="size-3.5" /></span>
                  <p className="mt-2 font-display text-[15px] font-semibold leading-none text-ink">{item.value}</p>
                  <p className="mt-1 text-[7px] uppercase tracking-[0.08em] text-muted">{item.label}</p>
                  <p className="mt-1 text-[7.5px] text-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[8px] text-muted">
            <span className="inline-flex items-center gap-1"><DemoTag /> Analytics simulées · échantillon de démonstration</span>
            <span>Source : entrepôt N’Teriface · mise à jour quotidienne</span>
          </div>
        </div>
      )}

      {tab === "system" && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Infrastructure</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">État des services</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[7px] font-bold text-brand-ink"><span className="size-1.5 rounded-full bg-brand" />Opérationnel</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { name: "API N’Teriface", detail: "Requêtes et authentification", latency: "82 ms", uptime: "99,99 %", icon: Server },
                  { name: "Fil et contenus", detail: "Publications, Reels et Stories", latency: "94 ms", uptime: "99,98 %", icon: Database },
                  { name: "Messagerie", detail: "Messages et appels simulés", latency: "64 ms", uptime: "99,97 %", icon: MessageCircle },
                  { name: "Stockage médias", detail: "Images, vidéos et archives", latency: "120 ms", uptime: "99,95 %", icon: Cloud },
                  { name: "N’Teriface Pay", detail: "Portefeuille et publicités", latency: "98 ms", uptime: "99,99 %", icon: Lock },
                ].map((service) => (
                  <div key={service.name} className="flex items-center gap-2.5 rounded-xl border border-line p-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted"><service.icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9.5px] font-semibold text-ink">{service.name}</p>
                      <p className="mt-0.5 truncate text-[7.5px] text-muted">{service.detail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[8px] font-semibold text-brand">● {service.latency}</p>
                      <p className="mt-0.5 text-[7px] text-muted">{service.uptime}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[7.5px] text-muted">Disponibilité globale : 99,98 % sur 30 jours · Dernier incident : 14 octobre 2026.</p>
            </Card>

            <div className="space-y-2.5">
              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  <Wifi className="size-3" />
                  Annonce système
                </p>
                <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Parler à toute la communauté</h2>
                <Field label="Message (10 caractères minimum)">
                  <textarea value={announcement} onChange={(event) => setAnnouncement(event.target.value.slice(0, 180))} rows={3} placeholder="Ex. Maintenance planifiée dimanche de 2 h à 4 h…" className={cn(fieldClass, "h-auto resize-none py-2.5")} />
                </Field>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[7.5px] text-muted">{announcement.length}/180</span>
                  <Button size="sm" onClick={publishAnnouncement}>
                    <Megaphone className="size-3.5" />
                    Publier
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  <TriangleAlert className="size-3" />
                  Incidents récents
                </p>
                <div className="mt-1 divide-y divide-line">
                  {[
                    { title: "Latence élevée sur les médias", date: "14 oct. 2026", status: "Résolu", duration: "32 min" },
                    { title: "Notifications push retardées", date: "3 oct. 2026", status: "Résolu", duration: "1 h 08" },
                  ].map((incident) => (
                    <div key={incident.title} className="py-2">
                      <p className="text-[8.5px] font-semibold text-ink">{incident.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[7.5px] text-muted"><span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[6.5px] font-semibold text-brand-ink">{incident.status}</span>{incident.date} · durée {incident.duration}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Configuration</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Fonctionnalités de la plateforme</h2>
              </div>
              <Settings2 className="size-4 text-muted" />
            </div>
            <div className="mt-2 grid gap-x-5 sm:grid-cols-2">
              {[
                { key: "live" as const, label: "Vidéos en direct", description: "Diffusion live et commentaires temps réel." },
                { key: "marketplace" as const, label: "Marketplace", description: "Annonces, paiements et livraison." },
                { key: "dating" as const, label: "N’Teriface Rencontres", description: "Profils, matchs et messagerie dédiée." },
                { key: "ai" as const, label: "Assistant N’Teri AI", description: "Résumés, idées et aide à la rédaction." },
                { key: "reels" as const, label: "Reels", description: "Format vertical et onglet dédié." },
                { key: "groups" as const, label: "Groupes", description: "Communautés publiques et privées." },
              ].map((feature) => (
                <Switch
                  key={feature.key}
                  checked={flags[feature.key]}
                  onChange={() => toggleFlag(feature.key, feature.label)}
                  label={feature.label}
                  description={feature.description}
                />
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                <ListChecks className="size-3" />
                Journal d’audit
              </p>
              <div className="mt-2 divide-y divide-line">
                {audit.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 py-2">
                    <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", entry.tone === "red" ? "bg-[color:var(--color-mali-red)]" : entry.tone === "yellow" ? "bg-[color:var(--color-gold)]" : entry.tone === "indigo" ? "bg-tone-indigo-ink" : "bg-brand")} />
                    <p className="min-w-0 flex-1 text-[8px] leading-relaxed text-muted">
                      <strong className="font-semibold text-ink">{entry.actor}</strong> {entry.action} <strong className="font-semibold text-ink-soft">{entry.target}</strong>
                      <span className="ml-1 text-[7px]">· {entry.time}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-2.5">
              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  <Users className="size-3" />
                  Équipe d’administration
                </p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { name: "Awa Traoré", role: "Super administratrice", tone: "green" as const, online: true },
                    { name: "Moussa Diarra", role: "Modérateur senior", tone: "river" as const, online: true },
                    { name: "Fatoumata Keïta", role: "Modération & vérifications", tone: "yellow" as const, online: false },
                    { name: "N’Teri AI", role: "Détection automatique", tone: "indigo" as const, online: true },
                  ].map((member) => (
                    <div key={member.name} className="flex items-center gap-2 py-1.5">
                      <Avatar name={member.name} tone={member.tone} size="sm" online={member.online} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8.5px] font-semibold text-ink">{member.name}</p>
                        <p className="text-[7px] text-muted">{member.role}</p>
                      </div>
                      {member.name === "Awa Traoré" && <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-[0.06em] text-brand-ink">Vous</span>}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Outils de maintenance</p>
                <div className="mt-1.5 space-y-1.5">
                  {[
                    { label: "Régénérer les tendances", icon: RefreshCw, action: () => showToast("Tendances recalculées pour Bamako et le Mali.", "info") },
                    { label: "Vider le cache de démonstration", icon: Database, action: () => showToast("Cache local vidé. Les données sont conservées.", "info") },
                    { label: "Tester les notifications", icon: Radio, action: () => showToast("Notification test envoyée aux administrateurs.", "info") },
                  ].map((tool) => (
                    <button key={tool.label} type="button" onClick={tool.action} className="flex w-full items-center gap-2 rounded-xl border border-line p-2 text-left transition hover:bg-surface-muted">
                      <tool.icon className="size-3.5 text-muted" />
                      <span className="flex-1 text-[8.5px] font-semibold text-ink-soft">{tool.label}</span>
                      <ChevronRight className="size-3 text-muted" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[8px] text-muted">
            <span className="inline-flex items-center gap-1"><DemoTag /> Console simulée · aucune action réelle sur un serveur</span>
            <span>Version admin 1.0 · Bamako, Mali</span>
          </div>
        </div>
      )}

      <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onAction={handleReportAction} />
      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onAction={handleUserAction} />
    </div>
  );
}
