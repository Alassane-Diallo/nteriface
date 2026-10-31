import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarDays,
  ChartLine,
  Check,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Clapperboard,
  Compass,
  Flag,
  Heart,
  House,
  Info,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  Plus,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  SquarePen,
  Store,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";

import {
  people,
  sponsors,
  suggestedFriends,
  trends,
  aiSuggestions,
} from "@/data";
import { useApp } from "@/store";
import type { AvatarTone, Notification } from "@/types";
import {
  Avatar,
  BrandMark,
  Button,
  CountBadge,
  Drawer,
  Field,
  IconButton,
  InlineNotice,
  Menu,
  Modal,
  Photo,
  SegmentedTabs,
  VerifiedBadge,
  fieldClass,
  toneSurface,
} from "@/components/ui";
import { cn, formatCount, formatFullNumber, searchNormalize } from "@/lib/utils";
import { ComposerModal } from "@/components/ComposerModal";

/* ------------------------------------------------------------------ */
/* Navigation model                                                    */
/* ------------------------------------------------------------------ */

const primaryNav = [
  { to: "/", label: "Accueil", icon: House },
  { to: "/videos", label: "Vidéos", icon: Clapperboard },
  { to: "/reels", label: "Reels", icon: Radio },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/groupes", label: "Groupes", icon: UsersRound },
];

const railNav: Array<{
  to: string;
  label: string;
  icon: typeof Users;
  tone: AvatarTone;
  count?: number;
}> = [
  { to: "/amis", label: "Amis", icon: Users, tone: "river" },
  { to: "/enregistrements", label: "Enregistrements", icon: Bookmark, tone: "indigo" },
  { to: "/groupes", label: "Groupes", icon: UsersRound, tone: "green" },
  { to: "/videos", label: "Vidéos et Reels", icon: Clapperboard, tone: "red" },
  { to: "/evenements", label: "Événements", icon: CalendarDays, tone: "red" },
  { to: "/marketplace", label: "Marketplace", icon: Store, tone: "clay" },
  { to: "/pages", label: "Pages", icon: Flag, tone: "yellow" },
  { to: "/local", label: "Local & Explorer", icon: Compass, tone: "river" },
  { to: "/dating", label: "Rencontres", icon: Heart, tone: "red" },
  { to: "/createur", label: "Creator Studio", icon: ChartLine, tone: "indigo" },
  { to: "/publicites", label: "Centre publicitaire", icon: Megaphone, tone: "yellow" },
  { to: "/portefeuille", label: "Portefeuille", icon: Wallet, tone: "green" },
  { to: "/parametres", label: "Paramètres et confidentialité", icon: Settings, tone: "river" },
];

function useActivePath() {
  const { pathname } = useLocation();
  return pathname;
}

function isActivePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

/* ------------------------------------------------------------------ */
/* Left rail                                                           */
/* ------------------------------------------------------------------ */

