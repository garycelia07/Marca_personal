import { backendFetch } from "@/lib/api/backend";

/** Nombre centralizado de la cookie de autenticación */
export const ACCESS_TOKEN_COOKIE = "aurea_access_token";

export type UserRole = "ADMIN" | "STUDENT" | string;

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    accessExpiresAt: string | null;
}

export type AuthUser = User;

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

/**
 * Obtiene el usuario autenticado actual desde las cookies en Server Components.
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        // backendFetch ya adjunta la cookie 'aurea_access_token' en el header Authorization
        const res = await backendFetch("/auth/me");

        if (!res.ok) return null;

        const data = (await res.json()) as { user?: User } & User;
        return data.user ?? data;
    } catch (error) {
        console.error("Error al obtener el usuario actual:", error);
        return null;
    }
}