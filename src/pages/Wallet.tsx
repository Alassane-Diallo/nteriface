import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Info,
  Landmark,
  Lock,
  Mail,
  Phone,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Wallet,
  Waves,
  X,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import {
  Avatar,
  BrandMark,
  Button,
  Card,
  Chip,
  DemoTag,
  Field,
  InlineNotice,
  Menu,
  Modal,
  ProgressBar,
  SegmentedTabs,
  StatCard,
  Switch,
  fieldClass,
} from "@/components/ui";
import { transactions } from "@/data";
import { cn, formatFullNumber, formatPrice, searchNormalize } from "@/lib/utils";
import { useApp } from "@/store";

type WalletTab = "overview" | "transactions" | "methods";
type MoneyMode = "add" | "withdraw";

interface WalletTransaction {
  id: string;
  label: string;
  date: string;
  amount: number;
  type: string;
  method: string;
  status: string;
}

interface PayMethod {
  id: string;
  provider: string;
  detail: string;
  type: "mobile" | "card" | "bank";
  default: boolean;
  tone: "green" | "yellow" | "river" | "clay";
  fee: string;
}

const initialMethods: PayMethod[] = [
  { id: "method-orange", provider: "Orange Money", detail: "•••• 4218 · Awa Traoré", type: "mobile", default: true, tone: "yellow", fee: "Sans frais" },
  { id: "method-moov", provider: "Moov Money", detail: "•••• 7391 · Awa Traoré", type: "mobile", default: false, tone: "river", fee: "Sans frais" },
  { id: "method-wave", provider: "Wave", detail: "•••• 8920 · Awa Traoré", type: "mobile", default: false, tone: "green", fee: "1 %" },
  { id: "method-visa", provider: "Visa", detail: "•••• 2048 · Exp. 09/28", type: "card", default: false, tone: "clay", fee: "1,5 %" },
];

const cashflow = [
  { label: "Sem 1", income: 24600, outcome: 12800 },
  { label: "Sem 2", income: 18400, outcome: 9400 },
  { label: "Sem 3", income: 31200, outcome: 18600 },
  { label: "Sem 4", income: 42800, outcome: 21500 },
];

const initialTransactions: WalletTransaction[] = transactions.map((transaction, index) => ({
  id: transaction.id,
  label: transaction.label,
  date: transaction.date,
  amount: transaction.amount,
  type: transaction.type,
  method: index % 3 === 0 ? "Orange Money" : index % 3 === 1 ? "Portefeuille N’Teriface" : "Wave",
  status: "Réussi",
}));

function methodIcon(method: PayMethod) {
  if (method.type === "card") return CreditCard;
  if (method.type === "bank") return Landmark;
  return method.provider === "Wave" ? Waves : Smartphone;
}

const methodTone: Record<PayMethod["tone"], string> = {
  green: "bg-tone-green text-tone-green-ink",
  yellow: "bg-tone-yellow text-tone-yellow-ink",
  river: "bg-tone-river text-tone-river-ink",
  clay: "bg-tone-clay text-tone-clay-ink",
};

