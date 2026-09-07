export type Student = {
    id: string;
    email: string;
    fullName: string;
    role?: "STUDENT" | "ADMIN";
    isActive?: boolean;
    accessExpiresAt: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type StudentPagination = {
    items: Student[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type CreateStudentInput = {
    email: string;
    fullName: string;
    password?: string;
    accessExpiresAt?: string;
};

export type UpdateStudentInput = {
    email?: string;
    fullName?: string;
    accessExpiresAt?: string;
    isActive?: boolean;
};

export type UpdateAccessExpirationInput = {
    accessExpiresAt: string;
};

export type ApiError = {
    status: number;
    message: string;
};

export type StudentListParams = {
    page?: number;
    limit?: number;
};

const DEFAULT_LIMIT = 20;

function buildQuery(params: StudentListParams): string {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    return search.toString();
}

function normalizeList(payload: unknown, page: number, limit: number): StudentPagination {
    const items = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
        ? (payload as { items: unknown[] }).items
        : []);
    const total = payload && typeof payload === "object" && typeof (payload as { total?: unknown }).total === "number"
        ? (payload as { total: number }).total
        : (Array.isArray(payload) ? payload.length : 0);
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    return { items: items as Student[], page, limit, total, totalPages };
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

/** Lista estudiantes paginada (proxy → GET /api/students). */
export async function listStudents(params: StudentListParams = {}): Promise<StudentPagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/students?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** Crea un estudiante (proxy → POST /api/students). */
export async function createStudent(input: CreateStudentInput): Promise<Student> {
    return (await requestJson("/api/students", jsonInit("POST", input))) as Student;
}

/** Obtiene un estudiante por id (proxy → GET /api/students/{id}). */
export async function getStudent(id: string): Promise<Student> {
    return (await requestJson(`/api/students/${encodeURIComponent(id)}`, { method: "GET" })) as Student;
}

/** Actualiza un estudiante (proxy → PATCH /api/students/{id}). */
export async function updateStudent(id: string, input: UpdateStudentInput): Promise<Student> {
    return (await requestJson(`/api/students/${encodeURIComponent(id)}`, jsonInit("PATCH", input))) as Student;
}

/** Ajusta la vigencia de acceso (proxy → PATCH /api/students/{id}/access-expiration). */
export async function updateAccessExpiration(id: string, input: UpdateAccessExpirationInput): Promise<Student> {
    return (await requestJson(`/api/students/${encodeURIComponent(id)}/access-expiration`, jsonInit("PATCH", input))) as Student;
}

/** Elimina un estudiante (proxy → DELETE /api/students/{id}). */
export async function deleteStudent(id: string): Promise<unknown> {
    return requestJson(`/api/students/${encodeURIComponent(id)}`, jsonInit("DELETE"));
}