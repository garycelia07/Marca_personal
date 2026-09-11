"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    addLesson,
    addModule,
    getCourse,
    deleteCourse,
    uploadLessonVideo,
    deleteLessonVideo,
    type Course,
    type Module,
} from "@/lib/api/courses";
import { uploadMaterial } from "@/lib/api/materials";
import { CourseEnrollments } from "@/components/admin/course-enrollments";
import { MaterialFormModal } from "@/components/admin/material-form-modal";

type ToastVariant = "success" | "error";
type Toast = { id: number; variant: ToastVariant; message: string };

function errorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: string }).message);
    }
    return fallback;
}

function nextOrder(items: ({ order?: number } | undefined)[]): number {
    return items.reduce((max, item) => Math.max(max, item?.order ?? 0), -1) + 1;
}

export function CourseDetail({ courseId }: { courseId: string }) {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const [addingModule, setAddingModule] = useState(false);
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleError, setModuleError] = useState<string | null>(null);

    const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
    const [lessonError, setLessonError] = useState<string | null>(null);
    const [addingMaterial, setAddingMaterial] = useState(false);
    const [materialError, setMaterialError] = useState<string | null>(null);

    /* Reproductor "en pantalla completa" de un video de lección (overlay fijo). */
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const [watch, setWatch] = useState<{ url: string; title: string } | null>(null);

    function openWatch(url: string, title: string) {
        setWatch({ url, title });
        // Pide fullscreen real sobre el overlay; si el navegador no lo permite,
        // el overlay `fixed inset-0` ya cubre el viewport completo.
        window.setTimeout(() => {
            try {
                void overlayRef.current?.requestFullscreen?.();
            } catch {
                /* sin Fullscreen API: el overlay ya es a pantalla completa */
            }
        }, 0);
    }

    function closeWatch() {
        if (document.fullscreenElement) {
            void document.exitFullscreen?.();
        }
        setWatch(null);
    }

    useEffect(() => {
        if (!watch) return;
        function onFullscreenChange() {
            // Sale de fullscreen con Esc o el control del navegador → cierra el modal.
            if (!document.fullscreenElement) setWatch(null);
        }
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, [watch]);

    function pushToast(variant: ToastVariant, message: string) {
        const id = ++toastId.current;
        setToasts((current) => [...current, { id, variant, message }]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 4500);
    }

    async function load() {
        setLoading(true);
        try {
            const result = await getCourse(courseId);
            setCourse(result);
            setError(null);
        } catch (err) {
            setError(errorMessage(err, "No fue posible cargar el curso."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void Promise.resolve().then(() => load());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    async function handleAddModule() {
        if (!course) return;
        if (!moduleTitle.trim()) {
            setModuleError("El título del módulo es obligatorio.");
            return;
        }
        setBusy(true);
        setModuleError(null);
        try {
            await addModule(course.id, {
                title: moduleTitle.trim(),
                order: nextOrder(course.modules ?? []),
            });
            pushToast("success", "Módulo agregado correctamente.");
            setModuleTitle("");
            setAddingModule(false);
            void load();
        } catch (err) {
            setModuleError(errorMessage(err, "No fue posible agregar el módulo."));
        } finally {
            setBusy(false);
        }
    }

    async function handleAddLesson(module: Module) {
        if (!lessonTitle.trim()) {
            setLessonError("El título de la lección es obligatorio.");
            return;
        }
        setBusy(true);
        setLessonError(null);
        try {
            const created = await addLesson(module.id, {
                title: lessonTitle.trim(),
                order: nextOrder(module.lessons ?? []),
            });
            if (lessonVideoFile) {
                try {
                    await uploadLessonVideo(created.id, lessonVideoFile);
                    pushToast("success", "Lección y video agregados correctamente.");
                } catch (err) {
                    pushToast("error", errorMessage(err, "La lección se creó, pero no se pudo subir el video."));
                }
            } else {
                pushToast("success", "Lección agregada correctamente.");
            }
            setLessonTitle("");
            setLessonVideoFile(null);
            setAddingLessonFor(null);
            void load();
        } catch (err) {
            setLessonError(errorMessage(err, "No fue posible agregar la lección."));
        } finally {
            setBusy(false);
        }
    }

    async function handleLessonVideo(lessonId: string, file: File) {
        setBusy(true);
        try {
            await uploadLessonVideo(lessonId, file);
            pushToast("success", "Video subido (o reemplazado) correctamente. Recuerda: máx. 10 min.");
            void load();
        } catch (err) {
            pushToast("error", errorMessage(err, "No se pudo subir el video (máx. 10 min)."));
        } finally {
            setBusy(false);
        }
    }

    async function handleDeleteLessonVideo(lessonId: string) {
        setBusy(true);
        try {
            await deleteLessonVideo(lessonId);
            pushToast("success", "Video eliminado de la lección.");
            void load();
        } catch (err) {
            pushToast("error", errorMessage(err, "No se pudo eliminar el video."));
        } finally {
            setBusy(false);
        }
    }

    async function handleAddMaterial(input: { title: string; file?: File; courseId?: string | null; isPublic: boolean }) {
        if (!course || !input.file) return;
        setBusy(true);
        setMaterialError(null);
        try {
            await uploadMaterial({
                title: input.title,
                file: input.file,
                courseId: course.id,
                isPublic: input.isPublic,
            });
            pushToast("success", "Material agregado al curso.");
            setAddingMaterial(false);
        } catch (err) {
            setMaterialError(errorMessage(err, "No fue posible subir el material."));
        } finally {
            setBusy(false);
        }
    }

    const sortedModules = [...(course?.modules ?? [])].sort((a, b) => a.order - b.order);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 py-20 text-[var(--ink-soft)]">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--copper)] border-t-transparent" aria-hidden="true" />
                <span>Cargando curso…</span>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="rounded-md border border-[var(--danger)] bg-[var(--lime)] px-4 py-4 text-sm leading-6 text-[var(--danger)]">
                <p className="font-semibold">No fue posible mostrar el curso.</p>
                <p className="mt-1">{error}</p>
                <Link href="/admin/cursos" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Volver a cursos</Link>
            </div>
        );
    }

    return (
        <section>
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Link href="/admin/cursos" className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">← Cursos</Link>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${course.isPublished ? "bg-[var(--forest)] text-[var(--background)]" : "bg-[var(--line)] text-[var(--ink-soft)]"}`}>
                    {course.isPublished ? "Publicado" : "Borrador"}
                </span>
            </div>

            <div className="flex flex-col gap-4">
                <p className="eyebrow">Detalle del curso</p>
                <h1 className="display-font mt-4 text-4xl leading-none sm:text-5xl">{course.title}</h1>
                {course.description && <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-soft)]">{course.description}</p>}
                <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-xs text-[var(--ink-soft)]">/{course.slug}</p>
                    <button
                        type="button"
                        onClick={() => { setMaterialError(null); setAddingMaterial(true); }}
                        disabled={busy}
                        className="rounded-full border hairline px-4 py-2 text-xs font-semibold text-[var(--copper)] transition hover:border-[var(--copper)] disabled:opacity-50"
                    >
                        + Subir material
                    </button>
                </div>
            </div>
            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
                <div className="min-w-0">
<div className="border-t hairline pt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="eyebrow">Módulos</p>
                        <p className="mt-1 text-sm text-[var(--ink-soft)]">{course.modules?.length ?? 0} módulos</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {addingModule ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={moduleTitle}
                                    onChange={(event) => { setModuleTitle(event.target.value); setModuleError(null); }}
                                    aria-label="Título del módulo"
                                    placeholder="Título del módulo"
                                    className="w-52 rounded-full border hairline bg-transparent px-3 py-2 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                                />
                                <button type="button" onClick={() => void handleAddModule()} disabled={busy} className="rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">Guardar</button>
                                <button type="button" onClick={() => { setAddingModule(false); setModuleTitle(""); setModuleError(null); }} disabled={busy} className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setAddingModule(true)} className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">+ Módulo</button>
                        )}
                    </div>
                </div>
                {moduleError && <p role="alert" className="mt-3 text-xs text-[var(--danger)]">{moduleError}</p>}
                <div className="mt-6 space-y-5">
{sortedModules.length === 0 ? (
                        <p className="rounded-md border hairline bg-[var(--paper)] px-4 py-6 text-sm text-[var(--ink-soft)]">Aún no hay módulos. Agrega el primero.</p>
                    ) : (
                        sortedModules.map((module) => (
                            <article key={module.id} className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                                <div className="flex flex-wrap items-center gap-3 border-b hairline px-5 py-4 sm:px-6">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-sm font-bold text-[var(--copper)]">{module.order + 1}</span>
                                    <h2 className="display-font text-2xl leading-none">{module.title}</h2>
                                    {addingLessonFor !== module.id ? (
                                        <button
                                            type="button"
                                            onClick={() => { setLessonError(null); setLessonVideoFile(null); setAddingLessonFor(module.id); }}
                                            className="ml-auto rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
                                        >
                                            + Lección / video
                                        </button>
                                    ) : null}
                                </div>
                                <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:px-6 lg:grid-cols-4">
                                    {(module.lessons ?? []).length === 0 ? (
                                        <div className="col-span-full rounded-xl border hairline bg-[var(--lime)] px-5 py-6 text-center text-sm text-[var(--ink-soft)]">
                                            Este módulo aún no tiene lecciones. Agrega una lección y podrás subir su video.
                                        </div>
                                    ) : (module.lessons ?? []).sort((a, b) => a.order - b.order).map((lesson) => (
                                        <div key={lesson.id} className="flex flex-col overflow-hidden rounded-xl border hairline bg-[var(--paper)]">
                                            <div className="relative aspect-video overflow-hidden rounded-t-xl border-b hairline bg-black">
                                                {lesson.videoUrl ? (
                                                    <video
                                                        key={`thumb-${lesson.videoUrl}`}
                                                        playsInline
                                                        preload="metadata"
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                        src={lesson.videoUrl}
                                                        aria-label={`Video de la lección: ${lesson.title}`}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-[var(--line)] text-xs font-semibold text-[var(--ink-soft)]">
                                                        Sin video
                                                    </div>
                                                )}
                                                {lesson.videoUrl ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openWatch(lesson.videoUrl as string, lesson.title)}
                                                        className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 text-sm font-bold text-white transition hover:bg-black/20"
                                                        aria-label={`Ver ${lesson.title} en pantalla completa`}
                                                    >
                                                        <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--copper)]" style={{ fontSize: 14 }}>▶</span>
                                                        Ver
                                                    </button>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2 p-3">
                                                <p className="line-clamp-2 text-xs font-semibold leading-5">
                                                    {lesson.order + 1}. {lesson.title}
                                                </p>
                                                <div className="mt-auto flex flex-wrap items-center gap-2">
                                                    <label className="cursor-pointer rounded-full border hairline px-2.5 py-1 text-[10px] font-bold text-[var(--forest-deep)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                                                        {busy ? "…" : "Subir / reemplazar"}
                                                        <input type="file" accept="video/mp4,video/webm" className="sr-only"
                                                            disabled={busy}
                                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleLessonVideo(lesson.id, f); e.target.value = ""; }} />
                                                    </label>
                                                    <button type="button" onClick={() => void handleDeleteLessonVideo(lesson.id)} disabled={busy} className="rounded-full border hairline px-2.5 py-1 text-[10px] font-bold text-[var(--danger)] transition hover:border-[var(--danger)]">
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t hairline px-5 py-3 sm:px-6">
                                    {addingLessonFor === module.id ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="text"
                                                value={lessonTitle}
                                                onChange={(event) => { setLessonTitle(event.target.value); setLessonError(null); }}
                                                aria-label="Título de la lección"
                                                placeholder="Título de la lección"
                                                className="w-64 rounded-full border hairline bg-transparent px-3 py-2 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                                            />
                                            <label className="block text-xs font-semibold text-[var(--ink-soft)]">
                                                Video de la lección
                                                <input
                                                    type="file"
                                                    accept="video/mp4,video/webm"
                                                    disabled={busy}
                                                    onChange={(event) => {
                                                        setLessonVideoFile(event.target.files?.[0] ?? null);
                                                        setLessonError(null);
                                                    }}
                                                    className="mt-1 w-64 rounded-md border hairline bg-transparent px-3 py-2 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[var(--forest)] file:px-3 file:py-1 file:text-[10px] file:font-semibold file:text-[var(--background)]"
                                                />
                                                {lessonVideoFile ? <span className="mt-1 block max-w-64 truncate font-normal">{lessonVideoFile.name}</span> : null}
                                            </label>
                                            <button type="button" onClick={() => void handleAddLesson(module)} disabled={busy} className="rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">Guardar</button>
                                            <button type="button" onClick={() => { setAddingLessonFor(null); setLessonTitle(""); setLessonVideoFile(null); setLessonError(null); }} disabled={busy} className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => { setLessonError(null); setLessonVideoFile(null); setAddingLessonFor(module.id); }} className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">+ Lección / video</button>
                                    )}
                                    {lessonError && addingLessonFor === module.id && <p role="alert" className="mt-2 text-xs text-[var(--danger)]">{lessonError}</p>}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-10 border-t hairline pt-8">
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-[var(--ink-soft)]">Cursos: máx. 20 videos (lecciones) por curso · cada video hasta 10 min.</p>
                    <div className="ml-auto">
                        <button type="button"
                            onClick={() => {
                                if (window.confirm(`¿Eliminar el curso "${course.title}" y todo su contenido?`)) {
                                    void deleteCourse(course.id)
                                        .then(() => { router.push("/admin/cursos"); })
                                        .catch(() => pushToast("error", "No se pudo eliminar el curso."));
                                }
                            }}
                            disabled={busy}
                            className="rounded-full bg-[var(--danger)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >Eliminar curso</button>
                    </div>
                </div>
            </div>

                </div>
                <aside className="xl:sticky xl:top-24">
                    <CourseEnrollments
                        courseId={course.id}
                        className="rounded-2xl border hairline bg-[var(--paper)] p-5 shadow-sm"
                    />
                </aside>
            </div>

            {addingMaterial ? (
                <MaterialFormModal
                    title={`Subir material · ${course.title}`}
                    courseId={course.id}
                    courses={[{ id: course.id, title: course.title }]}
                    busy={busy}
                    error={materialError}
                    onSubmit={(input) => void handleAddMaterial(input)}
                    onClose={() => { setAddingMaterial(false); setMaterialError(null); }}
                />
            ) : null}

            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div key={toast.id} role="status" aria-live="polite" className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm shadow-lg ${toast.variant === "success" ? "border-[var(--forest)] bg-[var(--paper)] text-[var(--forest-deep)]" : "border-[var(--danger)] bg-[var(--lime)] text-[var(--danger)]"}`}>
                        <span aria-hidden="true">{toast.variant === "success" ? "✓" : "⚠"}</span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>

            {watch ? (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Reproduciendo: ${watch.title}`}
                >
                    <video
                        key={watch.url}
                        controls
                        autoPlay
                        playsInline
                        className="h-full w-full object-contain"
                        src={watch.url}
                        aria-label={`Video de la lección: ${watch.title}`}
                    >
                        Tu navegador no soporta video.
                    </video>
                    <button
                        type="button"
                        onClick={closeWatch}
                        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-black transition hover:bg-white"
                        aria-label="Cerrar video (pantalla completa)"
                    >
                        ✕
                    </button>
                    <p className="pointer-events-none absolute left-1/2 top-4 max-w-[80%] -translate-x-1/2 truncate rounded-full bg-black/50 px-4 py-1 text-xs font-semibold text-white">
                        {watch.title}
                    </p>
                </div>
            ) : null}
        </section>
    );
}
