import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Check,
  CircleAlert,
  Image as ImageIcon,
  LoaderCircle,
  X,
} from "lucide-react";

import { cn, initials, formatCount } from "@/lib/utils";
import type { AvatarTone } from "@/types";

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-[30%] bg-logo shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_20px_-12px_rgba(14,44,29,0.8)]",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="size-full" fill="none">
        <path d="M18 47V17h7.4l13.2 19.2V17H46v30h-7.4L25.4 27.8V47H18Z" fill="#fffefa" />
        <path d="M27 38.4 40.1 17H46L32.9 38.4H27Z" fill="#fcd116" />
        <circle cx="49" cy="15" r="4" fill="#ce1126" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

const toneClass: Record<AvatarTone, string> = {
  green: "bg-tone-green text-tone-green-ink",
  yellow: "bg-tone-yellow text-tone-yellow-ink",
  red: "bg-tone-red text-tone-red-ink",
  clay: "bg-tone-clay text-tone-clay-ink",
  river: "bg-tone-river text-tone-river-ink",
  indigo: "bg-tone-indigo text-tone-indigo-ink",
};

export const toneSurface = toneClass;

const avatarSizes = {
  xs: "size-6 text-[9px]",
  sm: "size-8 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
  xl: "size-14 text-base",
  "2xl": "size-20 text-xl",
  "3xl": "size-24 text-2xl",
  "4xl": "size-32 text-4xl",
} as const;

type AvatarSize = keyof typeof avatarSizes;

export function Avatar({
  name,
  src,
  tone = "green",
  size = "md",
  online,
  shape = "circle",
  className,
  ring,
}: {
  name: string;
  src?: string;
  tone?: AvatarTone;
  size?: AvatarSize;
  online?: boolean;
  shape?: "circle" | "squircle" | "group";
  className?: string;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center font-semibold tracking-[0.02em]",
        shape === "circle" && "rounded-full",
        shape === "squircle" && "rounded-[28%]",
        shape === "group" && "rounded-[22%]",
        toneClass[tone],
        avatarSizes[size],
        ring && "ring-2 ring-surface",
        className,
      )}
      aria-hidden="true"
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn(
            "size-full object-cover",
            shape === "circle" && "rounded-full",
            shape === "squircle" && "rounded-[28%]",
            shape === "group" && "rounded-[22%]",
          )}
        />
      ) : (
        <span className="select-none">{initials(name)}</span>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 size-[26%] min-h-2.5 min-w-2.5 rounded-full border-2 border-surface bg-mali-green" />
      )}
    </span>
  );
}

export function VerifiedBadge({ className, label = "Compte vérifié" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn("inline-grid size-[15px] shrink-0 place-items-center rounded-full bg-brand text-white", className)}
      title={label}
      aria-label={label}
    >
      <Check className="size-[9px]" strokeWidth={3.4} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "button-brand shadow-sm hover:brightness-[1.06] active:scale-[0.985]",
  secondary:
    "border border-line bg-surface text-ink hover:bg-surface-muted active:scale-[0.985]",
  ghost: "text-ink-soft hover:bg-surface-muted hover:text-ink active:scale-[0.985]",
  danger:
    "border border-danger/20 bg-danger-soft text-danger hover:bg-danger/10 active:scale-[0.985]",
  gold:
    "border border-gold/25 bg-gold-soft text-[color:var(--color-gold)] hover:bg-gold/15 active:scale-[0.985]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-full px-3.5 text-[11.5px]",
  md: "h-11 gap-2 rounded-full px-4 text-[12.5px]",
  lg: "h-12 gap-2 rounded-full px-5 text-[13.5px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className,
  children,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid size-11 shrink-0 place-items-center rounded-full text-ink-soft transition duration-200 hover:bg-surface-muted hover:text-ink active:scale-95 disabled:opacity-40",
        active && "bg-brand-soft text-brand-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
  as = "div",
  hover,
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "article" | "section" | "li";
  hover?: boolean;
}) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "rounded-[24px] border border-line bg-surface shadow-card",
        hover && "transition duration-250 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-brand">{eyebrow}</p>
        )}
        <h2 className="mt-0.5 font-display text-[20px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[22px]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs / chips                                                        */
