import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CreditCard,
  Download,
  Ellipsis,
  Eye,
  Image as ImageIcon,
  Info,
  MapPin,
  Megaphone,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
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
  Menu,
  Modal,
  Photo,
  ProgressBar,
  SegmentedTabs,
  StatCard,
  Switch,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { adCampaigns, people, transactions } from "@/data";
import { cn, formatCount, formatPrice, formatFullNumber } from "@/lib/utils";
import { useApp } from "@/store";

type AdsTab = "campaigns" | "audiences" | "billing";
type CampaignStatus = "Active" | "En pause" | "Terminée";

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  results: string;
  reach: number;
  ctr: string;
  trend: string;
}

const parseAmount = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;
const objectives = ["Ventes", "Messages", "Trafic", "Notoriété"] as const;
const statusStyles: Record<CampaignStatus, string> = {
  Active: "bg-brand-soft text-brand-ink",
  "En pause": "bg-gold-soft text-[color:var(--color-gold)]",
  Terminée: "bg-surface-muted text-muted",
};

const weeklySpend = [
  { day: "Lun", value: 32 },
  { day: "Mar", value: 41 },
  { day: "Mer", value: 38 },
  { day: "Jeu", value: 52 },
  { day: "Ven", value: 46 },
  { day: "Sam", value: 61 },
  { day: "Dim", value: 58 },
];

const audiences = [
  {
    id: "aud-1",
    name: "Bamako · Mode & artisanat",
    detail: "Bamako, Mali · 25–40 ans",
    size: "86 400",
    type: "Personnalisée",
    source: "Intérêts + comportement",
    icon: Users,
    tone: "bg-tone-green text-tone-green-ink",
  },
  {
    id: "aud-2",
    name: "Diaspora malienne",
    detail: "France, Côte d’Ivoire, Sénégal",
    size: "42 800",
    type: "Automatique",
    source: "Personnes ayant quitté le Mali",
    icon: MapPin,
    tone: "bg-tone-river text-tone-river-ink",
  },
  {
    id: "aud-3",
    name: "Retargeting · visiteurs 30 j",
    detail: "Toute personne ayant interagi",
    size: "18 200",
    type: "Retargeting",
    source: "Pixel N’Teriface",
    icon: Target,
    tone: "bg-tone-indigo text-tone-indigo-ink",
  },
  {
    id: "aud-4",
    name: "Créateurs & artisans",
    detail: "Mali · 18–45 ans",
    size: "31 600",
    type: "Personnalisée",
    source: "Pages et groupes créatifs",
    icon: Sparkles,
    tone: "bg-tone-yellow text-tone-yellow-ink",
  },
];

function CreateCampaignModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}) {
  const { showToast } = useApp();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<(typeof objectives)[number]>("Ventes");
  const [budget, setBudget] = useState("25000");
  const [duration, setDuration] = useState("7");
  const [audience, setAudience] = useState("Bamako · Mode & artisanat");
  const [headline, setHeadline] = useState("La collection Harmattan est arrivée.");
  const [copy, setCopy] = useState("Pièces en édition limitée, façonnées à Ségou. Livraison à Bamako sous 48 h.");
  const [placements, setPlacements] = useState<string[]>(["Fil d’actualité", "Reels"]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setObjective("Ventes");
    setBudget("25000");
    setDuration("7");
    setAudience("Bamako · Mode & artisanat");
    setHeadline("La collection Harmattan est arrivée.");
    setCopy("Pièces en édition limitée, façonnées à Ségou. Livraison à Bamako sous 48 h.");
    setPlacements(["Fil d’actualité", "Reels"]);
    setError(null);
  }, [open]);

  const togglePlacement = (placement: string) => {
    setPlacements((current) =>
      current.includes(placement) ? current.filter((item) => item !== placement) : [...current, placement],
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError("Donnez un nom d’au moins 3 caractères à votre campagne.");
      return;
    }
    const weekly = Number(budget);
    if (!Number.isFinite(weekly) || weekly < 1000) {
      setError("Le budget doit être d’au moins 1 000 FCFA par jour.");
      return;
    }
    onCreate({
      id: `camp-${Date.now()}`,
      name: name.trim(),
      objective,
      status: "Active",
      budget: weekly * Math.max(1, Number(duration)),
      spent: 0,
      results: "0 résultat",
      reach: 0,
      ctr: "—",
      trend: "Nouveau",
    });
    showToast("Campagne créée. Elle est en cours d’examen par N’Teriface.", "info");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Créer une campagne"
      description="Définissez votre objectif, votre audience et votre budget. Vous pourrez modifier la campagne à tout moment."
      size="xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="campaign-form">
            <Megaphone className="size-3.5" />
            Lancer la campagne
          </Button>
        </>
      }
    >
      <form id="campaign-form" onSubmit={submit} className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {error && <InlineNotice tone="danger">{error}</InlineNotice>}
          <Field label="Nom de la campagne">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Collection Harmattan — novembre" className={fieldClass} maxLength={70} autoFocus />
          </Field>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Objectif</span>
            <div className="grid grid-cols-2 gap-1.5">
              {objectives.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setObjective(item)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[10px] font-semibold transition",
                    objective === item ? "border-brand/30 bg-brand-soft text-brand-ink" : "border-line bg-surface text-ink-soft hover:border-line-strong",
                  )}
                >
                  {objective === item ? <Check className="size-3" /> : <Target className="size-3" />}
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget / jour (FCFA)">
              <input type="number" min={1000} step={500} value={budget} onChange={(event) => setBudget(event.target.value)} className={fieldClass} />
            </Field>
            <Field label="Durée">
              <select value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClass}>
                <option value="3">3 jours</option>
                <option value="7">7 jours</option>
                <option value="14">14 jours</option>
                <option value="30">30 jours</option>
              </select>
            </Field>
          </div>
          <Field label="Audience">
            <select value={audience} onChange={(event) => setAudience(event.target.value)} className={fieldClass}>
              {audiences.map((item) => (
                <option key={item.id} value={item.name}>{item.name} · {item.size}</option>
              ))}
            </select>
          </Field>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Emplacements</span>
            <div className="flex flex-wrap gap-1.5">
              {["Fil d’actualité", "Reels", "Stories", "Marketplace"].map((placement) => (
                <Chip key={placement} active={placements.includes(placement)} onClick={() => togglePlacement(placement)}>
                  {placements.includes(placement) && <Check className="size-2.5" />}
                  {placement}
                </Chip>
              ))}
            </div>
          </div>
          <Field label="Titre de l’annonce">
            <input value={headline} onChange={(event) => setHeadline(event.target.value)} maxLength={60} className={fieldClass} />
          </Field>
          <Field label="Texte de l’annonce" hint={`${copy.length}/160 caractères`}>
            <textarea value={copy} onChange={(event) => setCopy(event.target.value.slice(0, 160))} rows={3} className={cn(fieldClass, "h-auto resize-none py-2.5")} />
          </Field>
        </div>

        <div>
          <div className="rounded-2xl border border-line bg-surface-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
              <Megaphone className="size-3 text-brand" />
              Aperçu
            </p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              <div className="flex items-center gap-2 p-2.5">
                <Avatar name="Faso Kréa" tone="clay" size="md" shape="squircle" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-[9.5px] font-semibold text-ink">
                    Faso Kréa
                    <VerifiedBadge className="size-3" />
                  </p>
                  <p className="text-[7.5px] text-muted">Sponsorisé · <span className="text-ink-soft">Bamako</span></p>
                </div>
                <Ellipsis className="size-3.5 text-muted" />
              </div>
              <p className="px-2.5 pb-2 text-[9px] leading-relaxed text-ink-soft">{copy || "Votre texte apparaîtra ici."}</p>
              <Photo
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=82"
                alt="Aperçu de l’annonce"
                className="aspect-[16/10]"
              />
              <div className="flex items-center justify-between gap-2 border-t border-line p-2.5">
                <div className="min-w-0">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-muted">fasokrea.ml</p>
                  <p className="mt-0.5 line-clamp-2 text-[9px] font-semibold text-ink">{headline || "Votre titre"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1.5 text-[8px] font-bold text-brand-ink">Découvrir</span>
              </div>
            </div>
          </div>
          <InlineNotice tone="info" className="mt-3">
            Estimation : <strong>{formatPrice(Number(budget) || 0)}</strong> / jour · portée estimée{" "}
            <strong>{formatCount(Math.round((Number(budget) || 0) * 4.2))}</strong> personnes.
          </InlineNotice>
          <p className="mt-2 flex items-start gap-1.5 text-[8px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-3 shrink-0 text-brand" />
            Les publicités sont examinées selon les règles de N’Teriface. Aucun paiement réel n’est effectué dans cette démo.
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default function AdsPage() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<AdsTab>("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    adCampaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status as CampaignStatus,
      budget: parseAmount(campaign.budget),
      spent: parseAmount(campaign.spent),
      results: campaign.results,
      reach: parseAmount(campaign.reach),
      ctr: campaign.ctr,
      trend: campaign.trend,
    })),
  );
  const [statusFilter, setStatusFilter] = useState<"Toutes" | CampaignStatus>("Toutes");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [autoAudience, setAutoAudience] = useState(true);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return campaigns.filter(
      (campaign) =>
        (statusFilter === "Toutes" || campaign.status === statusFilter) &&
        (!term || campaign.name.toLowerCase().includes(term) || campaign.objective.toLowerCase().includes(term)),
    );
  }, [campaigns, query, statusFilter]);

  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const activeCount = campaigns.filter((campaign) => campaign.status === "Active").length;

  const toggleStatus = (id: string) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status: campaign.status === "Active" ? "En pause" : "Active" }
          : campaign,
      ),
    );
    const campaign = campaigns.find((item) => item.id === id);
    showToast(campaign?.status === "Active" ? "Campagne mise en pause." : "Campagne réactivée.", "info");
  };

  const duplicate = (campaign: Campaign) => {
    setCampaigns((current) => [
      { ...campaign, id: `camp-${Date.now()}`, name: `${campaign.name} — copie`, status: "En pause", spent: 0, results: "0 résultat", reach: 0, ctr: "—", trend: "Nouveau" },
      ...current,
    ]);
    showToast("Campagne dupliquée. Elle est en pause par défaut.", "info");
  };

  const remove = (id: string) => {
    setCampaigns((current) => current.filter((campaign) => campaign.id !== id));
    showToast("Campagne supprimée de la démonstration.", "info");
  };

  const billingTransactions = transactions.filter((transaction) => transaction.amount < 0).slice(0, 4);

  return (
    <div>
      <PageIntro
        eyebrow="Développez votre audience"
        title="Centre publicitaire"
        description="Créez des campagnes qui touchent les bonnes personnes à Bamako, au Mali et dans la diaspora."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Créer une publicité
          </Button>
        }
      />

      <Card className="mb-3 overflow-hidden">
        <div className="relative bg-[linear-gradient(130deg,#0e2c1d,#075c35)] p-4 text-white">
          <span className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full border border-white/10" />
          <span className="pointer-events-none absolute -bottom-20 right-16 size-40 rounded-full border border-white/5" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-white/55">Budget du mois · octobre</p>
              <p className="mt-1.5 font-display text-[30px] font-semibold leading-none tracking-[-0.05em]">
                {formatPrice(totalSpent)}
                <span className="ml-1.5 font-sans text-[10px] font-medium tracking-normal text-white/55">dépensés sur {formatPrice(totalBudget)}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[8px] font-semibold backdrop-blur">
              <TrendingUp className="size-3 text-[color:var(--color-mali-yellow)]" />
              +18 % vs septembre
            </span>
          </div>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[color:var(--color-mali-yellow)]" style={{ width: `${Math.min(100, Math.round((totalSpent / Math.max(1, totalBudget)) * 100))}%` }} />
          </div>
          <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 text-[8px] text-white/60">
            <span>{Math.round((totalSpent / Math.max(1, totalBudget)) * 100)} % du budget consommé</span>
            <span>{formatPrice(Math.max(0, totalBudget - totalSpent))} restants · {activeCount} campagnes actives</span>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line sm:grid-cols-4">
          {[
            { label: "Impressions", value: "312 400", delta: "+14 %" },
            { label: "Clics", value: "8 942", delta: "+21 %" },
            { label: "Taux de clic", value: "2,9 %", delta: "+0,4 pt" },
            { label: "Conversions", value: "184", delta: "+9 %" },
          ].map((item) => (
            <div key={item.label} className="p-3">
              <p className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-muted">{item.label}</p>
              <p className="mt-1 font-display text-[16px] font-semibold leading-none tracking-[-0.03em] text-ink">{item.value}</p>
              <p className="mt-1 text-[7.5px] font-semibold text-brand">{item.delta}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-3">
        <SegmentedTabs
          items={[
            { id: "campaigns", label: "Campagnes", count: campaigns.length },
            { id: "audiences", label: "Audiences", count: audiences.length },
            { id: "billing", label: "Facturation" },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Sections du centre publicitaire"
        />
      </div>

      {tab === "campaigns" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Dépensé ce mois" value={formatPrice(totalSpent)} hint={`${activeCount} campagnes actives`} icon={<CircleDollarSign className="size-4" />} tone="green" sparkline={[3, 4, 4, 6, 7, 8, 9, 11]} />
            <StatCard label="Coût par résultat" value="1 562 FCFA" delta="−8 %" hint="moyenne toutes campagnes" icon={<MousePointerClick className="size-4" />} tone="river" sparkline={[9, 8, 9, 7, 7, 6, 6, 5]} />
          </div>

          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Dépenses</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Les 7 derniers jours</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-[7.5px] font-semibold text-muted">
                <CalendarDays className="size-2.5" />
                19 – 25 octobre
              </span>
            </div>
            <div className="mt-3 flex h-[112px] items-end gap-2">
              {weeklySpend.map((day, index) => {
                const max = Math.max(...weeklySpend.map((item) => item.value));
                return (
                  <div key={day.day} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5" title={`${day.day} · ${day.value} 000 FCFA`}>
                    <span className="text-[7px] font-semibold text-muted opacity-0 transition group-hover:opacity-100">{day.value} k</span>
                    <span
                      className={cn("w-full rounded-t-lg transition duration-500 group-hover:brightness-110", index === weeklySpend.length - 1 ? "bg-brand" : "bg-brand/25")}
                      style={{ height: `${(day.value / max) * 82}px` }}
                    />
                    <span className="text-[7px] font-medium text-muted">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
              {(["Toutes", "Active", "En pause", "Terminée"] as const).map((status) => (
                <Chip key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)}>
                  {status}
                </Chip>
              ))}
            </div>
            <div className="relative w-full sm:w-[190px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une campagne…" aria-label="Rechercher une campagne" className={cn(fieldClass, "h-9 rounded-full pl-8 text-[10px]")} />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-2.5">
              {filtered.map((campaign) => {
                const progress = Math.min(100, Math.round((campaign.spent / Math.max(1, campaign.budget)) * 100));
                return (
                  <Card key={campaign.id} className="overflow-hidden">
                    <div className="flex items-start justify-between gap-2 p-3.5">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", campaign.status === "Active" ? "bg-brand-soft text-brand-ink" : "bg-surface-muted text-muted")}>
                          <Megaphone className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-ink">{campaign.name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[8px] text-muted">
                            <span>{campaign.objective}</span>
                            <span className="size-1 rounded-full bg-line-strong" />
                            <span>{formatCount(campaign.reach)} personnes touchées</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[7.5px] font-bold", statusStyles[campaign.status])}>{campaign.status}</span>
                        <Menu
                          label={`Options de la campagne ${campaign.name}`}
                          trigger={
                            <span className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink">
                              <Ellipsis className="size-4" />
                            </span>
                          }
                          items={[
                            { label: "Voir le rapport", onClick: () => showToast(`Rapport de « ${campaign.name} » affiché.`, "info") },
                            { label: campaign.status === "Active" ? "Mettre en pause" : "Activer", icon: campaign.status === "Active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />, onClick: () => toggleStatus(campaign.id) },
                            { label: "Dupliquer", icon: <Copy className="size-3.5" />, onClick: () => duplicate(campaign) },
                            { label: "", separator: true },
                            { label: "Supprimer", icon: <Trash2 className="size-3.5" />, danger: true, onClick: () => remove(campaign.id) },
                          ]}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-line border-y border-line bg-surface-muted/40">
                      {[
                        { label: "Budget", value: formatPrice(campaign.budget) },
                        { label: "Dépensé", value: formatPrice(campaign.spent) },
                        { label: "Résultats", value: campaign.results },
                      ].map((item) => (
                        <div key={item.label} className="px-3 py-2">
                          <p className="text-[7px] font-semibold uppercase tracking-[0.08em] text-muted">{item.label}</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-ink">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2.5">
                      <ProgressBar value={progress} className="min-w-0 flex-1" />
                      <span className="shrink-0 text-[7.5px] font-semibold text-muted">{progress} %</span>
                      <span className="shrink-0 text-[7.5px] font-semibold text-brand">{campaign.ctr} CTR</span>
                      <span className="shrink-0 text-[7.5px] font-bold text-brand">{campaign.trend}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-[20px] bg-surface-muted text-muted">
                  <Search className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">Aucune campagne trouvée</h2>
                <p className="mt-1 text-[10px] text-muted">Essayez un autre filtre ou créez une nouvelle campagne.</p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>Créer une campagne</Button>
              </div>
            </Card>
          )}

          <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold text-ink">Laissez N’Teri AI optimiser vos campagnes</p>
                <p className="mt-0.5 text-[8.5px] text-muted">Suggestions de budget, d’audience et de visuels chaque semaine.</p>
              </div>
            </div>
            <Switch checked={autoAudience} onChange={setAutoAudience} label="Optimisation auto" />
          </Card>
        </div>
      )}

      {tab === "audiences" && (
        <div className="space-y-3">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Vos audiences enregistrées</h2>
              <p className="mt-0.5 text-[9px] text-muted">Composez des groupes précis pour vos prochaines campagnes.</p>
            </div>
            <Button size="sm" onClick={() => showToast("Création d’audience simulée depuis vos données de démonstration.", "info")}>
              <Plus className="size-3.5" />
              Créer une audience
            </Button>
          </Card>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {audiences.map((audience) => (
              <Card key={audience.id} hover className="p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", audience.tone)}>
                    <audience.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-ink">{audience.name}</p>
                    <p className="mt-0.5 text-[8px] text-muted">{audience.detail}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-muted px-1.5 py-0.5 text-[7px] font-semibold text-muted">{audience.type}</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2 border-t border-line pt-2.5">
                  <div>
                    <p className="font-display text-[17px] font-semibold leading-none text-ink">{audience.size}</p>
                    <p className="mt-1 text-[7.5px] text-muted">personnes estimées</p>
                  </div>
                  <button type="button" onClick={() => showToast(`Audience « ${audience.name} » appliquée à une nouvelle campagne.`, "info")} className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                    Utiliser <ArrowUpRight className="size-2.5" />
                  </button>
                </div>
                <p className="mt-2 text-[7.5px] text-muted">Source : {audience.source}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Aperçu</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Votre audience principale</h2>
              <div className="mt-3">
                <GenderBars />
              </div>
              <div className="mt-3 space-y-2 border-t border-line pt-2.5">
                {[
                  { label: "Bamako", percent: 58 },
                  { label: "Ségou", percent: 14 },
                  { label: "Diaspora", percent: 18 },
                  { label: "Autres villes", percent: 10 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-[8px]"><span className="text-muted">{item.label}</span><span className="font-semibold text-ink">{item.percent} %</span></div>
                    <ProgressBar value={item.percent} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Centres d’intérêt</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Ce qui rassemble votre audience</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Mode", "Artisanat", "Culture malienne", "Musique", "Cuisine", "Voyages", "Entrepreneuriat", "Photographie", "Bogolan", "Diaspora"].map((interest) => (
                  <span key={interest} className="rounded-full border border-line bg-surface-muted px-2.5 py-1.5 text-[8.5px] font-medium text-ink-soft">{interest}</span>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-line bg-surface-muted/50 p-3">
                <p className="flex items-center gap-1.5 text-[9.5px] font-semibold text-ink"><Sparkles className="size-3.5 text-brand" />Suggestion N’Teri AI</p>
                <p className="mt-1 text-[8.5px] leading-relaxed text-muted">
                  Votre audience est plus active entre 18 h et 21 h. Programmez vos campagnes sur ce créneau pour améliorer le CTR de 12 à 18 %.
                </p>
              </div>
            </Card>
          </div>

          <InlineNotice tone="info">
            Les audiences sont fictives et ne contiennent aucune donnée personnelle réelle. Vous pouvez les modifier ou les supprimer à tout moment.
          </InlineNotice>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Moyen de paiement</p>
                  <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Portefeuille publicitaire</h2>
                </div>
                <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
                  <Wallet className="size-4" />
                </span>
              </div>
              <div className="mt-3 rounded-2xl bg-[linear-gradient(130deg,#173d55,#0d2333)] p-3.5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/55">Solde disponible</span>
                  <CreditCard className="size-4 text-white/60" />
                </div>
                <p className="mt-2 font-display text-[24px] font-semibold leading-none tracking-[-0.04em]">{formatPrice(112400)}</p>
                <div className="mt-3 flex items-center justify-between text-[8px] text-white/65">
                  <span>Orange Money · •••• 4218</span>
                  <span>Bamako, Mali</span>
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => showToast("Rechargement simulé : 50 000 FCFA ajoutés.", "info")}>
                  <Plus className="size-3.5" />
                  Recharger
                </Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => showToast("Gestion des moyens de paiement (simulation).", "info")}>
                  <CreditCard className="size-3.5" />
                  Modifier
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Prochaine facture</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Récapitulatif du mois</h2>
              <p className="mt-2 font-display text-[25px] font-semibold leading-none tracking-[-0.045em] text-ink">{formatPrice(totalSpent)}</p>
              <p className="mt-1 text-[8.5px] text-muted">Montant estimé · prélèvement le 1<sup>er</sup> novembre 2026</p>
              <div className="mt-3 space-y-1.5 border-t border-line pt-2.5 text-[8.5px]">
                <div className="flex justify-between"><span className="text-muted">Campagnes actives</span><span className="font-semibold text-ink">{activeCount}</span></div>
                <div className="flex justify-between"><span className="text-muted">TVA (18 %)</span><span className="font-semibold text-ink">{formatPrice(Math.round(totalSpent * 0.18))}</span></div>
                <div className="flex justify-between border-t border-line pt-1.5"><span className="font-semibold text-ink">Total estimé</span><span className="font-bold text-ink">{formatPrice(Math.round(totalSpent * 1.18))}</span></div>
              </div>
              <InlineNotice tone="success" className="mt-2.5">
                Votre plafond de dépenses mensuel est de 400 000 FCFA. Vous pouvez le modifier dans les paramètres de facturation.
              </InlineNotice>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Historique</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Dernières transactions</h2>
              </div>
              <button type="button" onClick={() => showToast("Toutes les factures exportées (simulation).", "info")} className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                <Download className="size-3" /> Exporter
              </button>
            </div>
            <div className="divide-y divide-line px-4 pb-2 pt-1">
              {billingTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-2.5 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-tone-red text-tone-red-ink">
                    <Receipt className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9.5px] font-semibold text-ink">{transaction.label}</p>
                    <p className="mt-0.5 text-[7.5px] text-muted">{transaction.date} · Facture NTF-2026-{transaction.id.replace("tx-", "0")}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-ink">{formatPrice(Math.abs(transaction.amount))}</span>
                  <button type="button" onClick={() => showToast("Facture téléchargée (simulation).", "info")} aria-label="Télécharger la facture" className="grid size-7 place-items-center rounded-full text-muted hover:bg-surface-muted hover:text-ink">
                    <Download className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Mode de facturation</p>
              <div className="mt-2">
                <Switch
                  checked
                  onChange={() => showToast("Facturation automatique activée.", "info")}
                  label="Rechargement automatique"
                  description="Rechargez le portefeuille quand le solde passe sous 25 000 FCFA."
                />
                <Switch
                  checked={false}
                  onChange={() => showToast("Les reçus mensuels seront envoyés par e-mail.", "info")}
                  label="Reçus par e-mail"
                  description="Recevez une facture détaillée chaque début de mois."
                />
              </div>
            </Card>
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                <Info className="size-3" />
                Besoin d’aide ?
              </p>
              <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">
                Une question sur une facture ou un prélèvement ? L’équipe publicitaire de N’Teriface vous répond sous 24 h.
              </p>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => showToast("Demande envoyée au support publicitaire.", "info")}>
                Contacter le support
                <ChevronRight className="size-3.5" />
              </Button>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1"><DemoTag /> Campagnes fictives · aucun paiement réel</span>
        <Link to="/parametres" className="font-semibold text-brand hover:underline">Règles publicitaires</Link>
      </div>

      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(campaign) => setCampaigns((current) => [campaign, ...current])}
      />
    </div>
  );
}

function GenderBars() {
  return (
    <div className="flex items-end gap-1.5">
      {[
        { label: "Femmes", value: 68, tone: "bg-brand" },
        { label: "Hommes", value: 28, tone: "bg-[color:var(--color-mali-yellow)]" },
        { label: "Autres", value: 4, tone: "bg-tone-river-ink" },
      ].map((item) => (
        <div key={item.label} className="flex-1">
          <div className="relative h-[72px] overflow-hidden rounded-t-lg bg-surface-muted">
            <span className={cn("absolute bottom-0 w-full rounded-t-lg", item.tone)} style={{ height: `${item.value}%` }} />
          </div>
          <p className="mt-1 text-center text-[9px] font-semibold text-ink">{item.value}%</p>
          <p className="text-center text-[7px] text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
