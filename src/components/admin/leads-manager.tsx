"use client";

import { useEffect, useRef, useState } from "react";
import { listLeads, type LeadPagination } from "@/lib/api/leads";
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

function formatDateTime(iso: string | undefined): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function LeadsManager() {
    const [pagination, setPagination] = useState<LeadPagination>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

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
            const result = await listLeads({ page, limit: PAGE_SIZE });
            setPagination(result);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible cargar los contactos."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => refresh(1, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
return (
        <section className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
            <div className="border-b hairline px-5 py-5 sm:px-8">
                <p className="eyebrow">Contactos recibidos</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{pagination.total} registros · página {pagination.page} de {pagination.totalPages}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                        <tr className="border-b hairline text-xs uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                            <th className="px-5 py-3 sm:px-8">Contacto</th>
                            <th className="px-5 py-3 sm:px-8">Mensaje</th>
                            <th className="px-5 py-3 sm:px-8">Origen</th>
                            <th className="px-5 py-3 sm:px-8">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 sm:px-8">
                                    <div className="flex items-center justify-center gap-3 text-[var(--ink-soft)]">
                                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" aria-hidden="true" />
                                        <span>Cargando contactos…</span>
                                    </div>
                                </td>
                            </tr>
                        ) : pagination.items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--ink-soft)] sm:px-8">Aún no hay contactos registrados.</td>
                            </tr>
                        ) : (
                            pagination.items.map((lead) => (
                                <tr key={lead.id} className="border-b hairline transition hover:bg-[var(--lime)]">
                                    <td className="px-5 py-4 sm:px-8">
                                        <p className="text-sm font-semibold">{lead.name ?? "Sin nombre"}</p>
                                        <p className="text-xs text-[var(--ink-soft)]">{lead.email ?? "—"}</p>
                                        <p className="text-xs text-[var(--ink-soft)]">{lead.phone ?? "—"}</p>
                                    </td>
                                    <td className="max-w-xs px-5 py-4 text-sm text-[var(--ink-soft)] sm:px-8">{lead.message ?? "—"}</td>
                                    <td className="px-5 py-4 sm:px-8">
                                        <span className="rounded-full bg-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">{lead.channel ?? "—"}</span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-[var(--ink-soft)] sm:px-8">{formatDateTime(lead.createdAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t hairline px-5 py-4 sm:px-8">
                <p className="text-xs text-[var(--ink-soft)]">Mostrando {pagination.items.length} de {pagination.total}</p>
                {pagination.totalPages > 1 && (
                    <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de contactos">
                        <button type="button" onClick={() => { void refresh(pagination.page - 1); }} disabled={pagination.page <= 1} aria-label="Página anterior" className="rounded-full border hairline px-3 py-1.5 text-sm disabled:opacity-40">←</button>
                        {buildPageList(pagination.page, pagination.totalPages).map((entry) =>
                            entry === "…" ? <span key={`gap-${entry}`} className="px-1 text-[var(--ink-soft)]">…</span>
                            : <button key={entry} type="button" onClick={() => { void refresh(entry); }} aria-label={`Página ${entry}`} aria-current={entry === pagination.page ? "page" : undefined} className={`h-9 w-9 rounded-full text-sm ${entry === pagination.page ? "bg-[var(--forest)] text-[var(--background)]" : "border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)]"}`}>{entry}</button>)}
                        <button type="button" onClick={() => { void refresh(pagination.page + 1); }} disabled={pagination.page >= pagination.totalPages} aria-label="Página siguiente" className="rounded-full border hairline px-3 py-1.5 text-sm disabled:opacity-40">→</button>
                    </nav>
                )}
            </div>

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
