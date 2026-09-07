import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Kind = "video" | "cover";
type Context = { params: Promise<{ kind: string; name: string }> };

function slugify(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function PUT(request: Request, { params }: Context) {
    const { kind, name } = await params;
    if (kind !== "video" && kind !== "cover") {
        return NextResponse.json({ message: "Tipo no válido (video|cover)." }, { status: 400 });
    }
    const slug = slugify(name);
    if (!slug) {
        return NextResponse.json({ message: "Nombre de proyecto no válido." }, { status: 400 });
    }

    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    // El campo del archivo es "file" para cover y "video" para video (y "file" también por compat.).
    const file = form.get(kind === "video" ? "video" : "file") ?? form.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ message: "Falta el archivo." }, { status: 400 });
    }

    try {
        const upload = new FormData();
        upload.append(kind === "video" ? "video" : "file", file, file.name);
        const response = await backendFetch(`/content/projects/${slug}/${kind}`, {
            method: "PUT",
            body: upload,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible subir el archivo.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar." }, { status: 503 });
    }
}

export const config = {}; // (placeholder no usado)
