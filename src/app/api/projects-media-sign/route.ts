import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

/** GET /api/projects-media-sign?name={slug}&kind={cover|video} — firma Cloudinary para media de proyecto (admin). */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") ?? "";
    const kind = searchParams.get("kind") ?? "";
    if (!name || (kind !== "cover" && kind !== "video")) {
        return NextResponse.json({ ok: false, message: "name y kind(cover|video) son obligatorios." }, { status: 400 });
    }
    try {
        const response = await backendFetch(`/content/projects/${encodeURIComponent(name)}/media-sign?kind=${kind}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            return NextResponse.json(payload ?? { ok: false, message: "No fue posible obtener la firma." }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: false });
    } catch {
        return NextResponse.json({ ok: false, message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}
