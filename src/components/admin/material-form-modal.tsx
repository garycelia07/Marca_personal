"use client";

import { useRef, useState } from "react";
import {
    MAX_FILE_SIZE_BYTES,
    validateMaterialFile,
    type Material,
} from "@/lib/api/materials";

function formatBytes(bytes: number | undefined): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CourseOption = { id: string; title: string };

export function MaterialFormModal({
    title,
    initial,
    courseId,
    courses = [],
    busy,
    error,
    onSubmit,
    onClose,
}: {
    title: string;
    initial?: Material;
    courseId?: string;
    courses?: CourseOption[];
    busy: boolean;
    error: string | null;
    onSubmit: (input: { title: string; file?: File; courseId?: string | null; isPublic: boolean }) => void;
    onClose: () => void;
}) {
    const [materialTitle, setMaterialTitle] = useState(initial?.title ?? "");
    const [file, setFile] = useState<File | null>(null);
    const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
    const [coursePick, setCoursePick] = useState<string>(initial?.courseId ?? courseId ?? "");
    const [fieldError, setFieldError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0] ?? null;
        if (!selected) {
            setFile(null);
            return;
        }
        const validationError = validateMaterialFile(selected);
        if (validationError) {
            setFieldError(validationError);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setFieldError(null);
        setFile(selected);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        if (!materialTitle.trim()) {
            setFieldError("El título es obligatorio.");
            return;
        }
        if (!initial && (!file || file.size === 0)) {
            setFieldError("Selecciona un archivo (PDF, JPG, PNG o WEBP, máx. 20 MB).");
            return;
        }
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            setFieldError("El archivo supera el límite de 20 MB.");
            return;
        }
        setFieldError(null);
        onSubmit({
            title: materialTitle.trim(),
            file: file ?? undefined,
            courseId: coursePick || null,
            isPublic,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border hairline bg-[var(--paper)] p-6 shadow-[0_24px_48px_-18px_rgba(36,35,31,0.6)] sm:p-8">
                <p className="eyebrow">Gestión de materiales</p>
                <h3 className="display-font mt-4 text-3xl leading-none">{title}</h3>
<form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">Título</span>
                        <input
                            type="text"
                            value={materialTitle}
                            required
                            onChange={(event) => {
                                setMaterialTitle(event.target.value);
                                setFieldError(null);
                            }}
                            className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                            placeholder="Guía de fundamentos"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">
                            Archivo {initial ? <span className="text-xs text-[var(--ink-soft)]">(déjalo vacío para conservar el actual)</span> : <span className="text-xs text-[var(--ink-soft)]">(PDF, JPG, PNG, WEBP · máx. 20 MB)</span>}
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="w-full rounded-md border hairline bg-transparent px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--forest)] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--background)]"
                        />
                        {file && <p className="mt-2 text-xs text-[var(--ink-soft)]">{file.name} · {formatBytes(file.size)}</p>}
                        {initial && !file && <p className="mt-2 text-xs text-[var(--ink-soft)]">Archivo actual: {initial.fileName ?? "—"}</p>}
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold">
                            Vincular a curso {courses.length === 0 ? <span className="text-xs font-normal text-[var(--ink-soft)]">(sin cursos disponibles)</span> : <span className="text-xs font-normal text-[var(--ink-soft)]">(opcional: el estudiante lo verá en su perfil)</span>}
                        </span>
                        <select
                            value={coursePick}
                            onChange={(event) => setCoursePick(event.target.value)}
                            className="w-full rounded-md border hairline bg-[var(--paper)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--copper)] [color-scheme:light]"
                        >
                            <option value="" className="bg-[var(--paper)] text-[var(--foreground)]">— Material general (sin curso) —</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id} className="bg-[var(--paper)] text-[var(--foreground)]">
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(event) => setIsPublic(event.target.checked)}
                            className="h-4 w-4 accent-[var(--copper)]"
                        />
                        <span className="text-sm text-[var(--foreground)]">Visible públicamente en la landing</span>
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