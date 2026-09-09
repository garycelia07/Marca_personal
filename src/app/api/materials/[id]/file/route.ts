import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/materials/{id}/file — stream binario del archivo para previsualizar
 * o descargar. No retorna JSON: reenvía el cuerpo con su Content-Type original.
 */
export async function GET(request: Request, { params }: Context) {
    const { id } = await params;
    try {
        const response = await backendFetch(`/materials/${encodeURIComponent(id)}/file`);

        if (!response.ok || !response.body) {
            const payload = await response.json().catch(() => null);
            const message = payload && typeof payload === "object" && "message" in payload && payload.message
                ? String(payload.message)
                : "No fue posible obtener el archivo.";
            return NextResponse.json({ message }, { status: response.ok ? 502 : response.status });
        }

        const headers = new Headers();
        const contentType = response.headers.get("content-type") ?? "";
        headers.set("Content-Type", contentType);
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }
        const contentDisposition = response.headers.get("content-disposition");

        const wantDownload = new URL(request.url).searchParams.get("download") === "1";
        if (wantDownload) {
            // «Descargar»: forzamos descarga real con un nombre amigable.
            const ext = contentType.includes("pdf") ? ".pdf"
                : contentType.includes("image/png") ? ".png"
                    : contentType.includes("image/jpeg") ? ".jpg"
                        : contentType.includes("image/webp") ? ".webp"
                            : "";
            headers.set("Content-Disposition", `attachment; filename="material${ext}"`);
        } else if (contentDisposition) {
            // «Ver»: mostramos inline (PDF/imagen) para incrustarlo en la web.
            headers.set("Content-Disposition", contentDisposition.replace(/^attachment/i, "inline"));
        }
        // Cache ligera para previsualizaciones repetidas.
        headers.set("Cache-Control", "private, max-age=60");

        return new NextResponse(response.body, { status: 200, headers });
    } catch {
        return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
    }
}