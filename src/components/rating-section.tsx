"use client";

import { useEffect, useState } from "react";
import { getCourseRatings, submitCourseRating, type RatingItem, type RatingSummary } from "@/lib/api/ratings";

function Stars({ value, onChange, size = "text-lg" }: { value: number; onChange?: (v: number) => void; size?: string }) {
    return (
        <div className="flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${value} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) =>
                onChange ? (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={n <= value}
                        aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
                        onClick={() => onChange(n)}
                        className={`${size} transition ${n <= value ? "text-[var(--copper)]" : "text-[var(--line)]"}`}
                    >
                        ★
                    </button>
                ) : (
                    <span key={n} aria-hidden="true" className={`${size} ${n <= Math.round(value) ? "text-[var(--copper)]" : "text-[var(--line)]"}`}>★</span>
                ),
            )}
        </div>
    );
}

export function RatingSection({ courseId, canRate, courseTitle }: { courseId: string; canRate: boolean; courseTitle: string }) {
    const [summary, setSummary] = useState<RatingSummary>({ ratings: [], average: 0, total: 0 });
    const [loaded, setLoaded] = useState(false);
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState("");
    const [sending, setSending] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [feedback, setFeedback] = useState<"ok" | "error" | null>(null);
    const visibleRatings = showAll ? summary.ratings : summary.ratings.slice(0, 3);

    async function load() {
        try {
            const data = await getCourseRatings(courseId);
            setSummary(data);
        } catch {
            /* mantener vacío */
        } finally {
            setLoaded(true);
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    async function handleRate() {
        if (sending) return;
        setSending(true);
        setFeedback(null);
        try {
            await submitCourseRating(courseId, { stars, comment: comment.trim() || undefined });
            setFeedback("ok");
            setComment("");
            const data = await getCourseRatings(courseId);
            setSummary(data);
        } catch {
            setFeedback("error");
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="mt-10 border-t hairline pb-2 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">Calificación y comentarios</p>
                    <h3 className="display-font mt-2 text-3xl">Opiniones · {courseTitle}</h3>
                </div>
                {loaded && (
                    <div className="flex items-center gap-3 text-sm">
                        <Stars value={summary.average} />
                        <span className="text-[var(--ink-soft)]">
                            {summary.average.toFixed(1)} · {summary.total} comentario{summary.total === 1 ? "" : "s"}
                        </span>
                    </div>
                )}
            </div>

            {canRate ? (
                <div className="mt-6 space-y-4 rounded-2xl border hairline bg-[var(--paper)] p-5 sm:p-6">
                    <p className="text-sm font-semibold">Comparte tu experiencia</p>
                    <div className="flex items-center gap-3">
                        <Stars value={stars} onChange={setStars} size="text-2xl" />
                        <span className="text-sm text-[var(--ink-soft)]">{stars}/5</span>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-md border hairline bg-transparent px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]"
                        placeholder="Cuéntanos qué te pareció el curso (opcional)."
                    />
                    {feedback === "ok" && <p className="text-sm font-semibold text-[var(--forest)]">✓ ¡Gracias por calificar! Ya actualizamos el promedio.</p>}
                    {feedback === "error" && <p className="text-sm font-semibold text-[var(--danger)]">No se pudo guardar. Asegúrate de tener acceso activo al curso.</p>}
                    <button
                        type="button"
                        onClick={() => void handleRate()}
                        disabled={sending}
                        className="rounded-full bg-[var(--forest)] px-6 py-2.5 text-sm font-bold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50"
                    >
                        {sending ? "Guardando…" : "Publicar calificación"}
                    </button>
                </div>
            ) : null}

            <ul className="mt-8 space-y-3">
                {loaded && summary.ratings.length === 0 ? (
                    <li className="rounded-xl border hairline bg-[var(--paper)] px-5 py-6 text-center text-sm text-[var(--ink-soft)]">
                        No hay comentarios todavía. ¡Sé el primero!
                    </li>
                ) : null}
                {loaded
                    ? visibleRatings.map((r: RatingItem) => (
                          <li key={r.id} className="rounded-xl border hairline bg-[var(--paper)] p-5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold">{r.fullName ?? "Estudiante"}</p>
                                  <Stars value={r.stars} />
                              </div>
                              {r.comment ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--ink-soft)]">{r.comment}</p> : null}
                          </li>
                      ))
                    : null}
            </ul>

            {loaded && summary.ratings.length > 3 ? (
                <button
                    type="button"
                    onClick={() => setShowAll((s) => !s)}
                    className="mt-5 rounded-full border hairline px-5 py-2 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
                >
                    {showAll ? "Ver menos" : `Ver más comentarios (${summary.ratings.length - 3})`}
                </button>
            ) : null}
        </section>
    );
}

