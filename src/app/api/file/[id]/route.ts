import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(
    _request: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    try {
        const upstream = await backendFetch(`/materials/${encodeURIComponent(id)}/file`);

        if (!upstream.ok) {
            const isAuth = upstream.status === 401 || upstream.status === 403;
            return NextResponse.json(
                { message: isAuth ? "No autenticado." : "Material no disponible." },
                { status: upstream.status }
            );
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
