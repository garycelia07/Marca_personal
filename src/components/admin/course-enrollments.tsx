"use client";

import { useEffect, useRef, useState } from "react";
import {
    deleteEnrollment,
    enrollStudent,
    listCourseEnrollments,
    updateEnrollmentExpiration,
    type EnrollmentPagination,
} from "@/lib/api/enrollments";
import { listStudents } from "@/lib/api/students";

const PAGE_SIZE = 10;

type ToastVariant = "success" | "error";
type Toast = { id: number; variant: ToastVariant; message: string };

function errorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: string }).message);
    }
    return fallback;
}

function formatDate(iso: string | null | undefined): string {
    if (!iso) return "Sin límite";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Sin límite";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function inputDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export function CourseEnrollments({ courseId }: { courseId: string }) {
    const [pagination, setPagination] = useState<EnrollmentPagination>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const [students, setStudents] = useState<{ id: string; fullName: string; email: string }[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [assignExpiresAt, setAssignExpiresAt] = useState("");
    const [assignError, setAssignError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingDate, setEditingDate] = useState("");
    const [rowError, setRowError] = useState<string | null>(null);

    function pushToast(variant: ToastVariant, message: string) {
        const id = ++toastId.current;
        setToasts((current) => [...current, { id, variant, message }]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 4500);
    }

    async function refresh(page = pagination.page, spinner = true) {
        if (spinner) {
            setLoading(true);
        }
        try {
            const result = await listCourseEnrollments(courseId, { page, limit: PAGE_SIZE });
            setPagination(result);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cargar los inscritos."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(async () => {
            try {
                const result = await listStudents({ page: 1, limit: 50 });
                setStudents(result.items.map((student) => ({ id: student.id, fullName: student.fullName, email: student.email })));
            } catch {
                // Sin lista de estudiantes, la asignación manual no estará disponible.
            }
        });
    }, []);

    useEffect(() => {
        void Promise.resolve().then(() => refresh(1, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    async function handleAssign() {
        if (!selectedStudent) {
            setAssignError("Selecciona un estudiante.");
            return;
        }
        setBusy(true);
        setAssignError(null);
        try {
            await enrollStudent({
                userId: selectedStudent,
                courseId,
                expiresAt: assignExpiresAt ? new Date(`${assignExpiresAt}T23:59:59`).toISOString() : undefined,
            });
            pushToast("success", "Estudiante matriculado correctamente.");
            setAssigning(false);
            setSelectedStudent("");
            setAssignExpiresAt("");
            void refresh(1);
        } catch (error) {
            setAssignError(errorMessage(error, "No fue posible matricular al estudiante."));
        } finally {
            setBusy(false);
        }
    }

    async function handleSaveExpiration(id: string) {
        if (!editingDate) {
            setRowError("Selecciona una fecha.");
            return;
        }
        setBusy(true);
        setRowError(null);
        try {
            await updateEnrollmentExpiration(id, new Date(`${editingDate}T23:59:59`).toISOString());
            pushToast("success", "Vigencia actualizada.");
            setEditingId(null);
            void refresh();
        } catch (error) {
            setRowError(errorMessage(error, "No fue posible actualizar la vigencia."));
        } finally {
            setBusy(false);
        }
    }

    async function handleRemove(id: string) {
        setBusy(true);
        try {
            await deleteEnrollment(id);
            pushToast("success", "Inscripción eliminada.");
            void refresh();
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible eliminar la inscripción."));
        } finally {
            setBusy(false);
        }
    }
return (
        <div className="mt-10 border-t hairline pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="eyebrow">Estudiantes inscritos</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{pagination.total} inscripciones</p>
                </div>
                {assigning ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={selectedStudent}
                            onChange={(event) => { setSelectedStudent(event.target.value); setAssignError(null); }}
                            aria-label="Seleccionar estudiante"
                            className="max-w-52 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                        >
                            <option value="">Selecciona…</option>
                            {students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}
                        </select>
                        <input
                            type="date"
                            value={assignExpiresAt}
                            onChange={(event) => setAssignExpiresAt(event.target.value)}
                            aria-label="Vigencia de la inscripción"
                            className="rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                        />
                        <button type="button" onClick={() => void handleAssign()} disabled={busy} className="rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">Matricular</button>
                        <button type="button" onClick={() => { setAssigning(false); setSelectedStudent(""); setAssignExpiresAt(""); setAssignError(null); }} disabled={busy} className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setAssigning(true)} disabled={students.length === 0} title={students.length === 0 ? "No hay estudiantes disponibles" : undefined} className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">+ Matricular estudiante</button>
                )}
            </div>
            {assignError && <p role="alert" className="mt-3 text-xs text-[var(--danger)]">{assignError}</p>}
<ul className="mt-6 space-y-3">
                {loading ? (
                    <li className="flex items-center justify-center gap-3 rounded-md border hairline bg-[var(--paper)] px-4 py-8 text-[var(--ink-soft)]">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" aria-hidden="true" />
                        <span className="text-sm">Cargando inscripciones…</span>
                    </li>
                ) : pagination.items.length === 0 ? (
                    <li className="rounded-md border hairline bg-[var(--paper)] px-4 py-6 text-sm text-[var(--ink-soft)]">Aún no hay estudiantes inscritos en este curso.</li>
                ) : (
                    pagination.items.map((enrollment) => (
                        <li key={enrollment.id} className="flex flex-wrap items-center gap-3 rounded-md border hairline bg-[var(--paper)] px-4 py-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{enrollment.user?.fullName ?? "Estudiante"}</p>
                                <p className="text-xs text-[var(--ink-soft)]">{enrollment.user?.email ?? "—"}</p>
                            </div>
                            {editingId === enrollment.id ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="date"
                                        value={editingDate}
                                        onChange={(event) => { setEditingDate(event.target.value); setRowError(null); }}
                                        aria-label="Nueva vigencia"
                                        className="rounded-full border hairline bg-transparent px-3 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                                    />
                                    <button type="button" onClick={() => void handleSaveExpiration(enrollment.id)} disabled={busy} className="rounded-full bg-[var(--forest)] px-4 py-2 text-xs font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">Guardar</button>
                                    <button type="button" onClick={() => { setEditingId(null); setRowError(null); }} disabled={busy} className="rounded-full border hairline px-4 py-2 text-xs font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-[var(--forest-deep)]">Vence: {formatDate(enrollment.expiresAt)}</span>
                                    <button type="button" onClick={() => { setRowError(null); setEditingId(enrollment.id); setEditingDate(inputDate(enrollment.expiresAt)); }} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Vigencia</button>
                                    <button type="button" onClick={() => void handleRemove(enrollment.id)} disabled={busy} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-50">Quitar</button>
                                </div>
                            )}
                        </li>
                    ))
                )}
            </ul>
            {rowError && <p role="alert" className="mt-3 text-xs text-[var(--danger)]">{rowError}</p>}

            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div key={toast.id} role="status" aria-live="polite" className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm shadow-lg ${toast.variant === "success" ? "border-[var(--forest)] bg-[var(--paper)] text-[var(--forest-deep)]" : "border-[var(--danger)] bg-[var(--lime)] text-[var(--danger)]"}`}>
                        <span aria-hidden="true">{toast.variant === "success" ? "✓" : "⚠"}</span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}