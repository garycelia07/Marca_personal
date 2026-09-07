"use client";

import { useEffect, useRef, useState } from "react";
import { getContentJson, saveContentJson } from "@/lib/api/content";

type Svc = { name: string; slug: string; description: string };
type Timers = { id: number; variant: "success" | "error"; message: string };

function slugify(v: string): string {
    return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function err(e: unknown, f: string): string {
    return e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : f;
}

export function ServicesAdmin() {
    const [items, setItems] = useState<Svc[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState<Svc | null>(null);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Timers[]>([]);
    const toastId = useRef(0);

    function toast(variant: Timers["variant"], message: string) {
        const id = ++toastId.current;
        setToasts((p) => [...p, { id, variant, message }]);
        window.setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4000);
    }

    async function load() {
        setLoading(true);
        try {
            const data = await getContentJson("SERVICES");
            const raw = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
            setItems(raw.map((r) => ({ name: String(r.name ?? ""), slug: String(r.slug ?? ""), description: String(r.description ?? "") })));
        } catch (e) {
            toast("error", err(e, "No se pudieron cargar los servicios."));
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        void Promise.resolve().then(load);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function persist(next: Svc[]) {
        setBusy(true);
        try {
            await saveContentJson("SERVICES", { title: "Servicios y formación.", items: next });
            setItems(next);
            toast("success", "Servicios guardados.");
        } catch (e) {
            toast("error", err(e, "No se pudo guardar."));
        } finally {
            setBusy(false);
        }
    }

    function upsert(d: Svc) {
        return items.some((i) => i.slug && i.slug === d.slug)
            ? items.map((i) => (i.slug === d.slug ? d : i))
            : [...items, d];
    }
    function save() {
        if (!draft) return;
        if (!draft.name.trim()) { toast("error", "El nombre es obligatorio."); return; }
        const d: Svc = { name: draft.name.trim(), slug: slugify(draft.name) || ("servicio-" + Date.now()), description: draft.description.trim() };
        setDraft(null);
        void persist(upsert(d));
    }
    function remove(name: string) {
        void persist(items.filter((i) => i.slug !== slugify(name) && i.name !== name));
    }

    async function upload(file: File, name: string, slug: string) {
        setBusy(true);
        try {
            const fd = new FormData();
            fd.append("file", file, file.name);
            const res = await fetch(`/api/service-cover/${encodeURIComponent(slug)}`, { method: "PUT", body: fd });
            const payload = await res.json().catch(() => null);
            if (!res.ok) throw { message: payload && typeof payload === "object" && "message" in payload ? (payload as { message: string }).message : "No se subió." };
            toast("success", `Portada de "${name}" subida.`);
        } catch (e) {
            toast("error", err(e, "No se pudo subir la imagen."));
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <p className="text-sm text-[var(--ink-soft)]">Cargando servicios…</p>;

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="display-font text-2xl">Servicios</h2>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">Cada servicio: nombre, descripción y una portada (subida aquí).</p>
                </div>
                <button type="button" onClick={() => setDraft({ name: "", slug: "", description: "" })} className="rounded-full bg-[var(--forest)] px-5 py-2 text-sm font-semibold text-[var(--background)]">+ Nuevo servicio</button>
            </div>

            {items.length === 0 ? (
                <p className="rounded-2xl border hairline px-6 py-12 text-center text-sm text-[var(--ink-soft)]">Aún no hay servicios. Crea el primero.</p>
            ) : (
                <ul className="space-y-3">
                    {items.map((s) => (
                        <li key={s.slug || s.name} className="flex flex-col gap-3 rounded-2xl border hairline bg-[var(--paper)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="min-w-0"><p className="font-semibold">{s.name || "(sin nombre)"}</p></div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)]">
                                    Portada
                                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; const slug = s.slug || slugify(s.name); if (f && slug) void upload(f, s.name, slug); e.target.value = ""; }} />
                                </label>
                                <button type="button" onClick={() => setDraft({ ...s })} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold hover:border-[var(--copper)] hover:text-[var(--copper)]">Editar</button>
                                <button type="button" onClick={() => remove(s.name)} disabled={busy} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] hover:border-[var(--danger)]">Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {draft && <DraftCard draft={draft} set={setDraft} busy={busy} onSave={save} onClose={() => setDraft(null)} />}
        </section>
    );
}

function DraftCard({ draft, set, busy, onSave, onClose }: {
    draft: Svc;
    set: (v: Svc) => void;
    busy: boolean;
    onSave: () => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6">
                <p className="eyebrow">Servicio</p>
                <h3 className="display-font mt-2 text-2xl">{draft.slug ? "Editar servicio" : "Nuevo servicio"}</h3>
                <div className="mt-4 space-y-4">
                    <label className="block text-sm"><span className="font-semibold">Nombre</span>
                        <input value={draft.name} onChange={(e) => set({ ...draft, name: e.target.value })} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" /></label>
                    <label className="block text-sm"><span className="font-semibold">Descripción</span>
                        <textarea value={draft.description} onChange={(e) => set({ ...draft, description: e.target.value })} rows={4} className="mt-1 w-full resize-none rounded border hairline bg-transparent px-3 py-2 outline-none" /></label>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-full border hairline px-5 py-2 text-sm">Cancelar</button>
                    <button type="button" onClick={onSave} disabled={busy} className="rounded-full bg-[var(--forest)] px-6 py-2 text-sm font-semibold text-[var(--background)]">{busy ? "Guardando…" : "Guardar"}</button>
                </div>
            </div>
        </div>
    );
}
