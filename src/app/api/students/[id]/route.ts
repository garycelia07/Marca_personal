import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { UpdateStudentInput } from "@/lib/api/students";

type Context = { params: Promise<{ id: string }> };

function validateUpdate(body: UpdateStudentInput): string | null {
    if (body.email !== undefined && !body.email.trim()) return "El correo no puede estar vacío.";
    if (body.fullName !== undefined && !body.fullName.trim()) return "El nombre completo no puede estar vacío.";
    if (body.email !== undefined && body.email.trim() && !body.email.includes("@")) return "El correo no parece válido.";
    return null;
}

/** GET /api/students/{id} — detalle de un estudiante. */
export async function GET(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/students/${encodeURIComponent(id)}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener el estudiante.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** PATCH /api/students/{id} — actualiza un estudiante. */
export async function PATCH(request: Request, { params }: Context) {
    const { id } = await params;
    let body: UpdateStudentInput;
    try {
        body = (await request.json()) as UpdateStudentInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    const validationError = validateUpdate(body);
    if (validationError) {
        return NextResponse.json({ message: validationError }, { status: 400 });
    }

    try {
        const response = await backendFetch(`/students/${encodeURIComponent(id)}`, { method: "PATCH", body });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible actualizar el estudiante.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** DELETE /api/students/{id} — elimina un estudiante. */
export async function DELETE(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/students/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible eliminar el estudiante.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}