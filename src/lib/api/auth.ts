import { cookies } from "next/headers";

export type UserRole = "ADMIN" | "STUDENT";

export type AuthUser = {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    accessExpiresAt: string | null;
};

export type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};

export type LoginInput = {
    email: string;
    password: string;
    remember?: boolean;
};

export type JwtPayload = {
    sub?: unknown;
    userId?: unknown;
    email?: unknown;
    name?: unknown;
    fullName?: unknown;
    role?: unknown;
    accessExpiresAt?: unknown;
    exp?: unknown;
    [claim: string]: unknown;
};

export const ACCESS_TOKEN_COOKIE = "mp_access_token";

function normalizeRole(value: unknown): UserRole | null {
    if (value === "ADMIN" || value === "STUDENT") return value as UserRole;
    return null;
}

function decodeBase64(value: string): string {
    const padded = value.padEnd(Math.ceil(value.length / 4) * 4, "=");
    if (typeof Buffer !== "undefined") {
        return Buffer.from(padded, "base64").toString("utf-8");
    }
    return atob(padded);
}

export function decodeJwtToken(token: string): JwtPayload | null {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    try {
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        base64 += "=".repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(decodeBase64(base64)) as JwtPayload;
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
        if (!token) return null;

        const claims = decodeJwtToken(token);
        if (!claims) return null;

        const role = normalizeRole(claims.role);
        if (!role) return null;

        const accessExpiresAt =
            typeof claims.accessExpiresAt === "string"
                ? claims.accessExpiresAt
                : typeof claims.exp === "number"
                    ? new Date(claims.exp * 1000).toISOString()
                    : null;

        return {
            id: String(claims.sub ?? claims.userId ?? ""),
            email: String(claims.email ?? ""),
            fullName: String(claims.name ?? claims.fullName ?? ""),
            role,
            accessExpiresAt,
        };
    } catch {
        return null;
    }
}

export function dashboardForRole(role: UserRole): string {
    return role === "ADMIN" ? "/admin" : "/estudiante";
}
