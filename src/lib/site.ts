export type SiteConfig = {
    brand: string;
    byline: string;
    lang: string;
    title: string;
    description: string;
    contactEmail: string;
    whatsapp?: string;
};

const read = (envKey: string, fallback: string) =>
    typeof process !== "undefined" && process.env[envKey] ? (process.env[envKey] as string) : fallback;

export const siteConfig: SiteConfig = {
    brand: read("NEXT_PUBLIC_BRAND", "Gary Mayhua"),
    byline: read("NEXT_PUBLIC_BYLINE", "Liderazgo · Finanzas · Inversión inmobiliaria"),
    lang: "es",
    title: read("NEXT_PUBLIC_SITE_TITLE", "Gary Mayhua — Marca Personal y Formación"),
    description: read("NEXT_PUBLIC_SITE_DESCRIPTION", "Gary Mayhua — Liderazgo, finanzas e inversión inmobiliaria."),
    contactEmail: read("NEXT_PUBLIC_CONTACT_EMAIL", "tipsinmobiliaria24@gmail.com"),
    whatsapp: read("NEXT_PUBLIC_WHATSAPP", "51987654321"),
};

export function siteUrl(): string {
    const v = read("NEXT_PUBLIC_SITE_URL", "http://localhost:3001");
    return v.replace(/\/+$/, "");
}

export function absoluteImage(path: string): string {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${siteUrl()}${p}`;
}

export function waNumberToIntl(value?: string): string {
    return (value ?? siteConfig.whatsapp ?? "").replace(/\D/g, "");
}

export function socialUrl(name: string): string {
    const v = read(`NEXT_PUBLIC_SOCIAL_${name.toUpperCase()}`, "");
    return v;
}

export function whatsappHref(message?: string): string {
    const num = waNumberToIntl(siteConfig.whatsapp);
    const text = encodeURIComponent(message ?? `Hola, me interesa conocer más sobre ${siteConfig.brand}.`);
    return `https://wa.me/${num}?text=${text}`;
}

