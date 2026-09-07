import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { MAX_FILE_SIZE_BYTES, validateMaterialFile } from "@/lib/api/materials";

/**
 * Construye el FormData que se reenvía al backend, validando título y archivo.
 * Devuelve null si la petición es inválida (en cuyo caso ya se respondió 400).
 */
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

/** POST /api/materials — sube un material (admin, multipart/form-data). */
export async function POST(request: Request) {
    const { formData, error } = await extractFormData(request);
    if (error) {
        return error;
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ message: "El archivo es obligatorio." }, { status: 400 });
    }

    try {
        const response = await backendFetch("/materials", { method: "POST", body: formData });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible subir el material.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true }, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}