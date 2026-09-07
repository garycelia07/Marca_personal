import { backendFetch } from "@/lib/api/backend";



export type ContentSection =
    | "HERO"
    | "ABOUT"
    | "STORY"
    | "PROJECTS"
    | "SERVICES"
    | "SOCIAL_LINKS";

export type ContentBlock = {
    id: string;
    section: ContentSection;
    data: unknown;
    updatedAt: string;
};

export type HeroData = {
    title?: string;
    subtitle?: string;
    photoUrl?: string;
    socialLinks?: Record<string, string>;
};

export type AboutData = { title?: string; vision?: string; mission?: string };

export type StoryData = { title?: string; body?: string };
export type ItemData = { name?: string; description?: string };

export type ProjectsData = { title?: string; items?: ItemData[] };
export type ServicesData = { title?: string; items?: ItemData[] };
export type SocialLinksData = Record<string, string>;

export type LeadInput = {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    channel?: "WHATSAPP" | "CONTACT_FORM";
};

function as<T>(value: unknown): T {
    return (value ?? {}) as T;
}

export async function fetchAllContent(): Promise<ContentBlock[]> {
    try {
        const res = await backendFetch("/content");
        if (!res.ok) return [];

        const payload = await res.json();
        // El backend puede devolver el listado en `.data` o directamente en la raíz.
        const list = Array.isArray(payload)
            ? payload
            : (payload as { data?: unknown })?.data;
        if (list === undefined || list === null) return [];
        return Array.isArray(list) ? (list as ContentBlock[]) : [];
    } catch {
        return [];
    }
}

export function heroData(block?: ContentBlock): HeroData {
    return as<HeroData>(block?.data);
}
export function aboutData(block?: ContentBlock): AboutData {
    return as<AboutData>(block?.data);
}
export function storyData(block?: ContentBlock): StoryData {
    return as<StoryData>(block?.data);
}
export function projectsData(block?: ContentBlock): ProjectsData {
    const d = as<ProjectsData>(block?.data);
    return { title: d.title, items: Array.isArray(d.items) ? (d.items as ItemData[]) : [] };
}

export type ProjectItemExt = {
    name?: string;
    slug?: string;
    tagline?: string;
    description?: string;
    link?: string;
    /** URL de imagen elegida de la tarjeta (pegando un enlace) o la que devuelve Servir media. */
    coverUrl?: string;
    /** URL de video por enlace (opcional, se usa si no hay archivo subido). */
    videoUrl?: string;
    /** URL pública del archivo de video subido (media backend), si aplica. */
    videoFileUrl?: string;
};

/** Extrae los ítems crudos de PROJECTS sin perder campos extra (slug, tagline, link). */
export function projectItems(block?: ContentBlock): ProjectItemExt[] {
    const d = as<{ items?: unknown }>(block?.data);
    if (!Array.isArray(d.items)) return [];
    return d.items as ProjectItemExt[];
}
export function projectTitle(block?: ContentBlock): string {
    return as<{ title?: string }>(block?.data).title ?? "Proyectos.";
}

/** Items de la sección SERVICES con campos editables (name, tagline, description). */
export function serviceItems(block?: ContentBlock): Omit<ProjectItemExt, "link">[] {
    const d = as<{ items?: unknown }>(block?.data);
    if (!Array.isArray(d.items)) return [];
    return d.items as Omit<ProjectItemExt, "link">[];
}
export function serviceTitle(block?: ContentBlock): string {
    return as<{ title?: string }>(block?.data).title ?? "Servicios y formación.";
}
export function servicesData(block?: ContentBlock): ServicesData {
    const d = as<ServicesData>(block?.data);
    return { title: d.title, items: Array.isArray(d.items) ? (d.items as ItemData[]) : [] };
}
export function socialLinksData(block?: ContentBlock): SocialLinksData {
    return as<SocialLinksData>(block?.data);
}

/* Permite seleccionar sobre el contenido ya descargado sin token. */
export function pickSection(blocks: ContentBlock[], section: ContentSection): ContentBlock | undefined {
    return Array.isArray(blocks) ? blocks.find((b) => b.section === section) : undefined;
}

/**
 * POST seguro para públicos / leads. No requiere token.
 */
export async function postLead(input: LeadInput): Promise<{ id: string } | null> {
    try {
        const res = await backendFetch("/leads", {
            method: "POST",
            body: input,
        });
        if (!res.ok) return null;
        return (await res.json()) as { id: string };
    } catch {
        return null;
    }
}
