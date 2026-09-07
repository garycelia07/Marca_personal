import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { CreateLessonInput } from "@/lib/api/courses";

type Context = { params: Promise<{ moduleId: string }> };

/** POST /api/courses/modules/{moduleId}/lessons — agrega una lección a un módulo (admin). */
export async function POST(request: Request, { params }: Context) {
    const { moduleId } = await params;
    let body: CreateLessonInput;
    try {
        body = (await request.json()) as CreateLessonInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.title?.trim() || typeof body.order !== "number") {
        return NextResponse.json({ message: "Título y orden son obligatorios." }, { status: 400 });
    }

    try {
        const response = await backendFetch(`/courses/modules/${encodeURIComponent(moduleId)}/lessons`, {
            method: "POST",
            body: {
                title: body.title.trim(),
                description: body.description?.trim() || undefined,
                videoUrl: body.videoUrl?.trim() || undefined,
                order: body.order,
            },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible agregar la lección.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}