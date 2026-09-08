/**
 * Ayudantes para subir archivos GRANDES (PDF, imágenes) DIRECTAMENTE al backend
 * desde el navegador, sin pasar por las funciones de Next.js/Vercel (límite
 * fijo ~4.5 MB). El backend vive en un VPS que admite hasta 100 MB.
 *
 * Requisitos:
 *  - El cliente necesita el `accessToken` (se guarda en localStorage en el login).
 *  - El backend debe tener CORS abierto para el dominio de la web.
 */

export const CLIENT_TOKEN_KEY = "aurea_access_token";

/** Origen público del backend (para el navegador). */
export function backendPublicOrigin(): string {
    const origin =
        (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BACKEND_URL) ||
        "https://api.garymayhua.com";
    return origin.replace(/\/+$/, "");
}

/** Lee el token de acceso desde el localStorage del cliente. */
export function getClientToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(CLIENT_TOKEN_KEY) || null;
    } catch {
        return null;
    }
}

export async function directUpload(path: string, form: FormData): Promise<Response> {
    const token = getClientToken();
    const headers = new Headers();
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(`${backendPublicOrigin()}${path}`, {
        method: "POST",
        headers,
        body: form,
        credentials: "include",
    });
}

export async function directUploadPut(path: string, form: FormData): Promise<Response> {
    const token = getClientToken();
    const headers = new Headers();
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(`${backendPublicOrigin()}${path}`, {
        method: "PUT",
        headers,
        body: form,
        credentials: "include",
    });
}
