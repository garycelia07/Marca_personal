import { NextResponse } from "next/server";
import { backendApiBase, tokenFromCookies } from "@/lib/api/backend";

export async function GET(
    _request: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const token = await tokenFromCookies();
    if (!token) {
        return NextResponse.json({ message: "No autenticado." }, { status: 401 });
    }

    try {
        const upstream = await fetch(`${backendApiBase()}/materials/${encodeURIComponent(id)}/file`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!upstream.ok) {
            return NextResponse.json({ message: "Material no disponible." }, { status: upstream.status });
        }

        const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
        const disposition = upstream.headers.get("content-disposition");
        const body = await upstream.arrayBuffer();

        const response = new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, no-store",
            },
        });
        if (disposition) response.headers.set("Content-Disposition", disposition);
        return response;
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 502 });
    }
}
