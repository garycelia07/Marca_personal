"use client";

import { useEffect, useRef, useState } from "react";
import {
    listPublicMaterials,
    uploadMaterial,
    updateMaterial,
    deleteMaterial,
    type Material,
    type MaterialPagination,
} from "@/lib/api/materials";
import { listAdminCourses, type Course } from "@/lib/api/courses";
import { MaterialFormModal } from "@/components/admin/material-form-modal";
import { buildPageList } from "@/components/admin/students-utils";

const PAGE_SIZE = 20;

type ToastVariant = "success" | "error";
type Toast = { id: number; variant: ToastVariant; message: string };

function errorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: string }).message);
    }
    return fallback;
}

function formatDateTime(iso: string | undefined): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function fileIconFor(mimeType: string | undefined): string {
    if (!mimeType) return "📎";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("image")) return "🖼️";
    return "📎";
}

export function MaterialsManager() {
    const [pagination, setPagination] = useState<MaterialPagination>({
        items: [],
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [modal, setModal] = useState<{
        open: boolean;
        mode: "create" | "edit";
        material?: Material;
    }>({ open: false, mode: "create" });
    const [courses, setCourses] = useState<Course[]>([]);
    const toastId = useRef(0);

    function nameOfCourse(id?: string | null): string {
        if (!id) return "—";
        const found = courses.find((c) => c.id === id);
        return found?.title ?? "Curso sin título";
    }

    async function loadCourses() {
        try {
            const result = await listAdminCourses({ page: 1, limit: 100 });
            setCourses(result.items);
        } catch {
            setCourses([]);
        }
    }

    function pushToast(variant: ToastVariant, message: string) {
        const id = ++toastId.current;
        setToasts((current) => [...current, { id, variant, message }]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 4500);
    }

    async function refresh(page = pagination.page, spinner = true) {
        if (spinner) setLoading(true);
        try {
            const result = await listPublicMaterials({ page, limit: PAGE_SIZE });
            setPagination(result);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cargar los materiales."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => refresh(1, false));
        void loadCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openCreate() {
        setModal({ open: true, mode: "create" });
    }

    function openEdit(material: Material) {
        setModal({ open: true, mode: "edit", material });
    }

    function closeModal() {
        setModal({ open: false, mode: "create" });
    }

    async function handleSubmit(input: { title: string; file?: File; courseId?: string | null; isPublic: boolean }) {
        setBusy(true);
        try {
            // null = "sin curso"; lo normalizamos a undefined para no sobrescribir/limpiar backend no-lo-envía.
            const payload: { title: string; file?: File; courseId?: string; isPublic: boolean } = {
                title: input.title,
                file: input.file,
                courseId: input.courseId ?? undefined,
                isPublic: input.isPublic,
            };
            if (modal.mode === "edit" && modal.material) {
                await updateMaterial(modal.material.id, payload);
                pushToast("success", "Material actualizado.");
            } else {
                await uploadMaterial({ ...payload, file: payload.file! });
                pushToast("success", "Material subido.");
            }
            void refresh(pagination.page, false);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible guardar el material."));
        } finally {
            setBusy(false);
            setModal({ open: false, mode: "create" });
        }
    }

    async function handleDelete(material: Material) {
        if (!confirm(`¿Estás seguro de eliminar "${material.title}"?`)) return;
        setBusy(true);
        try {
            await deleteMaterial(material.id);
            pushToast("success", "Material eliminado.");
            void refresh(pagination.page, false);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible eliminar el material."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
            <div className="border-b hairline px-5 py-5 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="eyebrow">Materiales de la plataforma</p>
                        <p className="mt-1 text-sm text-[var(--ink-soft)]">
                            {pagination.total} materiales · página {pagination.page} de {pagination.totalPages}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreate}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50"
                    >
                        + Subir material
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                    <thead>
                        <tr className="border-b hairline text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                            <th className="px-5 py-3 sm:px-8">Archivo</th>
                            <th className="px-5 py-3 sm:px-8">Título</th>
                            <th className="px-5 py-3 sm:px-8">Curso</th>
                            <th className="px-5 py-3 sm:px-8">Tipo</th>
                            <th className="px-5 py-3 sm:px-8">Público</th>
                            <th className="px-5 py-3 sm:px-8">Fecha</th>
                            <th className="px-5 py-3 sm:px-8 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-10 sm:px-8">
                                    <div className="flex items-center justify-center gap-3 text-[var(--ink-soft)]">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" />
                                        Cargando materiales…
                                    </div>
                                </td>
                            </tr>
                        ) : pagination.items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--ink-soft)] sm:px-8">
                                    Aún no hay materiales.
                                </td>
                            </tr>
                        ) : (
                            pagination.items.map((material) => (
                                <tr key={material.id} className="border-b hairline transition hover:bg-[var(--lime)]">
                                    <td className="px-5 py-4 sm:px-8">
                                        <span className="text-xl" aria-hidden="true">
                                            {fileIconFor(material.mimeType)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <p className="text-sm font-semibold">{material.title}</p>
                                        {material.fileName && (
                                            <p className="text-xs text-[var(--ink-soft)]">{material.fileName}</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <span className={`rounded-full ${material.courseId ? "bg-[var(--lime)] px-2.5 py-1 text-xs font-semibold text-[var(--forest-deep)]" : "text-xs text-[var(--ink-soft)]"}`}>
                                            {material.courseId ? nameOfCourse(material.courseId) : "Sin curso"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-[var(--ink-soft)] sm:px-8">
                                        {material.mimeType ?? "—"}
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        {material.isPublic ? (
                                            <span className="rounded-full bg-[var(--forest)] px-2.5 py-1 text-xs font-semibold text-[var(--background)]">
                                                Sí
                                            </span>
                                        ) : (
                                            <span className="rounded-full border hairline px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                                                No
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-[var(--ink-soft)] sm:px-8">
                                        {formatDateTime(material.createdAt)}
                                    </td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <div className="flex items-center justify-end gap-2">
                                            {material.fileUrl && (
                                                <a
                                                    href={material.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Ver ${material.title}`}
                                                    className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--copper)] transition hover:border-[var(--copper)] hover:bg-[var(--copper)]"
                                                >
                                                    Ver
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openEdit(material)}
                                                aria-label={`Editar ${material.title}`}
                                                className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--copper)] transition hover:border-[var(--copper)] hover:bg-[var(--copper)]"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(material)}
                                                aria-label={`Eliminar ${material.title}`}
                                                className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>  
            <div className="flex flex-wrap items-center justify-between gap-4 border-t hairline px-5 py-4 sm:px-8">
                <p className="text-xs text-[var(--ink-soft)]">
                    Mostrando {pagination.items.length} de {pagination.total}
                </p>
                {pagination.totalPages > 1 && (
                    <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de materiales">
                        <button
                            type="button"
                            onClick={() => void refresh(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            aria-label="Página anterior"
                            className="rounded-full border hairline px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                            ←
                        </button>
                        {buildPageList(pagination.page, pagination.totalPages).map((entry) =>
                            entry === "…" ? (
                                <span key={`gap-${entry}`} className="px-1 text-[var(--ink-soft)]">
                                    …
                                </span>
                            ) : (
                                <button
                                    key={entry}
                                    type="button"
                                    onClick={() => void refresh(entry)}
                                    aria-label={`Página ${entry}`}
                                    aria-current={entry === pagination.page ? "page" : undefined}
                                    className={`h-9 w-9 rounded-full text-sm ${entry === pagination.page
                                            ? "bg-[var(--forest)] text-[var(--background)]"
                                            : "border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)]"
                                        }`}
                                >
                                    {entry}
                                </button>
                            )
                        )}
                        <button
                            type="button"
                            onClick={() => void refresh(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            aria-label="Página siguiente"
                            className="rounded-full border hairline px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                            →
                        </button>
                    </nav>
                )}
            </div>

            {modal.open && (
                <MaterialFormModal
                    title={modal.mode === "edit" ? "Editar material" : "Subir material"}
                    initial={modal.mode === "edit" && modal.material ? modal.material : undefined}
                    courses={courses}
                    busy={busy}
                    error={null}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}

            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        aria-live="polite"
                        className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm shadow-lg ${toast.variant === "success"
                                ? "border-[var(--forest)] bg-[var(--paper)] text-[var(--forest-deep)]"
                                : "border-[var(--danger)] bg-[var(--lime)] text-[var(--danger)]"
                            }`}
                    >
                        <span aria-hidden="true">
                            {toast.variant === "success" ? "✓" : "⚠"}
                        </span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}