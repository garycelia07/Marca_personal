"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    addLesson,
    addModule,
    getCourse,
    type Course,
    type Module,
} from "@/lib/api/courses";
import { CourseEnrollments } from "@/components/admin/course-enrollments";

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
    const [lessonError, setLessonError] = useState<string | null>(null);

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
            await addLesson(module.id, {
                title: lessonTitle.trim(),
                order: nextOrder(module.lessons ?? []),
            });
            pushToast("success", "Lección agregada correctamente.");
            setLessonTitle("");
            setAddingLessonFor(null);
            void load();
        } catch (err) {
            setLessonError(errorMessage(err, "No fue posible agregar la lección."));
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
                <p className="font-mono text-xs text-[var(--ink-soft)]">/{course.slug}</p>
            </div>
<div className="mt-10 border-t hairline pt-8">
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
                                <div className="flex items-center gap-3 border-b hairline px-5 py-4 sm:px-6">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-sm font-bold text-[var(--copper)]">{module.order + 1}</span>
                                    <h2 className="display-font text-2xl leading-none">{module.title}</h2>
                                </div>
                                <ul className="divide-y hairline">
                                    {(module.lessons ?? []).sort((a, b) => a.order - b.order).map((lesson) => (
                                        <li key={lesson.id} className="px-5 py-3 sm:px-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-[var(--copper)]">▶</span>
                                                <p className="text-sm font-semibold">{lesson.title}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
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
                                            <button type="button" onClick={() => void handleAddLesson(module)} disabled={busy} className="rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">Guardar</button>
                                            <button type="button" onClick={() => { setAddingLessonFor(null); setLessonTitle(""); setLessonError(null); }} disabled={busy} className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]">Cancelar</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => { setLessonError(null); setAddingLessonFor(module.id); }} className="rounded-full border hairline px-4 py-2 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">+ Lección</button>
                                    )}
                                    {lessonError && addingLessonFor === module.id && <p role="alert" className="mt-2 text-xs text-[var(--danger)]">{lessonError}</p>}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            <CourseEnrollments courseId={course.id} />

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