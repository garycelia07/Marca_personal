import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
    const { id } = await params;
    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ message: "Falta el archivo de video." }, { status: 400 });
    }
    try {
        const upload = new FormData();
        upload.append("file", file, file.name);
        const response = await backendFetch(`/courses/lessons/${encodeURIComponent(id)}/video`, { method: "PUT", body: upload });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload
                ? String((payload as { message: string }).message)
                : "No se pudo subir el video.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar." }, { status: 503 });
    }
}

export async function DELETE(_request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/courses/lessons/${encodeURIComponent(id)}/video`, { method: "DELETE" });
        if (!response.ok) {
            return NextResponse.json({ message: "No se pudo eliminar el video." }, { status: response.status });
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar." }, { status: 503 });
    }
}
