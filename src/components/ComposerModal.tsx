import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  Globe,
  ImagePlus,
  ListFilter,
  Lock,
  MapPin,
  Radio,
  Smile,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";

import { moods } from "@/data";
import { useApp } from "@/store";
import type { Post } from "@/types";
import {
  Avatar,
  Button,
  Field,
  InlineNotice,
  Modal,
  Photo,
  fieldClass,
  labelClass,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const photoPresets = [
  {
    url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1100&q=82",
    alt: "Lumière dorée sur le fleuve Niger",
  },
  {
    url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1100&q=82",
    alt: "Collection de vêtements en bazin",
  },
  {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1100&q=82",
    alt: "Plat malien préparé maison",
  },
  {
    url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1100&q=82",
    alt: "Textile bogolan et artisanat",
  },
  {
    url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1100&q=82",
    alt: "Ambiance d’un événement à Bamako",
  },
  {
    url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1100&q=82",
    alt: "Concert de musique malienne",
  },
];

const storyPresets = [
  { url: photoPresets[0].url, alt: "Coucher de soleil sur le Niger" },
  { url: photoPresets[1].url, alt: "Collection de mode" },
  { url: photoPresets[2].url, alt: "Cuisine malienne" },
  { url: photoPresets[3].url, alt: "Bogolan de Ségou" },
  { url: photoPresets[4].url, alt: "Marché nocturne" },
  { url: photoPresets[5].url, alt: "Concert live" },
];

const reelPresets = [
  { url: photoPresets[2].url, alt: "Cuisine en préparation" },
  { url: photoPresets[1].url, alt: "Défilé de mode" },
  { url: photoPresets[4].url, alt: "Danse et fête" },
  { url: photoPresets[3].url, alt: "Artisanat bogolan" },
];

const audiences = [
  { value: "public", label: "Public", icon: Globe },
  { value: "friends", label: "Amis", icon: Users },
  { value: "private", label: "Privé", icon: Lock },
] as const;

export function ComposerModal() {
  const {
    composer,
    closeComposer,
    state,
    createPost,
    createStory,
    createReel,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<Post["audience"]>("public");
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", ""]);
  const [storyImage, setStoryImage] = useState(0);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyMusic, setStoryMusic] = useState("");
  const [reelImage, setReelImage] = useState(0);
  const [reelCaption, setReelCaption] = useState("");
  const [reelAudio, setReelAudio] = useState("");
  const [liveTitle, setLiveTitle] = useState("Coulisses de l’atelier Faso Kréa");
  const [liveDescription, setLiveDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setText("");
    setAudience("public");
    setSelectedPhoto(null);
    setFeeling(null);
    setLocation("");
    setShowLocation(false);
    setShowPoll(false);
    setPollQuestion("");
    setPollOptions(["", "", ""]);
    setStoryImage(0);
    setStoryCaption("");
    setStoryMusic("");
    setReelImage(0);
    setReelCaption("");
    setReelAudio("");
    setLiveTitle("Coulisses de l’atelier Faso Kréa");
    setLiveDescription("");
    setBusy(false);
  };

  useEffect(() => {
    if (composer.open) reset();
  }, [composer.open, composer.kind]);

  const media = useMemo(
    () =>
      selectedPhoto === null
        ? undefined
        : [
            {
              id: `composer-${selectedPhoto}`,
              url: photoPresets[selectedPhoto].url,
              alt: photoPresets[selectedPhoto].alt,
            },
          ],
    [selectedPhoto],
  );

  const canPublishPost =
    text.trim().length > 0 ||
    Boolean(media?.length) ||
    Boolean(showPoll && pollQuestion.trim() && pollOptions.filter((option) => option.trim()).length >= 2);

  const publishPost = () => {
    if (!canPublishPost) return;
    setBusy(true);
    createPost({
      text: text.trim(),
      audience,
      feeling: feeling ? `se sent ${feeling}` : undefined,
      location: showLocation ? location.trim() || "Bamako, Mali" : undefined,
      media,
      poll:
        showPoll && pollQuestion.trim()
          ? { question: pollQuestion.trim(), options: pollOptions }
          : undefined,
    });
    closeComposer();
  };

  const publishStory = () => {
    setBusy(true);
    createStory({
      caption: storyCaption.trim() || "Un instant partagé sur N’Teriface.",
      image: storyPresets[storyImage].url,
      music: storyMusic.trim() || undefined,
    });
    closeComposer();
  };

  const publishReel = () => {
    if (!reelCaption.trim()) return;
    setBusy(true);
    createReel({
      caption: reelCaption.trim(),
      poster: reelPresets[reelImage].url,
      audio: reelAudio.trim(),
    });
    closeComposer();
    navigate("/reels");
  };

  const startLive = () => {
    if (!liveTitle.trim()) return;
    closeComposer();
    showToast("Votre direct est configuré. La diffusion est simulée dans cette démo.");
    navigate("/videos");
  };

  const titles: Record<string, { title: string; description: string }> = {
    post: {
      title: "Créer une publication",
      description: "Partagez un instant avec votre communauté malienne.",
    },
    story: {
      title: "Créer une Story",
      description: "Visible pendant 24 h par votre audience choisie.",
    },
    reel: {
      title: "Créer un Reel",
      description: "Un format vertical, pensé pour être découvert.",
    },
    live: {
      title: "Lancer un direct",
      description: "Préparez votre diffusion en direct.",
    },
  };

  const current = titles[composer.kind] ?? titles.post;

  return (
    <Modal
      open={composer.open}
      onClose={closeComposer}
      title={current.title}
      description={current.description}
      size={composer.kind === "story" ? "md" : "lg"}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
            <Sparkles className="size-3 text-brand" />
            Démo · vos données restent sur cet appareil
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={closeComposer} size="sm">
              Annuler
            </Button>
            {composer.kind === "post" && (
              <Button onClick={publishPost} disabled={!canPublishPost} loading={busy} size="sm">
                Publier
              </Button>
            )}
            {composer.kind === "story" && (
              <Button onClick={publishStory} loading={busy} size="sm">
                Publier la Story
              </Button>
            )}
            {composer.kind === "reel" && (
              <Button onClick={publishReel} disabled={!reelCaption.trim()} loading={busy} size="sm">
                Publier le Reel
              </Button>
            )}
            {composer.kind === "live" && (
              <Button onClick={startLive} disabled={!liveTitle.trim()} size="sm">
                <Radio className="size-3.5" />
                Démarrer le direct
              </Button>
            )}
          </div>
        </div>
      }
    >
      {composer.kind === "post" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">{state.me.name}</p>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2 py-1">
                {audiences.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAudience(value)}
                    aria-pressed={audience === value}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-semibold transition",
                      audience === value ? "bg-surface text-brand shadow-sm" : "text-muted hover:text-ink",
                    )}
                  >
                    <Icon className="size-2.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label htmlFor="composer-text" className="sr-only">
            Texte de la publication
          </label>
          <textarea
            id="composer-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Quoi de neuf à Bamako, Awa ?"
            rows={4}
            className="w-full resize-none rounded-2xl border border-line bg-surface-muted/60 px-4 py-3 text-[14px] leading-relaxed text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {feeling && (
            <div className="flex items-center justify-between rounded-2xl bg-gold-soft px-3.5 py-2.5 text-[11.5px] font-medium text-[color:var(--color-gold)]">
              <span>Vous vous sentez {feeling}.</span>
              <button type="button" onClick={() => setFeeling(null)} aria-label="Retirer le sentiment">
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {showLocation && (
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ajouter un lieu — ex. Bamako, Mali"
              className={fieldClass}
              aria-label="Lieu de la publication"
            />
          )}

          {selectedPhoto !== null && (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <Photo
                src={photoPresets[selectedPhoto].url}
                alt={photoPresets[selectedPhoto].alt}
                className="aspect-[16/9] w-full"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Retirer la photo"
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-line">
            <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setSelectedPhoto(selectedPhoto === null ? 0 : null)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted",
                  selectedPhoto !== null && "text-brand",
                )}
              >
                <ImagePlus className="size-4 text-brand" />
                Photo
              </button>
              <button
                type="button"
                onClick={() => setFeeling(feeling ? null : moods[0].label)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted"
              >
                <Smile className="size-4 text-[color:var(--color-gold)]" />
                Sentiment
              </button>
              <button
                type="button"
                onClick={() => setShowLocation((current) => !current)}
                aria-pressed={showLocation}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted",
                  showLocation && "text-brand",
                )}
              >
                <MapPin className="size-4 text-[color:var(--color-mali-red)]" />
                Lieu
              </button>
              <button
                type="button"
                onClick={() => setShowPoll((current) => !current)}
                aria-pressed={showPoll}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted",
                  showPoll && "text-brand",
                )}
              >
                <ListFilter className="size-4 text-tone-river-ink" />
                Sondage
              </button>
              <button
                type="button"
                onClick={() => showToast("Les événements se créent depuis l’onglet Événements.", "info")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-ink-soft transition hover:bg-surface-muted"
              >
                <Calendar className="size-4 text-tone-clay-ink" />
                Événement
              </button>
            </div>
            {feeling && (
              <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    onClick={() => setFeeling(mood.label)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition",
                      feeling === mood.label
                        ? "border-brand/30 bg-brand-soft text-brand-ink"
                        : "border-line text-ink-soft hover:bg-surface-muted",
                    )}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            )}
            {selectedPhoto === null && (
              <div className="grid grid-cols-3 gap-1 border-t border-line p-2 sm:grid-cols-6">
                {photoPresets.map((preset, index) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setSelectedPhoto(index)}
                    className="group relative aspect-square overflow-hidden rounded-xl ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label={`Ajouter la photo : ${preset.alt}`}
                  >
                    <img
                      src={preset.url}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {showPoll && (
            <div className="space-y-2.5 rounded-2xl border border-line bg-surface-muted/50 p-3.5">
              <Field label="Question du sondage">
                <input
                  value={pollQuestion}
                  onChange={(event) => setPollQuestion(event.target.value)}
                  placeholder="Quel est le meilleur plat malien ?"
                  className={cn(fieldClass, "mt-1.5")}
                />
              </Field>
              {pollOptions.map((option, index) => (
                <input
                  key={index}
                  value={option}
                  onChange={(event) =>
                    setPollOptions((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                    )
                  }
                  placeholder={`Option ${index + 1}`}
                  className={cn(fieldClass, "mt-1.5")}
                  aria-label={`Option ${index + 1} du sondage`}
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions((current) => [...current, ""])}
                  className="text-[11px] font-semibold text-brand hover:underline"
                >
                  + Ajouter une option
                </button>
              )}
            </div>
          )}

          <InlineNotice tone="info">
            Dans cette démonstration, les photos sont choisies dans une banque d’images locale et
            les publications sont conservées sur votre appareil.
          </InlineNotice>
        </div>
      )}

      {composer.kind === "story" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="relative aspect-[9/13] overflow-hidden rounded-2xl border border-line">
              <img src={storyPresets[storyImage].url} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <Avatar name={state.me.name} src={state.me.avatar} tone={state.me.tone} size="sm" ring />
                <span className="text-[11px] font-semibold text-white">{state.me.name}</span>
              </div>
              <p className="absolute inset-x-3 bottom-4 text-[15px] font-semibold leading-snug text-white drop-shadow">
                {storyCaption || "Votre légende apparaîtra ici…"}
              </p>
              {storyMusic && (
                <span className="absolute bottom-12 left-3 rounded-full bg-black/35 px-2 py-1 text-[9px] text-white backdrop-blur">
                  ♪ {storyMusic}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <Field label="Choisir un visuel">
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {storyPresets.map((preset, index) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setStoryImage(index)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-xl border-2 transition",
                        storyImage === index ? "border-brand" : "border-transparent hover:opacity-80",
                      )}
                      aria-label={`Choisir ${preset.alt}`}
                    >
                      <img src={preset.url} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Légende">
                <textarea
                  value={storyCaption}
                  onChange={(event) => setStoryCaption(event.target.value)}
                  rows={2}
                  placeholder="Un mot sur cet instant…"
                  className={cn(fieldClass, "mt-1.5 h-auto py-2.5")}
                />
              </Field>
              <Field label="Musique (facultatif)">
                <input
                  value={storyMusic}
                  onChange={(event) => setStoryMusic(event.target.value)}
                  placeholder="Ex. Oumou Sangaré — Djorolen"
                  className={cn(fieldClass, "mt-1.5")}
                />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {["Bamako", "Ségou", "Fleuve Niger", "Faso Kréa"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setStoryCaption((current) => `${current} ${tag}`.trim())}
                    className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold text-ink-soft hover:bg-surface-muted"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <InlineNotice tone="info">
            Votre Story sera visible 24 h. L’outil IA de retouche visuelle est simulé dans cette démo.
          </InlineNotice>
        </div>
      )}

      {composer.kind === "reel" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="relative aspect-[9/14] overflow-hidden rounded-2xl border border-line bg-ink">
              <img src={reelPresets[reelImage].url} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-mali-red)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                <Video className="size-2.5" />
                Reel
              </span>
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-[11px] font-semibold text-white">{state.me.name}</p>
                <p className="mt-1 line-clamp-3 text-[10.5px] leading-relaxed text-white/85">
                  {reelCaption || "Votre légende de Reel…"}
                </p>
                <p className="mt-2 flex items-center gap-1 text-[9px] text-white/75">
                  ♪ {reelAudio || "Son original"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Field label="Visuel de couverture">
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {reelPresets.map((preset, index) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setReelImage(index)}
                      className={cn(
                        "relative aspect-[9/14] overflow-hidden rounded-xl border-2 transition",
                        reelImage === index ? "border-brand" : "border-transparent hover:opacity-80",
                      )}
                      aria-label={`Choisir ${preset.alt}`}
                    >
                      <img src={preset.url} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Légende">
                <textarea
                  value={reelCaption}
                  onChange={(event) => setReelCaption(event.target.value)}
                  rows={3}
                  placeholder="Décrivez votre Reel et ajoutez des hashtags…"
                  className={cn(fieldClass, "mt-1.5 h-auto py-2.5")}
                />
              </Field>
              <Field label="Son ou musique">
                <input
                  value={reelAudio}
                  onChange={(event) => setReelAudio(event.target.value)}
                  placeholder="Ex. Ali Farka Touré — Savane"
                  className={cn(fieldClass, "mt-1.5")}
                />
              </Field>
              <button
                type="button"
                onClick={() => setReelCaption((current) => `${current} #MadeInMali #Bamako`.trim())}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                + Suggérer des hashtags avec l’IA
              </button>
            </div>
          </div>
          <InlineNotice tone="info">
            L’envoi vidéo est simulé : le Reel sera ajouté à votre profil avec cette couverture.
          </InlineNotice>
        </div>
      )}

      {composer.kind === "live" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(252,209,22,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(11,122,69,0.4),transparent_55%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-mali-red)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                En direct
              </span>
              <p className="mt-4 font-display text-[20px] font-semibold tracking-[-0.03em]">
                {liveTitle || "Votre direct"}
              </p>
              <p className="mt-1 text-[11px] text-white/65">Prévisualisation · N’Teriface Live</p>
            </div>
          </div>
          <Field label="Titre du direct">
            <input
              value={liveTitle}
              onChange={(event) => setLiveTitle(event.target.value)}
              className={cn(fieldClass, "mt-1.5")}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={liveDescription}
              onChange={(event) => setLiveDescription(event.target.value)}
              rows={3}
              placeholder="De quoi allez-vous parler ?"
              className={cn(fieldClass, "mt-1.5 h-auto py-2.5")}
            />
          </Field>
          <InlineNotice tone="info">
            Le direct est simulé. En production, la diffusion utiliserait WebRTC et un serveur
            d’ingestion vidéo.
          </InlineNotice>
        </div>
      )}

      {["listing", "event", "page", "group", "ad"].includes(composer.kind) && (
        <InlineNotice tone="info">
          Ce formulaire de création est disponible depuis sa section dédiée.
        </InlineNotice>
      )}
    </Modal>
  );
}
