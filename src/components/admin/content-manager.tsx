"use client";

import { useEffect, useRef, useState } from "react";
import {
    CONTENT_SECTIONS,
    getContentSection,
    saveContentSection,
    type ContentSection,
} from "@/lib/api/content";
import { SectionImageUploader } from "@/components/admin/section-image-uploader";
import { ProjectsAdmin } from "@/components/admin/projects-admin";
import { ServicesAdmin } from "@/components/admin/services-admin";
import Link from "next/link";

const SECTION_SLOT: Partial<Record<ContentSection, "hero" | "proyectos" | "servicios">> = {
    HERO: "hero",
    PROJECTS: "proyectos",
    SERVICES: "servicios",
};

type ToastVariant = "success" | "error";
type Toast = { id: number; variant: ToastVariant; message: string };

function errorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: string }).message);
    }
    return fallback;
}

function upsertField(fields: { key: string; value: string }[], key: string, value: string) {
    const found = fields.some((field) => field.key === key);
    if (found) {
        return fields.map((field) => field.key === key ? { ...field, value } : field);
    }
    return [...fields, { key, value }];
}

function HomeVideoEditor({
    value,
    busy,
    onSave,
    onUpload,
    onShareLink,
}: {
    value: string;
    busy: boolean;
    onSave: (url: string) => void;
    onUpload: (file: File) => void;
    onShareLink: () => void;
}) {
    const [draft, setDraft] = useState(value);

    return (
        <div className="rounded-xl border hairline bg-[var(--paper)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Actualizar video Home
            </p>
            <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
                <input
                    type="url"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Pega enlace de YouTube, Vimeo o MP4"
                    aria-label="Enlace del video Home"
                    className="w-full rounded-md border hairline bg-transparent px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                />
                <button
                    type="button"
                    onClick={() => onSave(draft)}
                    disabled={busy}
                    className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50"
                >
                    {busy ? "Guardando..." : "Guardar video"}
                </button>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border hairline px-5 py-2.5 text-sm font-semibold text-[var(--copper)] transition hover:border-[var(--copper)] disabled:opacity-50">
                    Subir local
                    <input
                        type="file"
                        accept="video/mp4,video/webm"
                        disabled={busy}
                        className="sr-only"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) onUpload(file);
                            event.target.value = "";
                        }}
                    />
                </label>
                <button
                    type="button"
                    onClick={onShareLink}
                    className="rounded-full bg-[var(--copper)] px-5 py-2.5 text-sm font-bold text-[var(--forest-deep)] shadow-sm transition hover:brightness-110"
                >
                    Compartir link de video
                </button>
            </div>
            {value ? (
                <p className="mt-3 truncate text-xs text-[var(--ink-soft)]">
                    Actual: {value}
                </p>
            ) : null}
        </div>
    );
}

