import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/enrollments/{id}/expiration — actualiza la vigencia de una inscripción (admin). */
export async function PATCH(request: Request, { params }: Context) {
    const { id } = await params;
    let body: { expiresAt?: string };
    try {
        body = (await request.json()) as { expiresAt?: string };
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.expiresAt || Number.isNaN(Date.parse(body.expiresAt))) {
        return NextResponse.json({ message: "La fecha de expiración es obligatoria y debe ser válida." }, { status: 400 });
    }

    try {
        const response = await backendFetch(`/enrollments/${encodeURIComponent(id)}/expiration`, {
            method: "PATCH",
            body: { expiresAt: new Date(body.expiresAt).toISOString() },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible actualizar la vigencia.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}