function MoneyModal({
  open,
  mode,
  balance,
  methods,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: MoneyMode;
  balance: number;
  methods: PayMethod[];
  onClose: () => void;
  onConfirm: (amount: number, methodId: string) => void;
}) {
  const [amount, setAmount] = useState("10000");
  const [methodId, setMethodId] = useState(methods.find((method) => method.default)?.id ?? methods[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const numeric = Number(amount);
  const method = methods.find((item) => item.id === methodId);
  const feeRate = method?.fee === "1 %" ? 0.01 : method?.fee === "1,5 %" ? 0.015 : 0;
  const fee = Math.round((Number.isFinite(numeric) ? numeric : 0) * feeRate);
  const total = mode === "withdraw" ? Math.max(0, numeric - fee) : numeric;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(numeric) || numeric < 1000) {
      setError("Le montant minimum est de 1 000 FCFA.");
      return;
    }
    if (mode === "withdraw" && numeric > balance) {
      setError("Le montant dépasse votre solde disponible.");
      return;
    }
    if (!methodId) {
      setError("Sélectionnez un moyen de paiement.");
      return;
    }
    onConfirm(numeric, methodId);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Ajouter de l’argent" : "Retirer de l’argent"}
      description={
        mode === "add"
          ? "Rechargez votre portefeuille N’Teriface depuis votre compte mobile money."
          : "Transférez vos gains vers Orange Money, Moov Money, Wave ou votre compte bancaire."
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="money-form" disabled={mode === "withdraw" && balance <= 0}>
            {mode === "add" ? "Ajouter" : "Retirer"} {Number.isFinite(numeric) && numeric > 0 ? formatPrice(mode === "withdraw" ? total : numeric) : ""}
          </Button>
        </>
      }
    >
      <form id="money-form" onSubmit={submit} className="space-y-4">
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div className="rounded-2xl border border-line bg-surface-muted/60 p-3 text-center">
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            {mode === "add" ? "Solde après recharge" : "Solde disponible"}
          </p>
          <p className="mt-1 font-display text-[24px] font-semibold leading-none tracking-[-0.04em] text-ink">
            {formatPrice(mode === "add" ? balance + (Number.isFinite(numeric) ? numeric : 0) : Math.max(0, balance - (Number.isFinite(numeric) ? numeric : 0)))}
          </p>
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Montant (FCFA)</span>
          <input
            type="number"
            min={1000}
            step={500}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={cn(fieldClass, "h-12 text-center font-display text-[20px] font-semibold")}
            aria-label="Montant en FCFA"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[5000, 10000, 25000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="rounded-full border border-line bg-surface px-2.5 py-1 text-[8.5px] font-semibold text-ink-soft transition hover:border-line-strong hover:text-ink"
              >
                {formatFullNumber(preset)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">{mode === "add" ? "Payer avec" : "Recevoir sur"}</span>
          <div className="space-y-1.5">
            {methods.map((item) => {
              const Icon = methodIcon(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethodId(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-2xl border p-2.5 text-left transition",
                    methodId === item.id ? "border-brand/40 bg-brand-soft/50" : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", methodTone[item.tone])}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold text-ink">{item.provider}</span>
                    <span className="mt-0.5 block truncate text-[8px] text-muted">{item.detail}</span>
                  </span>
                  {methodId === item.id && <Check className="size-4 shrink-0 text-brand" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-1 rounded-xl bg-surface-muted p-2.5 text-[8.5px]">
          <p className="flex justify-between"><span className="text-muted">Frais</span><span className="font-semibold text-ink">{fee > 0 ? formatPrice(fee) : "Sans frais"}</span></p>
          <p className="flex justify-between"><span className="text-muted">Montant reçu</span><span className="font-semibold text-ink">{formatPrice(Number.isFinite(total) ? total : 0)}</span></p>
          <p className="flex justify-between"><span className="text-muted">Délai</span><span className="font-semibold text-ink">Instantané</span></p>
        </div>
        <InlineNotice tone="info">
          Démonstration : aucun argent réel n’est transféré. Les montants sont simulés localement.
        </InlineNotice>
      </form>
    </Modal>
  );
}

function AddMethodModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (method: PayMethod) => void;
}) {
  const [provider, setProvider] = useState<PayMethod["provider"]>("Orange Money");
  const [account, setAccount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (account.trim().length < 5) {
      setError("Saisissez un numéro ou une référence valide.");
      return;
    }
    const type = provider === "Visa" ? "card" : provider === "Compte bancaire" ? "bank" : "mobile";
    onAdd({
      id: `method-${Date.now()}`,
      provider,
      detail: type === "card" ? `•••• ${account.slice(-4)} · Exp. 12/29` : `•••• ${account.slice(-4)} · Awa Traoré`,
      type,
      default: false,
      tone: provider === "Orange Money" ? "yellow" : provider === "Wave" ? "green" : provider === "Visa" ? "clay" : "river",
      fee: type === "card" ? "1,5 %" : "Sans frais",
    });
    setAccount("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter un moyen de paiement"
      description="Associez un compte mobile money ou une carte pour vos prochains paiements."
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="method-form">Ajouter</Button>
        </>
      }
    >
      <form id="method-form" onSubmit={submit} className="space-y-4">
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div className="grid grid-cols-2 gap-1.5">
          {["Orange Money", "Moov Money", "Wave", "Visa", "Compte bancaire"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setProvider(option)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[10px] font-semibold transition",
                provider === option ? "border-brand/40 bg-brand-soft text-brand-ink" : "border-line bg-surface text-ink-soft hover:border-line-strong",
              )}
            >
              {provider === option ? <Check className="size-3" /> : <Plus className="size-3" />}
              {option}
            </button>
          ))}
        </div>
        <Field label={provider === "Visa" || provider === "Compte bancaire" ? "Numéro de carte / compte" : "Numéro de téléphone"}>
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder={provider === "Visa" ? "4242 4242 4242 4242" : "+223 70 00 00 00"}
            className={fieldClass}
          />
        </Field>
        <InlineNotice tone="info">Le moyen de paiement sera vérifié par un code simulé. Aucune donnée bancaire réelle n’est demandée.</InlineNotice>
      </form>
    </Modal>
  );
}

export default function WalletPage() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<WalletTab>("overview");
  const [balance, setBalance] = useState(125400);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [methods, setMethods] = useState<PayMethod[]>(initialMethods);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(initialTransactions);
  const [moneyMode, setMoneyMode] = useState<MoneyMode | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [query, setQuery] = useState("");
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);

  const income = walletTransactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0);
  const outcome = walletTransactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const pending = 18500;

  const filteredTransactions = useMemo(() => {
    const term = searchNormalize(query);
    return walletTransactions.filter(
      (transaction) =>
        (filter === "all" || (filter === "in" ? transaction.amount > 0 : transaction.amount < 0)) &&
        (!term || searchNormalize(transaction.label).includes(term) || searchNormalize(transaction.method).includes(term)),
    );
  }, [filter, query, walletTransactions]);

  const handleMoney = (amount: number, methodId: string) => {
    const method = methods.find((item) => item.id === methodId);
    const feeRate = method?.fee === "1 %" ? 0.01 : method?.fee === "1,5 %" ? 0.015 : 0;
    const fee = Math.round(amount * feeRate);
    if (moneyMode === "add") {
      setBalance((current) => current + amount);
      setWalletTransactions((current) => [
        {
          id: `tx-${Date.now()}`,
          label: `Rechargement via ${method?.provider ?? "portefeuille"}`,
          date: "Aujourd’hui",
          amount,
          type: "in",
          method: method?.provider ?? "Portefeuille",
          status: "Réussi",
        },
        ...current,
      ]);
      showToast(`${formatPrice(amount)} ajoutés à votre portefeuille.`);
    } else {
      setBalance((current) => current - amount);
      setWalletTransactions((current) => [
        {
          id: `tx-${Date.now()}`,
          label: `Retrait vers ${method?.provider ?? "compte"}`,
          date: "Aujourd’hui",
          amount: -amount,
          type: "out",
          method: method?.provider ?? "Portefeuille",
          status: "En cours",
        },
        ...current,
      ]);
      showToast(`Retrait de ${formatPrice(amount - fee)} initié vers ${method?.provider ?? "votre compte"}.`, "info");
    }
  };

  const toggleDefault = (id: string) => {
    setMethods((current) => current.map((method) => ({ ...method, default: method.id === id })));
    showToast("Moyen de paiement par défaut mis à jour.", "info");
  };

  const removeMethod = (id: string) => {
    setMethods((current) => current.filter((method) => method.id !== id));
    showToast("Moyen de paiement retiré.", "info");
  };

  return (
    <div>
      <PageIntro
        eyebrow="Votre argent, simplement"
        title="Portefeuille"
        description="Recevez vos revenus, payez vos publicités et transférez de l’argent vers votre mobile money — en toute sécurité."
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setMoneyMode("withdraw")}>
              <ArrowUpRight className="size-3.5" />
              Retirer
            </Button>
            <Button size="sm" onClick={() => setMoneyMode("add")}>
              <Plus className="size-3.5" />
              Ajouter
            </Button>
          </div>
        }
      />

      <Card className="mb-3 overflow-hidden">
        <div className="relative overflow-hidden bg-[linear-gradient(125deg,#0e2c1d,#075c35_55%,#0b7a45)] p-4 text-white">
          <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border border-white/10" />
          <span className="pointer-events-none absolute -bottom-24 right-10 size-44 rounded-full border border-white/5" />
          <span className="pointer-events-none absolute right-4 top-4 opacity-20">
            <BrandMark className="size-14" />
          </span>
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[8.5px] font-bold uppercase tracking-[0.2em] text-white/55">
                Solde disponible
                <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[7px] tracking-normal text-white/70">Compte vérifié</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <p className="font-display text-[34px] font-semibold leading-none tracking-[-0.055em] sm:text-[40px]">
                  {balanceVisible ? formatPrice(balance) : "•••••• FCFA"}
                </p>
                <button type="button" onClick={() => setBalanceVisible((value) => !value)} aria-label={balanceVisible ? "Masquer le solde" : "Afficher le solde"} className="grid size-8 place-items-center rounded-full border border-white/15 bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white">
                  {balanceVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[8.5px] text-white/55">NTF · Awa Traoré · Orange Money •••• 4218</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setMoneyMode("add")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[10.5px] font-semibold text-brand-ink transition hover:bg-cream">
                  <Plus className="size-3.5" />
                  Ajouter de l’argent
                </button>
                <button type="button" onClick={() => setMoneyMode("withdraw")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 text-[10.5px] font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  <ArrowUpRight className="size-3.5" />
                  Retirer
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[8px]">
              <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 backdrop-blur">
                <p className="text-white/55">En attente</p>
                <p className="mt-1 font-display text-[13px] font-semibold">{formatPrice(pending)}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 backdrop-blur">
                <p className="text-white/55">Étoiles</p>
                <p className="mt-1 font-display text-[13px] font-semibold">12 400</p>
              </div>
              <div className="col-span-2 flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 text-[8px] text-white/70 backdrop-blur">
                <ShieldCheck className="size-3 text-[color:var(--color-mali-yellow)]" />
                Protégé par N’Teriface Pay
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2">
          <p className="text-[8.5px] text-muted">Dernière mise à jour : aujourd’hui à 09:42</p>
          <Link to="/createur" className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
            Voir mes revenus créateur <ChevronRight className="size-2.5" />
          </Link>
        </div>
      </Card>

      <div className="mb-3">
        <SegmentedTabs
          items={[
            { id: "overview", label: "Aperçu" },
            { id: "transactions", label: "Transactions", count: walletTransactions.length },
            { id: "methods", label: "Moyens de paiement", count: methods.length },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Sections du portefeuille"
        />
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Entrées du mois" value={formatPrice(income)} delta="+18 %" hint="revenus et ventes" icon={<ArrowDownLeft className="size-4" />} tone="green" sparkline={[4, 5, 6, 5, 7, 8, 9, 10]} />
            <StatCard label="Sorties du mois" value={formatPrice(outcome)} hint="retraits et publicités" icon={<ArrowUpRight className="size-4" />} tone="red" sparkline={[6, 5, 7, 6, 8, 7, 8, 9]} />
          </div>

          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Flux du mois</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Ce qui entre, ce qui sort</h2>
              </div>
              <div className="flex items-center gap-2 text-[7.5px] text-muted">
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-brand" />Entrées</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-[color:var(--color-mali-yellow)]" />Sorties</span>
              </div>
            </div>
            <div className="mt-3 flex h-[120px] items-end gap-3">
              {cashflow.map((week) => {
                const max = Math.max(...cashflow.flatMap((item) => [item.income, item.outcome]));
                return (
                  <div key={week.label} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-[92px] w-full items-end justify-center gap-1">
                      <span className="w-2/5 rounded-t-md bg-brand/85 transition hover:bg-brand" style={{ height: `${(week.income / max) * 88}px` }} title={`Entrées : ${formatPrice(week.income)}`} />
                      <span className="w-2/5 rounded-t-md bg-[color:var(--color-mali-yellow)]/80 transition hover:bg-[color:var(--color-mali-yellow)]" style={{ height: `${(week.outcome / max) * 88}px` }} title={`Sorties : ${formatPrice(week.outcome)}`} />
                    </div>
                    <span className="text-[7.5px] text-muted">{week.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-2.5 text-center">
              <div><p className="text-[9px] font-semibold text-ink">{formatPrice(income - outcome)}</p><p className="mt-0.5 text-[7px] text-muted">solde net</p></div>
              <div><p className="text-[9px] font-semibold text-ink">12</p><p className="mt-0.5 text-[7px] text-muted">transactions</p></div>
              <div><p className="text-[9px] font-semibold text-ink">+18 %</p><p className="mt-0.5 text-[7px] text-muted">vs septembre</p></div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Créer un lien de paiement", icon: ArrowLeftRight, tone: "bg-tone-green text-tone-green-ink", action: () => showToast("Lien de paiement créé pour 25 000 FCFA.", "info") },
              { label: "Recevoir par QR code", icon: Receipt, tone: "bg-tone-indigo text-tone-indigo-ink", action: () => showToast("QR code de paiement généré.", "info") },
              { label: "Envoyer à un ami", icon: ArrowUpRight, tone: "bg-tone-yellow text-tone-yellow-ink", action: () => showToast("Transfert entre amis bientôt disponible.", "info") },
              { label: "Demander de l’argent", icon: ArrowDownLeft, tone: "bg-tone-river text-tone-river-ink", action: () => showToast("Demande de paiement envoyée à Moussa.", "info") },
            ].map((action) => (
              <button key={action.label} type="button" onClick={action.action} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", action.tone)}>
                  <action.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-[9.5px] font-semibold leading-tight text-ink">{action.label}</span>
                <ChevronRight className="size-3 shrink-0 text-muted" />
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Activité récente</p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Vos dernières transactions</h2>
              </div>
              <button type="button" onClick={() => setTab("transactions")} className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</button>
            </div>
            <div className="divide-y divide-line px-4 pb-2 pt-1">
              {walletTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-2.5 py-2.5">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", transaction.amount > 0 ? "bg-tone-green text-tone-green-ink" : "bg-tone-red text-tone-red-ink")}>
                    {transaction.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9.5px] font-semibold text-ink">{transaction.label}</p>
                    <p className="mt-0.5 text-[7.5px] text-muted">{transaction.date} · {transaction.method}</p>
                  </div>
                  <span className={cn("text-[9px] font-semibold", transaction.amount > 0 ? "text-brand" : "text-ink")}>
                    {transaction.amount > 0 ? "+" : ""}{formatPrice(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Moyens de paiement</p>
                  <h2 className="mt-0.5 font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">Vos comptes liés</h2>
                </div>
                <button type="button" onClick={() => setMethodOpen(true)} aria-label="Ajouter un moyen de paiement" className="grid size-8 place-items-center rounded-full border border-line text-muted transition hover:border-brand/30 hover:text-brand">
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {methods.slice(0, 3).map((method) => {
                  const Icon = methodIcon(method);
                  return (
                    <div key={method.id} className="flex items-center gap-2 rounded-xl border border-line p-2">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", methodTone[method.tone])}><Icon className="size-3.5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold text-ink">{method.provider}</span>
                        <span className="block truncate text-[7.5px] text-muted">{method.detail}</span>
                      </span>
                      {method.default && <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.08em] text-brand-ink">Défaut</span>}
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => setTab("methods")} className="mt-2.5 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                Gérer mes moyens de paiement <ArrowRight className="size-2.5" />
              </button>
            </Card>

            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Sécurité</p>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-tone-green text-tone-green-ink"><Lock className="size-4" /></span>
                <div>
                  <p className="text-[10px] font-semibold text-ink">Code PIN & double authentification</p>
                  <p className="mt-0.5 text-[8px] text-muted">Votre portefeuille est protégé.</p>
                </div>
              </div>
              <div className="mt-2.5 space-y-1.5 border-t border-line pt-2">
                <Switch checked label="Verrouillage biométrique" description="Sur cet appareil" onChange={() => showToast("Verrouillage biométrique simulé.", "info")} />
                <Switch checked={autoWithdrawal} onChange={setAutoWithdrawal} label="Retrait automatique" description="Chaque vendredi si solde > 50 000 FCFA" />
              </div>
              <button type="button" onClick={() => showToast("Paramètres de sécurité du portefeuille (simulation).", "info")} className="mt-1.5 inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
                Renforcer la sécurité <ChevronRight className="size-2.5" />
              </button>
            </Card>
          </div>

          <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-tone-yellow text-tone-yellow-ink">
                <Star className="size-4" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold text-ink">Vos abonnés peuvent vous soutenir avec des étoiles</p>
                <p className="mt-0.5 text-[8.5px] text-muted">Chaque étoile vaut 100 FCFA reversés au créateur.</p>
              </div>
            </div>
            <Link to="/createur" className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand hover:underline">
              Voir mes étoiles <ArrowUpRight className="size-2.5" />
            </Link>
          </Card>
        </div>
      )}

      {tab === "transactions" && (
        <div className="space-y-3">
          <Card className="flex flex-wrap items-center gap-2 p-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une transaction…" aria-label="Rechercher une transaction" className={cn(fieldClass, "h-9 rounded-full pl-8 text-[10px]")} />
            </div>
            <div className="flex gap-1">
              {[
                { id: "all" as const, label: "Toutes" },
                { id: "in" as const, label: "Entrées" },
                { id: "out" as const, label: "Sorties" },
              ].map((item) => (
                <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</Chip>
              ))}
            </div>
            <Button size="sm" variant="secondary" onClick={() => showToast("Relevé de transactions exporté (CSV simulé).", "info")}>
              <Download className="size-3.5" />
              Exporter
            </Button>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Entrées", value: formatPrice(income), tone: "text-brand" },
              { label: "Sorties", value: formatPrice(outcome), tone: "text-ink" },
              { label: "Net", value: formatPrice(income - outcome), tone: "text-brand" },
            ].map((item) => (
              <Card key={item.label} className="p-2.5 text-center">
                <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-muted">{item.label}</p>
                <p className={cn("mt-1 font-display text-[14px] font-semibold leading-none tracking-[-0.03em]", item.tone)}>{item.value}</p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <p className="text-[8.5px] font-semibold text-muted">{filteredTransactions.length} transactions</p>
              <button type="button" onClick={() => showToast("Les filtres avancés sont simulés.", "info")} className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-ink-soft hover:text-ink">
                <SlidersIcon /> Filtrer
              </button>
            </div>
            <div className="divide-y divide-line">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-2.5 px-4 py-2.5 transition hover:bg-surface-muted/40">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", transaction.amount > 0 ? "bg-tone-green text-tone-green-ink" : "bg-tone-red text-tone-red-ink")}>
                      {transaction.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9.5px] font-semibold text-ink">{transaction.label}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[7.5px] text-muted">
                        {transaction.date}
                        <span className="size-1 rounded-full bg-line-strong" />
                        {transaction.method}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn("text-[9.5px] font-semibold", transaction.amount > 0 ? "text-brand" : "text-ink")}>
                        {transaction.amount > 0 ? "+" : ""}{formatPrice(transaction.amount)}
                      </p>
                      <p className={cn("mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[6.5px] font-semibold", transaction.status === "En cours" ? "bg-gold-soft text-[color:var(--color-gold)]" : "bg-brand-soft text-brand-ink")}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="grid size-12 place-items-center rounded-[18px] bg-surface-muted text-muted"><Search className="size-5" /></span>
                  <p className="mt-3 text-[11px] font-semibold text-ink">Aucune transaction</p>
                  <p className="mt-1 text-[9px] text-muted">Essayez un autre filtre ou un autre mot-clé.</p>
                </div>
              )}
            </div>
          </Card>

          <p className="px-1 text-[8px] text-muted">
            Les opérations « En cours » sont simulées. Les transactions réussies restent enregistrées sur cet appareil.
          </p>
        </div>
      )}

      {tab === "methods" && (
        <div className="space-y-3">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Moyens de paiement liés</h2>
              <p className="mt-0.5 text-[9px] text-muted">Le moyen par défaut est utilisé pour vos retraits et vos publicités.</p>
            </div>
            <Button size="sm" onClick={() => setMethodOpen(true)}>
              <Plus className="size-3.5" />
              Ajouter un moyen
            </Button>
          </Card>

          <div className="space-y-2">
            {methods.map((method) => {
              const Icon = methodIcon(method);
              return (
                <Card key={method.id} className="flex items-center gap-3 p-3.5">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", methodTone[method.tone])}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink">
                      {method.provider}
                      {method.default && <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.08em] text-brand-ink">Par défaut</span>}
                    </p>
                    <p className="mt-0.5 truncate text-[8.5px] text-muted">{method.detail}</p>
                    <p className="mt-0.5 text-[7.5px] text-muted">Frais : {method.fee}</p>
                  </div>
                  <Menu
                    label={`Options pour ${method.provider}`}
                    trigger={
                      <span className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink">
                        <EllipsisDots />
                      </span>
                    }
                    items={[
                      { label: "Définir par défaut", onClick: () => toggleDefault(method.id), disabled: method.default },
                      { label: "Vérifier le compte", onClick: () => showToast("Vérification simulée réussie.", "info") },
                      { label: "", separator: true },
                      { label: "Retirer ce moyen", danger: true, onClick: () => removeMethod(method.id) },
                    ]}
                  />
                </Card>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Retraits</p>
              <h2 className="mt-0.5 font-display text-[16px] font-semibold tracking-[-0.03em] text-ink">Vos préférences</h2>
              <div className="mt-2 space-y-1.5">
                <Switch checked={autoWithdrawal} onChange={setAutoWithdrawal} label="Retrait automatique" description="Chaque vendredi si le solde dépasse 50 000 FCFA." />
                <Switch checked={false} onChange={() => showToast("Les notifications de retrait sont activées.", "info")} label="Me prévenir par SMS" description="Un SMS à chaque retrait initié." />
              </div>
              <div className="mt-3 border-t border-line pt-2.5">
                <ProgressBar value={balance} max={500000} label="Plafond de retrait mensuel" valueLabel={`${formatPrice(balance)} / 500 000`} />
              </div>
            </Card>

            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                <ShieldCheck className="size-3 text-brand" />
                Sécurité des paiements
              </p>
              <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">
                Chaque retrait est confirmé par un code à usage unique. Vous pouvez verrouiller votre portefeuille depuis cet appareil.
              </p>
              <div className="mt-3 space-y-1.5">
                <button type="button" onClick={() => showToast("Code PIN modifié (simulation).", "info")} className="flex w-full items-center gap-2 rounded-xl border border-line p-2.5 text-left transition hover:bg-surface-muted">
                  <Lock className="size-3.5 text-muted" />
                  <span className="flex-1 text-[9px] font-semibold text-ink">Modifier mon code PIN</span>
                  <ChevronRight className="size-3 text-muted" />
                </button>
                <button type="button" onClick={() => showToast("Portefeuille verrouillé pour 24 h (simulation).", "info")} className="flex w-full items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft/40 p-2.5 text-left transition hover:bg-danger-soft">
                  <Lock className="size-3.5 text-danger" />
                  <span className="flex-1 text-[9px] font-semibold text-danger">Verrouiller le portefeuille</span>
                  <ChevronRight className="size-3 text-danger" />
                </button>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Factures & reçus</p>
            <div className="mt-2 divide-y divide-line">
              {[
                { label: "Publicité — Collection Harmattan", date: "21 oct. 2026", amount: 16800 },
                { label: "Retrait vers Orange Money", date: "18 oct. 2026", amount: 50000 },
                { label: "Publicité — Brunch du dimanche", date: "14 oct. 2026", amount: 8200 },
              ].map((invoice) => (
                <div key={invoice.label} className="flex items-center gap-2.5 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted"><Receipt className="size-3.5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9.5px] font-semibold text-ink">{invoice.label}</p>
                    <p className="mt-0.5 text-[7.5px] text-muted">{invoice.date}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-ink">{formatPrice(invoice.amount)}</span>
                  <button type="button" onClick={() => showToast("Reçu téléchargé (simulation).", "info")} aria-label="Télécharger le reçu" className="grid size-7 place-items-center rounded-full text-muted hover:bg-surface-muted hover:text-ink">
                    <Download className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[8.5px] text-muted">
        <span className="inline-flex items-center gap-1"><DemoTag /> Portefeuille fictif · aucune transaction réelle</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3" />N’Teriface Pay · Bamako, Mali</span>
      </div>

      <MoneyModal
        open={moneyMode !== null}
        mode={moneyMode ?? "add"}
        balance={balance}
        methods={methods}
        onClose={() => setMoneyMode(null)}
        onConfirm={handleMoney}
      />
      <AddMethodModal open={methodOpen} onClose={() => setMethodOpen(false)} onAdd={(method) => { setMethods((current) => [...current, method]); showToast("Moyen de paiement ajouté."); }} />
    </div>
  );
}

function EllipsisDots() {
  return <span className="text-[16px] leading-none">···</span>;
}

function SlidersIcon() {
  return <ArrowLeftRight className="size-3" />;
}
