import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { CreateStudentInput } from "@/lib/api/students";

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** GET /api/students?page=1&limit=20 — lista estudiantes paginada. */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 20);

    try {
        const response = await backendFetch(`/students?page=${page}&limit=${limit}`);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener los estudiantes.";
            return NextResponse.json({ message }, { status: response.status });
        }

        return NextResponse.json(normalizePayload(payload ?? null, page, limit));
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** Convierte el paginado del backend { data, meta } al shape plano { items, page, limit, total, totalPages }. */
function normalizePayload(payload: unknown, page: number, limit: number) {
    if (!payload || typeof payload !== "object") {
        return { items: [], page, limit, total: 0, totalPages: 0 };
    }
    const p = payload as { data?: unknown; meta?: { total?: unknown; page?: unknown; limit?: unknown; totalPages?: unknown } };
    const list = Array.isArray(payload)
        ? payload
        : Array.isArray(p.data)
            ? p.data
            : Array.isArray((payload as { items?: unknown }).items)
                ? (payload as { items: unknown[] }).items
                : [];
    const total = typeof p.meta?.total === "number"
        ? p.meta.total
        : typeof (payload as { total?: unknown }).total === "number"
            ? (payload as { total: number }).total
            : list.length;
    const pLimit = limit > 0 ? limit : (typeof p.meta?.limit === "number" ? p.meta.limit : 20);
    const totalPages = typeof p.meta?.totalPages === "number"
        ? p.meta.totalPages
        : (pLimit > 0 ? Math.max(1, Math.ceil(total / pLimit)) : 1);
    return { items: list, page, limit: pLimit, total, totalPages };
}

/** POST /api/students — crea un estudiante. */
export async function POST(request: Request) {
    let body: CreateStudentInput;
    try {
        body = (await request.json()) as CreateStudentInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.email?.trim() || !body.fullName?.trim() || !body.password) {
        return NextResponse.json(
            { message: "Correo, nombre completo y contraseña son obligatorios." },
            { status: 400 }
        );
    }

    try {
        const response = await backendFetch("/students", {
            method: "POST",
            body: {
                email: body.email.trim(),
                fullName: body.fullName.trim(),
                password: body.password,
                accessExpiresAt: body.accessExpiresAt || undefined,
            },
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible crear el estudiante.";
            return NextResponse.json({ message }, { status: response.status });
        }

        return NextResponse.json(payload, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}