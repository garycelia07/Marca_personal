import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

/** GET /api/content — todo el contenido del landing. */
export async function GET() {
    try {
        const response = await backendFetch("/content");
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener el contenido.";
            return NextResponse.json({ message }, { status: response.status });
        }
        return NextResponse.json(payload ?? []);
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}