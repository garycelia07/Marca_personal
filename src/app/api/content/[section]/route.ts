import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { isContentSection } from "@/lib/api/content";

type Context = { params: Promise<{ section: string }> };

/** GET /api/content/{section} — contenido de una sección puntual. */
export async function GET(_request: Request, { params }: Context) {
    const { section } = await params;
    if (!isContentSection(section)) {
        return NextResponse.json({ message: "Sección no válida." }, { status: 400 });
    }
    try {
        const response = await backendFetch(`/content/${section}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener el contenido de la sección.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** PUT /api/content/{section} — crea o reemplaza el contenido de una sección (admin). */
export async function PUT(request: Request, { params }: Context) {
    const { section } = await params;
    if (!isContentSection(section)) {
        return NextResponse.json({ message: "Sección no válida." }, { status: 400 });
    }

    let body: { data?: unknown };
    try {
        body = (await request.json()) as { data?: unknown };
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
        return NextResponse.json({ message: "El campo `data` es obligatorio y debe ser un objeto." }, { status: 400 });
    }

    try {
        const response = await backendFetch(`/content/${section}`, { method: "PUT", body: { data: body.data } });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible guardar el contenido.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}