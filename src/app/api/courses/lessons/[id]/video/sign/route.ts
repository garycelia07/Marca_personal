import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

/** GET /api/courses/lessons/{id}/video/sign — devuelve la firma de subida directa a Cloudinary (admin). */
export async function GET(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/courses/lessons/${encodeURIComponent(id)}/video/sign`, { method: "GET" });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload
                ? String((payload as { message: string }).message)
                : "No se pudo preparar la subida.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar." }, { status: 503 });
    }
}
