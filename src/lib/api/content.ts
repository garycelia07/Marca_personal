export const CONTENT_SECTIONS = ["HERO", "ABOUT", "STORY", "PROJECTS", "SERVICES", "SOCIAL_LINKS"] as const;

export type ContentSection = (typeof CONTENT_SECTIONS)[number];

export type ContentEntry = {
    section: ContentSection;
    data: Record<string, string>;
    updatedAt?: string;
};

export type ApiError = {
    status: number;
    message: string;
};

export function isContentSection(value: string): value is ContentSection {
    return (CONTENT_SECTIONS as readonly string[]).includes(value);
}

async function toApiError(response: Response): Promise<ApiError> {
    let message = "Ocurrió un error inesperado.";
    try {
        const body = (await response.json()) as { message?: string };
        if (body?.message) message = body.message;
    } catch {
        // mantener el mensaje genérico
    }
    return { status: response.status, message };
}

async function requestJson(input: string, init: RequestInit): Promise<unknown> {
    const response = await fetch(input, init);
    if (!response.ok) {
        throw await toApiError(response);
    }
    if (response.status === 204) return null;
    return response.json().catch(() => null);
}

/** Obtiene todo el contenido del landing (proxy → GET /api/content). */
export async function getContent(): Promise<ContentEntry[]> {
    const payload = await requestJson("/api/content", { method: "GET" });
    if (Array.isArray(payload)) {
        return payload as ContentEntry[];
    }
    if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)) {
        return (payload as { items: ContentEntry[] }).items;
    }
    return [];
}

/** Obtiene el contenido de una sección puntual (proxy → GET /api/content/{section}). */
export async function getContentSection(section: ContentSection): Promise<Record<string, string>> {
    const payload = await requestJson(`/api/content/${section}`, { method: "GET" }) as
        | { data?: Record<string, string>; section?: string }
        | Record<string, string>
        | null;
    if (payload && typeof payload === "object" && "data" in payload && payload.data && typeof payload.data === "object") {
        return payload.data as Record<string, string>;
    }
    if (payload && typeof payload === "object") {
        return payload as Record<string, string>;
    }
    return {};
}

/** Crea o reemplaza el contenido de una sección (proxy → PUT /api/content/{section}). */
export async function saveContentSection(section: ContentSection, data: Record<string, string>): Promise<ContentEntry> {
    return (await requestJson(`/api/content/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
    })) as ContentEntry;
}

/** GET data JSON (no tipado) de una sección; útil para estructuras anidadas (PROJECTS con items). */
export async function getContentJson(section: ContentSection): Promise<Record<string, unknown>> {
    const payload = await requestJson(`/api/content/${section}`, { method: "GET" }) as
        | { data?: Record<string, unknown> }
        | Record<string, unknown>
        | null;
    if (payload && typeof payload === "object" && "data" in payload && payload.data && typeof payload.data === "object") {
        return payload.data as Record<string, unknown>;
    }
    return (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
}

/** PUT JSON anidado (data) de una sección (proxy → PUT /api/content/{section}). */
export async function saveContentJson(section: ContentSection, data: Record<string, unknown>): Promise<unknown> {
    return requestJson(`/api/content/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
    });
}