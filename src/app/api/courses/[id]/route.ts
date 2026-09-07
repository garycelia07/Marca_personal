import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { UpdateCourseInput } from "@/lib/api/courses";

type Context = { params: Promise<{ id: string }> };

function validateUpdate(body: UpdateCourseInput): string | null {
    if (body.title !== undefined && !body.title.trim()) return "El título no puede estar vacío.";
    if (body.slug !== undefined && !body.slug.trim()) return "El slug no puede estar vacío.";
    return null;
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** GET /api/courses/{id} — detalle completo de un curso. */
export async function GET(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/courses/${encodeURIComponent(id)}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener el curso.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** PATCH /api/courses/{id} — actualiza un curso (admin). */
export async function PATCH(request: Request, { params }: Context) {
    const { id } = await params;
    let body: UpdateCourseInput;
    try {
        body = (await request.json()) as UpdateCourseInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    const validationError = validateUpdate(body);
    if (validationError) {
        return NextResponse.json({ message: validationError }, { status: 400 });
    }

    try {
        const cleanBody: UpdateCourseInput = {};
        if (body.title !== undefined) cleanBody.title = body.title.trim();
        if (body.slug !== undefined) cleanBody.slug = slugify(body.slug.trim());
        if (body.description !== undefined) cleanBody.description = body.description.trim() || undefined;
        if (body.coverImageUrl !== undefined) cleanBody.coverImageUrl = body.coverImageUrl.trim() || undefined;
        if (body.isActive !== undefined) cleanBody.isActive = Boolean(body.isActive);
        if (body.isPublished !== undefined) cleanBody.isPublished = Boolean(body.isPublished);

        const response = await backendFetch(`/courses/${encodeURIComponent(id)}`, { method: "PATCH", body: cleanBody });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible actualizar el curso.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** DELETE /api/courses/{id} — elimina un curso en cascada (admin). */
export async function DELETE(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/courses/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible eliminar el curso.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}