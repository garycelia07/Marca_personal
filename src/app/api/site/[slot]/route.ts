import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const VALID_SLOTS = ["hero", "proyectos", "servicios"] as const;
type Slot = (typeof VALID_SLOTS)[number];

type Context = { params: Promise<{ slot: string }> };

export async function GET(_request: Request, { params }: Context) {
    const { slot } = await params;
    if (!(VALID_SLOTS as readonly string[]).includes(slot)) {
        return NextResponse.json({ message: "Slot no válido." }, { status: 400 });
    }

    try {
        const upstream = await backendFetch(`/content/site/${slot}/file`);
        if (!upstream.ok) {
            return new NextResponse(null, { status: 404 });
        }
        const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
        const body = await upstream.arrayBuffer();
        return new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch {
        return new NextResponse(null, { status: 502 });
    }
}

export async function PUT(request: Request, { params }: Context) {
    const { slot } = await params;
    if (!(VALID_SLOTS as readonly string[]).includes(slot)) {
        return NextResponse.json({ message: "Slot no válido." }, { status: 400 });
    }

    try {
        const body = await request.formData();
        const file = body.get("file");
        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ message: "Falta el archivo de imagen." }, { status: 400 });
        }
        const form = new FormData();
        form.append("file", file, file.name);
        const upstream = await backendFetch(`/content/site/${slot}`, {
            method: "PUT",
            body: form,
        });
        if (!upstream.ok) {
            const payload = await upstream.json().catch(() => null);
            return NextResponse.json(
                { message: payload?.message ?? "No fue posible subir la imagen." },
                { status: upstream.status },
            );
        }
        const payload = await upstream.json().catch(() => null);
        return NextResponse.json({ ok: true, ...(payload ?? {}) });
    } catch {
        return NextResponse.json({ message: "No se pudo conectar con el servidor." }, { status: 503 });
    }
}
