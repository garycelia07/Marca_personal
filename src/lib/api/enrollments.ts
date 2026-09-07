export type Enrollment = {
    id: string;
    userId?: string;
    courseId?: string;
    expiresAt?: string | null;
    user?: {
        fullName?: string;
        email?: string;
    };
    course?: {
        title?: string;
        slug?: string;
    };
    createdAt?: string;
};

export type EnrollmentPagination = {
    items: Enrollment[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type EnrollStudentInput = {
    userId: string;
    courseId: string;
    expiresAt?: string;
};

export type EnrollmentListParams = {
    page?: number;
    limit?: number;
};

export type ApiError = {
    status: number;
    message: string;
};

const DEFAULT_LIMIT = 20;

function buildQuery(params: EnrollmentListParams): string {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    return search.toString();
}

function normalizeList(payload: unknown, page: number, limit: number): EnrollmentPagination {
    const hasDataMeta = payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data);
    const items = hasDataMeta
        ? (payload as { data: unknown[] }).data
        : Array.isArray(payload)
            ? payload
            : (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
                ? (payload as { items: unknown[] }).items
                : []);
    const meta = (payload && typeof payload === "object" ? (payload as { meta?: { total?: unknown; page?: unknown; limit?: unknown; totalPages?: unknown } }).meta : undefined) ?? {};
    const total = hasDataMeta && typeof meta.total === "number"
        ? meta.total
        : (payload && typeof payload === "object" && typeof (payload as { total?: unknown }).total === "number"
            ? (payload as { total: number }).total
            : items.length);
    const effectiveLimit = limit > 0 ? limit : (typeof meta.limit === "number" ? meta.limit : 20);
    const totalPages = hasDataMeta && typeof meta.totalPages === "number"
        ? meta.totalPages
        : (effectiveLimit > 0 ? Math.max(1, Math.ceil(total / effectiveLimit)) : 1);
    return { items: items as Enrollment[], page, limit: effectiveLimit, total, totalPages };
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

function jsonInit(method: "POST" | "PATCH" | "DELETE", body?: unknown): RequestInit {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    };
}

/** Matricula un estudiante en un curso (proxy → POST /api/enrollments). */
export async function enrollStudent(input: EnrollStudentInput): Promise<Enrollment> {
    return (await requestJson("/api/enrollments", jsonInit("POST", input))) as Enrollment;
}

/** Cursos asignados al estudiante autenticado (proxy → GET /api/enrollments/me). */
export async function listMyEnrollments(params: EnrollmentListParams = {}): Promise<EnrollmentPagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/enrollments/me?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** Estudiantes inscritos en un curso (proxy → GET /api/enrollments/course/{courseId}). */
export async function listCourseEnrollments(courseId: string, params: EnrollmentListParams = {}): Promise<EnrollmentPagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/enrollments/course/${encodeURIComponent(courseId)}?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** Actualiza la vigencia de una inscripción (proxy → PATCH /api/enrollments/{id}/expiration). */
export async function updateEnrollmentExpiration(id: string, expiresAt: string): Promise<Enrollment> {
    return (await requestJson(`/api/enrollments/${encodeURIComponent(id)}/expiration`, jsonInit("PATCH", { expiresAt }))) as Enrollment;
}

/** Elimina una inscripción (proxy → DELETE /api/enrollments/{id}). */
export async function deleteEnrollment(id: string): Promise<unknown> {
    return requestJson(`/api/enrollments/${encodeURIComponent(id)}`, jsonInit("DELETE"));
}