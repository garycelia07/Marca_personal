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
    /** Si es false, la cookie de acceso es de sesión (expira al cerrar el navegador). */
    remember?: boolean;
};

/** Decoded JWT claims (Base64Url payload, unverified). */
export type JwtPayload = {
    /** Standard JWT subject — preferred user id. */
    sub?: unknown;
    /** Fallback user id claim. */
    userId?: unknown;
    email?: unknown;
    name?: unknown;
    fullName?: unknown;
    role?: unknown;
    accessExpiresAt?: unknown;
    /** Standard JWT expiration (seconds since epoch). */
    exp?: unknown;
    [claim: string]: unknown;
};

/** HttpOnly cookie that holds the backend access token. */
export const ACCESS_TOKEN_COOKIE = "aurea_access_token";

function normalizeRole(value: unknown): UserRole | null {
    if (value === "ADMIN" || value === "STUDENT") return value as UserRole;
    return null;
}

function decodeBase64(value: string): string {
    if (typeof atob === "function") {
        try {
            return atob(value);
        } catch {
            // Buffer padding/url-encoding edge cases — fall through.
        }
    }
    if (typeof Buffer !== "undefined") {
        return Buffer.from(value, "base64").toString("utf-8");
    }
    throw new Error("No Base64 decoder available for the JWT payload.");
}

/**
 * Decodes the payload of a JWT WITHOUT verifying its signature.
 * Good for reading non-sensitive, client-displayable claims (e.g. the role
 * used to pick the dashboard). Server-side authorization must always be
 * re-validated against the trusted backend.
 */
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

/**
 * Returns the authenticated user for the current request by reading the
 * HttpOnly `aurea_access_token` cookie. Server-only — import from Server
 * Components, Route Handlers or Server Actions, never from Client Components.
 */
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

/** Default landing page for a role, used right after login. */
export function dashboardForRole(role: UserRole): string {
    return role === "ADMIN" ? "/admin" : "/estudiante";
}
