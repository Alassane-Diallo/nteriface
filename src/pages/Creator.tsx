import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bookmark,
  CalendarDays,
  ChartLine,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Download,
  Eye,
  Heart,
  Lightbulb,
  MessageCircle,
  Play,
  Plus,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import {
  ArtCover,
  Avatar,
  Button,
  Card,
  Chip,
  DemoTag,
  InlineNotice,
  Photo,
  ProgressBar,
  SegmentedTabs,
  Sparkline,
  StatCard,
  VerifiedBadge,
} from "@/components/ui";
import { analytics, transactions } from "@/data";
import { cn, formatCount, formatPrice } from "@/lib/utils";
import { useApp } from "@/store";

type CreatorTab = "overview" | "content" | "audience" | "revenue";
type Period = "7" | "14" | "30";

const viewsSeries = [8.2, 9.1, 7.4, 10.2, 11.6, 9.8, 12.4, 13.1, 11.8, 14.2, 15.6, 13.9, 16.8, 18.4];
const engagementSeries = [320, 410, 380, 520, 610, 540, 690, 720, 650, 780, 860, 810, 940, 1020];
const labelsSeries = ["12 oct", "13 oct", "14 oct", "15 oct", "16 oct", "17 oct", "18 oct", "19 oct", "20 oct", "21 oct", "22 oct", "23 oct", "24 oct", "25 oct"];

const contentStats = [
  {
    id: "content-1",
    title: "Harmattan, la collection qui raconte Ségou",
    type: "Reel",
    format: "Reel · 0:42",
    poster: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=700&q=82",
    date: "22 oct.",
    views: 128400,
    reactions: 12480,
    comments: 842,
    shares: 1260,
    watch: "26,4 s",
    rate: "9,7 %",
    trend: "+34 %",
  },
  {
    id: "content-2",
    title: "3 façons de porter le bogolan au quotidien",
    type: "Vidéo",
    format: "Vidéo · 6:18",
    poster: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=82",
    date: "19 oct.",
    views: 84200,
    reactions: 6940,
    comments: 412,
    shares: 680,
    watch: "2 min 12",
    rate: "8,2 %",
    trend: "+21 %",
  },
  {
    id: "content-3",
    title: "Coulisses : l’atelier avant le défilé",
    type: "Story",
    format: "Story · 8 cartes",
    poster: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=82",
    date: "17 oct.",
    views: 42600,
    reactions: 3120,
    comments: 96,
    shares: 214,
    watch: "8,1 s",
    rate: "7,3 %",
    trend: "+12 %",
  },
  {
    id: "content-4",
    title: "Le marché de Médine en 60 secondes",
    type: "Reel",
    format: "Reel · 1:02",
    poster: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=700&q=82",
    date: "14 oct.",
    views: 68200,
    reactions: 5210,
    comments: 308,
    shares: 540,
    watch: "19,7 s",
    rate: "8,9 %",
    trend: "+18 %",
  },
  {
    id: "content-5",
    title: "Une journée avec les artisanes de Ségou",
    type: "Publication",
    format: "Photos · 6 images",
    poster: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=700&q=82",
    date: "11 oct.",
    views: 31400,
    reactions: 2860,
    comments: 184,
    shares: 122,
    watch: "—",
    rate: "9,1 %",
    trend: "+7 %",
  },
];

const audienceCities = [
  { name: "Bamako", percent: 52, count: "129 000" },
  { name: "Ségou", percent: 16, count: "39 700" },
  { name: "Mopti", percent: 9, count: "22 300" },
  { name: "Sikasso", percent: 7, count: "17 400" },
  { name: "Kayes", percent: 5, count: "12 400" },
  { name: "Diaspora", percent: 11, count: "27 300" },
];

const ageGroups = [
  { label: "18–24 ans", percent: 26 },
  { label: "25–34 ans", percent: 42 },
  { label: "35–44 ans", percent: 21 },
  { label: "45–54 ans", percent: 8 },
  { label: "55 ans et +", percent: 3 },
];

const bestTimes = [
  [12, 18, 24, 32, 58, 72, 46],
  [16, 22, 38, 46, 74, 88, 62],
  [24, 34, 52, 64, 86, 92, 70],
  [30, 42, 60, 58, 78, 82, 60],
  [22, 34, 46, 52, 68, 64, 44],
];

