"use client";

import { useState } from "react";
import type { Course, CreateCourseInput, UpdateCourseInput } from "@/lib/api/courses";
import { uploadCourseCover } from "@/lib/api/courses";

export function CourseFormModal({
    title,
    initial,
    busy,
    error,
    onSubmit,
    onClose,
}: {
    title: string;
    initial?: Course;
    busy: boolean;
    error: string | null;
    onSubmit: (input: CreateCourseInput & UpdateCourseInput) => void;
    onClose: () => void;
}) {
    const [courseTitle, setCourseTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
    const [durationHours, setDurationHours] = useState(initial?.durationHours ? String(initial.durationHours) : "");
    const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    function validate(): boolean {
        if (!courseTitle.trim()) {
            setFieldError("El título es obligatorio.");
            return false;
        }
        if (!slug.trim()) {
            setFieldError("El slug es obligatorio.");
            return false;
        }
        if (durationHours.trim()) {
            const parsed = Number(durationHours);
            if (!Number.isInteger(parsed) || parsed < 1) {
                setFieldError("Las horas deben ser un numero entero mayor a 0.");
                return false;
            }
        }
        setFieldError(null);
        return true;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !validate()) return;
        onSubmit({
            title: courseTitle.trim(),
            slug: slug.trim(),
            description: description.trim() || undefined,
            coverImageUrl: coverImageUrl.trim() || undefined,
            durationHours: durationHours.trim() ? Number(durationHours) : undefined,
            isPublished,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6 shadow-[0_24px_48px_-18px_rgba(36,35,31,0.6)] sm:p-8">
                <p className="eyebrow">Gestión de cursos</p>
                <h3 className="display-font mt-4 text-3xl leading-none">{title}</h3>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Horas del curso <span className="text-xs text-[var(--ink-soft)]">(para el certificado)</span></span>
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={durationHours}
                            onChange={(event) => {
                                setDurationHours(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="100"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Título</span>
                        <input
                            type="text"
                            value={courseTitle}
                            required
                            onChange={(event) => {
                                setCourseTitle(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="Liderazgo e Inversión Inmobiliaria"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Slug (URL amigable)</span>
                        <input
                            type="text"
                            value={slug}
                            required
                            onChange={(event) => {
                                setSlug(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="liderazgo-e-inversion-inmobiliaria"
                        />
                    </label>
<label className="block">
                        <span className="mb-2 block text-sm font-semibold">Descripción <span className="text-xs text-[var(--ink-soft)]">(opcional)</span></span>
                        <textarea
                            value={description}
                            rows={3}
                            onChange={(event) => setDescription(event.target.value)}
                            className="w-full resize-none rounded-md border hairline bg-transparent px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="Curso enfocado en fundamentos de liderazgo y bienes raíces."
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Imagen de portada <span className="text-xs text-[var(--ink-soft)]">(opcional; se sube a Cloudinary)</span></span>
                        <input
                            type="url"
                            value={coverImageUrl}
                            onChange={(event) => setCoverImageUrl(event.target.value)}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="…o pega aquí la URL de una imagen"
                        />
                        {initial?.id ? (
                            <span className="mt-2 inline-flex items-center gap-2">
                                <label htmlFor={`course-cover-file-${initial.id}`} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--copper)] px-4 py-2 text-xs font-bold text-[var(--copper)] transition hover:bg-[var(--copper)] hover:text-white ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                                    {uploading ? "Subiendo…" : "📂 Elegir imagen de portada"}
                                </label>
                                <input
                                    id={`course-cover-file-${initial.id}`}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    disabled={uploading || busy}
                                    onChange={async (event) => {
                                        const f = event.target.files?.[0];
                                        event.target.value = "";
                                        if (!f || uploading) return;
                                        setUploading(true);
                                        setFieldError(null);
                                        try {
                                            const url = await uploadCourseCover(initial.id!, f);
                                            setCoverImageUrl(url);
                                        } catch (e) {
                                            setFieldError(e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "No se pudo subir la imagen.");
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                />
                                {coverImageUrl && <span className="text-[10px] text-[var(--ink-soft)]"># cubierta cargada</span>}
                            </span>
                        ) : null}
                        {coverImageUrl ? (
                            <span className="mt-3 block aspect-[16/9] w-full overflow-hidden rounded-lg border hairline bg-[var(--line)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={coverImageUrl} alt="Vista previa de la portada del curso" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                            </span>
                        ) : null}
                    </label>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(event) => setIsPublished(event.target.checked)}
                            className="h-4 w-4 accent-[var(--copper)]"
                        />
                        <span className="text-sm text-[var(--foreground)]">Publicar el curso</span>
                    </label>

                    {fieldError && <p role="alert" className="text-xs text-[var(--danger)]">{fieldError}</p>}
                    {error && <p role="alert" className="rounded-md border border-[var(--danger)] bg-[var(--lime)] px-4 py-3 text-sm leading-6 text-[var(--danger)]">⚠ {error}</p>}

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={busy} className="rounded-full border hairline px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-6 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">
                            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent" aria-hidden="true" />}
                            {busy ? "Guardando…" : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
