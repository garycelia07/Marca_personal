export type Lesson = {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    order: number;
    moduleId?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type Module = {
    id: string;
    title: string;
    order: number;
    courseId?: string;
    lessons?: Lesson[];
    createdAt?: string;
    updatedAt?: string;
};

export type Course = {
    id: string;
    title: string;
    slug: string;
    description?: string;
    coverImageUrl?: string;
    isPublished?: boolean;
    isActive?: boolean;
    modules?: Module[];
    createdAt?: string;
    updatedAt?: string;
};

export type CoursePagination = {
    items: Course[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type CreateCourseInput = {
    title: string;
    slug: string;
    description?: string;
    coverImageUrl?: string;
    isPublished?: boolean;
};

export type UpdateCourseInput = {
    title?: string;
    slug?: string;
    description?: string;
    coverImageUrl?: string;
    isActive?: boolean;
    isPublished?: boolean;
};

export type CreateModuleInput = {
    title: string;
    order: number;
};

export type CreateLessonInput = {
    title: string;
    description?: string;
    videoUrl?: string;
    order: number;
};

export type ApiError = {
    status: number;
    message: string;
};

export type CourseListParams = {
    page?: number;
    limit?: number;
};

const DEFAULT_LIMIT = 20;

function buildQuery(params: CourseListParams): string {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(params.limit ?? DEFAULT_LIMIT));
    return search.toString();
}

function normalizeList(payload: unknown, page: number, limit: number): CoursePagination {
    const items = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
        ? (payload as { items: unknown[] }).items
        : []);
    const total = payload && typeof payload === "object" && typeof (payload as { total?: unknown }).total === "number"
        ? (payload as { total: number }).total
        : (Array.isArray(payload) ? payload.length : 0);
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    return { items: items as Course[], page, limit, total, totalPages };
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

/** Lista cursos publicados (proxy → GET /api/courses). */
export async function listPublishedCourses(params: CourseListParams = {}): Promise<CoursePagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/courses?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** Lista todos los cursos, publicados o borradores (proxy → GET /api/courses/admin). */
export async function listAdminCourses(params: CourseListParams = {}): Promise<CoursePagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/courses/admin?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

/** Obtiene el detalle completo de un curso con módulos y lecciones (proxy → GET /api/courses/{id}). */
export async function getCourse(id: string): Promise<Course> {
    return (await requestJson(`/api/courses/${encodeURIComponent(id)}`, { method: "GET" })) as Course;
}

/** Crea un curso (proxy → POST /api/courses). */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
    return (await requestJson("/api/courses", jsonInit("POST", input))) as Course;
}

/** Actualiza un curso (proxy → PATCH /api/courses/{id}). */
export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    return (await requestJson(`/api/courses/${encodeURIComponent(id)}`, jsonInit("PATCH", input))) as Course;
}

/** Elimina un curso (proxy → DELETE /api/courses/{id}). */
export async function deleteCourse(id: string): Promise<unknown> {
    return requestJson(`/api/courses/${encodeURIComponent(id)}`, jsonInit("DELETE"));
}

/** Agrega un módulo a un curso (proxy → POST /api/courses/{id}/modules). */
export async function addModule(courseId: string, input: CreateModuleInput): Promise<Module> {
    return (await requestJson(`/api/courses/${encodeURIComponent(courseId)}/modules`, jsonInit("POST", input))) as Module;
}

/** Agrega una lección a un módulo (proxy → POST /api/courses/modules/{moduleId}/lessons). */
export async function addLesson(moduleId: string, input: CreateLessonInput): Promise<Lesson> {
    return (await requestJson(`/api/courses/modules/${encodeURIComponent(moduleId)}/lessons`, jsonInit("POST", input))) as Lesson;
}