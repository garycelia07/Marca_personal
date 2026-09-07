import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { CreateModuleInput } from "@/lib/api/courses";

type Context = { params: Promise<{ id: string }> };

/** POST /api/courses/{id}/modules — agrega un módulo a un curso (admin). */
export async function POST(request: Request, { params }: Context) {
    const { id } = await params;
    let body: CreateModuleInput;
    try {
        body = (await request.json()) as CreateModuleInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.title?.trim() || typeof body.order !== "number") {
        return NextResponse.json({ message: "Título y orden son obligatorios." }, { status: 400 });
    }

    try {
        const response = await backendFetch(`/courses/${encodeURIComponent(id)}/modules`, {
            method: "POST",
            body: { title: body.title.trim(), order: body.order },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible agregar el módulo.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}