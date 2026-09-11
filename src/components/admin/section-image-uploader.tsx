"use client";

import { useEffect, useState } from "react";

const SLOT_LABEL: Record<string, string> = {
    hero: "Imagen principal (Home)",
    proyectos: "Imagen de Proyectos",
    servicios: "Imagen de Servicios",
};

export function SectionImageUploader({ slot }: { slot: "hero" | "proyectos" | "servicios" }) {
    const [busy, setBusy] = useState<"upload" | "delete" | null>(null);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
    const [exists, setExists] = useState(false);
    const [previewKey, setPreviewKey] = useState<number>(() => Date.now());
    const previewUrl = exists ? `/api/site/${slot}?v=${previewKey}` : undefined;

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/site/${slot}`, { method: "HEAD", cache: "no-store" })
            .then((res) => {
                if (!cancelled) {
                    setExists(res.ok);
                    setPreviewKey(Date.now());
                }
            })
            .catch(() => {
                if (!cancelled) setExists(false);
            });
        return () => {
            cancelled = true;
        };
    }, [slot]);

    async function handleFile(file: File) {
        setBusy("upload");
        setMessage(null);
        try {
            const form = new FormData();
            form.append("file", file, file.name);
            const res = await fetch(`/api/site/${slot}`, { method: "PUT", body: form });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                setMessage({ ok: false, text: payload?.message ?? "No se pudo subir la imagen." });
                return;
            }
            setExists(true);
            setPreviewKey(Date.now());
            setMessage({ ok: true, text: "Imagen actualizada. La anterior fue eliminada." });
        } catch {
            setMessage({ ok: false, text: "No se pudo conectar con el servidor." });
        } finally {
            setBusy(null);
        }
    }

    async function handleDelete() {
        if (!window.confirm("¿Seguro que quieres borrar esta imagen? Se usará la imagen elegante por defecto de la página.")) {
            return;
        }
        setBusy("delete");
        setMessage(null);
        try {
            const res = await fetch(`/api/site/${slot}`, { method: "DELETE" });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                setMessage({ ok: false, text: payload?.message ?? "No se pudo eliminar la imagen." });
                return;
            }
            setExists(false);
            setPreviewKey(Date.now());
            setMessage({ ok: true, text: "Imagen eliminada. La página usará su imagen por defecto." });
        } catch {
            setMessage({ ok: false, text: "No se pudo conectar con el servidor." });
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="rounded-xl border hairline bg-[var(--paper)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                {SLOT_LABEL[slot]}
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Sube una imagen nueva (borra automáticamente la anterior) o elimínala para volver a la imagen por defecto.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
                {previewUrl ? (
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="block h-20 w-28 shrink-0 overflow-hidden rounded-md border hairline bg-[var(--line)]">
                        <img key={previewUrl} src={previewUrl} alt="Imagen actual" className="h-full w-full object-cover" onError={() => setExists(false)} />
                    </a>
                ) : (
                    <span className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md border border-dashed hairline text-[11px] text-[var(--ink-soft)]">
                        Sin imagen
                    </span>
                )}

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border hairline px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                    {busy === "upload" ? "Subiendo…" : "Subir imagen"}
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        disabled={!!busy}
                        className="sr-only"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFile(file);
                            e.target.value = "";
                        }}
                    />
                </label>

                <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={!!busy || !exists}
                    className="rounded-full border hairline px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-40"
                >
                    {busy === "delete" ? "Borrando…" : "Eliminar imagen"}
                </button>
            </div>

            {message && (
                <p className={`mt-3 text-xs font-semibold ${message.ok ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}

