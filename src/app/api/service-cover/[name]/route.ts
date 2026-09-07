import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ name: string }> };

function slugify(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function PUT(request: Request, { params }: Context) {
    const { name } = await params;
    const slug = slugify(name);
    if (!slug) return NextResponse.json({ message: "Nombre de servicio no válido." }, { status: 400 });

    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ message: "Falta el archivo de imagen." }, { status: 400 });
    }

    try {
        const upload = new FormData();
        upload.append("file", file, file.name);
        const response = await backendFetch(`/content/services/${slug}/cover`, { method: "PUT", body: upload });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload ? String((payload as { message: string }).message) : "No se pudo subir la imagen.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar." }, { status: 503 });
    }
}
