"use client";

import { useState } from "react";
import type { CreateStudentInput, Student, UpdateStudentInput } from "@/lib/api/students";

function formatInputDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export type StudentFormPayload = CreateStudentInput & UpdateStudentInput;

export function StudentFormModal({
    title,
    initial,
    busy,
    error,
    onSubmit,
    onClose,
}: {
    title: string;
    initial?: Student;
    busy: boolean;
    error: string | null;
    onSubmit: (input: StudentFormPayload) => void;
    onClose: () => void;
}) {
    const [email, setEmail] = useState(initial?.email ?? "");
    const [fullName, setFullName] = useState(initial?.fullName ?? "");
    const [password, setPassword] = useState("");
    const [accessExpiresAt, setAccessExpiresAt] = useState(formatInputDate(initial?.accessExpiresAt));
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);
    const [fieldError, setFieldError] = useState<string | null>(null);

    function validate(): boolean {
        if (!email.trim() || !email.includes("@")) {
            setFieldError("Introduce un correo válido.");
            return false;
        }
        if (!fullName.trim()) {
            setFieldError("El nombre completo es obligatorio.");
            return false;
        }
        if (!initial && password.length < 6) {
            setFieldError("La contraseña debe tener al menos 6 caracteres.");
            return false;
        }
        setFieldError(null);
        return true;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !validate()) return;
        onSubmit({
            email: email.trim(),
            fullName: fullName.trim(),
            password: initial ? undefined : password,
            accessExpiresAt: accessExpiresAt ? new Date(`${accessExpiresAt}T23:59:59`).toISOString() : undefined,
            isActive,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border hairline bg-[var(--paper)] p-6 shadow-[0_24px_48px_-18px_rgba(36,35,31,0.6)] sm:p-8">
                <p className="eyebrow">Gestión de estudiantes</p>
                <h3 className="display-font mt-4 text-3xl leading-none">{title}</h3>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Correo electrónico</span>
                        <input
                            type="email"
                            value={email}
                            autoComplete="off"
                            required
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="alumno@correo.com"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Nombre completo</span>
                        <input
                            type="text"
                            value={fullName}
                            autoComplete="off"
                            required
                            onChange={(event) => {
                                setFullName(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="Juan Pérez"
                        />
                    </label>
{!initial && (
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold">Contraseña inicial</span>
                            <input
                                type="password"
                                value={password}
                                autoComplete="new-password"
                                required
                                minLength={6}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setFieldError(null);
                                }}
                                className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                                placeholder="ClaveSegura123"
                            />
                        </label>
                    )}

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Vigencia de acceso <span className="text-xs text-[var(--ink-soft)]">(opcional)</span></span>
                        <input
                            type="date"
                            value={accessExpiresAt}
                            onChange={(event) => setAccessExpiresAt(event.target.value)}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition focus:border-[var(--copper)]"
                        />
                    </label>

                    {initial && (
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) => setIsActive(event.target.checked)}
                                className="h-4 w-4 accent-[var(--copper)]"
                            />
                            <span className="text-sm text-[var(--foreground)]">Cuenta activa</span>
                        </label>
                    )}

                    {fieldError && <p role="alert" className="text-xs text-[var(--danger)]">{fieldError}</p>}
                    {error && <p role="alert" className="rounded-md border border-[var(--danger)] bg-[var(--lime)] px-4 py-3 text-sm leading-6 text-[var(--danger)]">⚠ {error}</p>}

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={busy} className="rounded-full border hairline px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-6 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">
                            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent" aria-hidden="true" />}
                            {busy ? "Guardando…" : "Guardar"}
                        </button>
                    </div>
</form>
            </div>
        </div>
    );
}