/* ------------------------------------------------------------------ */

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number | string;
  icon?: ReactNode;
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  fullWidth = true,
  size = "md",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "no-scrollbar flex items-center gap-1 overflow-x-auto rounded-2xl bg-surface-muted p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-semibold transition duration-200",
              size === "md" ? "h-9 px-3.5 text-[11.5px]" : "h-8 px-3 text-[10.5px]",
              fullWidth && "flex-1",
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:bg-surface/60 hover:text-ink",
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span className={cn("text-[9.5px] font-bold", active ? "text-brand" : "text-muted")}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[11.5px] font-semibold transition duration-200",
        active
          ? "border-brand/30 bg-brand-soft text-brand-ink"
          : "border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-muted hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  hint?: string;
  separator?: boolean;
}

export function Menu({
  trigger,
  label,
  items,
  align = "right",
  width = "w-64",
  triggerClassName,
  header,
}: {
  trigger: ReactNode;
  label: string;
  items: MenuItem[];
  align?: "left" | "right";
  width?: string;
  triggerClassName?: string;
  header?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn("inline-flex items-center justify-center", triggerClassName)}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "pop-in absolute top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-pop",
            align === "right" ? "right-0" : "left-0",
            width,
          )}
        >
          {header && <div className="mb-1 border-b border-line px-3 py-2.5">{header}</div>}
          {items.map((item, index) =>
            item.separator ? (
              <div key={`sep-${index}`} className="my-1 h-px bg-line" role="separator" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium transition-colors disabled:opacity-40",
                  item.danger
                    ? "text-danger hover:bg-danger-soft"
                    : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                )}
              >
                {item.icon && <span className="shrink-0 text-current">{item.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{item.label}</span>
                  {item.hint && <span className="mt-0.5 block text-[10px] font-normal text-muted">{item.hint}</span>}
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog / drawer                                                     */
/* ------------------------------------------------------------------ */

const modalSizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
} as const;

function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }
    return () => {
      if (!open) document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.body.style.overflow = "";
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return ref;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  bodyClassName,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof modalSizes;
  className?: string;
  bodyClassName?: string;
  hideClose?: boolean;
}) {
  const ref = useNativeDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "dialog-in m-auto w-[calc(100vw-1.5rem)] overflow-hidden rounded-[26px] border border-line bg-surface p-0 text-ink shadow-pop sm:w-[calc(100vw-3rem)]",
        modalSizes[size],
        className,
      )}
    >
      {(title || !hideClose) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-[18px] font-semibold tracking-[-0.035em] text-ink">{title}</h2>
            )}
            {description && <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{description}</p>}
          </div>
          {!hideClose && (
            <IconButton label="Fermer" onClick={onClose} className="-mr-1.5 -mt-1 size-9">
              <X className="size-4" />
            </IconButton>
          )}
        </header>
      )}
      <div
        className={cn(
          "scrollbar-slim max-h-[calc(90dvh-8rem)] overflow-y-auto px-5 py-5 sm:px-6",
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer && (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-muted/60 px-5 py-3.5 sm:px-6">
          {footer}
        </footer>
      )}
    </dialog>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const ref = useNativeDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "drawer-in fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full overflow-hidden rounded-none border-0 border-l border-line bg-surface p-0 text-ink shadow-pop",
        width,
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.04em] text-ink">{title}</h2>
            {description && <p className="mt-1 text-[11px] leading-relaxed text-muted">{description}</p>}
          </div>
          <IconButton label="Fermer" onClick={onClose} className="-mr-1.5 -mt-1">
            <X className="size-4" />
          </IconButton>
        </header>
        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-4">{footer}</div>}
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-3">
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink">{label}</div>
        {description && <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === "string" ? label : "Activer l’option"}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand" : "bg-line-strong",
          disabled && "opacity-40",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export const fieldClass =
  "h-11 w-full rounded-2xl border border-line bg-surface-muted px-3.5 text-[12.5px] text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15";