function LeftRail() {
  const { state, friendCount } = useApp();
  const pathname = useActivePath();
  const showGroupe = state.groups.filter((group) => group.joined).slice(0, 2);

  return (
    <aside
      aria-label="Navigation principale"
      className="sticky top-[76px] hidden h-[calc(100dvh-88px)] w-[252px] shrink-0 overflow-y-auto pb-8 pr-1 lg:block scrollbar-slim"
    >
      <Link
        to={`/profil/${state.me.username}`}
        className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 shadow-card transition hover:border-line-strong hover:bg-surface-muted"
      >
        <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="lg" online />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-[12.5px] font-semibold text-ink">
            {state.me.name}
            {state.me.verified && <VerifiedBadge />}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-muted">Voir votre profil</p>
        </div>
        <ChevronRight className="size-3.5 shrink-0 text-muted" />
      </Link>

      <nav className="mt-3 space-y-0.5" aria-label="Sections">
        {railNav.map(({ to, label, icon: Icon, tone }) => {
          const active = isActivePath(pathname, to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-2xl px-2.5 py-1.5 text-[12px] font-medium transition duration-200",
                active
                  ? "bg-brand-soft text-brand-ink"
                  : "text-ink-soft hover:bg-surface-muted hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-xl transition group-hover:scale-[1.03]",
                  toneSurface[tone],
                )}
              >
                <Icon className="size-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {label === "Amis" && (
                <span className="text-[10px] font-bold text-muted">{friendCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="my-3 h-px bg-line" />

      {state.me.staff && (
        <Link
          to="/admin"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-2xl px-2.5 py-1.5 text-[12px] font-medium transition",
            isActivePath(pathname, "/admin")
              ? "bg-brand-soft text-brand-ink"
              : "text-ink-soft hover:bg-surface-muted hover:text-ink",
          )}
        >
          <span className="grid size-8 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
            <ShieldCheck className="size-4" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">Administration</span>
          <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[color:var(--color-gold)]">
            équipe
          </span>
        </Link>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between px-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Vos raccourcis</p>
          <button
            type="button"
            className="text-[9px] font-semibold text-brand hover:underline"
            onClick={(event) => event.preventDefault()}
          >
            Gérer
          </button>
        </div>
        <div className="mt-1.5 space-y-0.5">
          {showGroupe.map((group) => (
            <Link
              key={group.id}
              to={`/groupes/${group.id}`}
              className="flex min-h-11 items-center gap-3 rounded-2xl px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              <Avatar name={group.name} tone={group.tone} shape="group" size="sm" />
              <span className="min-w-0 flex-1 truncate">{group.name}</span>
            </Link>
          ))}
          <Link
            to="/pages/faso-krea"
            className="flex min-h-11 items-center gap-3 rounded-2xl px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
          >
            <Avatar name="Faso Kréa" tone="clay" shape="squircle" size="sm" />
            <span className="min-w-0 flex-1 truncate">Faso Kréa</span>
          </Link>
        </div>
      </div>

      <div className="mt-5 px-2.5 text-[9px] leading-relaxed text-muted">
        <p className="flex flex-wrap gap-x-2 gap-y-1">
          <span>Confidentialité</span>
          <span>·</span>
          <span>Conditions</span>
          <span>·</span>
          <span>Cookies</span>
          <span>·</span>
          <span>Publicités</span>
        </p>
        <p className="mt-2.5 flex items-center gap-1 font-semibold">
          N’Teriface <span className="mali-line h-1 w-5 rounded-full" />
          <span className="font-normal text-muted">Démo 2026</span>
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Right rail                                                          */
/* ------------------------------------------------------------------ */

function RightRail() {
  const {
    state,
    acceptFriend,
    declineFriend,
    startConversation,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const requests = state.requests.slice(0, 2);
  const contacts = people.filter((person) => person.online).slice(0, 6);

  const openConversation = (personId: string) => {
    const person = people.find((item) => item.id === personId);
    if (!person) return;
    const conversationId = startConversation(person);
    navigate(`/messages?conv=${conversationId}`);
  };

  return (
    <aside
      aria-label="Suggestions et contacts"
      className="sticky top-[76px] hidden h-[calc(100dvh-88px)] w-[320px] shrink-0 overflow-y-auto pb-8 pl-1 xl:block scrollbar-slim"
    >
      <div className="mt-3 space-y-4">
        {requests.length > 0 && (
          <section className="rounded-[24px] border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
                Demandes d’ami
              </h2>
              <Link to="/amis" className="text-[10px] font-semibold text-brand hover:underline">
                Tout voir
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {requests.map((request) => {
                const person = people.find((item) => item.id === request.personId);
                if (!person) return null;
                return (
                  <div key={request.personId} className="flex items-start gap-2.5">
                    <Avatar
                      name={person.name}
                      src={person.avatar}
                      tone={person.tone}
                      size="lg"
                      className="rounded-[18px]"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/profil/${person.username}`}
                        className="block truncate text-[12px] font-semibold text-ink hover:underline"
                      >
                        {person.name}
                      </Link>
                      <p className="mt-0.5 text-[9.5px] text-muted">
                        {request.mutual} amis en commun · {request.time}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 px-3 text-[10.5px]"
                          onClick={() => acceptFriend(person.id)}
                        >
                          Confirmer
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 px-3 text-[10.5px]"
                          onClick={() => declineFriend(person.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-[24px] border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">Contacts</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => showToast("Recherche de contacts bientôt disponible.", "info")}
                aria-label="Rechercher un contact"
                className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
              >
                <Search className="size-3.5" />
              </button>
              <Link
                to="/messages"
                aria-label="Ouvrir la messagerie"
                className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
              >
                <MessageCircle className="size-3.5" />
              </Link>
            </div>
          </div>
          <ul className="mt-2 space-y-0.5">
            {contacts.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => openConversation(person.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-surface-muted"
                >
                  <Avatar
                    name={person.name}
                    src={person.avatar}
                    tone={person.tone}
                    size="md"
                    online={person.online}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-ink-soft">
                    {person.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[24px] border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">Sponsorisé</h2>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted">Démo</span>
          </div>
          <div className="mt-3 space-y-4">
            {sponsors.slice(0, 2).map((sponsor) => (
              <article key={sponsor.id} className="group">
                <Link to="/marketplace" className="block overflow-hidden rounded-2xl">
                  <Photo
                    src={sponsor.image}
                    alt={`Illustration ${sponsor.brand}`}
                    className="aspect-[16/9] w-full"
                    imgClassName="transition duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
                  {sponsor.brand}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{sponsor.text}</p>
                <button
                  type="button"
                  onClick={() => showToast("Annonce de démonstration — aucun achat réel.", "info")}
                  className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline"
                >
                  {sponsor.cta}
                  <ArrowUpRight className="size-3" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-surface p-4 shadow-card">
          <h2 className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
            Tendances au Mali
          </h2>
          <p className="mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted">
            Mis à jour à l’instant
          </p>
          <ul className="mt-2 divide-y divide-line">
            {trends.slice(0, 4).map((trend) => (
              <li key={trend.tag}>
                <Link
                  to={`/recherche?q=${encodeURIComponent(trend.tag)}`}
                  className="flex items-start gap-3 py-2.5 transition hover:opacity-80"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink">{trend.tag}</span>
                    <span className="mt-0.5 block text-[9.5px] text-muted">
                      {trend.posts} · {trend.category}
                    </span>
                  </span>
                  <span className="mt-0.5 rounded-full bg-brand-soft px-1.5 py-0.5 text-[8.5px] font-bold text-brand-ink">
                    {trend.delta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/local"
            className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline"
          >
            Voir tout ce qui est local
            <ChevronRight className="size-3" />
          </Link>
        </section>

        <p className="px-2 text-[9px] leading-relaxed text-muted">
          N’Teriface · Réseau social de démonstration. Les personnes, marques et annonces sont
          fictives ou utilisées à titre d’illustration.
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

function TopNavLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof House;
}) {
  const pathname = useActivePath();
  const active = isActivePath(pathname, to);

  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "group relative flex h-12 min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[8.5px] font-semibold transition duration-200",
        active ? "text-brand" : "text-muted hover:bg-surface-muted hover:text-ink",
      )}
    >
      <Icon className="size-[21px]" strokeWidth={active ? 2.3 : 1.8} />
      <span className="hidden leading-none sm:block">{label}</span>
      {active && <span className="absolute bottom-0 h-[2.5px] w-5 rounded-full bg-brand" />}
    </Link>
  );
}

function TopBar({
  onOpenSearch,
  onOpenNotifications,
  onOpenMenu,
  onOpenAI,
}: {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenMenu: () => void;
  onOpenAI: () => void;
}) {
  const { state, unreadMessages, unreadNotifications, logout, openComposer } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-[60px] w-full max-w-[1500px] items-center gap-2 px-3 sm:px-4 xl:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 xl:max-w-[330px]">
          <Link
            to="/"
            aria-label="N’Teriface, accueil"
            className="flex shrink-0 items-center gap-2 rounded-2xl pr-1 transition hover:opacity-90"
          >
            <BrandMark className="size-9 sm:size-10" />
            <span className="hidden font-display text-[19px] font-semibold tracking-[-0.05em] text-ink md:block">
              N’Teriface
            </span>
          </Link>

          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface-muted px-3 text-left text-[11px] text-muted transition hover:border-line-strong hover:bg-surface lg:flex"
          >
            <Search className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">Rechercher sur N’Teriface</span>
            <span className="hidden items-center gap-0.5 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[8.5px] font-semibold text-muted xl:flex">
              ⌘K
            </span>
            <span
              role="button"
              tabIndex={-1}
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"
              onClick={(event) => {
                event.stopPropagation();
                onOpenAI();
              }}
            >
              <Sparkles className="size-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Rechercher"
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-surface-muted lg:hidden"
          >
            <Search className="size-[19px]" />
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu"
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-surface-muted lg:hidden"
          >
            <Users className="size-[19px]" />
          </button>
        </div>

        <nav aria-label="Navigation du fil" className="hidden items-center gap-0.5 md:flex">
          {primaryNav.map((item) => (
            <TopNavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
          <div className="hidden sm:block">
            <Menu
              label="Créer"
              trigger={
                <>
                  <Plus className="size-4" />
                  <span className="hidden xl:inline">Créer</span>
                </>
              }
              triggerClassName="button-brand h-10 gap-1.5 rounded-full px-3 text-[11.5px] font-semibold shadow-sm transition hover:brightness-110"
              width="w-[310px]"
              header={
                <div>
                  <p className="font-display text-[13px] font-semibold tracking-[-0.02em] text-ink">
                    Créer sur N’Teriface
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-muted">Tout commence par un geste.</p>
                </div>
              }
              items={[
                {
                  label: "Publication",
                  hint: "Partager un instant, une idée, un sondage",
                  icon: <SquarePen className="size-4 text-brand" />,
                  onClick: () => openComposer("post"),
                },
                {
                  label: "Story",
                  hint: "Une image, une musique, 24 heures",
                  icon: <Sparkles className="size-4 text-[color:var(--color-gold)]" />,
                  onClick: () => openComposer("story"),
                },
                {
                  label: "Reel",
                  hint: "Un format vertical et créatif",
                  icon: <Clapperboard className="size-4 text-[color:var(--color-mali-red)]" />,
                  onClick: () => openComposer("reel"),
                },
                {
                  label: "En direct",
                  hint: "Retrouver votre communauté en temps réel",
                  icon: <Radio className="size-4 text-tone-river-ink" />,
                  onClick: () => openComposer("live"),
                },
                { label: "", separator: true },
                {
                  label: "Événement",
                  hint: "Rassembler autour d’une date",
                  icon: <CalendarDays className="size-4 text-[color:var(--color-mali-red)]" />,
                  onClick: () => navigate("/evenements?new=1"),
                },
                {
                  label: "Page",
                  hint: "Donner une voix à votre activité",
                  icon: <Flag className="size-4 text-[color:var(--color-gold)]" />,
                  onClick: () => navigate("/pages?new=1"),
                },
                {
                  label: "Groupe",
                  hint: "Créer un espace pour votre communauté",
                  icon: <UsersRound className="size-4 text-brand" />,
                  onClick: () => navigate("/groupes?new=1"),
                },
                {
                  label: "Annonce Marketplace",
                  hint: "Vendre près de chez vous",
                  icon: <ShoppingBag className="size-4 text-tone-clay-ink" />,
                  onClick: () => navigate("/marketplace?new=1"),
                },
                {
                  label: "Publicité",
                  hint: "Toucher une audience locale",
                  icon: <Megaphone className="size-4 text-tone-indigo-ink" />,
                  onClick: () => navigate("/publicites"),
                },
              ]}
            />
          </div>

          <Link
            to="/messages"
            aria-label={`Messages${unreadMessages ? `, ${unreadMessages} non lus` : ""}`}
            className="relative grid size-11 place-items-center rounded-full text-ink-soft transition hover:bg-surface-muted hover:text-ink"
          >
            <MessageCircle className="size-[19px]" />
            {unreadMessages > 0 && (
              <CountBadge count={unreadMessages} className="absolute right-1 top-1 border-2 border-surface" />
            )}
          </Link>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} non lues` : ""}`}
            className="relative grid size-11 place-items-center rounded-full text-ink-soft transition hover:bg-surface-muted hover:text-ink"
          >
            <Bell className="size-[19px]" />
            {unreadNotifications > 0 && (
              <CountBadge count={unreadNotifications} className="absolute right-1 top-1 border-2 border-surface" />
            )}
          </button>

          <Menu
            label="Menu du compte"
            trigger={<Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="md" online />}
            triggerClassName="size-11 rounded-full border border-line bg-surface p-1.5 transition hover:border-line-strong"
            width="w-[280px]"
            header={
              <div className="flex items-center gap-2.5">
                <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="lg" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-[12.5px] font-semibold text-ink">
                    {state.me.name}
                    {state.me.verified && <VerifiedBadge />}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted">@{state.me.username}</p>
                </div>
              </div>
            }
            items={[
              {
                label: "Voir mon profil",
                icon: <Users className="size-4" />,
                onClick: () => navigate(`/profil/${state.me.username}`),
              },
              {
                label: "Creator Studio",
                icon: <ChartLine className="size-4" />,
                onClick: () => navigate("/createur"),
              },
              {
                label: "Enregistrements",
                icon: <Bookmark className="size-4" />,
                onClick: () => navigate("/enregistrements"),
              },
              {
                label: "Paramètres et confidentialité",
                icon: <Settings className="size-4" />,
                onClick: () => navigate("/parametres"),
              },
              {
                label: "Centre d’aide",
                icon: <CircleHelp className="size-4" />,
                onClick: () => navigate("/parametres?tab=aide"),
              },
              { label: "", separator: true },
              {
                label: "Se déconnecter",
                icon: <LogOut className="size-4" />,
                danger: true,
                onClick: logout,
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile nav                                                          */
/* ------------------------------------------------------------------ */

const mobileNav = [
  { to: "/", label: "Accueil", icon: House },
  { to: "/videos", label: "Vidéos", icon: Clapperboard },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/groupes", label: "Groupes", icon: UsersRound },
];

function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = useActivePath();

  return (
    <nav
      aria-label="Navigation mobile"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-[58px] max-w-lg grid-cols-5">
        {mobileNav.map(({ to, label, icon: Icon }) => {
          const active = isActivePath(pathname, to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-semibold transition",
                active ? "text-brand" : "text-muted",
              )}
            >
              <Icon className="size-[21px]" strokeWidth={active ? 2.3 : 1.8} />
              <span>{label}</span>
              {active && <span className="absolute bottom-1 h-[2px] w-4 rounded-full bg-brand" />}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-semibold text-muted"
        >
          <span className="grid size-[21px] place-items-center rounded-full border border-line-strong">
            <Plus className="size-3" />
          </span>
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}

function MobileMenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, friendCount, logout, openComposer } = useApp();
  const navigate = useNavigate();

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      description="Tout N’Teriface, à portée de pouce."
      width="max-w-sm"
    >
      <div className="space-y-4 px-4 py-4">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(`/profil/${state.me.username}`);
          }}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-muted p-3 text-left"
        >
          <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="xl" online />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[13px] font-semibold text-ink">
              {state.me.name}
              {state.me.verified && <VerifiedBadge />}
            </span>
            <span className="mt-0.5 block truncate text-[10.5px] text-muted">
              @{state.me.username} · {formatCount(state.me.followers)} abonnés
            </span>
          </span>
          <ChevronRight className="size-4 text-muted" />
        </button>

        <Button className="w-full" onClick={() => { onClose(); openComposer("post"); }}>
          <SquarePen className="size-4" />
          Créer une publication
        </Button>

        <nav className="space-y-0.5" aria-label="Toutes les sections">
          {railNav.map(({ to, label, icon: Icon, tone }) => (
            <button
              key={to}
              type="button"
              onClick={() => go(to)}
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-2.5 py-1.5 text-left text-[12.5px] font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              <span className={`grid size-8 place-items-center rounded-xl ${toneSurface[tone]}`}>
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">{label}</span>
              {label === "Amis" && <span className="text-[10px] font-bold text-muted">{friendCount}</span>}
            </button>
          ))}
          {state.me.staff && (
            <button
              type="button"
              onClick={() => go("/admin")}
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-2.5 py-1.5 text-left text-[12.5px] font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-tone-indigo text-tone-indigo-ink">
                <ShieldCheck className="size-4" />
              </span>
              <span className="min-w-0 flex-1">Administration</span>
            </button>
          )}
        </nav>

        <div className="rounded-2xl border border-line bg-surface-muted p-3">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            <Sparkles className="size-3.5 text-brand" />
            N’Teri AI
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
            Résumez votre fil, générez une publication ou analysez vos Reels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { onClose(); logout(); }}
          className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-2.5 text-left text-[12.5px] font-semibold text-danger transition hover:bg-danger-soft"
        >
          <LogOut className="size-4" />
          Se déconnecter
        </button>

        <p className="px-2 pb-3 text-[9px] leading-relaxed text-muted">
          N’Teriface · Démonstration produit · Bamako, Mali
        </p>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function SearchOverlay({
  open,
  onClose,
  onOpenAI,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAI: (query: string) => void;
}) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(["bogolan", "Aigles du Mali", "Marketplace Bamako"]);
  const normalized = searchNormalize(query);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    if (!normalized) return null;
    const byName = (name: string) => searchNormalize(name).includes(normalized);
    return {
      people: people.filter((person) => byName(person.name) || byName(person.username)).slice(0, 4),
      pages: state.pages.filter((page) => byName(page.name) || byName(page.category)).slice(0, 3),
      groups: state.groups.filter((group) => byName(group.name) || byName(group.category)).slice(0, 3),
      events: state.events.filter((event) => byName(event.title) || byName(event.location)).slice(0, 3),
      listings: state.listings.filter((listing) => byName(listing.title) || byName(listing.category)).slice(0, 3),
      posts: state.posts
        .filter((post) => post.text && searchNormalize(post.text).includes(normalized))
        .slice(0, 3),
    };
  }, [normalized, state]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    const clean = query.trim();
    setRecent((current) => [clean, ...current.filter((item) => item !== clean)].slice(0, 4));
    onClose();
    navigate(`/recherche?q=${encodeURIComponent(clean)}`);
  };

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const totalResults = results
    ? results.people.length +
      results.pages.length +
      results.groups.length +
      results.events.length +
      results.listings.length +
      results.posts.length
    : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      hideClose
      size="xl"
      className="mt-[6vh] mb-auto max-h-[84dvh]"
      bodyClassName="p-0"
    >
      <div className="sticky top-0 z-10 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-sm">
        <form onSubmit={submit} className="flex items-center gap-2.5">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-surface-muted px-3.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <Search className="size-4 shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une personne, un groupe, une annonce…"
              className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
              aria-label="Rechercher sur N’Teriface"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="grid size-7 place-items-center rounded-full text-muted hover:bg-line/60 hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <IconButton label="Fermer la recherche" onClick={onClose} className="border border-line">
            <X className="size-4" />
          </IconButton>
        </form>
        <div className="mt-2 flex items-center gap-2 text-[9.5px] text-muted">
          <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-semibold">Entrée</span>
          pour tous les résultats
          <span className="mx-1">·</span>
          <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-semibold">Échap</span>
          pour fermer
        </div>
      </div>

      <div className="px-4 pb-5 pt-4 sm:px-5">
        {!normalized && (
          <div className="space-y-5">
            <div className="rounded-[20px] border border-brand/15 bg-[linear-gradient(135deg,var(--color-brand-soft),var(--color-surface))] p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
                    Cherchez autrement avec N’Teri AI
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-ink-soft">
                    Posez une question, demandez un résumé du fil ou une idée de publication.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAI("Résume mon fil d’actualité")}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline"
                  >
                    Essayer le mode IA
                    <ArrowUpRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Recherches récentes</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-full border border-line bg-surface px-2.5 py-1.5 text-[10.5px] font-medium text-ink-soft transition hover:border-line-strong hover:bg-surface-muted"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Tendances au Mali</p>
              <ul className="mt-1 divide-y divide-line">
                {trends.slice(0, 4).map((trend) => (
                  <li key={trend.tag}>
                    <button
                      type="button"
                      onClick={() => setQuery(trend.tag)}
                      className="flex w-full items-center gap-3 py-2.5 text-left"
                    >
                      <span className="grid size-8 place-items-center rounded-xl bg-surface-muted text-muted">
                        <TrendingIcon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-ink">{trend.tag}</span>
                        <span className="text-[9.5px] text-muted">{trend.posts}</span>
                      </span>
                      <span className="text-[9px] font-semibold text-brand">{trend.delta}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Suggestions pour vous</p>
              <ul className="mt-2 divide-y divide-line">
                {suggestedFriends.slice(0, 3).map((person) => (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => go(`/profil/${person.username}`)}
                      className="flex w-full items-center gap-3 py-2.5 text-left"
                    >
                      <Avatar name={person.name} src={person.avatar} tone={person.tone} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-ink">{person.name}</span>
                        <span className="text-[9.5px] text-muted">{person.mutual} amis en commun</span>
                      </span>
                      <ChevronRight className="size-3.5 text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {normalized && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10.5px] font-medium text-muted">
                {totalResults > 0
                  ? `${totalResults} résultat${totalResults > 1 ? "s" : ""} pour « ${query.trim()} »`
                  : `Aucun résultat pour « ${query.trim()} »`}
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[10px] font-semibold text-brand hover:underline"
              >
                Effacer
              </button>
            </div>

            <div className="rounded-[20px] border border-brand/15 bg-brand-soft/50 p-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-brand" />
                <p className="text-[11px] font-semibold text-ink">Demander à N’Teri AI</p>
              </div>
              <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-ink-soft">
                « {query.trim()} » — obtenez une réponse synthétique basée sur le contenu public de la démo.
              </p>
              <button
                type="button"
                onClick={() => onOpenAI(query.trim())}
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
              >
                Ouvrir la réponse IA
                <ArrowUpRight className="size-3" />
              </button>
            </div>

            {results?.people.length ? (
              <ResultGroup title="Personnes">
                {results.people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => go(`/profil/${person.username}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-muted"
                  >
                    <Avatar name={person.name} src={person.avatar} tone={person.tone} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-ink">
                        {person.name}
                        {person.verified && <VerifiedBadge />}
                      </span>
                      <span className="block truncate text-[9.5px] text-muted">
                        @{person.username} · {person.work}
                      </span>
                    </span>
                    <ChevronRight className="size-3.5 text-muted" />
                  </button>
                ))}
              </ResultGroup>
            ) : null}

            {results?.pages.length ? (
              <ResultGroup title="Pages">
                {results.pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => go(`/pages/${page.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-muted"
                  >
                    <Avatar name={page.name} tone={page.tone} shape="squircle" size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-ink">
                        {page.name}
                        {page.verified && <VerifiedBadge />}
                      </span>
                      <span className="block truncate text-[9.5px] text-muted">
                        Page · {formatCount(page.followers)} abonnés
                      </span>
                    </span>
                    <ChevronRight className="size-3.5 text-muted" />
                  </button>
                ))}
              </ResultGroup>
            ) : null}

            {results?.groups.length ? (
              <ResultGroup title="Groupes">
                {results.groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => go(`/groupes/${group.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-muted"
                  >
                    <Avatar name={group.name} tone={group.tone} shape="group" size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-ink">{group.name}</span>
                      <span className="text-[9.5px] text-muted">
                        Groupe {group.privacy} · {formatCount(group.members)} membres
                      </span>
                    </span>
                    <ChevronRight className="size-3.5 text-muted" />
                  </button>
                ))}
              </ResultGroup>
            ) : null}

            {results?.listings.length ? (
              <ResultGroup title="Marketplace">
                {results.listings.map((listing) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => go(`/marketplace/${listing.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-muted"
                  >
                    <Photo src={listing.image} alt={listing.title} className="size-10 rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-ink">{listing.title}</span>
                      <span className="text-[9.5px] text-muted">
                        {formatCount(listing.price)} FCFA · {listing.location}
                      </span>
                    </span>
                  </button>
                ))}
              </ResultGroup>
            ) : null}

            {results?.events.length ? (
              <ResultGroup title="Événements">
                {results.events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => go(`/evenements/${event.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-muted"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-tone-red text-tone-red-ink">
                      <CalendarDays className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-ink">{event.title}</span>
                      <span className="text-[9.5px] text-muted">
                        {event.date} · {event.location}
                      </span>
                    </span>
                  </button>
                ))}
              </ResultGroup>
            ) : null}

            {results?.posts.length ? (
              <ResultGroup title="Publications">
                {results.posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => go("/")}
                    className="flex w-full items-start gap-2.5 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-muted"
                  >
                    <Avatar name={post.author.name} src={post.author.avatar} tone={post.author.tone} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-semibold text-ink">{post.author.name}</span>
                      <span className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted">
                        {post.text}
                      </span>
                    </span>
                  </button>
                ))}
              </ResultGroup>
            ) : null}

            {totalResults === 0 && (
              <div className="rounded-2xl border border-line bg-surface-muted px-4 py-8 text-center">
                <Search className="mx-auto size-6 text-muted" />
                <p className="mt-3 text-[12px] font-semibold text-ink">Essayez un autre mot-clé</p>
                <p className="mt-1 text-[10.5px] text-muted">
                  Ex. « bogolan », « Bamako », « Aigles », « bazin ».
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function ResultGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">{title}</p>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function TrendingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path d="M4 16.5 9 11l3.5 3.5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

const notificationStyle: Record<Notification["type"], { icon: ReactNode; tone: AvatarTone }> = {
  friend_request: { icon: <UserPlus className="size-4" />, tone: "river" },
  friend_accept: { icon: <UserCheck className="size-4" />, tone: "green" },
  reaction: { icon: <Heart className="size-4" />, tone: "red" },
  comment: { icon: <MessageCircle className="size-4" />, tone: "indigo" },
  mention: { icon: <Sparkles className="size-4" />, tone: "yellow" },
  message: { icon: <MessageCircle className="size-4" />, tone: "river" },
  event: { icon: <CalendarDays className="size-4" />, tone: "clay" },
  marketplace: { icon: <ShoppingBag className="size-4" />, tone: "yellow" },
  live: { icon: <Radio className="size-4" />, tone: "red" },
  security: { icon: <ShieldAlert className="size-4" />, tone: "red" },
  group: { icon: <UsersRound className="size-4" />, tone: "green" },
  system: { icon: <Info className="size-4" />, tone: "river" },
};

function NotificationsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, markNotificationsRead, markNotificationRead, acceptFriend, declineFriend } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "unread" | "mentions">("all");

  const filtered = state.notifications.filter((notification) => {
    if (tab === "unread") return !notification.read;
    if (tab === "mentions") return notification.type === "mention" || notification.type === "comment";
    return true;
  });
  const unread = state.notifications.filter((notification) => !notification.read).length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifications"
      description={`${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/parametres?tab=notifications")}
            className="text-[10.5px] font-semibold text-brand hover:underline"
          >
            Préférences de notifications
          </button>
          <Button variant="secondary" size="sm" onClick={markNotificationsRead}>
            Tout marquer comme lu
          </Button>
        </div>
      }
    >
      <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
        <SegmentedTabs
          ariaLabel="Filtrer les notifications"
          value={tab}
          onChange={setTab}
          items={[
            { id: "all", label: "Tout", count: state.notifications.length },
            { id: "unread", label: "Non lues", count: unread },
            { id: "mentions", label: "Mentions" },
          ]}
        />
      </div>
      <ul className="divide-y divide-line">
        {filtered.map((notification) => {
          const style = notificationStyle[notification.type];
          const request = state.requests.find((item) => item.personId === notification.actor.id);
          const openNotification = () => {
            markNotificationRead(notification.id);
            if (notification.href) {
              onClose();
              navigate(notification.href);
            }
          };
          return (
            <li key={notification.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={openNotification}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openNotification();
                  }
                }}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40",
                  !notification.read && "bg-brand-soft/35",
                )}
              >
                <span className="relative shrink-0">
                  <Avatar
                    name={notification.actor.name}
                    src={notification.actor.avatar}
                    tone={notification.actor.tone}
                    size="lg"
                    shape={notification.actor.kind === "page" ? "squircle" : "circle"}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-surface",
                      toneSurface[style.tone],
                    )}
                  >
                    {style.icon}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-[11.5px] leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">{notification.actor.name}</span>{" "}
                    {notification.text}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-medium text-muted">{notification.time}</span>
                  {notification.type === "friend_request" && request && (
                    <span className="mt-2 flex gap-1.5" onClick={(event) => event.stopPropagation()}>
                      <Button
                        size="sm"
                        className="h-8 px-3 text-[10px]"
                        onClick={() => {
                          acceptFriend(notification.actor.id);
                          markNotificationRead(notification.id);
                        }}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-3 text-[10px]"
                        onClick={() => declineFriend(notification.actor.id)}
                      >
                        Supprimer
                      </Button>
                    </span>
                  )}
                </span>
                {notification.image && (
                  <Photo
                    src={notification.image}
                    alt=""
                    className="mt-0.5 size-12 shrink-0 rounded-lg"
                  />
                )}
                {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />}
              </div>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 && (
        <div className="px-6 py-16 text-center">
          <Bell className="mx-auto size-6 text-muted" />
          <p className="mt-3 text-[12px] font-semibold text-ink">Tout est à jour</p>
          <p className="mt-1 text-[10.5px] text-muted">Aucune notification dans ce filtre.</p>
        </div>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* AI                                                                  */
/* ------------------------------------------------------------------ */

function buildAIAnswer(input: string) {
  const q = searchNormalize(input);
  if (q.includes("resume") || q.includes("fil")) {
    return [
      "Voici l’essentiel de votre fil N’Teriface :",
      "",
      "• Moussa Diarra a publié une photo du fleuve Niger au lever du jour — 1 152 réactions.",
      "• Fatoumata Keïta lance un sondage sur le plat qui représente le mieux le Mali.",
      "• Faso Kréa dévoile la collection Harmattan et le marché nocturne du 31 octobre.",
      "• Ibrahim Touré partage un Reel cuisine qui dépasse les 182 000 vues.",
      "",
      "Une tendance se dégage : le Made in Mali et les rencontres locales rassemblent le plus d’engagement aujourd’hui.",
    ].join("\n");
  }
  if (q.includes("publication") || q.includes("ecris") || q.includes("harmattan")) {
    return [
      "Voici une proposition de publication :",
      "",
      "« L’harmattan souffle, la collection aussi. 🌾",
      "Trois pièces en bazin et bogolan, teintes à Ségou, cousues à Bamako. Chaque couture porte un geste, chaque motif raconte notre terre.",
      "La collection Harmattan est disponible à l’atelier Faso Kréa et en ligne.",
      "#MadeInMali #FasoKrea #Bamako »",
      "",
      "Souhaitez-vous une version plus courte, plus poétique ou orientée vente ?",
    ].join("\n");
  }
  if (q.includes("reel") || q.includes("performance") || q.includes("statistique") || q.includes("stats")) {
    return [
      "Analyse de vos Reels (7 derniers jours) :",
      "",
      "• 42 800 vues (+18 % vs semaine précédente)",
      "• Taux de rétention moyen : 61 % (au-dessus de votre moyenne de 54 %)",
      "• Meilleur format : les coulisses d’atelier, 2,4× plus de partages",
      "• Audience : 18–34 ans, 64 % à Bamako, 21 % à Ségou",
      "",
      "Recommandation : publiez le prochain Reel entre 18h et 20h avec un son malien tendance et une accroche dès la première seconde.",
    ].join("\n");
  }
  if (q.includes("idee") || q.includes("contenu") || q.includes("sujet")) {
    return [
      "Cinq idées de contenu pour votre audience :",
      "",
      "1. « Une journée à l’atelier » — timelapse de la teinture du bogolan.",
      "2. « Le prix juste » — expliquer le coût réel d’une pièce artisanale.",
      "3. « Trois façons de porter le bazin » — formats Reel courts.",
      "4. « Les femmes qui font Faso Kréa » — portraits et savoir-faire.",
      "5. « Bamako en couleurs » — collaboration avec un photographe local.",
      "",
      "Je peux rédiger le script ou la légende du premier épisode.",
    ].join("\n");
  }
  if (q.includes("bambara") || q.includes("tradu")) {
    return [
      "Version courte en bambara, à faire relire par un locuteur natif avant publication :",
      "",
      "« Aw ni ce ! Faso Kréa bɛ bila baara kura la. Aw bɛ na aw ka bazin ni bogolan dɔn. »",
      "",
      "Pour une publication complète, je recommande une relecture humaine. Voulez-vous aussi une version en anglais ou en espagnol ?",
    ].join("\n");
  }
  if (q.includes("prix") || q.includes("marketplace")) {
    return [
      "Estimation Marketplace pour un ensemble bazin riche :",
      "",
      "• Fourchette conseillée : 45 000–55 000 FCFA",
      "• Prix moyen observé à Bamako : 48 500 FCFA",
      "• Les annonces avec 4 photos ou plus reçoivent 2,1× plus de messages.",
      "",
      "Conseil : mettez en avant le sur-mesure et les retouches incluses pour justifier le haut de la fourchette.",
    ].join("\n");
  }
  if (q.includes("groupe") || q.includes("communauté")) {
    return [
      "Résumé de vos groupes :",
      "",
      "• Bamako Entrepreneurs : 42 publications aujourd’hui, 3 demandes en attente.",
      "• Développeurs du Sahel : 19 publications, le fil sur les paiements mobiles domine.",
      "• Cuisine malienne authentique : 87 publications, la recette du capitaine braisé est la plus partagée.",
      "",
      "Je peux retrouver une ancienne réponse ou préparer une annonce de modération.",
    ].join("\n");
  }
  if (q.includes("securite") || q.includes("sécurité") || q.includes("connexion")) {
    return [
      "Votre sécurité est à jour :",
      "",
      "• Authentification à deux facteurs : activée",
      "• 3 appareils de confiance, 1 session ouverte maintenant",
      "• Aucune connexion suspecte détectée cette semaine",
      "",
      "Une connexion Android à Ségou a été signalée il y a 3 jours. Vérifiez vos sessions si ce n’était pas vous.",
    ].join("\n");
  }
  return [
    `J’ai bien reçu votre demande : « ${input.trim()} ».`,
    "",
    "Voici ce que je peux faire dans cette démo :",
    "• résumer votre fil ou une conversation ;",
    "• rédiger une publication, une description Marketplace ou un script de Reel ;",
    "• analyser vos statistiques créateur ;",
    "• suggérer des hashtags et des idées de contenu ;",
    "• traduire un texte.",
    "",
    "Précisez votre objectif et je vous propose une première version.",
  ].join("\n");
}

function AIDrawer({
  open,
  onClose,
  seedPrompt,
  onSeedConsumed,
}: {
  open: boolean;
  onClose: () => void;
  seedPrompt?: string | null;
  onSeedConsumed: () => void;
}) {
  const { state } = useApp();
  const [messages, setMessages] = useState<Array<{ id: string; role: "ai" | "me"; text: string }>>([
    {
      id: "ai-welcome",
      role: "ai",
      text: "Bonjour Awa 👋 Je suis N’Teri AI, votre assistant créatif et votre moteur de recherche.\n\nJe peux résumer votre fil, écrire une publication, analyser vos Reels ou trouver une réponse dans un groupe. Que souhaitez-vous faire ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const send = (value: string) => {
    if (!value.trim()) return;
    const question = value.trim();
    setMessages((current) => [
      ...current,
      { id: `me-${Date.now()}`, role: "me", text: question },
    ]);
    setInput("");
    setTyping(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `ai-${Date.now()}`, role: "ai", text: buildAIAnswer(question) },
      ]);
      setTyping(false);
    }, 950);
  };

  useEffect(() => {
    if (!open) return;
    if (seedPrompt && seedPrompt.trim()) {
      send(seedPrompt);
      onSeedConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seedPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[12px] bg-[linear-gradient(145deg,var(--color-brand),var(--color-logo))] text-white">
            <Sparkles className="size-4" />
          </span>
          N’Teri AI
        </span>
      }
      description="Assistant créatif · recherche augmentée · démo locale"
      width="max-w-lg"
      footer={
        <div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="ai-input" className="sr-only">
              Votre message à N’Teri AI
            </label>
            <input
              id="ai-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Demandez-moi quelque chose…"
              className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface-muted px-4 text-[12px] text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <Button type="submit" size="md" className="size-11 shrink-0 px-0" aria-label="Envoyer" disabled={!input.trim()}>
              <Sparkles className="size-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[8.5px] text-muted">
            Réponses générées localement pour la démonstration. Vérifiez les informations importantes.
          </p>
        </div>
      }
    >
      <div ref={scrollRef} className="scrollbar-slim h-full overflow-y-auto px-4 py-4">
        <div className="rounded-2xl border border-brand/15 bg-brand-soft/60 p-3">
          <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-brand">
            <Sparkles className="size-3" />
            Mode démo
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-soft">
            N’Teri AI simule un assistant multimodal. Les données proviennent uniquement de cette
            démonstration.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {aiSuggestions.slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="rounded-full border border-line bg-surface px-2.5 py-1.5 text-[9.5px] font-medium text-ink-soft transition hover:border-line-strong hover:bg-surface-muted"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3.5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-2.5", message.role === "me" ? "flex-row-reverse" : "flex-row")}
            >
              {message.role === "ai" ? (
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(145deg,var(--color-brand),var(--color-logo))] text-white">
                  <Sparkles className="size-3.5" />
                </span>
              ) : (
                <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="sm" />
              )}
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed",
                  message.role === "me"
                    ? "rounded-tr-md bg-brand text-white"
                    : "rounded-tl-md border border-line bg-surface-muted text-ink-soft",
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-[10px] bg-brand text-white">
                <Sparkles className="size-3.5" />
              </span>
              <span className="flex items-center gap-1 rounded-2xl border border-line bg-surface-muted px-3 py-2.5">
                <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted" />
              </span>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export function ToastStack() {
  const { toasts, dismissToast } = useApp();
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[120] flex flex-col items-center gap-2 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-[11.5px] font-medium shadow-float backdrop-blur-sm",
            toast.tone === "danger" && "border-danger/20 bg-danger-soft text-danger",
            toast.tone === "info" && "border-line bg-surface text-ink-soft",
            toast.tone === "success" && "border-brand/20 bg-surface text-ink",
          )}
        >
          <span
            className={cn(
              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full",
              toast.tone === "danger" && "bg-danger text-white",
              toast.tone === "info" && "bg-tone-river-ink text-white",
              toast.tone === "success" && "bg-brand text-white",
            )}
          >
            {toast.tone === "info" ? <Info className="size-2.5" /> : <Check className="size-2.5" strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1 leading-relaxed">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Fermer la notification"
            className="-mr-1 grid size-6 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-muted"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
  }, [searchOpen]);

  const openAI = (prompt?: string) => {
    setSearchOpen(false);
    if (prompt) setAiPrompt(prompt);
    setAiOpen(true);
  };

  return (
    <div className="app-pattern min-h-dvh text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-[12px] focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>

      <TopBar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenAI={() => openAI()}
      />

      <main
        id="contenu"
        className="mx-auto flex w-full max-w-[1500px] justify-center gap-5 px-3 pb-24 pt-0 sm:px-4 lg:gap-6 lg:px-5 lg:pb-10 xl:gap-7 xl:px-6"
      >
        <LeftRail />
        <div className="min-h-[calc(100dvh-60px)] w-full min-w-0 max-w-[700px] pt-4">
          <Outlet />
        </div>
        <RightRail />
      </main>

      <button
        type="button"
        onClick={() => openAI()}
        aria-label="Ouvrir N’Teri AI"
        className="group fixed bottom-[74px] right-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(145deg,var(--color-brand),var(--color-logo))] px-3.5 text-[11.5px] font-semibold text-white shadow-float transition hover:-translate-y-0.5 hover:brightness-110 lg:bottom-6 lg:right-6"
      >
        <Sparkles className="size-4 text-[color:var(--color-mali-yellow)]" />
        <span className="hidden sm:inline">N’Teri AI</span>
      </button>

      <MobileBottomNav onOpenMenu={() => setMenuOpen(true)} />
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenAI={(query) => openAI(query)}
      />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <AIDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        seedPrompt={aiPrompt}
        onSeedConsumed={() => setAiPrompt(null)}
      />
      <ComposerModal />
    </div>
  );
}

/* Re-exported for other pages to keep a consistent left alignment. */
export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-[24px] font-semibold leading-tight tracking-[-0.045em] text-ink sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[11.5px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export { formatFullNumber };