const contentIdeas = [
  { format: "Reel · 30 s", title: "Le bogolan expliqué par celles qui le tissent", score: "Fort potentiel", icon: Play },
  { format: "Carrousel · 5 images", title: "5 pièces à porter pour un mariage à Bamako", score: "Tendance locale", icon: Sparkles },
  { format: "Live · 20 min", title: "Atelier couture : répondre aux questions", score: "Fidéliser", icon: Activity },
  { format: "Story · sondage", title: "Quelle couleur pour la prochaine collection ?", score: "Engagement", icon: Users },
];

function PeriodChart({ period }: { period: Period }) {
  const [metric, setMetric] = useState<"views" | "engagement">("views");
  const [hover, setHover] = useState<number | null>(null);

  const length = Number(period);
  const data = (metric === "views" ? viewsSeries : engagementSeries).slice(-length);
  const labels = labelsSeries.slice(-length);
  const width = 560;
  const height = 178;
  const padX = 10;
  const padY = 18;
  const max = Math.max(...data) * 1.14;
  const step = (width - padX * 2) / (data.length - 1);
  const points = data.map((value, index) => ({
    x: padX + index * step,
    y: height - padY - (value / max) * (height - padY * 2),
    value,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  const gradientId = `creator-${metric}-${period}`;
  const current = Math.min(hover ?? data.length - 1, data.length - 1);
  const displayValue = metric === "views" ? `${data[current].toLocaleString("fr-FR")} k vues` : `${data[current].toLocaleString("fr-FR")} interactions`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-full bg-surface-muted p-1">
          <button
            type="button"
            onClick={() => setMetric("views")}
            className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold transition", metric === "views" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink")}
          >
            Vues
          </button>
          <button
            type="button"
            onClick={() => setMetric("engagement")}
            className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold transition", metric === "engagement" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink")}
          >
            Interactions
          </button>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-muted">
          <span className="inline-flex items-center gap-1"><span className={cn("size-1.5 rounded-full", metric === "views" ? "bg-brand" : "bg-[color:var(--color-mali-yellow)]")} />{metric === "views" ? "Vues cumulées" : "Interactions"}</span>
          <span className="inline-flex items-center gap-1"><TrendingUp className="size-3 text-brand" />+{metric === "views" ? "23" : "18"} %</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-[178px] w-full" role="img" aria-label={`Évolution des ${metric === "views" ? "vues" : "interactions"} sur ${period} jours`}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric === "views" ? "#0b7a45" : "#d29a12"} stopOpacity="0.28" />
              <stop offset="100%" stopColor={metric === "views" ? "#0b7a45" : "#d29a12"} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <line key={ratio} x1={padX} x2={width - padX} y1={height * ratio} y2={height * ratio} stroke="currentColor" className="text-line" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={area} fill={`url(#${gradientId})`} />
          <polyline points={line} fill="none" stroke={metric === "views" ? "#0b7a45" : "#d29a12"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {points.map((point, index) => (
            <g key={labels[index]}>
              <circle cx={point.x} cy={point.y} r={hover === index ? 4.5 : 2.6} fill={metric === "views" ? "#0b7a45" : "#d29a12"} stroke="#fffefa" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
              <circle cx={point.x} cy={point.y} r="10" fill="transparent" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} className="cursor-crosshair" />
            </g>
          ))}
        </svg>
        <div className="pointer-events-none absolute right-1 top-0 rounded-lg border border-line bg-surface/95 px-2 py-1 text-[8px] font-semibold text-ink shadow-card backdrop-blur">
          {displayValue}
          <span className="ml-1 text-[7.5px] font-normal text-muted">{labels[current]}</span>
        </div>
        <div className="mt-1 flex justify-between px-0.5">
          {labels.map((label, index) => (
            <span key={label} className={cn("text-[6.5px] font-medium text-muted", labels.length > 14 && index % 3 !== 0 && "opacity-0 sm:opacity-100")}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenderDonut() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-[92px] shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-surface-muted)" strokeWidth="6" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-brand)" strokeWidth="6" strokeDasharray="57 43" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-mali-yellow)" strokeWidth="6" strokeDasharray="38 62" strokeDashoffset="-59" strokeLinecap="round" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-tone-river-ink)" strokeWidth="6" strokeDasharray="5 95" strokeDashoffset="-99" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[15px] font-semibold leading-none text-ink">68 %</span>
          <span className="mt-0.5 text-[6.5px] uppercase tracking-[0.1em] text-muted">femmes</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Femmes", value: "68 %", color: "bg-brand" },
          { label: "Hommes", value: "27 %", color: "bg-[color:var(--color-mali-yellow)]" },
          { label: "Autres", value: "5 %", color: "bg-tone-river-ink" },
        ].map((item) => (
          <p key={item.label} className="flex items-center gap-1.5 text-[8.5px] text-muted">
            <span className={cn("size-1.5 rounded-full", item.color)} />
            <span className="w-[44px]">{item.label}</span>
            <span className="font-semibold text-ink">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default function CreatorPage() {
  const { state, openComposer, showToast } = useApp();
  const [tab, setTab] = useState<CreatorTab>("overview");
  const [period, setPeriod] = useState<Period>("14");
  const [contentFilter, setContentFilter] = useState<"Tout" | "Reel" | "Vidéo" | "Story" | "Publication">("Tout");

  const revenueTransactions = transactions.filter((transaction) => transaction.amount > 0);

  const filteredContent = useMemo(
    () => contentStats.filter((content) => contentFilter === "Tout" || content.type === contentFilter),
    [contentFilter],
  );

  const totalViews = contentStats.reduce((sum, content) => sum + content.views, 0);
  const totalReactions = contentStats.reduce((sum, content) => sum + content.reactions, 0);

  return (
    <div>
      <PageIntro
        eyebrow="Votre espace créateur"
        title="Creator Studio"
        description="Suivez votre audience, comprenez vos contenus et développez vos revenus — sans quitter N’Teriface."
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => showToast("Rapport PDF généré pour la démonstration.", "info")}>
              <Download className="size-3.5" />
              Exporter
            </Button>
            <Button size="sm" onClick={() => openComposer("post")}>
              <Plus className="size-3.5" />
              Créer
            </Button>
          </div>
        }
      />

      <Card className="mb-3 overflow-hidden">
        <div className="relative h-[88px] overflow-hidden">
          <img src={state.me.cover} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute right-3 top-3 flex gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/20 px-2 py-1 text-[8px] font-semibold text-white backdrop-blur">
              <BadgeCheck className="size-3 text-[color:var(--color-mali-yellow)]" />
              Créatrice vérifiée
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-3">
          <div className="flex items-end gap-3">
            <span className="-mt-8 rounded-full border-4 border-surface bg-surface shadow-card">
              <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="3xl" online />
            </span>
            <div className="min-w-0 pb-1">
              <h2 className="flex items-center gap-1.5 font-display text-[20px] font-semibold tracking-[-0.04em] text-ink">
                {state.me.name}
                <VerifiedBadge className="size-4" />
              </h2>
              <p className="mt-0.5 text-[9px] text-muted">@{state.me.username} · Mode, artisanat & culture malienne</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-[8.5px] text-muted">
            <span><strong className="font-semibold text-ink">{formatCount(state.me.followers)}</strong> abonnés</span>
            <span><strong className="font-semibold text-ink">{formatCount(184300)}</strong> vues / 30 j</span>
            <span className="inline-flex items-center gap-1 text-brand"><span className="size-1.5 rounded-full bg-brand" />Éligible à la monétisation</span>
          </div>
        </div>
      </Card>

      <div className="mb-3">
        <SegmentedTabs
          items={[
            { id: "overview", label: "Vue d’ensemble" },
            { id: "content", label: "Contenu", count: contentStats.length },
            { id: "audience", label: "Audience" },
            { id: "revenue", label: "Revenus" },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Sections du Creator Studio"
        />
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Abonnés" value={formatCount(state.me.followers)} delta="+12 %" hint="30 derniers jours" icon={<Users className="size-4" />} tone="green" sparkline={[12, 14, 13, 16, 18, 17, 21, 24]} />
            <StatCard label="Vues" value={`${formatCount(184300)}`} delta="+23 %" hint="vs période précédente" icon={<Eye className="size-4" />} tone="river" sparkline={[8, 9, 7, 10, 12, 14, 13, 18]} />
            <StatCard label="Interactions" value={formatCount(12600)} delta="+9 %" hint="réactions, commentaires" icon={<Heart className="size-4" />} tone="red" sparkline={[3, 4, 5, 4, 7, 8, 7, 9]} />
            <StatCard label="Revenus estimés" value={formatPrice(84500)} delta="+18 %" hint="ce mois-ci" icon={<Wallet className="size-4" />} tone="yellow" sparkline={[2, 3, 4, 4, 6, 7, 8, 8]} />
          </div>

          <Card className="p-4">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Performance</p>
                <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">Votre audience en mouvement</h2>
              </div>
              <div className="flex gap-1 rounded-full bg-surface-muted p-1">
                {(["7", "14", "30"] as Period[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriod(value)}
                    className={cn("rounded-full px-2.5 py-1 text-[8.5px] font-semibold transition", period === value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink")}
                  >
                    {value} j
                  </button>
                ))}
              </div>
            </div>
            <PeriodChart period={period} />
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
              {[
                { label: "Taux d’engagement", value: "6,8 %" },
                { label: "Temps de visionnage", value: "2 min 04" },
                { label: "Nouveaux abonnés", value: "+1 284" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[9.5px] font-semibold text-ink">{item.value}</p>
                  <p className="mt-0.5 text-[7.5px] text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Vos meilleurs contenus</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Ce qui a marqué les esprits</h2>
                </div>
                <button type="button" onClick={() => setTab("content")} className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</button>
              </div>
              <div className="divide-y divide-line px-3 pb-2 pt-1.5">
                {contentStats.slice(0, 3).map((content, index) => (
                  <div key={content.id} className="flex items-center gap-2.5 py-2.5">
                    <span className="w-3 shrink-0 font-display text-[11px] font-semibold text-line-strong">{index + 1}</span>
                    <Photo src={content.poster} alt={content.title} className="size-11 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9.5px] font-semibold text-ink">{content.title}</p>
                      <p className="mt-0.5 text-[7.5px] text-muted">{content.format} · {formatCount(content.views)} vues</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[7.5px] font-bold text-brand-ink">{content.trend}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Monétisation</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Vos revenus</h2>
                </div>
                <span className="grid size-8 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
                  <Coins className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-[25px] font-semibold leading-none tracking-[-0.05em] text-ink">{formatPrice(84500)}</p>
              <p className="mt-1 text-[8.5px] text-muted">Revenus estimés · octobre 2026</p>
              <ProgressBar value={84} label="Objectif mensuel" valueLabel="84 / 100 k" className="mt-3" />
              <div className="mt-3 space-y-1.5 border-t border-line pt-2.5">
                <div className="flex justify-between text-[8.5px]"><span className="text-muted">Étoiles</span><span className="font-semibold text-ink">32 000 FCFA</span></div>
                <div className="flex justify-between text-[8.5px]"><span className="text-muted">Bonus créateur</span><span className="font-semibold text-ink">18 500 FCFA</span></div>
                <div className="flex justify-between text-[8.5px]"><span className="text-muted">Ventes marketplace</span><span className="font-semibold text-ink">34 000 FCFA</span></div>
              </div>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => setTab("revenue")}>
                Voir le détail
                <ArrowRight className="size-3.5" />
              </Button>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-brand">
                  <Sparkles className="size-3" />
                  Idées N’Teri AI
                </p>
                <h2 className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">Et si vous publiiez…</h2>
              </div>
              <Chip onClick={() => showToast("Nouvelles idées générées par N’Teri AI.", "info")}>
                <Lightbulb className="size-3" />
                Régénérer
              </Chip>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {contentIdeas.map((idea) => (
                <div key={idea.title} className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-muted/40 p-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
                    <idea.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-semibold leading-tight text-ink">{idea.title}</p>
                    <p className="mt-1 text-[7.5px] text-muted">{idea.format} · <span className="font-semibold text-brand">{idea.score}</span></p>
                  </div>
                  <button type="button" onClick={() => { openComposer("post"); showToast("Idée ajoutée au composeur.", "info"); }} aria-label={`Créer : ${idea.title}`} className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-brand/30 hover:text-brand">
                    <Plus className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Vues totales", value: formatCount(totalViews), icon: Eye, tone: "bg-tone-river text-tone-river-ink" },
              { label: "Interactions", value: formatCount(totalReactions), icon: Heart, tone: "bg-tone-red text-tone-red-ink" },
              { label: "Taux moyen", value: "8,6 %", icon: Activity, tone: "bg-tone-green text-tone-green-ink" },
            ].map((stat) => (
              <Card key={stat.label} className="flex items-center gap-2.5 p-3">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", stat.tone)}>
                  <stat.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold leading-none text-ink">{stat.value}</p>
                  <p className="mt-1 truncate text-[7.5px] uppercase tracking-[0.08em] text-muted">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {(["Tout", "Reel", "Vidéo", "Story", "Publication"] as const).map((filter) => (
              <Chip key={filter} active={contentFilter === filter} onClick={() => setContentFilter(filter)}>
                {filter}
              </Chip>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1fr_54px_60px_58px_52px] gap-2 border-b border-line bg-surface-muted/60 px-3 py-2 text-[7px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
              <span>Contenu</span>
              <span className="text-right">Vues</span>
              <span className="text-right">Réactions</span>
              <span className="text-right">Partages</span>
              <span className="text-right">Taux</span>
            </div>
            <div className="divide-y divide-line">
              {filteredContent.map((content) => (
                <div key={content.id} className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[1fr_54px_60px_58px_52px]">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-xl">
                      <Photo src={content.poster} alt={content.title} className="size-full" />
                      <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                        <Play className="size-3" fill="currentColor" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[9.5px] font-semibold text-ink">{content.title}</p>
                      <p className="mt-0.5 text-[7.5px] text-muted">{content.format} · {content.date}</p>
                    </div>
                  </div>
                  <span className="hidden text-right text-[9px] font-semibold text-ink sm:block">{formatCount(content.views)}</span>
                  <span className="hidden text-right text-[9px] text-ink-soft sm:block">{formatCount(content.reactions)}</span>
                  <span className="hidden text-right text-[9px] text-ink-soft sm:block">{formatCount(content.shares)}</span>
                  <span className="text-right text-[8.5px] font-bold text-brand">{content.rate}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
                <CalendarDays className="size-4" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold text-ink">Planifier vos prochaines publications</p>
                <p className="mt-0.5 text-[8.5px] text-muted">Publiez au meilleur moment pour votre audience.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => showToast("Calendrier éditorial ouvert (simulation).", "info")}>
              Ouvrir le calendrier
              <ChevronRight className="size-3.5" />
            </Button>
          </Card>
        </div>
      )}

      {tab === "audience" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: "Membres uniques", value: formatCount(analytics.dau), hint: "30 derniers jours" },
              { label: "Nouveaux abonnés", value: "+4 820", hint: "+14 % ce mois" },
              { label: "Taux de rétention", value: `${analytics.retention} %`, hint: "audience fidèle" },
              { label: "Partages", value: "12,6 k", hint: "+21 % ce mois" },
            ].map((stat) => (
              <Card key={stat.label} className="p-3">
                <p className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-muted">{stat.label}</p>
                <p className="mt-1.5 font-display text-[18px] font-semibold leading-none tracking-[-0.03em] text-ink">{stat.value}</p>
                <p className="mt-1 text-[7.5px] text-muted">{stat.hint}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Géographie</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">D’où vient votre audience</h2>
              <div className="mt-3 space-y-2.5">
                {audienceCities.map((city) => (
                  <div key={city.name}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-[8.5px]">
                      <span className="font-medium text-ink-soft">{city.name}</span>
                      <span className="text-muted">{city.count} · {city.percent} %</span>
                    </div>
                    <ProgressBar value={city.percent} max={60} />
                  </div>
                ))}
              </div>
              <InlineNotice tone="info" className="mt-3">
                Bamako concentre 52 % de votre audience. Ségou progresse de 18 % ce mois-ci.
              </InlineNotice>
            </Card>

            <div className="space-y-3">
              <Card className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Démographie</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Âge et genre</h2>
                <div className="mt-3">
                  <GenderDonut />
                </div>
                <div className="mt-3 space-y-2 border-t border-line pt-2.5">
                  {ageGroups.map((group) => (
                    <div key={group.label} className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-[8px] text-muted">{group.label}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${group.percent}%` }} />
                      </span>
                      <span className="w-6 text-right text-[7.5px] font-semibold text-ink-soft">{group.percent}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Moments forts</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Quand votre audience est active</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-[7.5px] font-semibold text-muted">
                <Clock className="size-2.5" /> Heure de Bamako
              </span>
            </div>
            <div className="mt-3 overflow-x-auto">
              <div className="grid min-w-[300px] grid-cols-[34px_repeat(7,1fr)] gap-1">
                <span />
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <span key={day} className="text-center text-[7px] font-semibold text-muted">{day}</span>
                ))}
                {["6 h", "10 h", "14 h", "18 h", "21 h"].map((hour, rowIndex) => (
                  <div key={hour} className="contents">
                    <span className="flex items-center text-[7px] text-muted">{hour}</span>
                    {bestTimes[rowIndex].map((level, index) => (
                      <span
                        key={`${hour}-${index}`}
                        title={`${hour} · niveau ${level}`}
                        className={cn(
                          "h-6 rounded-md transition hover:scale-105",
                          level > 80 ? "bg-brand" : level > 60 ? "bg-brand/60" : level > 40 ? "bg-brand/35" : level > 25 ? "bg-brand/20" : "bg-surface-muted",
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2 text-[7px] text-muted">
              <span>Moins actif</span>
              <span className="flex gap-0.5">
                {[0.15, 0.25, 0.45, 0.7, 1].map((opacity) => (
                  <span key={opacity} className="size-2.5 rounded-sm bg-brand" style={{ opacity }} />
                ))}
              </span>
              <span>Plus actif</span>
            </div>
          </Card>
        </div>
      )}

      {tab === "revenue" && (
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-[1.25fr_0.75fr]">
              <div className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Revenus créateur</p>
                <p className="mt-2 font-display text-[32px] font-semibold leading-none tracking-[-0.055em] text-ink">84 500 <span className="font-sans text-[11px] font-medium tracking-normal text-muted">FCFA</span></p>
                <p className="mt-1 text-[9px] text-muted">Octobre 2026 · estimation avant taxes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => showToast("Demande de versement simulée vers Orange Money.", "info")}>
                    <Banknote className="size-3.5" />
                    Retirer mes revenus
                  </Button>
                  <Link to="/portefeuille" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[10.5px] font-semibold text-ink-soft transition hover:bg-surface-muted">
                    <Wallet className="size-3.5" />
                    Portefeuille
                  </Link>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 border-t border-line bg-surface-muted/40 p-4 sm:border-l sm:border-t-0">
                {[
                  { label: "Étoiles reçues", value: "1 284", icon: Star },
                  { label: "Ventes Marketplace", value: "3", icon: Target },
                  { label: "Bonus du mois", value: "18 500 FCFA", icon: Sparkles },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-lg bg-surface text-brand shadow-sm">
                      <item.icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 text-[8.5px] text-muted">{item.label}</span>
                    <span className="text-[9px] font-semibold text-ink">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Disponible au retrait" value={formatPrice(47500)} hint="versement sous 48 h" icon={<Wallet className="size-4" />} tone="green" />
            <StatCard label="En attente" value={formatPrice(37000)} hint="validation des ventes" icon={<Clock className="size-4" />} tone="yellow" />
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Détail</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">D’où viennent vos revenus</h2>
              </div>
              <Chip onClick={() => showToast("Relevé de revenus exporté (simulation).", "info")}>
                <Download className="size-3" />
                Relevé
              </Chip>
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                { label: "Étoiles & soutiens", amount: 32000, percent: 38, tone: "bg-brand" },
                { label: "Ventes Marketplace", amount: 34000, percent: 40, tone: "bg-[color:var(--color-mali-yellow)]" },
                { label: "Bonus créateur", amount: 18500, percent: 22, tone: "bg-tone-river-ink" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[8.5px]">
                    <span className="text-muted">{item.label}</span>
                    <span className="font-semibold text-ink">{formatPrice(item.amount)}</span>
                  </div>
                  <ProgressBar value={item.percent} className="[&>div>div]:bg-current" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Historique</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Crédits récents</h2>
              </div>
              <Link to="/portefeuille" className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</Link>
            </div>
            <div className="divide-y divide-line px-4 pb-2 pt-1">
              {revenueTransactions.slice(0, 4).map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-2.5 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                    <ArrowDownRight className="size-4 rotate-180" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9.5px] font-semibold text-ink">{transaction.label}</p>
                    <p className="mt-0.5 text-[7.5px] text-muted">{transaction.date}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-brand">+{formatPrice(transaction.amount)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-tone-green text-tone-green-ink">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold text-ink">Vous êtes éligible au programme Créateur</p>
                <p className="mt-0.5 text-[8.5px] text-muted">Vos revenus sont versés via Orange Money ou Moov Money.</p>
              </div>
            </div>
            <Link to="/parametres" className="text-[8.5px] font-semibold text-brand hover:underline">Gérer mes paiements</Link>
          </Card>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1"><DemoTag /> Statistiques simulées · N’Teriface Creator</span>
        <span className="inline-flex items-center gap-1"><ChartLine className="size-3" />Dernière mise à jour : aujourd’hui, 09:42</span>
      </div>
    </div>
  );
}
