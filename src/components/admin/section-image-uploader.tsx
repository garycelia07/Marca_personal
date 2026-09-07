"use client";

import { useState } from "react";

const SLOT_LABEL: Record<string, string> = {
    hero: "Imagen principal (Home)",
    proyectos: "Imagen de Proyectos",
    servicios: "Imagen de Servicios",
};

export function SectionImageUploader({ slot }: { slot: "hero" | "proyectos" | "servicios" }) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(`/api/site/${slot}?v=${Date.now()}`);

    async function handleFile(file: File) {
        setBusy(true);
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
            setMessage({ ok: true, text: "Imagen actualizada. La anterior fue eliminada." });
            setPreviewUrl(`/api/site/${slot}?v=${Date.now()}`);
        } catch {
            setMessage({ ok: false, text: "No se pudo conectar con el servidor." });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-xl border hairline bg-[var(--paper)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                {SLOT_LABEL[slot]}
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Sube una imagen nueva. Al guardar se borra automáticamente la imagen anterior.
            </p>

            <div className="mt-4 flex items-center gap-4">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="block h-20 w-28 shrink-0 overflow-hidden rounded-md border hairline bg-[var(--line)]">
                    <img src={previewUrl} alt="Imagen actual" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </a>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border hairline px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                    {busy ? "Subiendo…" : "Subir imagen"}
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        disabled={busy}
                        className="sr-only"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFile(file);
                            e.target.value = "";
                        }}
                    />
                </label>
            </div>

            {message && (
                <p className={`mt-3 text-xs font-semibold ${message.ok ? "text-[var(--forest)]" : "text-[var(--danger)]"}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}

