"use client";

import { useEffect, useRef, useState } from "react";
import { getContentJson, saveContentJson } from "@/lib/api/content";
import { directUploadPut, backendPublicOrigin } from "@/lib/api/direct-upload";

type ProjectDraft = { name: string; slug: string; tagline: string; description: string; link: string; coverUrl?: string; videoUrl?: string };
type ToastV = "success" | "error";
type Toast = { id: number; variant: ToastV; message: string };

const EMPTY: ProjectDraft = { name: "", slug: "", tagline: "", description: "", link: "", coverUrl: "", videoUrl: "" };

function slugify(v: string): string {
    return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function errMessage(e: unknown, f: string): string {
    return e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : f;
}

export function ProjectsAdmin() {
    const [items, setItems] = useState<ProjectDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<ProjectDraft | null>(null);
    const [busy, setBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    function toast(variant: ToastV, message: string) {
        const id = ++toastId.current;
        setToasts((p) => [...p, { id, variant, message }]);
        window.setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4000);
    }

    async function load() {
        setLoading(true);
        try {
            const data = await getContentJson("PROJECTS");
            const raw = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
            setItems(raw.map((r) => ({
                name: String(r.name ?? ""),
                slug: String(r.slug ?? ""),
                tagline: String(r.tagline ?? ""),
                description: String(r.description ?? ""),
                link: String(r.link ?? ""),
                coverUrl: String(r.coverUrl ?? ""),
                videoUrl: String(r.videoUrl ?? ""),
            })));
        } catch (e) {
            toast("error", errMessage(e, "No se pudo cargar los proyectos."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(load);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function persist(next: ProjectDraft[]) {
        setBusy(true);
        try {
            await saveContentJson("PROJECTS", { title: "Proyectos.", items: next });
            setItems(next);
            toast("success", "Proyectos guardados.");
        } catch (e) {
            toast("error", errMessage(e, "No se pudo guardar."));
        } finally {
            setBusy(false);
        }
    }

    function remove(name: string) {
        const next = items.filter((i) => i.slug !== slugify(name) && i.name !== name);
        void persist(next);
    }

    function upsert(draft: ProjectDraft) {
        const exists = items.some((i) => i.slug && i.slug === draft.slug);
        const next = exists
            ? items.map((i) => (i.slug === draft.slug ? draft : i))
            : [...items, draft];
        return next;
    }

    async function saveEditor() {
        if (!editing) return;
        if (!editing.name.trim()) { toast("error", "El nombre es obligatorio."); return; }
        const draft: ProjectDraft = {
            name: editing.name.trim(),
            slug: slugify(editing.name) || ("proyecto-" + Date.now()),
            tagline: editing.tagline.trim(),
            description: editing.description.trim(),
            link: editing.link.trim(),
            coverUrl: (editing.coverUrl ?? "").trim(),
            videoUrl: (editing.videoUrl ?? "").trim(),
        };
        setEditing(null);
        await persist(upsert(draft));
    }

    function addNew() {
        setEditing({ ...EMPTY });
    }

    /* Subir portada/video de un proyecto (subida directa al backend). Tras subir,
       actualiza items/contenido y editing para mostrar la previsualización. */
    async function upload(kind: "cover" | "video", name: string, file: File, slug: string) {
        setBusy(true);
        try {
            const fd = new FormData();
            fd.append(kind === "video" ? "video" : "file", file, file.name);
            // Subida DIRECTA al backend VPS (evita el límite de ~4.5 MB de Vercel): /api/v1/content/projects/{slug}/{kind}
            const res = await directUploadPut(`/api/v1/content/projects/${encodeURIComponent(slug)}/${kind}`, fd);
            const payload = await res.json().catch(() => null);
            if (!res.ok) throw { message: payload && typeof payload === "object" && "message" in payload ? (payload as { message: string }).message : "No se pudo subir." };
            toast("success", `${kind === "video" ? "Video" : "Imagen"} de "${name}" subida.`);

            // URL pública (servida por el backend a partir del slug).
            const mediaUrl = `${backendPublicOrigin()}/api/v1/content/projects/${encodeURIComponent(slug)}/${kind}`;

            // 1) Refleja en la lista el medio nuevo.
            setItems((curr) => {
                const next = curr.map((i) => {
                    const is = slug && (i.slug === slug || slugify(i.name) === slug || i.name === name);
                    if (!is) return i;
                    return kind === "cover"
                        ? { ...i, coverUrl: mediaUrl }
                        : { ...i, videoUrl: mediaUrl };
                });
                // 2) Lo persiste en el contenido PROJECTS para que sobreviva a la recarga.
                void saveContentJson("PROJECTS", { title: "Proyectos.", items: next }).catch(() => undefined);
                return next;
            });

            // 3) Si la subida viene desde el editor, actualiza el borrador para previsualizarlo al momento.
            setEditing((curr) =>
                curr && slug && (curr.slug === slug || slugify(curr.name) === slug)
                    ? kind === "cover"
                        ? { ...curr, coverUrl: mediaUrl }
                        : { ...curr, videoUrl: mediaUrl }
                    : curr
            );
        } catch (e) {
            toast("error", errMessage(e, "No se pudo subir el archivo."));
        } finally {
            setBusy(false);
        }
    }

    /* Subir imagen/video desde el editor (botón laptop). Requiere proyecto guardado (slug). */
    async function onPickMedia(kind: "cover" | "video", file: File) {
        if (!editing) return;
        const slug = editing.slug || slugify(editing.name);
        if (!slug) { toast("error", "Guarda el proyecto primero (necesita nombre)."); return; }
        await upload(kind, editing.name, file, slug);
    }
    const hasItems = items.length > 0;

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="display-font text-2xl">Proyectos</h2>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        Cada proyecto tiene portada, video corto público y un enlace «Quiero unirme».
                    </p>
                </div>
                <button type="button" onClick={addNew} className="rounded-full bg-[var(--forest)] px-5 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">
                    + Nuevo proyecto
                </button>
            </div>

            {hasItems ? (
                <ul className="space-y-3">
                    {items.map((p) => (
                        <li key={p.slug || p.name} className="flex flex-col gap-3 rounded-2xl border hairline bg-[var(--paper)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="flex flex-1 min-w-0 items-center gap-4">
                                <div className="relative block h-14 w-24 shrink-0 overflow-hidden rounded-lg border hairline bg-[var(--line)]">
                                    {p.coverUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.coverUrl} alt={`Portada de ${p.name}`} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-xl" aria-hidden="true">🏗️</span>
                                    )}
                                    {p.videoUrl ? (
                                        <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white" aria-hidden="true">▶</span>
                                    ) : null}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{p.name || "(sin nombre)"}</p>
                                    <span className="block max-w-md truncate text-xs text-[var(--ink-soft)]">{p.link || "sin enlace"}</span>
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)]">
                                    Portada
                                    <input type="file" accept="image/*" className="sr-only"
                                        onChange={(e) => { const f = e.target.files?.[0]; const slug = p.slug || slugify(p.name); if (f && slug) void upload("cover", p.name, f, slug); e.target.value = ""; }} />
                                </label>
                                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)]">
                                    Video
                                    <input type="file" accept="video/mp4,video/webm" className="sr-only"
                                        onChange={(e) => { const f = e.target.files?.[0]; const slug = p.slug || slugify(p.name); if (f && slug) void upload("video", p.name, f, slug); e.target.value = ""; }} />
                                </label>
                                <button type="button" onClick={() => setEditing({ ...p })} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Editar</button>
                                <button type="button" onClick={() => remove(p.name)} disabled={busy} className="rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] hover:border-[var(--danger)]">Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}

            {editing && (
                <Editor
                    editing={editing}
                    patch={setEditing}
                    busy={busy}
                    onSave={() => void saveEditor()}
                    onClose={() => setEditing(null)}
                    onPickMedia={onPickMedia}
                />
            )}
        </section>
    );
}

function Editor({ editing, patch, busy, onSave, onClose, onPickMedia }: {
    editing: ProjectDraft;
    patch: (v: ProjectDraft) => void;
    busy: boolean;
    onSave: () => void;
    onClose: () => void;
    onPickMedia: (kind: "cover" | "video", file: File) => void;
}) {
    const set = (next: ProjectDraft) => patch(next);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6">
                <p className="eyebrow">Proyecto</p>
                <h3 className="display-font mt-2 text-2xl">{editing.slug ? "Editar proyecto" : "Nuevo proyecto"}</h3>

                <div className="mt-4 space-y-4">
                    <label className="block text-sm"><span className="font-semibold">Nombre</span>
                        <input value={editing.name} onChange={(e) => set({ ...editing, name: e.target.value })} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" /></label>
                    <label className="block text-sm"><span className="font-semibold">Destacado (corto)</span>
                        <input value={editing.tagline} onChange={(e) => set({ ...editing, tagline: e.target.value })} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" /></label>
                    <label className="block text-sm"><span className="font-semibold">Descripción larga</span>
                        <textarea value={editing.description} onChange={(e) => set({ ...editing, description: e.target.value })} rows={4} className="mt-1 w-full resize-none rounded border hairline bg-transparent px-3 py-2 outline-none" /></label>
                    <label className="block text-sm"><span className="font-semibold">Enlace «Quiero unirme» <span className="text-xs font-normal text-[var(--ink-soft)]">(opcional — si usas WhatsApp déjalo vacío)</span></span>
                        <input value={editing.link} onChange={(e) => set({ ...editing, link: e.target.value })} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" placeholder="Opcional: https://… o déjalo en blanco para usar tu WhatsApp" /></label>
                    <label className="block text-sm"><span className="font-semibold">Imagen de portada <span className="text-xs font-normal text-[var(--ink-soft)]">(es lo visual de la tarjeta)</span></span>
                        <input value={editing.coverUrl ?? ""} onChange={(e) => set({ ...editing, coverUrl: e.target.value })} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" placeholder="Si prefieres, pega aquí la URL de una imagen" />
                        <label htmlFor={`cover-file-${editing.slug || editing.name || "new"}`} className="mx-0 mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--copper)] px-4 py-2 text-xs font-bold text-[var(--copper)] transition hover:bg-[var(--copper)] hover:text-[var(--forest-deep)]">
                            📂 Elegir imagen de mi laptop
                        </label>
                        <input
                            id={`cover-file-${editing.slug || editing.name || "new"}`}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f && !busy) onPickMedia("cover", f); e.target.value = ""; }}
                        />
                        {busy ? <span className="ml-2 text-xs text-[var(--copper)]">Subiendo…</span> : null}
                        {editing.coverUrl ? (
                            <span className="mt-3 block h-40 w-full overflow-hidden rounded-lg border hairline bg-[var(--line)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={editing.coverUrl} alt={`Vista previa de ${editing.name}`} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                            </span>
                        ) : null}
                    </label>
                    <label className="block text-sm"><span className="font-semibold">Video corto <span className="text-xs font-normal text-[var(--ink-soft)]">(se abre al hacer clic en la tarjeta)</span></span>
                        <input value={editing.videoUrl ?? ""} onChange={(e) => set({ ...editing, videoUrl: e.target.value })} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" placeholder="Si prefieres, pega aquí el enlace del video (mp4 o plataforma)" />
                        <label htmlFor={`video-file-${editing.slug || editing.name || "new"}`} className="mx-0 mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--copper)] px-4 py-2 text-xs font-bold text-[var(--copper)] transition hover:bg-[var(--copper)] hover:text-[var(--forest-deep)]">
                            ▶ Elegir video de mi laptop (.mp4, máx. 10 min)
                        </label>
                        <input
                            id={`video-file-${editing.slug || editing.name || "new"}`}
                            type="file"
                            accept="video/mp4,video/webm"
                            className="sr-only"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f && !busy) onPickMedia("video", f); e.target.value = ""; }}
                        />
                        {busy ? <span className="ml-2 text-xs text-[var(--copper)]">Subiendo…</span> : null}
                        <span className="block pt-1 text-[11px] text-[var(--ink-soft)]">Primero guarda con un nombre el proyecto; luego ya puedes elegir el archivo.</span>
                        {editing.videoUrl ? (
                            <video controls playsInline preload="metadata" className="mt-2 max-h-56 w-full rounded-lg border hairline bg-black" src={editing.videoUrl} aria-label={`Vista previa del video de ${editing.name}`}>
                                Tu navegador no soporta video.
                            </video>
                        ) : null}
                    </label>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-full border hairline px-5 py-2 text-sm">Cancelar</button>
                    <button type="button" onClick={onSave} disabled={busy} className="rounded-full bg-[var(--forest)] px-6 py-2 text-sm font-semibold text-[var(--background)]">{busy ? "Guardando…" : "Guardar"}</button>
                </div>
            </div>
        </div>
    );
}
