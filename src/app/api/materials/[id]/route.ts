import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { MAX_FILE_SIZE_BYTES, validateMaterialFile } from "@/lib/api/materials";

type Context = { params: Promise<{ id: string }> };

async function extractFormData(request: Request): Promise<{ formData: FormData; error?: NextResponse }> {
    let incoming: FormData;
    try {
        incoming = await request.formData();
    } catch {
        return { formData: new FormData(), error: NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }) };
    }

    const title = String(incoming.get("title") ?? "").trim();
    if (!title) {
        return { formData: incoming, error: NextResponse.json({ message: "El título es obligatorio." }, { status: 400 }) };
    }

    const file = incoming.get("file");
    if (file instanceof File && file.size > 0) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return { formData: incoming, error: NextResponse.json({ message: "El archivo supera el límite de 20 MB." }, { status: 400 }) };
        }
        const validationError = validateMaterialFile(file);
        if (validationError) {
            return { formData: incoming, error: NextResponse.json({ message: validationError }, { status: 400 }) };
        }
    }

    return { formData: incoming };
}

/** PUT /api/materials/{id} — reemplaza archivo y/o metadata (admin, multipart). */
export async function PUT(request: Request, { params }: Context) {
    const { id } = await params;
    const { formData, error } = await extractFormData(request);
    if (error) {
        return error;
    }

    try {
        const response = await backendFetch(`/materials/${encodeURIComponent(id)}`, { method: "PUT", body: formData });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible actualizar el material.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** DELETE /api/materials/{id} — elimina registro y archivo físico (admin). */
export async function DELETE(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/materials/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible eliminar el material.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}