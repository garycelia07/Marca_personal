"use client";

import { useEffect, useRef, useState } from "react";
import {
    deleteMaterial,
    listCourseMaterials,
    listPublicMaterials,
    materialFileUrl,
    updateMaterial,
    uploadMaterial,
    type Material,
    type MaterialPagination,
} from "@/lib/api/materials";
import { listAdminCourses } from "@/lib/api/courses";
import { MaterialFormModal } from "@/components/admin/material-form-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-modal";
import { buildPageList } from "@/components/admin/students-utils";

const PAGE_SIZE = 10;

type ToastVariant = "success" | "error";
type Toast = { id: number; variant: ToastVariant; message: string };
type SourceMode = "public" | "course";

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
        <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de materiales">
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
export function MaterialsManager() {
    const [pagination, setPagination] = useState<MaterialPagination>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const [sourceMode, setSourceMode] = useState<SourceMode>("public");
    const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Material | null>(null);
    const [deleting, setDeleting] = useState<Material | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

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
            const result = sourceMode === "course" && selectedCourseId
                ? await listCourseMaterials(selectedCourseId, { page, limit: PAGE_SIZE })
                : await listPublicMaterials({ page, limit: PAGE_SIZE });
            setPagination(result);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cargar los materiales."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(async () => {
            try {
                const result = await listAdminCourses({ page: 1, limit: 50 });
                setCourses(result.items.map((course) => ({ id: course.id, title: course.title })));
            } catch {
                // El selector queda vacío; la vista "Públicos" sigue funcionando.
            }
        });
    }, []);

    useEffect(() => {
        void Promise.resolve().then(() => refresh(1, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceMode, selectedCourseId]);

    function switchSource(mode: SourceMode) {
        if (mode === sourceMode) return;
        setSourceMode(mode);
        if (mode === "course" && !selectedCourseId && courses.length > 0) {
            setSelectedCourseId(courses[0].id);
        }
    }

    async function handleCreate(input: { title: string; file?: File; courseId?: string; isPublic: boolean }) {
        if (!input.file) {
            setModalError("Selecciona un archivo para subir.");
            return;
        }
        setBusy(true);
        setModalError(null);
        try {
            await uploadMaterial({ ...input, file: input.file });
            pushToast("success", "Material subido correctamente.");
            setCreating(false);
            void refresh(1);
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible subir el material."));
        } finally {
            setBusy(false);
        }
    }

    async function handleUpdate(input: { title: string; file?: File; courseId?: string; isPublic: boolean }) {
        if (!editing) return;
        setBusy(true);
        setModalError(null);
        try {
            await updateMaterial(editing.id, input);
            pushToast("success", "Material actualizado correctamente.");
            setEditing(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible actualizar el material."));
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (!deleting) return;
        setBusy(true);
        try {
            await deleteMaterial(deleting.id);
            pushToast("success", "Material eliminado.");
            setDeleting(null);
            void refresh();
        } catch (error) {
            setModalError(errorMessage(error, "No fue posible eliminar el material."));
            setDeleting(null);
        } finally {
            setBusy(false);
        }
    }
return (
        <section className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
            <div className="flex flex-col gap-4 border-b hairline px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                    <p className="eyebrow">Materiales</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{pagination.total} registros · página {pagination.page} de {pagination.totalPages}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex rounded-full border hairline p-1" role="group" aria-label="Fuente de materiales">
                        <button type="button" onClick={() => switchSource("public")} aria-pressed={sourceMode === "public"} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${sourceMode === "public" ? "bg-[var(--forest)] text-[var(--background)]" : "text-[var(--ink-soft)] hover:text-[var(--forest)]"}`}>Públicos</button>
                        <button type="button" onClick={() => switchSource("course")} aria-pressed={sourceMode === "course"} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${sourceMode === "course" ? "bg-[var(--forest)] text-[var(--background)]" : "text-[var(--ink-soft)] hover:text-[var(--forest)]"}`}>Por curso</button>
                    </div>
                    {sourceMode === "course" && (
                        <select
                            value={selectedCourseId}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            aria-label="Seleccionar curso"
                            className="max-w-52 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                        >
                            {courses.length === 0 && <option value="">Sin cursos</option>}
                            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                        </select>
                    )}
                    <button type="button" onClick={() => { setModalError(null); setCreating(true); }} className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">+ Subir material</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                        <tr className="border-b hairline text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                            <th className="px-5 py-3 sm:px-8">Material</th>
                            <th className="px-5 py-3 sm:px-8">Archivo</th>
                            <th className="px-5 py-3 sm:px-8">Visibilidad</th>
                            <th className="px-5 py-3 text-right sm:px-8">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 sm:px-8">
                                    <div className="flex items-center justify-center gap-3 text-[var(--ink-soft)]">
                                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" aria-hidden="true" />
                                        <span>Cargando materiales…</span>
                                    </div>
                                </td>
                            </tr>
                        ) : pagination.items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--ink-soft)] sm:px-8">
                                    {sourceMode === "course" && !selectedCourseId ? "Selecciona un curso para ver sus materiales." : "Aún no hay materiales en esta vista."}
                                </td>
                            </tr>
                        ) : (
                            pagination.items.map((material) => (
                                <tr key={material.id} className="border-b hairline transition hover:bg-[var(--lime)]">
                                    <td className="px-5 py-4 sm:px-8">
                                        <p className="text-sm font-semibold">{material.title}</p>
                                        {material.courseId && <p className="mt-1 font-mono text-xs text-[var(--ink-soft)]">curso: {material.courseId.slice(0, 8)}…</p>}
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <p className="text-xs text-[var(--ink-soft)]">{material.fileName ?? "—"}</p>
                                        {material.mimeType && <p className="mt-1 text-xs text-[var(--ink-soft)]">{material.mimeType}</p>}
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${material.isPublic ? "bg-[var(--forest)] text-[var(--background)]" : "bg-[var(--line)] text-[var(--ink-soft)]"}`}>
                                            {material.isPublic ? "Público" : "Privado"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right sm:px-8">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <a href={materialFileUrl(material.id)} target="_blank" rel="noreferrer" className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Ver</a>
                                            <button type="button" onClick={() => { setModalError(null); setEditing(material); }} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Editar</button>
                                            <button type="button" onClick={() => setDeleting(material)} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
<div className="flex flex-wrap items-center justify-between gap-4 border-t hairline px-5 py-4 sm:px-8">
                <p className="text-xs text-[var(--ink-soft)]">Mostrando {pagination.items.length} de {pagination.total}</p>
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={(page) => { void refresh(page); }} />
            </div>

            {creating && (
                <MaterialFormModal
                    title="Subir material"
                    courseId={sourceMode === "course" ? selectedCourseId || undefined : undefined}
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleCreate(input)}
                    onClose={() => setCreating(false)}
                />
            )}
            {editing && (
                <MaterialFormModal
                    title="Editar material"
                    initial={editing}
                    busy={busy}
                    error={modalError}
                    onSubmit={(input) => void handleUpdate(input)}
                    onClose={() => setEditing(null)}
                />
            )}
            {deleting && (
                <ConfirmDeleteModal
                    title="Eliminar material"
                    entityName="el material"
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