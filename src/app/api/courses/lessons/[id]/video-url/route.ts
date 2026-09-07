import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

/** PUT /api/courses/lessons/{id}/video-url — guarda la URL del video ya subido (admin). */
export async function PUT(request: Request, { params }: Context) {
    const { id } = await params;
    let body: { videoUrl?: string };
    try {
        body = (await request.json()) as { videoUrl?: string };
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }
    if (!body || typeof body.videoUrl !== "string" || !body.videoUrl.trim()) {
        return NextResponse.json({ message: "videoUrl es obligatorio." }, { status: 400 });
    }
    try {
        const response = await backendFetch(`/courses/lessons/${encodeURIComponent(id)}/video-url`, {
            method: "PUT",
            body: { videoUrl: body.videoUrl.trim() },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload
                ? String((payload as { message: string }).message)
                : "No se pudo guardar la URL del video.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar." }, { status: 503 });
    }
}
