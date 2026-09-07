import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

/** DELETE /api/enrollments/{id} — elimina una matrícula (admin). */
export async function DELETE(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/enrollments/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible eliminar la inscripción.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}