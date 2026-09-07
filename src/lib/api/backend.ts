import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/auth";

/** Base URL del backend real. Se sobreescribe con la env `BACKEND_API_URL`. */
export const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000/api/v1";

/**
 * Realiza una petición al backend real añadiendo automáticamente el token de
 * acceso (cookie HttpOnly `aurea_access_token`) como `Authorization: Bearer`.
 * Server-only — úsalo en Route Handlers y Server Actions, nunca en cliente.
 */
export async function backendFetch(
    path: string,
    init?: {
        method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        body?: unknown;
        headers?: HeadersInit;
    }
): Promise<Response> {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    const headers = new Headers(init?.headers);
    const isMultipart = init?.body instanceof FormData;

    if (!isMultipart) {
        headers.set("Content-Type", "application/json");
    }
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${backendUrl}${path}`, {
        method: init?.method ?? "GET",
        headers,
        body: init?.body === undefined ? undefined : isMultipart ? (init.body as FormData) : JSON.stringify(init.body),
        cache: "no-store",
    });
}