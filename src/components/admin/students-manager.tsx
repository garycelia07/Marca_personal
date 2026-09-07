"use client";

import { useEffect, useRef, useState } from "react";
import {
    createStudent,
    deleteStudent,
    listStudents,
    updateAccessExpiration,
    updateStudent,
    type Student,
    type StudentPagination,
} from "@/lib/api/students";
import { StudentFormModal, type StudentFormPayload } from "@/components/admin/student-form-modal";
import { AccessModal } from "@/components/admin/access-modal";
import { DeleteModal } from "@/components/admin/delete-modal";
import { buildPageList, formatDate, isExpired } from "@/components/admin/students-utils";

const PAGE_SIZE = 10;

type ToastVariant = "success" | "error";
type Toast = { id: number; variant: ToastVariant; message: string };

function errorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: string }).message);
    }
    return fallback;
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
    if (totalPages <= 1) return null;
    const pages = buildPageList(page, totalPages);

    return (
        <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de estudiantes">
            <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Página anterior" className="rounded-full border hairline px-3 py-1.5 text-sm disabled:opacity-40">←</button>
            {pages.map((entry) =>
                entry === "…" ? (
                    <span key={`gap-${entry}`} className="px-1 text-[var(--ink-soft)]">…</span>
                ) : (
                    <button key={entry} type="button" onClick={() => onPage(entry)} aria-label={`Página ${entry}`} aria-current={entry === page ? "page" : undefined} className={`h-9 w-9 rounded-full text-sm ${entry === page ? "bg-[var(--forest)] text-[var(--background)]" : "border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)]"}`}>{entry}</button>
                )
            )}
            <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente" className="rounded-full border hairline px-3 py-1.5 text-sm disabled:opacity-40">→</button>
        </nav>
    );
}

export function StudentsManager() {
    const [pagination, setPagination] = useState<StudentPagination>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [adjusting, setAdjusting] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState<Student | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

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
            const result = await listStudents({ page, limit: PAGE_SIZE });
            setPagination(result);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cargar los estudiantes."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => refresh(1, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleCreate(input: StudentFormPayload) {
        setBusy(true);
        setModalError(null);
        try {
            await createStudent(input);
            pushToast("success", "Estudiante creado correctamente.");
            setCreating(false);
            void refresh(1);
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible crear el estudiante."));
        } finally {
            setBusy(false);
        }
    }

    async function handleUpdate(input: StudentFormPayload) {
        if (!editing) return;
        setBusy(true);
        setModalError(null);
        try {
            await updateStudent(editing.id, input);
            pushToast("success", "Estudiante actualizado correctamente.");
            setEditing(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible actualizar el estudiante."));
        } finally {
            setBusy(false);
        }
    }

    async function handleAdjust(accessExpiresAt: string) {
        if (!adjusting) return;
        setBusy(true);
        setModalError(null);
        try {
            await updateAccessExpiration(adjusting.id, { accessExpiresAt });
            pushToast("success", "Vigencia de acceso actualizada.");
            setAdjusting(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible ajustar la vigencia."));
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (!deleting) return;
        setBusy(true);
        try {
            await deleteStudent(deleting.id);
            pushToast("success", "Estudiante eliminado.");
            setDeleting(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible eliminar el estudiante."));
            setDeleting(null);
        } finally {
            setBusy(false);
        }
    }

    const filteredItems = search.trim()
        ? pagination.items.filter((student) =>
            student.fullName.toLowerCase().includes(search.toLowerCase()) ||
            student.email.toLowerCase().includes(search.toLowerCase()))
        : pagination.items;

    return (
        <section className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
            <div className="flex flex-col gap-4 border-b hairline px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                    <p className="eyebrow">Estudiantes</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{pagination.total} registros · página {pagination.page} de {pagination.totalPages}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Buscar estudiante"
                        placeholder="Buscar…"
                        className="w-44 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                    />
                    <button type="button" onClick={() => { setModalError(null); setCreating(true); }} className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">+ Nuevo estudiante</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                        <tr className="border-b hairline text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                            <th className="px-5 py-3 sm:px-8">Estudiante</th>
                            <th className="px-5 py-3 sm:px-8">Vigencia</th>
                            <th className="px-5 py-3 sm:px-8">Estado</th>
                            <th className="px-5 py-3 text-right sm:px-8">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
{loading ? (
                        <tr>
                            <td colSpan={4} className="px-5 py-10 sm:px-8">
                                <div className="flex items-center justify-center gap-3 text-[var(--ink-soft)]">
                                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" aria-hidden="true" />
                                    <span>Cargando estudiantes…</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--ink-soft)] sm:px-8">
                                {search.trim() ? "No hay resultados para tu búsqueda." : "Aún no hay estudiantes registrados."}
                            </td>
                        </tr>
                    ) : (
                        filteredItems.map((student) => (
                            <tr key={student.id} className="border-b hairline transition hover:bg-[var(--lime)]">
                                <td className="px-5 py-4 sm:px-8">
                                    <p className="text-sm font-semibold">{student.fullName}</p>
                                    <p className="text-xs text-[var(--ink-soft)]">{student.email}</p>
                                </td>
                                <td className="px-5 py-4 text-sm sm:px-8">
                                    {student.accessExpiresAt ? (
                                        <span className={isExpired(student) ? "text-[var(--danger)]" : "text-[var(--ink-soft)]"}>
                                            {formatDate(student.accessExpiresAt)}{isExpired(student) ? " · vencida" : ""}
                                        </span>
                                    ) : <span className="text-[var(--ink-soft)]">Sin límite</span>}
                                </td>
                                <td className="px-5 py-4 sm:px-8">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.isActive === false ? "bg-[var(--line)] text-[var(--ink-soft)]" : "bg-[var(--lime)] text-[var(--forest-deep)]"}`}>
                                        {student.isActive === false ? "Inactivo" : "Activo"}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right sm:px-8">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <button type="button" onClick={() => { setModalError(null); setAdjusting(student); }} title="Ajustar vigencia" className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Vigencia</button>
                                        <button type="button" onClick={() => { setModalError(null); setEditing(student); }} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Editar</button>
                                        <button type="button" onClick={() => setDeleting(student)} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
<div className="flex flex-wrap items-center justify-between gap-4 border-t hairline px-5 py-4 sm:px-8">
                <p className="text-xs text-[var(--ink-soft)]">Mostrando {filteredItems.length} de {pagination.total}</p>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={(page) => { void refresh(page); }} />
            </div>

            {creating && (
                <StudentFormModal
                    title="Nuevo estudiante"
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleCreate(input)}
                    onClose={() => setCreating(false)}
                />
            )}
            {editing && (
                <StudentFormModal
                    title="Editar estudiante"
                    initial={editing}
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleUpdate(input)}
                    onClose={() => setEditing(null)}
                />
            )}
            {adjusting && (
                <AccessModal
                    student={adjusting}
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleAdjust(input.accessExpiresAt)}
                    onClose={() => setAdjusting(null)}
                />
            )}
            {deleting && (
                <DeleteModal
                    student={deleting}
                    busy={busy}
                    onConfirm={() => void handleDelete()}
                    onClose={() => setDeleting(null)}
                />
            )}

            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div key={toast.id} role="status" aria-live="polite" className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm shadow-lg ${toast.variant === "success" ? "border-[var(--forest)] bg-[var(--paper)] text-[var(--forest-deep)]" : "border-[var(--danger)] bg-[var(--lime)] text-[var(--danger)]"}`}>
                        <span aria-hidden="true">{toast.variant === "success" ? "✓" : "⚠"}</span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}