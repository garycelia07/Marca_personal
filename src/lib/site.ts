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
    whatsapp: read("NEXT_PUBLIC_WHATSAPP", "51964045066"),
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

// Perfiles reales por defecto. Se pueden sobrescribir con
// NEXT_PUBLIC_SOCIAL_FACEBOOK / _TIKTOK / _INSTAGRAM / _YOUTUBE / _LINKEDIN (Vercel o .env.local).
export function socialHref(name: string): string {
    const fallbacks: Record<string, string> = {
        FACEBOOK: "https://www.facebook.com/gary.mayhuapalomino.92",
        TIKTOK: "https://www.tiktok.com/@garymayhua",
        INSTAGRAM: "https://www.instagram.com/",
        YOUTUBE: "https://www.youtube.com/",
        LINKEDIN: "https://www.linkedin.com/",
    };
    const key = name.toUpperCase();
    const fromEnv = socialUrl(name);
    if (fromEnv) return fromEnv;
    return fallbacks[key] ?? "";
}

export function whatsappHref(message?: string): string {
    const num = waNumberToIntl(siteConfig.whatsapp);
    const text = encodeURIComponent(message ?? `Hola, me interesa conocer más sobre ${siteConfig.brand}.`);
    return `https://wa.me/${num}?text=${text}`;
}

/** Origen público del backend (sin cola /api/v1), p.ej. https://api.garymayhua.com */
export function publicBackendOrigin(): string {
    // En productos (build) el navegador NO lee .env del servidor: si no se
    // inlineo NEXT_PUBLIC_BACKEND_URL, usamos el host público real y nunca localhost.
    const fallback =
        typeof process !== "undefined" && process.env?.NODE_ENV === "production"
            ? "https://api.garymayhua.com"
            : "http://localhost:3001";
    const v = read("NEXT_PUBLIC_BACKEND_URL", fallback);
    return v.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
}

/** URL pública (sin token) de la media de un proyecto: portada y video corto. */
export function slugifyName(name: string): string {
    return (name || "").toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function projectCoverUrl(projectName: string): string {
    return `${publicBackendOrigin()}/api/v1/content/projects/${slugifyName(projectName) || "proyecto"}/cover`;
}

export function projectVideoUrl(projectName: string): string {
    return `${publicBackendOrigin()}/api/v1/content/projects/${slugifyName(projectName) || "proyecto"}/video`;
}

export function serviceCoverUrl(serviceName: string): string {
    return `${publicBackendOrigin()}/api/v1/content/services/${slugifyName(serviceName) || "servicio"}/cover`;
}

