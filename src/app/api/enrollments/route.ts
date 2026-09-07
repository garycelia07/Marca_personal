import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { EnrollStudentInput } from "@/lib/api/enrollments";

/** POST /api/enrollments — matricula un estudiante en un curso (admin). */
export async function POST(request: Request) {
    let body: EnrollStudentInput;
    try {
        body = (await request.json()) as EnrollStudentInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.userId?.trim() || !body.courseId?.trim()) {
        return NextResponse.json({ message: "El estudiante y el curso son obligatorios." }, { status: 400 });
    }
    if (body.expiresAt && Number.isNaN(Date.parse(body.expiresAt))) {
        return NextResponse.json({ message: "La fecha de expiración no es válida." }, { status: 400 });
    }

    try {
        const response = await backendFetch("/enrollments", {
            method: "POST",
            body: {
                userId: body.userId.trim(),
                courseId: body.courseId.trim(),
                expiresAt: body.expiresAt ? new Date(body.expiresAt).toISOString() : undefined,
            },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible matricular al estudiante.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true }, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}