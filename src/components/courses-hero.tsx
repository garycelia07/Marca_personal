"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listPublishedCourses, getCourse, type Course } from "@/lib/api/courses";
import { publicBackendOrigin, whatsappHref } from "@/lib/site";
import { LeadForm } from "@/components/lead-form";

// Imagen fija y elegante que representa a toda la sección de cursos.
const ELEGANT_IMG =
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=2000&q=80";

interface HeroCourse {
    course: Course;
    cover: string;
    video: string | undefined;
}

export function CoursesHero() {
    const [data, setData] = useState<HeroCourse | null>(null);
    const [state, setState] = useState<"load" | "none" | "ok">("load");
    const [play, setPlay] = useState(false);
    const [subOpen, setSubOpen] = useState(false);
    const [afterContinue, setAfterContinue] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 50 });
                // siempre el más antiguo disponible; si se borra, toma el siguiente.
                const ordered = [...result.items].sort((a, b) =>
                    (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
                );
                for (const cand of ordered.slice(0, 8)) {
                    if (cancelled) return;
                    let video: string | undefined;
                    try {
                        const detail = await getCourse(cand.id);
                        const mods = [...(detail.modules ?? [])].sort((a, b) => a.order - b.order);
                        const first = (mods[0]?.lessons ?? [])
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .find((l) => l.videoUrl && l.videoUrl.trim())?.videoUrl;
                        if (first) {
                            const raw = first.trim();
                            video = /^https?:\/\//.test(raw)
                                ? raw
                                : `${publicBackendOrigin()}${raw.startsWith("/") ? raw : `/${raw}`}`;
                        }
                    } catch {
                        /* probar el siguiente */
                    }
                    if (cancelled) return;
                    setData({ course: cand, cover: ELEGANT_IMG, video });
                    setState("ok");
                    return;
                }
                setState("none");
            } catch {
                setState("none");
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openSubscribeOnly() {
        setAfterContinue(null);
        setSubOpen(true);
    }
    function continueAfterSubscribe(href: string) {
        setAfterContinue(href);
        setSubOpen(true);
    }
    function handleSubDone(ok: boolean) {
        if (!ok) return;
        setSubOpen(false);
        if (afterContinue) router.push(afterContinue);
    }

    if (state === "none") return null;
    if (state === "load" || !data) return <div className="h-80 animate-pulse bg-[var(--line)]" />;


    return (
        <section className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-12 lg:pt-10">
            <div className="relative overflow-hidden rounded-3xl border hairline bg-[#171713] text-white">
                <div className="relative aspect-video w-full sm:aspect-[21/9]">
                    {play && data.video ? (
                        <>
                            <video
                                key={data.video}
                                src={data.video}
                                controls
                                autoPlay
                                playsInline
                                className="h-full w-full bg-black object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => setPlay(false)}
                                aria-label="Cerrar video"
                                className="absolute right-3 top-3 z-10 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-black/70"
                            >
                                ✕ Cerrar
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setPlay(true)}
                            aria-label="Ver video de muestra (primera clase)"
                            className="group relative flex h-full w-full items-center justify-center"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={data.cover} alt="Programas de aprendizaje Gary Mayhua" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                            <span className="absolute inset-0 bg-gradient-to-t from-[#171713]/90 via-[#171713]/25 to-transparent" />
                            {data.video ? (
                                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--copper)] pl-1 text-4xl text-[var(--forest-deep)] shadow-2xl transition group-hover:scale-110 sm:h-24 sm:w-24">▶</span>
                            ) : null}
                        </button>
                    )}
                </div>


                <div className="relative flex flex-wrap items-end justify-between gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
                    <div className="max-w-xl">
                        <p className="eyebrow text-[var(--copper)]">Primera clase · {data.course.title}</p>
                        <h2 className="display-font mt-2 text-3xl font-display leading-tight sm:text-4xl">
                            Empieza hoy: mira la primera lección del curso {data.course.title}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-white/80">
                            Continúa aprendiendo a tu ritmo. Suscríbete para no perderte los próximos contenidos.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3">
                        <button
                            type="button"
                            onClick={() => continueAfterSubscribe(`/cursos/${data.course.id}`)}
                            className="inline-flex items-center gap-2 rounded-full bg-[var(--copper)] px-6 py-3 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-110"
                        >
                            Continuar aprendiendo →
                        </button>
                        <button
                            type="button"
                            onClick={openSubscribeOnly}
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            🔔 Suscribirme a novedades
                        </button>
                        <a
                            href={whatsappHref(`Hola, vi la primera clase de "${data.course.title}" y quiero más información.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:brightness-105"
                        >
                            💬 WhatsApp
                        </a>
                    </div>
                </div>
            </div>
            {subOpen && data ? (
                <SubscribeModal
                    courseTitle={data.course.title}
                    onClose={() => setSubOpen(false)}
                    onSubmitted={handleSubDone}
                />
            ) : null}
        </section>
    );
}

function SubscribeModal({
    courseTitle,
    onClose,
    onSubmitted,
}: {
    courseTitle: string;
    onClose: () => void;
    onSubmitted: (ok: boolean) => void;
}) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Suscríbete a novedades">
            <div className="absolute inset-0 z-0 bg-[#171713]/85 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border hairline bg-[var(--paper)] p-6 text-[var(--foreground)] sm:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border hairline text-sm font-bold hover:border-[var(--copper)] hover:text-[var(--copper)]"
                >
                    ✕
                </button>
                <p className="eyebrow">Newsletter</p>
                <h3 className="display-font mt-2 text-3xl leading-tight">Suscríbete</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    Deja tu correo para recibir novedades y el acceso al programa “{courseTitle}”.
                </p>
                <div className="mt-5">
                    <LeadForm
                        courseName={`Newsletter: ${courseTitle}`}
                        submitLabel="Quiero suscribirme"
                        onSubmitted={onSubmitted}
                    />
                </div>
            </div>
        </div>
    );
}
