export type LeadChannel = "CONTACT_FORM" | "WHATSAPP";

export type Lead = {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    channel?: string;
    createdAt?: string;
};

export type LeadPagination = {
    items: Lead[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type CreateLeadInput = {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    channel?: LeadChannel;
};

export type LeadListParams = {
    page?: number;
    limit?: number;
};

export type ApiError = {
    status: number;
    message: string;
};

const DEFAULT_LIMIT = 20;

function buildQuery(params: LeadListParams): string {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    return search.toString();
}

function normalizeList(payload: unknown, page: number, limit: number): LeadPagination {
    const items = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
        ? (payload as { items: unknown[] }).items
        : []);
    const total = payload && typeof payload === "object" && typeof (payload as { total?: unknown }).total === "number"
        ? (payload as { total: number }).total
        : (Array.isArray(payload) ? payload.length : 0);
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    return { items: items as Lead[], page, limit, total, totalPages };
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

/** Registra un contacto del landing (proxy → POST /api/leads, público). */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
    return (await requestJson("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    })) as Lead;
}

/** Lista los contactos recibidos (proxy → GET /api/leads, admin). */
export async function listLeads(params: LeadListParams = {}): Promise<LeadPagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/leads?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}