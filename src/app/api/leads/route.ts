import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { CreateLeadInput } from "@/lib/api/leads";

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * POST /api/leads — registra un contacto del landing (público).
 * No exige autenticación: cualquier visitante puede enviar el formulario.
 */
export async function POST(request: Request) {
    let body: CreateLeadInput;
    try {
        body = (await request.json()) as CreateLeadInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    const hasContactData = Boolean(body.name?.trim() || body.email?.trim() || body.phone?.trim());
    if (!hasContactData) {
        return NextResponse.json({ message: "Incluye al menos tu nombre, correo o teléfono." }, { status: 400 });
    }

    try {
        const response = await backendFetch("/leads", {
            method: "POST",
            body: {
                name: body.name?.trim() || undefined,
                email: body.email?.trim() || undefined,
                phone: body.phone?.trim() || undefined,
                message: body.message?.trim() || undefined,
                channel: body.channel === "WHATSAPP" ? "WHATSAPP" : "CONTACT_FORM",
            },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible registrar tu contacto.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { ok: true }, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** GET /api/leads?page=1&limit=20 — lista contactos recibidos (admin). */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 20);

    try {
        const response = await backendFetch(`/leads?page=${page}&limit=${limit}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener los contactos.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { items: [], page, limit, total: 0, totalPages: 0 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}