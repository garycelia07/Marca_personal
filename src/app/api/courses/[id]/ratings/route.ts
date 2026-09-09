import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

/** GET /api/courses/{id}/ratings — lista pública de calificaciones + promedio. */
export async function GET(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const upstream = await backendFetch(`/ratings/course/${encodeURIComponent(id)}`);
        const payload = await upstream.json().catch(() => null);
        return NextResponse.json(payload ?? { ratings: [], average: 0, total: 0 }, { status: upstream.ok ? 200 : upstream.status });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** POST /api/courses/{id}/ratings — guarda/añade la calificación del estudiante autenticado. */
export async function POST(request: Request, { params }: Context) {
    const { id } = await params;
    let body: { stars?: unknown; comment?: unknown };
    try {
        body = (await request.json()) as { stars?: unknown; comment?: unknown };
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    const stars = typeof body.stars === "number" && Number.isInteger(body.stars) ? body.stars : NaN;
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
        return NextResponse.json({ message: "La calificación debe ser entre 1 y 5 estrellas." }, { status: 400 });
    }
    const comment = typeof body.comment === "string" && body.comment.trim() ? body.comment.trim().slice(0, 1000) : undefined;

    try {
        const upstream = await backendFetch(`/ratings/${encodeURIComponent(id)}`, {
            method: "POST",
            body: comment !== undefined ? { stars, comment } : { stars },
        });
        const payload = await upstream.json().catch(() => null);
        if (!upstream.ok) {
            return NextResponse.json({ message: payload?.message ?? "No fue posible guardar." }, { status: upstream.status });
        }
        return NextResponse.json(payload ?? { ok: true }, { status: upstream.status === 204 ? 200 : upstream.status });
    } catch {
        return NextResponse.json({ message: "No se pudo conectar con el servidor." }, { status: 503 });
    }
}