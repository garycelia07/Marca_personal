"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import type { AuthUser } from "@/lib/api/auth";

const USER_STORAGE_KEY = "aurea_user";
const TOKEN_STORAGE_KEY = "aurea_access_token";

type LoginResponseBody = { user?: AuthUser; accessToken?: string; message?: string };
type Field = "email" | "password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IniciarSesion() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});

    function validate(): boolean {
        const next: Partial<Record<Field, string>> = {};
        const trimmed = email.trim();
        if (!trimmed) {
            next.email = "Introduce tu correo electrónico.";
        } else if (!EMAIL_RE.test(trimmed)) {
            next.email = "Ese correo no parece válido.";
        }
        if (!password) {
            next.password = "Introduce tu contraseña.";
        } else if (password.length < 6) {
            next.password = "La contraseña debe tener al menos 6 caracteres.";
        }
        setFieldErrors(next);
        return Object.keys(next).length === 0;
    }

    function clearFieldError(field: Field) {
        if (!fieldErrors[field]) return;
        const next = { ...fieldErrors };
        delete next[field];
        setFieldErrors(next);
    }

    const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) return;
        if (!validate()) return;

        setError(null);
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password, remember }),
                cache: "no-store",
            });

            const data = (await response.json().catch(() => null)) as LoginResponseBody | null;
            if (!response.ok) {
                setError(data?.message ?? "Credenciales inválidas. Inténtalo de nuevo.");
                return;
            }

            const user = data?.user;
            if (!user) {
                setError("Respuesta inválida del servidor de autenticación.");
                return;
            }

            try {
                window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            } catch {
                // El usuario sigue autenticado vía la cookie HttpOnly.
            }
            if (typeof data?.accessToken === "string") {
                try {
                    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
                } catch {
                    // Token solo en memoria: subidas directas requerirán re-login.
                }
            }

            // Redirige a la zona correspondiente según el rol del usuario:
            // ADMIN -> /admin | resto -> /estudiante
            router.push(user.role === "ADMIN" ? "/admin" : "/estudiante");
        } catch {
            setError("No fue posible conectar con el servidor. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SiteShell>
            <main className="grid min-h-[calc(100vh-170px)] lg:grid-cols-[0.9fr_1.1fr]">
                <section className="auth-panel flex flex-col justify-between p-8 text-[var(--background)] sm:p-12 lg:p-16">
                    <div className="flex items-center gap-2">
                        <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--copper-soft)]/40 bg-[var(--forest-deep)] text-lg font-bold text-[var(--copper-soft)]">G</span>
                        <Link href="/" className="display-font text-2xl">Gary <span className="text-[var(--copper-soft)]">Mayhua</span></Link>
                    </div>
                    <div className="max-w-md">
                        <p className="eyebrow text-[var(--copper-soft)]">Tu espacio de crecimiento</p>
                        <h1 className="display-font mt-7 text-5xl leading-[0.92] sm:text-7xl">
                            Vuelve a tu <em className="script-font text-[var(--copper-soft)]">próxima</em> decisión.
                        </h1>
                        <p aria-hidden="true" className="mt-10 h-[1px] w-14 bg-[var(--copper-soft)]" />
                    </div>
                    <div className="space-y-5">
                        <p className="max-w-sm text-sm leading-6 text-[var(--copper-soft)]">Accede a tus programas, recursos y conversaciones en curso.</p>
                        <p className="max-w-sm text-xs leading-5 text-[var(--copper-soft)]">¿Aún no tienes acceso? <Link href="/" className="underline decoration-solid underline-offset-4 transition hover:text-[var(--copper)]">Escríbenos</Link> y te contamos cómo empezar.</p>
                    </div>
                </section>
<section className="flex items-center justify-center p-6 sm:p-12 lg:p-20">
                    <div className="w-full max-w-md">
                        <p className="eyebrow">Iniciar sesión</p>
                        <h2 className="display-font mt-5 text-4xl leading-none sm:text-5xl">Qué bueno verte.</h2>

                        <form className="mt-12 space-y-6" onSubmit={handleSubmit} noValidate>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold">Correo electrónico</span>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    aria-invalid={Boolean(fieldErrors.email)}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        clearFieldError("email");
                                    }}
                                    onBlur={validate}
                                    className={`w-full border-b bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)] ${fieldErrors.email ? "border-[var(--danger)]" : "hairline"}`}
                                    placeholder="nombre@correo.com"
                                />
                                {fieldErrors.email && <p role="alert" className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.email}</p>}
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold">Contraseña</span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete={remember ? "current-password" : "off"}
                                        required
                                        value={password}
                                        aria-invalid={Boolean(fieldErrors.password)}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            clearFieldError("password");
                                        }}
                                        onBlur={validate}
                                        className={`w-full border-b bg-transparent px-0 py-3 pr-14 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)] ${fieldErrors.password ? "border-[var(--danger)]" : "hairline"}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        aria-pressed={showPassword}
                                        tabIndex={-1}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-[var(--ink-soft)] transition hover:text-[var(--forest-deep)]"
                                    >
                                        {showPassword ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                                {fieldErrors.password && <p role="alert" className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.password}</p>}
                            </label>

                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(event) => setRemember(event.target.checked)}
                                    className="h-4 w-4 accent-[var(--copper)]"
                                />
                                <span className="text-sm text-[var(--ink-soft)]">Recordarme en este dispositivo</span>
                            </label>

                            {error && (
                                <p role="alert" className="flex items-start gap-2 rounded-md border border-[var(--danger)] bg-[var(--lime)] px-4 py-3 text-sm leading-6 text-[var(--danger)]">
                                    <span aria-hidden="true">⚠</span>
                                    <span>{error}</span>
                                </p>
                            )}
<div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--forest)] px-8 py-3.5 text-sm font-bold text-[var(--background)] shadow-[0_10px_22px_-6px_rgba(23,23,19,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--copper)] hover:text-[#211f1b] hover:shadow-[0_16px_30px_-6px_rgba(36,35,31,0.6)] active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {loading
                                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent" aria-hidden="true" />
                                        : "Iniciar sesión"}
                                </button>
                                <Link href="/" className="text-sm text-[var(--ink-soft)] underline decoration-solid underline-offset-4 transition hover:text-[var(--copper)]">Volver al inicio</Link>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}