export function ContentManager() {
    const [section, setSection] = useState<ContentSection>("HERO");
    const [fields, setFields] = useState<{ key: string; value: string }[]>([]);
    const [newKey, setNewKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [videoBusy, setVideoBusy] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    function pushToast(variant: ToastVariant, message: string) {
        const id = ++toastId.current;
        setToasts((current) => [...current, { id, variant, message }]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 4500);
    }

    async function load(target: ContentSection) {
        if (target === "PROJECTS" || target === "SERVICES") {
            // Esas secciones se gestionan por tarjetas (imagen por archivo o URL) abajo.
            setFields([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await getContentSection(target);
            setFields(Object.entries(data).map(([key, value]) => ({ key, value: String(value) })));
        } catch (error) {
            setFields([]);
            pushToast("error", errorMessage(error, "No fue posible cargar el contenido de la sección."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => load(section));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section]);

    function updateField(index: number, patch: Partial<{ key: string; value: string }>) {
        setFields((current) => current.map((field, i) => (i === index ? { ...field, ...patch } : field)));
    }

    function addField() {
        const key = newKey.trim();
        if (!key) return;
        if (fields.some((field) => field.key === key)) {
            pushToast("error", "Ese campo ya existe.");
            return;
        }
        setFields((current) => [...current, { key, value: "" }]);
        setNewKey("");
    }

    async function handleSave() {
        const data: Record<string, string> = {};
        for (const field of fields) {
            const key = field.key.trim();
            if (key) data[key] = field.value;
        }
        setBusy(true);
        try {
            await saveContentSection(section, data);
            pushToast("success", `Contenido de ${section} guardado.`);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible guardar el contenido."));
        } finally {
            setBusy(false);
        }
    }

    async function saveHomeVideoUrl(url: string) {
        const nextFields = upsertField(fields, "homeVideoUrl", url.trim());
        const data: Record<string, string> = {};
        for (const field of nextFields) {
            const key = field.key.trim();
            if (key) data[key] = field.value;
        }
        setVideoBusy(true);
        try {
            await saveContentSection("HERO", data);
            setFields(nextFields);
            pushToast("success", "Video Home actualizado.");
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible guardar el video Home."));
        } finally {
            setVideoBusy(false);
        }
    }

    async function uploadHomeVideo(file: File) {
        setVideoBusy(true);
        try {
            const form = new FormData();
            form.append("video", file, file.name);
            const response = await fetch("/api/projects-media/video/home-video", { method: "PUT", body: form });
            const payload = await response.json().catch(() => null) as { url?: string; message?: string } | null;
            if (!response.ok || !payload?.url) {
                throw new Error(payload?.message ?? "No fue posible subir el video.");
            }
            await saveHomeVideoUrl(payload.url);
        } catch (error) {
            pushToast("error", errorMessage(error, "No fue posible subir el video Home."));
        } finally {
            setVideoBusy(false);
        }
    }

    async function copyVideoShareLink() {
        const shareUrl = `${window.location.origin}/reproducir`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            pushToast("success", "¡Link de video copiado!");
        } catch {
            pushToast("error", "No fue posible copiar el link de video.");
        }
    }

    const isCardsSection = section === "PROJECTS" || section === "SERVICES";

    if (isCardsSection) {
        return (
            <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Sección</p>
                        <select
                            value={section}
                            onChange={(event) => setSection(event.target.value as ContentSection)}
                            aria-label="Seleccionar sección"
                            className="mt-2 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                        >
                            {CONTENT_SECTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <p className="mt-2 text-xs text-[var(--ink-soft)]">
                            {section === "PROJECTS"
                                ? "Proyectos: imagen desde laptop (Portada), video desde laptop (Video) y/o pega una URL de imagen/video."
                                : "Servicios: nombre y descripción que se muestran en /servicios; sube su portada desde laptop o pega la URL."}
                        </p>
                    </div>
                    <Link href="/cursos" className="hidden" aria-hidden="true">x</Link>
                </div>
                <div className="mt-6 rounded-2xl border hairline bg-transparent">
                    <SectionImageUploader slot={SECTION_SLOT[section] === "proyectos" ? "proyectos" : "servicios"} />
                </div>

                <div className="mt-6">
                    {section === "PROJECTS" ? <ProjectsAdmin /> : <ServicesAdmin />}
                </div>
            </section>
        );
    }

return (
        <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="eyebrow">Sección</p>
                    <select
                        value={section}
                        onChange={(event) => setSection(event.target.value as ContentSection)}
                        aria-label="Seleccionar sección"
                        className="mt-2 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                    >
                        {CONTENT_SECTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <button type="button" onClick={() => void handleSave()} disabled={busy || loading} className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-6 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">
                    {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent" aria-hidden="true" />}
                    {busy ? "Guardando…" : "Guardar sección"}
                </button>
            </div>
<div className="mt-8 overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 px-5 py-10 text-[var(--ink-soft)]">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" aria-hidden="true" />
                        <span className="text-sm">Cargando contenido…</span>
                    </div>
                ) : (
                    <div>
                        {SECTION_SLOT[section] && (
                            <div className="border-b hairline px-5 py-5 sm:px-8">
                                <SectionImageUploader slot={SECTION_SLOT[section]} />
                            </div>
                        )}
                        {section === "HERO" && (
                            <div className="border-b hairline px-5 py-5 sm:px-8">
                                <div key={fields.find((field) => field.key === "homeVideoUrl")?.value ?? "empty-home-video"}>
                                    <HomeVideoEditor
                                        value={fields.find((field) => field.key === "homeVideoUrl")?.value ?? ""}
                                        busy={videoBusy}
                                        onSave={(url) => void saveHomeVideoUrl(url)}
                                        onUpload={(file) => void uploadHomeVideo(file)}
                                        onShareLink={() => void copyVideoShareLink()}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="divide-y hairline">
                        {fields.length === 0 && <p className="px-5 py-6 text-sm text-[var(--ink-soft)]">Esta sección aún no tiene campos. Agrega el primero abajo.</p>}
                        {fields.map((field, index) => (
                            <div key={`${field.key}-${index}`} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(140px,220px)_1fr_auto] sm:items-center sm:px-8">
                                <input
                                    type="text"
                                    value={field.key}
                                    onChange={(event) => updateField(index, { key: event.target.value })}
                                    aria-label="Nombre del campo"
                                    className="w-full rounded-md border hairline bg-transparent px-3 py-2 font-mono text-xs outline-none transition focus:border-[var(--copper)]"
                                />
                                <textarea
                                    value={field.value}
                                    rows={field.value.length > 80 ? 3 : 1}
                                    onChange={(event) => updateField(index, { value: event.target.value })}
                                    aria-label={`Valor de ${field.key}`}
                                    className="w-full resize-none rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none transition focus:border-[var(--copper)]"
                                />
                                <button type="button" onClick={() => setFields((current) => current.filter((_, i) => i !== index))} aria-label={`Eliminar campo ${field.key}`} className="justify-self-end rounded-full border hairline px-3 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">✕</button>
                            </div>
                        ))}
                        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-8">
                            <input
                                type="text"
                                value={newKey}
                                onChange={(event) => setNewKey(event.target.value)}
                                placeholder="nuevo_campo"
                                aria-label="Nombre del nuevo campo"
                                className="w-48 rounded-full border hairline bg-transparent px-4 py-2 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            />
                            <button type="button" onClick={addField} className="rounded-full border hairline px-5 py-2 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">+ Campo</button>
                        </div>
                        </div>
                    </div>
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
