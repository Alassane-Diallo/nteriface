import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Users,
} from "lucide-react";

import {
  BrandMark,
  Button,
  InlineNotice,
  ProgressBar,
  VerifiedBadge,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useApp } from "@/store";

type Mode = "login" | "register";

const inputWrap =
  "relative flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-surface-muted px-3.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15";
const inputBase =
  "h-full min-w-0 flex-1 bg-transparent text-[12.5px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted";

function SocialProof() {
  return (
    <div className="relative z-10 rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
          alt=""
          className="size-11 rounded-full object-cover ring-2 ring-white/30"
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[12px] font-semibold text-white">
            Awa Traoré
            <VerifiedBadge className="size-3.5 bg-white/20" label="Créatrice vérifiée" />
          </p>
          <p className="mt-0.5 truncate text-[10px] text-white/65">Créatrice de mode · Bamako</p>
        </div>
        <span className="ml-auto rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.14em] text-white/80">
          Démo
        </span>
      </div>
      <p className="mt-3 font-display text-[13px] leading-relaxed text-white/85">
        « Le fil, les Reels et Marketplace au même endroit. N’Teriface, c’est
        Bamako qui se raconte. »
      </p>
      <div className="mt-3 flex items-center gap-2 text-[9.5px] font-medium text-white/55">
        <Users className="size-3.5" />
        1,24 M de membres au Mali
        <span className="mx-0.5 size-1 rounded-full bg-white/30" />
        <MessageCircle className="size-3.5" />
        Communautés actives
      </div>
    </div>
  );
}

