import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

/** GET /api/progress — lecciones marcadas como vistas del estudiante autenticado. */
export async function GET() {
    try {
        const upstream = await backendFetch("/progress");
        const payload = await upstream.json().catch(() => null);
        return NextResponse.json(Array.isArray(payload) ? payload : [], { status: upstream.ok ? 200 : upstream.status });
    } catch {
        return NextResponse.json({ message: "No se pudo conectar con el servidor." }, { status: 503 });
    }
}
