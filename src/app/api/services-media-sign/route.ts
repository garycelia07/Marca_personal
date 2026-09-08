import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

/** GET /api/services-media-sign?name={slug} — firma Cloudinary de la portada de un servicio (admin). */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") ?? "";
    if (!name) return NextResponse.json({ ok: false, message: "name es obligatorio." }, { status: 400 });

    try {
        const response = await backendFetch(`/content/services/${encodeURIComponent(name)}/media-sign`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            return NextResponse.json(payload ?? { ok: false, message: "No fue posible obtener la firma." }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: false });
    } catch {
        return NextResponse.json({ ok: false, message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}
