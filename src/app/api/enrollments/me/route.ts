import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** GET /api/enrollments/me — cursos asignados al estudiante autenticado. */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 20);

    try {
        const response = await backendFetch(`/enrollments/me?page=${page}&limit=${limit}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener tus cursos.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { items: [], page, limit, total: 0, totalPages: 0 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}