import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { UpdateAccessExpirationInput } from "@/lib/api/students";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/students/{id}/access-expiration — ajusta la vigencia de acceso. */
export async function PATCH(request: Request, { params }: Context) {
    const { id } = await params;
    let body: UpdateAccessExpirationInput;
    try {
        body = (await request.json()) as UpdateAccessExpirationInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.accessExpiresAt || !body.accessExpiresAt.trim()) {
        return NextResponse.json({ message: "La fecha de vigencia es obligatoria." }, { status: 400 });
    }
    if (Number.isNaN(Date.parse(body.accessExpiresAt))) {
        return NextResponse.json({ message: "La fecha de vigencia no es válida." }, { status: 400 });
    }

    try {
        const response = await backendFetch(`/students/${encodeURIComponent(id)}/access-expiration`, {
            method: "PATCH",
            body: { accessExpiresAt: new Date(body.accessExpiresAt).toISOString() },
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible ajustar la vigencia.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}