export const labelClass = "block text-[11px] font-semibold text-ink-soft";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <p className="mt-1 text-[10px] leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export function Photo({
  src,
  alt,
  className,
  imgClassName,
  children,
  eager,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: ReactNode;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className={cn("relative overflow-hidden bg-tone-clay", className)}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className={cn("size-full object-cover", imgClassName)}
        />
      ) : (
        <div className="bogolan flex size-full min-h-32 flex-col items-center justify-center gap-2 text-tone-clay-ink">
          <ImageIcon className="size-7 opacity-50" />
          <span className="px-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
            {alt || "N’Teriface"}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

const artClass = {
  sahel: "sahel-art",
  indigo: "indigo-art",
  green: "bg-[linear-gradient(150deg,#0b7a45,#075c35)]",
  clay: "bogolan",
} as const;

export function ArtCover({
  art = "sahel",
  className,
  children,
  overlay = true,
  label,
}: {
  art?: keyof typeof artClass | "river";
  className?: string;
  children?: ReactNode;
  overlay?: boolean;
  label?: string;
}) {
  const resolved =
    art === "river"
      ? "bg-[linear-gradient(150deg,#173d55,#0d2333)]"
      : artClass[art];

  return (
    <div className={cn("relative overflow-hidden", resolved, className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.6) 0 1px, transparent 1px 18px), repeating-linear-gradient(-45deg, rgba(255,255,255,.35) 0 1px, transparent 1px 28px)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-16 size-52 rounded-full border border-white/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-4 -top-6 size-28 rounded-full border border-white/15"
        aria-hidden="true"
      />
      {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/5" />}
      {label && (
        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-[20px] border border-line bg-surface-muted text-muted">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">{title}</h3>
      <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function InlineNotice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "danger" | "success";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-[11px] leading-relaxed",
        tone === "danger" && "border-danger/25 bg-danger-soft text-danger",
        tone === "info" && "border-line bg-surface-muted text-ink-soft",
        tone === "success" && "border-brand/20 bg-brand-soft text-brand-ink",
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl", className)} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Data display                                                        */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  tone = "green",
  sparkline,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: AvatarTone;
  sparkline?: number[];
}) {
  const negative = delta?.startsWith("−") || delta?.startsWith("-");
  return (
    <Card className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-2 font-display text-[23px] font-semibold leading-none tracking-[-0.04em] text-ink">
            {value}
          </p>
        </div>
        {icon && (
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", toneClass[tone])}>{icon}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {delta && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                negative ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand-ink",
              )}
            >
              {delta}
            </span>
          )}
          {hint && <span className="text-[9.5px] text-muted">{hint}</span>}
        </div>
        {sparkline && <Sparkline data={sparkline} className="h-8 w-20" />}
      </div>
    </Card>
  );
}

export function Sparkline({
  data,
  className,
  tone = "green",
}: {
  data: number[];
  className?: string;
  tone?: "green" | "red" | "yellow";
}) {
  const id = useId().replace(/:/g, "");
  const width = 100;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const colors = {
    green: ["#0b7a45", "#58c98b"],
    red: ["#ce1126", "#f08a95"],
    yellow: ["#c79000", "#fcd116"],
  }[tone];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[1]} stopOpacity="0.35" />
          <stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#spark-${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={colors[0]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  className,
  label,
  valueLabel,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "yellow" | "red" | "river" | "indigo";
  className?: string;
  label?: string;
  valueLabel?: string;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const bar = {
    brand: "bg-brand",
    yellow: "bg-[color:var(--color-mali-yellow)]",
    red: "bg-[color:var(--color-mali-red)]",
    river: "bg-tone-river-ink",
    indigo: "bg-tone-indigo-ink",
  }[tone];

  return (
    <div className={className}>
      {(label || valueLabel) && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          {label && <span className="text-[10.5px] font-medium text-ink-soft">{label}</span>}
          {valueLabel && <span className="text-[10px] font-semibold text-muted">{valueLabel}</span>}
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div className={cn("h-full rounded-full transition-[width] duration-500", bar)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid min-w-4 place-items-center rounded-full bg-[color:var(--color-mali-red)] px-1 py-0.5 text-[8.5px] font-bold leading-none text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-soft px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-gold)]",
        className,
      )}
    >
      Démo
    </span>
  );
}

export function PhotoCount({ count, className, style }: { count: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={cn(
        "absolute inset-0 grid place-items-center bg-black/45 text-[22px] font-semibold text-white backdrop-blur-[1px]",
        className,
      )}
      style={style}
    >
      +{formatCount(count)}
    </span>
  );
}
