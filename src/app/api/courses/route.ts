import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { CreateCourseInput } from "@/lib/api/courses";

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function proxyError(response: Response, fallback: string): Promise<NextResponse> {
    const payload = await response.json().catch(() => null);
    const message = payload && typeof payload === "object" && "message" in payload && payload.message
        ? String(payload.message)
        : fallback;
    return NextResponse.json({ message }, { status: response.status });
}

/** GET /api/courses?page=1&limit=20 — lista cursos publicados. */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 20);

    try {
        const response = await backendFetch(`/courses?page=${page}&limit=${limit}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            return proxyError(response, "No fue posible obtener los cursos.");
        }
        return NextResponse.json(payload ?? { items: [], page, limit, total: 0, totalPages: 0 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}

/** POST /api/courses — crea un curso (admin). */
export async function POST(request: Request) {
    let body: CreateCourseInput;
    try {
        body = (await request.json()) as CreateCourseInput;
    } catch {
        return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
    }

    if (!body.title?.trim() || !body.slug?.trim()) {
        return NextResponse.json({ message: "Título y slug son obligatorios." }, { status: 400 });
    }

    try {
        const response = await backendFetch("/courses", {
            method: "POST",
            body: {
                title: body.title.trim(),
                slug: slugify(body.slug.trim()),
                description: body.description?.trim() || undefined,
                coverImageUrl: body.coverImageUrl?.trim() || undefined,
                isPublished: body.isPublished === true,
            },
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            return proxyError(response, "No fue posible crear el curso.");
        }
        return NextResponse.json(payload ?? { ok: true }, { status: 201 });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}