import { NextResponse } from "next/server";
import type { LoginInput, LoginResponse } from "@/lib/api/auth";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/auth";

const backendUrl =
    process.env.BACKEND_API_URL ??
    (process.env.NODE_ENV === "production"
        ? "https://api.garymayhua.com/api/v1"
        : "http://localhost:3000/api/v1");

function isTokenExpired(accessExpiresAt: string | null): boolean {
  if (!accessExpiresAt) return false;
  const expiresAt = new Date(accessExpiresAt);
  const now = new Date();
  return now > expiresAt;
}

export async function POST(request: Request) {
  let body: LoginInput;

  try {
    body = (await request.json()) as LoginInput;
  } catch {
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  }

  if (!body.email?.trim() || !body.password) {
    return NextResponse.json({ message: "Correo y contraseña son obligatorios." }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim(), password: body.password }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    const payload = (await response.json().catch(() => null)) as LoginResponse | { message?: string } | null;

    if (!response.ok) {
      const message = payload && "message" in payload && payload.message ? payload.message : "Credenciales inválidas.";
      return NextResponse.json({ message }, { status: response.status });
    }

    if (!payload || !("accessToken" in payload) || !("user" in payload)) {
      return NextResponse.json({ message: "Respuesta inválida del servidor de autenticación." }, { status: 502 });
    }

    const { user } = payload;

    if (user.role === "STUDENT" && isTokenExpired(user.accessExpiresAt)) {
      return NextResponse.json({ message: "Acceso vencido. Por favor inicie sesión nuevamente." }, { status: 401 });
    }

    const remember = body.remember === true;
    const cookieOptions = remember ? { maxAge: 60 * 60 * 24 * 7 } : {};

    // Devolvemos también el accessToken para que el cliente pueda hacer subidas
    // directas al backend (archivos grandes) con Authorization: Bearer.
    const result = NextResponse.json({ user, accessToken: payload.accessToken });
    result.cookies.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...cookieOptions,
    });

    return result;
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
  }
}
