import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ lessonId: string }> };

/** PUT /api/progress/{lessonId} — marca como vista la lección (solo al terminar el video). */
export async function PUT(_request: Request, { params }: Context) {
    const { lessonId } = await params;
    try {
        const upstream = await backendFetch(`/progress/${encodeURIComponent(lessonId)}`, { method: "PUT" });
        const payload = await upstream.json().catch(() => null);
        if (!upstream.ok) {
            return NextResponse.json({ message: payload?.message ?? "No se pudo guardar el progreso." }, { status: upstream.status });
        }
        return NextResponse.json(payload ?? { done: true });
    } catch {
        return NextResponse.json({ message: "No se pudo conectar con el servidor." }, { status: 503 });
    }
}

/** DELETE /api/progress/{lessonId} — desmarca la lección (opcional). */
export async function DELETE(_request: Request, { params }: Context) {
    const { lessonId } = await params;
    try {
        const upstream = await backendFetch(`/progress/${encodeURIComponent(lessonId)}`, { method: "DELETE" });
        const payload = await upstream.json().catch(() => null);
        if (!upstream.ok) {
            return NextResponse.json({ message: payload?.message ?? "No se pudo actualizar el progreso." }, { status: upstream.status });
        }
        return NextResponse.json(payload ?? { done: false });
    } catch {
        return NextResponse.json({ message: "No se pudo conectar con el servidor." }, { status: 503 });
    }
}
