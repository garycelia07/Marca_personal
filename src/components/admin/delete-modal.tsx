"use client";

import type { Student } from "@/lib/api/students";

export function DeleteModal({
    student,
    busy,
    onConfirm,
    onClose,
}: {
    student: Student;
    busy: boolean;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Eliminar estudiante">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border hairline bg-[var(--paper)] p-6 shadow-[0_24px_48px_-18px_rgba(36,35,31,0.6)] sm:p-8">
                <p className="eyebrow">Gestión de estudiantes</p>
                <h3 className="display-font mt-4 text-3xl leading-none text-[var(--danger)]">Eliminar estudiante</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                    ¿Seguro que quieres eliminar a <span className="font-semibold">{student.fullName}</span> (<span className="font-mono">{student.email}</span>)? Esta acción no se puede deshacer.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-full border hairline px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[var(--danger)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50">
                        {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />}
                        {busy ? "Eliminando…" : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}