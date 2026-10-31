import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Check,
  Ellipsis,
  Globe,
  GraduationCap,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Play,
  Plus,
  Settings,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import { PageIntro } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import {
  Avatar,
  Button,
  Card,
  DemoTag,
  EmptyState,
  InlineNotice,
  Menu,
  Modal,
  Photo,
  SegmentedTabs,
  VerifiedBadge,
  fieldClass,
} from "@/components/ui";
import { people } from "@/data";
import { cn, formatCount } from "@/lib/utils";
import { useApp } from "@/store";
import type { Person } from "@/types";

const fallbackCovers = [
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=82",
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=82",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1600&q=82",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=82",
];

const profileGallery = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80",
];

type ProfileTab = "posts" | "about" | "friends" | "photos" | "reels";

function EditProfileModal({
  open,
  onClose,
  person,
}: {
  open: boolean;
  onClose: () => void;
  person: Person;
}) {
  const { updateProfile } = useApp();
  const [name, setName] = useState(person.name);
  const [bio, setBio] = useState(person.bio ?? "");
  const [location, setLocation] = useState(person.location ?? "");
  const [hometown, setHometown] = useState(person.hometown ?? "");
  const [work, setWork] = useState(person.work ?? "");
  const [education, setEducation] = useState(person.education ?? "");
  const [website, setWebsite] = useState(person.website ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(person.name);
      setBio(person.bio ?? "");
      setLocation(person.location ?? "");
      setHometown(person.hometown ?? "");
      setWork(person.work ?? "");
      setEducation(person.education ?? "");
      setWebsite(person.website ?? "");
      setError(null);
    }
  }, [open, person]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Votre nom doit contenir au moins 2 caractères.");
      return;
    }
    updateProfile({ name: name.trim(), bio, location, hometown, work, education, website });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Modifier le profil"
      description="Ces informations sont visibles sur votre profil public."
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" type="submit" form="edit-profile-form">Enregistrer</Button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Nom complet</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="profile-bio" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Bio</label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            className={cn(fieldClass, "h-auto resize-none py-2.5")}
            placeholder="Quelques mots sur vous…"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-location" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Ville actuelle</label>
            <input id="profile-location" value={location} onChange={(event) => setLocation(event.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="profile-hometown" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Ville d’origine</label>
            <input id="profile-hometown" value={hometown} onChange={(event) => setHometown(event.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="profile-work" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Travail</label>
            <input id="profile-work" value={work} onChange={(event) => setWork(event.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="profile-education" className="mb-1.5 block text-[11px] font-semibold text-ink-soft"> Formation</label>
            <input id="profile-education" value={education} onChange={(event) => setEducation(event.target.value)} className={fieldClass} />
          </div>
        </div>
        <div>
          <label htmlFor="profile-website" className="mb-1.5 block text-[11px] font-semibold text-ink-soft">Site web</label>
          <input id="profile-website" value={website} onChange={(event) => setWebsite(event.target.value)} className={fieldClass} />
        </div>
        <InlineNotice tone="info">Votre photo et votre couverture sont conservées dans cette démo.</InlineNotice>
      </form>
    </Modal>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const {
    state,
    friendCount,
    addFriend,
    removeFriend,
    startConversation,
    showToast,
    openComposer,
  } = useApp();
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [following, setFollowing] = useState(false);

  const person = useMemo(() => {
    if (username === state.me.username) return state.me;
    return people.find((item) => item.username === username);
  }, [state.me, username]);

  useEffect(() => {
    setTab("posts");
    setFollowing(false);
  }, [username]);

  if (!person) {
    return (
      <Card>
        <EmptyState
          icon={<Users className="size-6" />}
          title="Profil introuvable"
          description="Cette personne n’existe pas dans la démonstration. Vérifiez le nom d’utilisateur."
          action={<Button onClick={() => navigate("/")}>Retour au fil</Button>}
        />
      </Card>
    );
  }

  const isMe = person.id === state.me.id;
  const isFriend = state.friendIds.includes(person.id);
  const posts = state.posts.filter(
    (post) => post.author.id === person.id || (post.author.handle === `@${person.username}` && !post.pageId),
  );
  const reels = state.reels.filter((reel) => reel.author.id === person.id);
  const photos = posts.flatMap((post) => post.media ?? []);
  const gallery = photos.length > 0 ? photos.map((media) => media.url) : profileGallery;
  const cover = person.cover ?? fallbackCovers[person.id.length % fallbackCovers.length];
  const friends = state.friendIds
    .map((id) => people.find((item) => item.id === id))
    .filter((item): item is Person => Boolean(item))
    .slice(0, 9);
  const memberFriends = people.filter((item) => item.friend || isFriend).slice(0, 9);

  const message = () => {
    const id = startConversation(person);
    navigate(`/messages?conv=${id}`);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" />
          Retour au fil
        </Link>
        <DemoTag />
      </div>

      <Card className="overflow-hidden">
        <div className="relative">
          <Photo src={cover} alt={`Couverture de ${person.name}`} className="h-[190px] w-full sm:h-[240px]" eager>
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {isMe && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/30 bg-black/25 px-3 text-[9.5px] font-semibold text-white backdrop-blur transition hover:bg-black/40"
              >
                <Camera className="size-3.5" />
                Changer la couverture
              </button>
            )}
          </Photo>

          <div className="px-4 pb-3">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
              <div className="flex items-end gap-3">
                <span className="rounded-full border-4 border-surface bg-surface shadow-card">
                  <Avatar name={person.name} src={person.avatar} tone={person.tone} size="4xl" online={person.online} />
                </span>
                <div className="min-w-0 pb-1">
                  <h1 className="flex items-center gap-1.5 font-display text-[22px] font-semibold leading-tight tracking-[-0.045em] text-ink sm:text-[27px]">
                    {person.name}
                    {person.verified && <VerifiedBadge className="size-4" />}
                  </h1>
                  <p className="mt-0.5 text-[10px] font-medium text-muted">@{person.username}</p>
                  <p className="mt-1 text-[10.5px] text-ink-soft">{person.bio}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-muted">
                    {person.location && <span className="inline-flex items-center gap-1"><MapPin className="size-2.5" />{person.location}</span>}
                    {person.work && <span className="inline-flex items-center gap-1"><Briefcase className="size-2.5" />{person.work}</span>}
                    {person.website && <span className="inline-flex items-center gap-1"><Globe className="size-2.5" />{person.website}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pb-1">
                {isMe ? (
                  <>
                    <Button size="sm" onClick={() => setEditOpen(true)}>
                      <Pencil className="size-3.5" />
                      Modifier le profil
                    </Button>
                    <Menu
                      label="Options du profil"
                      trigger={<span className="grid size-9 place-items-center rounded-full border border-line bg-surface text-muted"><Ellipsis className="size-4" /></span>}
                      items={[
                        { label: "Voir mon profil public", onClick: () => showToast("Vous consultez déjà votre profil.", "info") },
                        { label: "Creator Studio", onClick: () => navigate("/createur") },
                        { label: "Paramètres du compte", onClick: () => navigate("/parametres") },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <Button size="sm" variant={following ? "secondary" : "primary"} onClick={() => { setFollowing((current) => !current); showToast(following ? "Vous ne suivez plus cette personne." : `Vous suivez ${person.name}.`, "info"); }}>
                      {following ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                      {following ? "Suivi·e" : "Suivre"}
                    </Button>
                    {isFriend ? (
                      <Button size="sm" variant="secondary" onClick={() => removeFriend(person.id)}>
                        <UserCheck className="size-3.5" />
                        Ami·e
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => addFriend(person.id)}>
                        <UserPlus className="size-3.5" />
                        Ajouter
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={message}>
                      <MessageCircle className="size-3.5" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-2.5 text-[9.5px]">
              <span><strong className="font-semibold text-ink">{formatCount(person.followers + (following ? 1 : 0))}</strong> <span className="text-muted">abonnés</span></span>
              <span><strong className="font-semibold text-ink">{formatCount(person.following)}</strong> <span className="text-muted">abonnements</span></span>
              <span><strong className="font-semibold text-ink">{formatCount(isMe ? friendCount : person.mutual ?? 12)}</strong> <span className="text-muted">amis</span></span>
              <span className="inline-flex items-center gap-1 text-brand"><Sparkles className="size-3" />{person.professional ? "Créateur professionnel" : "Membre N’Teriface"}</span>
            </div>
          </div>
        </div>

        <div className="no-scrollbar flex overflow-x-auto border-t border-line px-2">
          {[
            { id: "posts" as const, label: "Publications", count: posts.length },
            { id: "about" as const, label: "À propos" },
            { id: "friends" as const, label: "Amis", count: isMe ? friendCount : person.mutual ?? 0 },
            { id: "photos" as const, label: "Photos", count: gallery.length },
            { id: "reels" as const, label: "Reels", count: reels.length },
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

      <div className="mt-3 grid gap-3 md:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          {tab === "posts" && (
            <>
              {isMe && (
                <Card className="p-3">
                  <button
                    type="button"
                    onClick={() => openComposer("post")}
                    className="flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface-muted px-3 py-2.5 text-left transition hover:border-line-strong"
                  >
                    <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="md" />
                    <span className="text-[10.5px] text-muted">Quoi de neuf, {state.me.name.split(" ")[0]} ?</span>
                  </button>
                </Card>
              )}
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <Card>
                  <EmptyState
                    icon={<ImageIcon className="size-6" />}
                    title={isMe ? "Vous n’avez rien publié" : "Aucune publication publique"}
                    description={
                      isMe
                        ? "Partagez un instant avec votre communauté : une photo, une idée ou une actualité."
                        : "Cette personne n’a pas encore partagé de publication visible par vous."
                    }
                    action={isMe ? <Button onClick={() => openComposer("post")}>Créer une publication</Button> : undefined}
                  />
                </Card>
              )}
            </>
          )}

          {tab === "about" && (
            <Card className="p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">À propos de {person.name.split(" ")[0]}</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{person.bio}</p>
              <div className="mt-3 space-y-2.5 border-t border-line pt-3">
                {[
                  { icon: Briefcase, label: person.work ?? "Travail non renseigné" },
                  { icon: GraduationCap, label: person.education ?? "Formation non renseignée" },
                  { icon: MapPin, label: person.location ?? "Bamako, Mali" },
                  { icon: Building2, label: `Originaire de ${person.hometown ?? "Bamako"}` },
                  { icon: Link2, label: person.website ?? "Pas de site web" },
                ].map((item) => (
                  <p key={item.label} className="flex items-center gap-2 text-[10px] text-ink-soft">
                    <item.icon className="size-3.5 shrink-0 text-muted" />
                    {item.label}
                  </p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Mode", "Artisanat", "Bamako", "Création", "Sahel"].map((tag) => (
                  <span key={tag} className="rounded-full border border-line bg-surface-muted px-2 py-1 text-[8.5px] font-semibold text-muted">{tag}</span>
                ))}
              </div>
            </Card>
          )}

          {tab === "friends" && (
            <Card className="p-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold tracking-[-0.025em] text-ink">
                  {isMe ? "Vos amis" : `Amis en commun`}
                </h2>
                <Link to="/amis" className="text-[9.5px] font-semibold text-brand hover:underline">Tout voir</Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {memberFriends.map((friend) => (
                  <Link
                    key={friend.id}
                    to={`/profil/${friend.username}`}
                    className="flex items-center gap-2 rounded-2xl border border-line p-2 transition hover:border-line-strong"
                  >
                    <Avatar name={friend.name} src={friend.avatar} tone={friend.tone} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-semibold text-ink">{friend.name}</span>
                      <span className="mt-0.5 block text-[8px] text-muted">{friend.mutual ?? 8} amis en commun</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {tab === "photos" && (
            <Card className="p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gallery.map((url, index) => (
                  <Photo key={`${url}-${index}`} src={url} alt={`Photo ${index + 1} de ${person.name}`} className="aspect-square rounded-xl" />
                ))}
              </div>
            </Card>
          )}

          {tab === "reels" && (
            <Card className="p-4">
              {reels.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {reels.map((reel) => (
                    <Link key={reel.id} to="/reels" className="group relative aspect-[9/14] overflow-hidden rounded-2xl">
                      <img src={reel.poster} alt={reel.caption} className="size-full object-cover transition group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute left-2 top-2 rounded-full bg-black/30 px-1.5 py-0.5 text-[8px] font-semibold text-white backdrop-blur">
                        {reel.views} vues
                      </span>
                      <span className="absolute inset-x-2 bottom-2 line-clamp-2 text-[9px] font-medium text-white">{reel.caption}</span>
                      <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/30 text-white"><Play className="size-3" fill="currentColor" /></span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Play className="size-6" />}
                  title="Aucun Reel pour l’instant"
                  description={isMe ? "Publiez votre premier Reel et montrez votre univers." : "Cette personne n’a pas encore publié de Reel."}
                  action={isMe ? <Button onClick={() => openComposer("reel")}>Créer un Reel</Button> : undefined}
                />
              )}
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card className="p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Présentation</p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">{person.bio}</p>
            <div className="mt-2.5 space-y-2 border-t border-line pt-2.5">
              {person.work && <p className="flex items-start gap-2 text-[9.5px] text-ink-soft"><Briefcase className="mt-0.5 size-3.5 shrink-0 text-muted" />{person.work}</p>}
              {person.education && <p className="flex items-start gap-2 text-[9.5px] text-ink-soft"><GraduationCap className="mt-0.5 size-3.5 shrink-0 text-muted" />{person.education}</p>}
              <p className="flex items-center gap-2 text-[9.5px] text-ink-soft"><MapPin className="size-3.5 shrink-0 text-muted" />{person.location}</p>
              <p className="flex items-center gap-2 text-[9.5px] text-ink-soft"><CalendarDays className="size-3.5 shrink-0 text-muted" />A rejoint N’Teriface en 2023</p>
            </div>
            {isMe && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-surface-muted py-2 text-[9.5px] font-semibold text-ink-soft transition hover:border-line-strong"
              >
                <Pencil className="size-3" />
                Modifier les informations
              </button>
            )}
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Photos</p>
              <button type="button" onClick={() => setTab("photos")} className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {gallery.slice(0, 6).map((url, index) => (
                <Photo key={`${url}-mini-${index}`} src={url} alt="Photo de profil" className="aspect-square rounded-lg" />
              ))}
            </div>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Amis</p>
              <Link to="/amis" className="text-[8.5px] font-semibold text-brand hover:underline">Tout voir</Link>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {(friends.length > 0 ? friends : memberFriends).slice(0, 6).map((friend) => (
                <Link key={friend.id} to={`/profil/${friend.username}`} className="group text-center">
                  <Avatar name={friend.name} src={friend.avatar} tone={friend.tone} size="lg" className="mx-auto size-full aspect-square" />
                  <span className="mt-1 block truncate text-[8px] font-medium text-muted group-hover:text-ink">{friend.name.split(" ")[0]}</span>
                </Link>
              ))}
            </div>
          </Card>

          {!isMe && (
            <Card className="p-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Contacter</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={message} className="flex items-center justify-center gap-1.5 rounded-full bg-brand-soft py-2 text-[9.5px] font-semibold text-brand-ink transition hover:bg-brand/15">
                  <MessageCircle className="size-3.5" />
                  Message
                </button>
                <button type="button" onClick={() => showToast("Appel audio simulé depuis le profil.", "info")} className="flex items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[9.5px] font-semibold text-ink-soft transition hover:bg-surface-muted">
                  <Phone className="size-3.5" />
                  Appeler
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {isMe && <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} person={person} />}
    </div>
  );
}
