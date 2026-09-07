import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/auth";

export function backendPublicBase(): string {
    return (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function backendApiBase(): string {
    return (process.env.BACKEND_API_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
}

export async function tokenFromCookies(): Promise<string | null> {
    try {
        const store = await cookies();
        return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
    } catch {
        return null;
    }
}

export async function backendGetJson<T>(path: string, token?: string | null): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${backendApiBase()}${path}`, { headers, cache: "no-store" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend ${res.status} en ${path}${text ? `: ${text.slice(0, 200)}` : ""}`);
    }
    return (await res.json()) as T;
}

export type Paginated<T> = {
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function backendMutation<T>(
    path: string,
    options: {
        method?: "POST" | "PATCH" | "PUT" | "DELETE";
        body?: unknown;
        token?: string | null;
    } = {},
): Promise<T> {
    const { method = "POST", body, token } = options;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(`${backendApiBase()}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend ${res.status} en ${path}${text ? `: ${text.slice(0, 200)}` : ""}`);
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return (await res.json()) as T;
    return undefined as T;
}
