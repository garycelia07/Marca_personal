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
    return { items: items as Course[], page, limit: effectiveLimit, total, totalPages };
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

export async function listPublishedCourses(params: CourseListParams = {}): Promise<CoursePagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/courses?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

export async function listAdminCourses(params: CourseListParams = {}): Promise<CoursePagination> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const payload = await requestJson(`/api/courses/admin?${buildQuery({ page, limit })}`, { method: "GET" });
    return normalizeList(payload, page, limit);
}

export async function getCourse(id: string): Promise<Course> {
    return (await requestJson(`/api/courses/${encodeURIComponent(id)}`, { method: "GET" })) as Course;
}
export async function createCourse(input: CreateCourseInput): Promise<Course> {
    return (await requestJson("/api/courses", jsonInit("POST", input))) as Course;
}
export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    return (await requestJson(`/api/courses/${encodeURIComponent(id)}`, jsonInit("PATCH", input))) as Course;
}
export async function deleteCourse(id: string): Promise<unknown> {
    return requestJson(`/api/courses/${encodeURIComponent(id)}`, jsonInit("DELETE"));
}
export async function addModule(courseId: string, input: CreateModuleInput): Promise<Module> {
    return (await requestJson(`/api/courses/${encodeURIComponent(courseId)}/modules`, jsonInit("POST", input))) as Module;
}
export async function addLesson(moduleId: string, input: CreateLessonInput): Promise<Lesson> {
    return (await requestJson(`/api/courses/modules/${encodeURIComponent(moduleId)}/lessons`, jsonInit("POST", input))) as Lesson;
}

export async function uploadLessonVideo(lessonId: string, file: File): Promise<unknown> {
    // 1) Intentar subida directa a Cloudinary (firmada por el backend).
    try {
        const signRes = await fetch(`/api/courses/lessons/${encodeURIComponent(lessonId)}/video/sign`, { method: "GET" });
        if (signRes.ok) {
            const sign = (await signRes.json()) as {
                cloudName?: string; apiKey?: string; signature?: string;
                timestamp?: string; publicId?: string;
                resourceType?: string; overwrite?: string;
            };
            if (sign.cloudName && sign.signature && sign.apiKey) {
                const cloudForm = new FormData();
                cloudForm.append("file", file, file.name);
                cloudForm.append("api_key", sign.apiKey);
                cloudForm.append("timestamp", sign.timestamp ?? "");
                cloudForm.append("signature", sign.signature);
                // public_id COMPLETO (con carpeta) para que la firma coincida; sin folder aparte.
                if (sign.publicId) cloudForm.append("public_id", sign.publicId);
                cloudForm.append("overwrite", sign.overwrite ?? "true");
                const cloudRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`,
                    { method: "POST", body: cloudForm },
                );
                const cloudPayload = (await cloudRes.json().catch(() => null)) as { secure_url?: string; error?: { message?: string } } | null;
                if (!cloudRes.ok || !cloudPayload?.secure_url) {
                    throw Object.assign(new Error(cloudPayload?.error?.message ?? "Cloudinary rechazó el video."), { status: cloudRes.status });
                }
                // Guardar la URL en la lección.
                const saveRes = await fetch(`/api/courses/lessons/${encodeURIComponent(lessonId)}/video-url`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ videoUrl: cloudPayload.secure_url }),
                });
                if (!saveRes.ok) {
                    throw new Error("El video se subió a Cloudinary pero no se pudo guardar en la lección.");
                }
                return { ok: true, storage: "cloudinary", url: cloudPayload.secure_url };
            }
        }
    } catch {
        // Si falla la firma/Cloudinary, caemos al flujo clásico de disco más abajo.
    }

    // 2) Fallback: disco (proxy clásico).
    const form = new FormData();
    form.append("file", file, file.name);
    const response = await fetch(`/api/courses/lessons/${encodeURIComponent(lessonId)}/video`, {
        method: "PUT",
        body: form,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const message = payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message: string }).message)
            : "No se pudo subir.";
        throw Object.assign(new Error(message), { status: response.status });
    }
    return payload;
}

/** Elimina el video archivo de una lección (proxy → DELETE). */
export async function deleteLessonVideo(lessonId: string): Promise<unknown> {
    const response = await fetch(`/api/courses/lessons/${encodeURIComponent(lessonId)}/video`, { method: "DELETE" });
    if (!response.ok) {
        throw new Error("No se pudo eliminar el video.");
    }
    return { ok: true };
}


/**
 * Subida DIRECTA de la imagen de portada de un curso a Cloudinary (CDN).
 * Paso 1: obtiene la firma (paso a proxys del backend admin).
 * Paso 2: sube el archivo a https://api.cloudinary.com/v1_1/<cloud>/image/upload.
 * Devuelve la URL pública (secure_url) para guardar en `course.coverImageUrl`.
 */
export async function uploadCourseCover(courseId: string, file: File): Promise<string> {
    if (!file) throw new Error("Selecciona una imagen.");

    const signRes = await fetch(`/api/courses/${encodeURIComponent(courseId)}/cover-sign`, { method: "GET", cache: "no-store" });
    const sign = await signRes.json().catch(() => null) as {
        ok?: boolean;
        reason?: string;
        cloudName?: string;
        apiKey?: string;
        signature?: string;
        timestamp?: string;
        publicId?: string;
        overwrite?: string;
        message?: string;
    } | null;

    if (!sign || sign.ok !== true || !sign.cloudName || !sign.signature || !sign.apiKey) {
        if (sign?.reason === "cloudinary-not-configured") {
            throw new Error("Cloudinary no está configurado: usa el campo 'pegar URL' de la imagen.");
        }
        throw new Error(sign?.message || "No fue posible iniciar la subida de la imagen.");
    }

    const form = new FormData();
    form.append("file", file, file.name);
    form.append("api_key", sign.apiKey!);
    form.append("timestamp", sign.timestamp ?? "");
    form.append("signature", sign.signature!);
    form.append("public_id", sign.publicId ?? "");
    form.append("overwrite", sign.overwrite ?? "true");

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: form });
    const payload = await cloudRes.json().catch(() => null) as { secure_url?: string; error?: { message?: string } } | null;
    if (!cloudRes.ok || !payload?.secure_url) {
        throw new Error(payload?.error?.message ?? "Cloudinary rechazó la imagen.");
    }
    return payload.secure_url;
}
