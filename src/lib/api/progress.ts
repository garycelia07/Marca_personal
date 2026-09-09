/** Backend persistido de lecciones vistas (cross-device, ver roomies/lesson_progress). */

const BASE = "/api/progress";

async function send(method: "GET" | "PUT" | "DELETE", path: string): Promise<unknown> {
    const res = await fetch(`${BASE}${path}`, { method, cache: "no-store" });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
        throw Object.assign(new Error((payload && payload.message) || "Error de progreso."), { status: res.status });
    }
    return payload;
}

/** Lista de lessonIds vistas del usuario autenticado (persistido). */
export async function getMyProgress(): Promise<string[]> {
    const payload = await send("GET", "/");
    if (Array.isArray(payload)) return payload as string[];
    return [];
}

/** Marca una lección como vista (solo al terminar el video). */
export async function markLessonDone(lessonId: string): Promise<void> {
    await send("PUT", `/${encodeURIComponent(lessonId)}`);
}
