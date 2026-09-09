"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    createCourse,
    deleteCourse,
    listAdminCourses,
    updateCourse,
    type Course,
    type CoursePagination,
    type CreateCourseInput,
    type UpdateCourseInput,
} from "@/lib/api/courses";
import { CourseFormModal } from "@/components/admin/course-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-modal";
import { buildPageList } from "@/components/admin/students-utils";

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
        <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de cursos">
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

export function CoursesManager() {
    const [pagination, setPagination] = useState<CoursePagination>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState<Course | null>(null);
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
            const result = await listAdminCourses({ page, limit: PAGE_SIZE });
            setPagination(result);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cargar los cursos."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => refresh(1, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleCreate(input: CreateCourseInput) {
        setBusy(true);
        setModalError(null);
        try {
            await createCourse(input);
            pushToast("success", "Curso creado correctamente.");
            setCreating(false);
            void refresh(1);
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible crear el curso."));
        } finally {
            setBusy(false);
        }
    }

    async function handleUpdate(input: UpdateCourseInput) {
        if (!editing) return;
        setBusy(true);
        setModalError(null);
        try {
            await updateCourse(editing.id, input);
            pushToast("success", "Curso actualizado correctamente.");
            setEditing(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible actualizar el curso."));
        } finally {
            setBusy(false);
        }
    }

    async function togglePublished(course: Course) {
        setBusy(true);
        try {
            const next = !(course.isPublished ?? false);
            await updateCourse(course.id, { isPublished: next });
            pushToast("success", next ? `"${course.title}" publicado.` : `"${course.title}" pasó a borrador.`);
            void refresh();
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cambiar el estado."));
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (!deleting) return;
        setBusy(true);
        try {
            await deleteCourse(deleting.id);
            pushToast("success", "Curso eliminado.");
            setDeleting(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible eliminar el curso."));
            setDeleting(null);
        } finally {
            setBusy(false);
        }
    }

    const filteredItems = search.trim()
        ? pagination.items.filter((course) =>
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.slug.toLowerCase().includes(search.toLowerCase()))
        : pagination.items;

    return (
        <section className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
            <div className="flex flex-col gap-4 border-b hairline px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                    <p className="eyebrow">Cursos</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{pagination.total} registros · página {pagination.page} de {pagination.totalPages}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Buscar curso"
                        placeholder="Buscar…"
                        className="w-44 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                    />
                    <button type="button" onClick={() => { setModalError(null); setCreating(true); }} className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">+ Nuevo curso</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                        <tr className="border-b hairline text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                            <th className="px-5 py-3 sm:px-8">Curso</th>
                            <th className="px-5 py-3 sm:px-8">Slug</th>
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
                                        <span>Cargando cursos…</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--ink-soft)] sm:px-8">
                                    {search.trim() ? "No hay resultados para tu búsqueda." : "Aún no hay cursos registrados."}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((course) => (
                                <tr key={course.id} className="border-b hairline transition hover:bg-[var(--lime)]">
                                    <td className="px-5 py-4 sm:px-8">
                                        <div className="flex items-center gap-4">
                                            {course.coverImageUrl ? (
                                                <span className="block h-14 w-20 shrink-0 overflow-hidden rounded-lg border hairline bg-[var(--line)]">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={course.coverImageUrl}
                                                        alt={`Portada de ${course.title}`}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                                                    />
                                                </span>
                                            ) : (
                                                <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border hairline bg-[var(--lime)] text-lg" aria-hidden="true">🖼️</span>
                                            )}
                                            <span className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{course.title}</p>
                                                {course.description ? <p className="mt-1 max-w-md truncate text-xs text-[var(--ink-soft)]">{course.description}</p> : null}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <p className="font-mono text-xs text-[var(--ink-soft)]">{course.slug}</p>
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        {course.isPublished ? (
                                            <button type="button" onClick={() => void togglePublished(course)} disabled={busy} className="rounded-full bg-[var(--forest)] px-3 py-1 text-xs font-semibold text-[var(--background)] transition hover:brightness-110 disabled:opacity-50" title="Haz clic para pasar a borrador">
                                                Publicado ✓
                                            </button>
                                        ) : (
                                            <button type="button" onClick={() => void togglePublished(course)} disabled={busy} className="rounded-full border border-[var(--copper)] px-3 py-1 text-xs font-bold text-[var(--copper)] transition hover:bg-[var(--copper)] hover:text-[var(--forest-deep)] disabled:opacity-50" title="Haz clic para publicar">
                                                Borrador · Publicar
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right sm:px-8">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <Link href={`/admin/cursos/${course.id}`} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Gestionar</Link>
                                            <button type="button" onClick={() => { setModalError(null); setEditing(course); }} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Editar</button>
                                            <button type="button" onClick={() => setDeleting(course)} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">Eliminar</button>
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
                <CourseFormModal
                    title="Nuevo curso"
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleCreate(input)}
                    onClose={() => setCreating(false)}
                />
            )}
            {editing && (
                <CourseFormModal
                    title="Editar curso"
                    initial={editing}
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleUpdate(input)}
                    onClose={() => setEditing(null)}
                />
            )}
            {deleting && (
                <ConfirmDeleteModal
                    title="Eliminar curso"
                    entityName="el curso"
                    detail={deleting.title}
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