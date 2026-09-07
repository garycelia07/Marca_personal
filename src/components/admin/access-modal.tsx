"use client";

import { useState } from "react";
import type { Student, UpdateAccessExpirationInput } from "@/lib/api/students";

function formatInputDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export function AccessModal({
    student,
    busy,
    error,
    onSubmit,
    onClose,
}: {
    student: Student;
    busy: boolean;
    error: string | null;
    onSubmit: (input: UpdateAccessExpirationInput) => void;
    onClose: () => void;
}) {
    const [accessExpiresAt, setAccessExpiresAt] = useState(formatInputDate(student.accessExpiresAt));
    const [fieldError, setFieldError] = useState<string | null>(null);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        if (!accessExpiresAt) {
            setFieldError("Selecciona una fecha de vigencia.");
            return;
        }
        setFieldError(null);
        onSubmit({ accessExpiresAt: new Date(`${accessExpiresAt}T23:59:59`).toISOString() });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Ajustar vigencia de acceso">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border hairline bg-[var(--paper)] p-6 shadow-[0_24px_48px_-18px_rgba(36,35,31,0.6)] sm:p-8">
                <p className="eyebrow">Gestión de estudiantes</p>
                <h3 className="display-font mt-4 text-3xl leading-none">Ajustar vigencia</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                    Define hasta cuándo <span className="font-semibold">{student.fullName}</span> puede acceder a su espacio.
                </p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Fecha límite de acceso</span>
                        <input
                            type="date"
                            value={accessExpiresAt}
                            required
                            onChange={(event) => {
                                setAccessExpiresAt(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition focus:border-[var(--copper)]"
                        />
                    </label>

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