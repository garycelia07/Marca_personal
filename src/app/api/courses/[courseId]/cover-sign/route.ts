import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ courseId: string }> };

/** GET /api/courses/{courseId}/cover-sign — firma de subida directa a Cloudinary de la portada de un curso (admin). */
export async function GET(_request: Request, { params }: Context) {
    const { courseId } = await params;
    try {
        const response = await backendFetch(`/courses/${encodeURIComponent(courseId)}/cover-sign`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String((payload as { message: string }).message)
                : "No fue posible obtener la firma.";
            return NextResponse.json({ ok: false, message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: false });
    } catch {
        return NextResponse.json({ ok: false, message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}
