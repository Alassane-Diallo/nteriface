export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name
    .replace(/[’']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")} M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".", ",").replace(",0", "")} k`;
  }
  return value.toLocaleString("fr-FR");
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} FCFA`;
}

export function formatFullNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count > 1 ? pluralForm : singular;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

export function searchNormalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
