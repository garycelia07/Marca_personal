import { backendGetJson, backendApiBase } from "@/lib/api/backend";


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
    return backendGetJson<ContentBlock[]>("/content").catch(() => []);
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
export function servicesData(block?: ContentBlock): ServicesData {
    const d = as<ServicesData>(block?.data);
    return { title: d.title, items: Array.isArray(d.items) ? (d.items as ItemData[]) : [] };
}
export function socialLinksData(block?: ContentBlock): SocialLinksData {
    return as<SocialLinksData>(block?.data);
}

/* Permite seleccionar sobre el contenido ya descargado sin token. */
export function pickSection(blocks: ContentBlock[], section: ContentSection): ContentBlock | undefined {
    return blocks.find((b) => b.section === section);
}

/**
 * POST seguro para públicos / leads. No requiere token.
 */
export async function postLead(input: LeadInput): Promise<{ id: string } | null> {
    try {
        const res = await fetch(`${backendApiBase()}/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            cache: "no-store",
        });
        if (!res.ok) return null;
        return (await res.json()) as { id: string };
    } catch {
        return null;
    }
}
