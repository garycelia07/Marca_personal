import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ courseId: string }> };

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** GET /api/enrollments/course/{courseId} — estudiantes inscritos en un curso (admin). */
export async function GET(request: Request, { params }: Context) {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 20);

    try {
        const response = await backendFetch(`/enrollments/course/${encodeURIComponent(courseId)}?page=${page}&limit=${limit}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener los inscritos del curso.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? { items: [], page, limit, total: 0, totalPages: 0 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}