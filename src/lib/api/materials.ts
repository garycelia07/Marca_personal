export type Material = {
    id: string;
    title: string;
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
    fileSize?: number;
    courseId?: string | null;
    lessonId?: string | null;
    isPublic?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type MaterialPagination = {
    items: Material[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type MaterialListParams = {
    page?: number;
    limit?: number;
};

export type ApiError = {
    status: number;
    message: string;
};

export type MaterialUploadInput = {
    title: string;
    file: File;
    courseId?: string;
    lessonId?: string;
    isPublic?: boolean;
};

export type MaterialUpdateInput = {
    title: string;
    file?: File;
    courseId?: string;
    lessonId?: string;
    isPublic?: boolean;
};

/** Tipos MIME permitidos por la spec (PDF, JPG, PNG, WEBP). */
export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

/** Tamaño máximo por archivo: 20 MB. */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function validateMaterialFile(file: File): string | null {
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
        return "Formato no permitido. Usa PDF, JPG, PNG o WEBP.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return "El archivo supera el límite de 20 MB.";
    }
    return null;
}

const DEFAULT_LIMIT = 20;

function buildQuery(params: MaterialListParams): string {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    return search.toString();
}

function normalizeList(payload: unknown, page: number, limit: number): MaterialPagination {
    const items = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
        ? (payload as { items: unknown[] }).items
        : []);
    const total = payload && typeof payload === "object" && typeof (payload as { total?: unknown }).total === "number"
        ? (payload as { total: number }).total
        : (Array.isArray(payload) ? payload.length : 0);
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    return { items: items as Material[], page, limit, total, totalPages };
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

function buildFormData(input: { title: string; file?: File; courseId?: string; lessonId?: string; isPublic?: boolean }): FormData {
    const formData = new FormData();
    formData.set("title", input.title);
    if (input.file) {
        formData.set("file", input.file);
    }
    if (input.courseId) {
        formData.set("courseId", input.courseId);
    }
    if (input.lessonId) {
        formData.set("lessonId", input.lessonId);
    }
    if (input.isPublic !== undefined) {
        formData.set("isPublic", String(input.isPublic));
    }
    return formData;
}

/** Sube un material (proxy → POST /api/materials, multipart). */
export async function uploadMaterial(input: MaterialUploadInput): Promise<Material> {
    return (await requestJson("/api/materials", {
        method: "POST",
        body: buildFormData(input),
    })) as Material;
}

/** Reemplaza archivo o metadata de un material (proxy → PUT /api/materials/{id}, multipart). */
export async function updateMaterial(id: string, input: MaterialUpdateInput): Promise<Material> {
    return (await requestJson(`/api/materials/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: buildFormData(input),
    })) as Material;
}

/** Elimina un material (proxy → DELETE /api/materials/{id}). */
export async function deleteMaterial(id: string): Promise<unknown> {
    return requestJson(`/api/materials/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Lista materiales públicos de la landing (proxy → GET /api/materials/public). */
export async function listPublicMaterials(params: MaterialListParams = {}): Promise<MaterialPagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/materials/public?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** Lista materiales de un curso (proxy → GET /api/materials/course/{courseId}). */
export async function listCourseMaterials(courseId: string, params: MaterialListParams = {}): Promise<MaterialPagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/materials/course/${encodeURIComponent(courseId)}?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** URL del stream binario del archivo (para <a download> o previsualización). */
export function materialFileUrl(id: string): string {
    return `/api/materials/${encodeURIComponent(id)}/file`;
}