export default function Login() {
  const { login, register, showToast } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState("awa.traore");
  const [password, setPassword] = useState("nteriface2026");
  const [remember, setRemember] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setShowPassword(false);
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!identifier.trim() || password.length < 4) {
      setError("Renseignez votre identifiant et un mot de passe de 4 caractères minimum.");
      return;
    }
    setBusy(true);
    const success = await login(identifier, password);
    setBusy(false);
    if (success) navigate("/", { replace: true });
  };

  const enterDemo = async () => {
    setError(null);
    setBusy(true);
    const success = await login("awa.traore", "nteriface2026");
    setBusy(false);
    if (success) navigate("/", { replace: true });
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setError("Indiquez votre prénom et votre nom.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Choisissez un nom d’utilisateur d’au moins 3 caractères.");
      return;
    }
    if (!email.includes("@")) {
      setError("Indiquez une adresse e-mail valide.");
      return;
    }
    if (phone.trim().length < 8) {
      setError("Indiquez un numéro de téléphone valide.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Votre mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!accepted) {
      setError("Acceptez les conditions et la politique de confidentialité pour continuer.");
      return;
    }
    setBusy(true);
    const success = await register({
      firstName,
      lastName,
      username,
      email,
      phone,
      password: newPassword,
    });
    setBusy(false);
    if (success) navigate("/", { replace: true });
  };

  const strength = Math.min(4, Math.round(newPassword.length / 3));

  return (
    <main className="page-pattern relative min-h-dvh p-3 text-ink sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100dvh-24px)] w-full max-w-[1260px] overflow-hidden rounded-[28px] border border-line bg-surface shadow-frame sm:min-h-[calc(100dvh-40px)] lg:min-h-[calc(100dvh-56px)] lg:grid-cols-[1.04fr_0.96fr] lg:rounded-[34px]">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-logo text-white lg:flex lg:flex-col">
          <img
            src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=85"
            alt=""
            className="absolute inset-0 size-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,25,16,0.82)_0%,rgba(6,25,16,0.34)_42%,rgba(6,25,16,0.94)_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,.45) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, rgba(255,255,255,.22) 0 1px, transparent 1px 34px)",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 top-10 size-52 rounded-full border border-white/10" />

          <div className="relative z-10 flex h-full flex-col p-9 xl:p-11">
            <div className="flex items-center gap-3">
              <BrandMark className="size-12 shadow-float" />
              <div>
                <p className="font-display text-[22px] font-semibold leading-none tracking-[-0.045em]">
                  N’Teriface
                </p>
                <p className="mt-1.5 text-[8.5px] font-bold uppercase tracking-[0.26em] text-white/55">
                  Le réseau social du Mali
                </p>
              </div>
            </div>

            <div className="mt-auto max-w-[480px] pb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                <Sparkles className="size-3 text-[color:var(--color-mali-yellow)]" />
                Une démo aux couleurs du Sahel
              </span>
              <h1 className="mt-5 font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] xl:text-[50px]">
                Le Mali se
                <br />
                retrouve ici.
              </h1>
              <p className="mt-4 max-w-[410px] text-[13px] leading-relaxed text-white/65">
                Partagez vos instants, suivez vos créateurs, vendez sur
                Marketplace et faites vivre vos communautés — de Bamako à
                Tombouctou.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: Users, label: "Communautés" },
                  { icon: Search, label: "Découverte" },
                  { icon: Store, label: "Marketplace" },
                  { icon: MapPin, label: "Local" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-white/80 backdrop-blur"
                  >
                    <Icon className="size-3.5 text-[color:var(--color-mali-yellow)]" />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-7">
                <SocialProof />
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-[9px] font-medium text-white/45">
              <span className="flex items-center gap-2">
                <span className="mali-line h-1.5 w-11 rounded-full" />
                Fièrement malien · 2026
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                Données fictives, démo privée
              </span>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <section className="relative flex flex-col justify-center px-5 py-7 sm:px-10 sm:py-9 xl:px-14">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <BrandMark className="size-11" />
            <div>
              <p className="font-display text-[20px] font-semibold leading-none tracking-[-0.045em] text-ink">
                N’Teriface
              </p>
              <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.22em] text-muted">
                Réseau social du Mali
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <div
              role="tablist"
              aria-label="Connexion ou création de compte"
              className="flex items-center gap-1 rounded-2xl bg-surface-muted p-1"
            >
              {(
                [
                  { id: "login", label: "Se connecter" },
                  { id: "register", label: "Créer un compte" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.id}
                  onClick={() => switchMode(tab.id)}
                  className={cn(
                    "h-9 flex-1 rounded-xl text-[11.5px] font-semibold transition duration-200",
                    mode === tab.id
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-brand">
                {mode === "login" ? "Heureux de vous revoir" : "Rejoindre N’Teriface"}
              </p>
              <h2 className="mt-1.5 font-display text-[27px] font-semibold leading-tight tracking-[-0.045em] text-ink">
                {mode === "login" ? "Bon retour, Awa." : "Ouvrez votre espace."}
              </h2>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                {mode === "login"
                  ? "Connectez-vous pour retrouver votre fil, vos messages et votre communauté."
                  : "Quelques informations suffisent. Votre profil de démonstration sera prêt immédiatement."}
              </p>
            </div>

            {error && (
              <InlineNotice tone="danger" className="mt-5">
                {error}
              </InlineNotice>
            )}

            {mode === "login" ? (
              <form className="mt-6 space-y-4" onSubmit={handleLogin} noValidate>
                <div>
                  <label htmlFor="identifier" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                    Téléphone, e-mail ou nom d’utilisateur
                  </label>
                  <div className={inputWrap}>
                    <AtSign className="size-4 shrink-0 text-muted" />
                    <input
                      id="identifier"
                      name="identifier"
                      autoComplete="username"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="awa.traore"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="block text-[11px] font-semibold text-ink-soft">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          "Démo : utilisez le mot de passe pré-rempli ou « Entrer dans la démo ».",
                          "info",
                        )
                      }
                      className="text-[10px] font-semibold text-brand hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className={inputWrap}>
                    <Lock className="size-4 shrink-0 text-muted" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Votre mot de passe"
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-[11px] font-medium text-ink-soft">
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-[5px] border transition",
                      remember
                        ? "border-brand bg-brand text-white"
                        : "border-line-strong bg-surface text-transparent",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3.2} />
                  </span>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="sr-only"
                  />
                  Se souvenir de moi sur cet appareil
                </label>

                <Button type="submit" size="lg" loading={busy} className="w-full justify-between px-5">
                  <span>Ouvrir mon fil</span>
                  {!busy && <ArrowRight className="size-4" />}
                </Button>

                <div className="relative py-1">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
                  <p className="relative mx-auto w-fit bg-surface px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                    ou sans compte
                  </p>
                </div>

                <button
                  type="button"
                  onClick={enterDemo}
                  disabled={busy}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-gold/30 bg-gold-soft/60 p-3.5 text-left transition hover:border-gold/50 hover:bg-gold-soft disabled:opacity-50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-[color:var(--color-gold)] shadow-sm">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11.5px] font-semibold text-ink">
                      Entrer dans la démo
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">
                      Connexion instantanée avec le compte d’Awa Traoré.
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-[color:var(--color-gold)] transition group-hover:translate-x-0.5" />
                </button>
              </form>
            ) : (
              <form className="mt-6 space-y-3.5" onSubmit={handleRegister} noValidate>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                      Prénom
                    </label>
                    <div className={inputWrap}>
                      <User className="size-4 shrink-0 text-muted" />
                      <input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Aminata"
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                      Nom
                    </label>
                    <div className={inputWrap}>
                      <input
                        id="lastName"
                        name="lastName"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Cissé"
                        className={inputBase}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                    Nom d’utilisateur
                  </label>
                  <div className={inputWrap}>
                    <span className="text-[12px] font-semibold text-muted">@</span>
                    <input
                      id="username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value.replace(/\s/g, ""))}
                      placeholder="aminata.cisse"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                    Adresse e-mail
                  </label>
                  <div className={inputWrap}>
                    <Mail className="size-4 shrink-0 text-muted" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="aminata@exemple.ml"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                    Téléphone
                  </label>
                  <div className={inputWrap}>
                    <Phone className="size-4 shrink-0 text-muted" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+223 76 12 34 56"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="newPassword" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                      Mot de passe
                    </label>
                    <div className={inputWrap}>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="8 caractères min."
                        className={inputBase}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                      Confirmer
                    </label>
                    <div className={inputWrap}>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Répétez"
                        className={inputBase}
                      />
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={strength}
                  max={4}
                  label="Robustesse du mot de passe"
                  valueLabel={["Faible", "Faible", "Moyen", "Bon", "Excellent"][strength]}
                  tone={strength < 2 ? "red" : strength < 4 ? "yellow" : "brand"}
                />

                <label className="flex cursor-pointer items-start gap-2.5 text-[10px] leading-relaxed text-muted">
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-[5px] border transition",
                      accepted
                        ? "border-brand bg-brand text-white"
                        : "border-line-strong bg-surface text-transparent",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3.2} />
                  </span>
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    className="sr-only"
                  />
                  J’accepte les conditions d’utilisation et la politique de
                  confidentialité de cette démonstration.
                </label>

                <Button type="submit" size="lg" loading={busy} className="w-full justify-between px-5">
                  <span>Créer mon compte démo</span>
                  {!busy && <ArrowRight className="size-4" />}
                </Button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="mx-auto flex items-center gap-1.5 text-[10.5px] font-semibold text-brand hover:underline"
                >
                  <ArrowLeft className="size-3" />
                  J’ai déjà un compte
                </button>
              </form>
            )}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-medium text-muted">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3 text-brand" />
                Session sécurisée
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="size-3 text-[color:var(--color-mali-red)]" />
                Sans publicité réelle
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3 text-muted" />
                +223 · Bamako
              </span>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-[420px] text-center text-[9px] leading-relaxed text-muted">
            N’Teriface est une démonstration produit. Aucun compte réel n’est
            créé, aucun paiement n’est effectué et toutes les données restent
            sur cet appareil.
          </p>
        </section>
      </div>
    </main>
  );
}
