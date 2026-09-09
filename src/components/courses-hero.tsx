"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    const [sub, setSub] = useState(false);

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
                        {sub ? (
                            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
                                <p className="mb-1 text-sm font-semibold">Suscríbete</p>
                                <LeadForm
                                    courseName={`Newsletter/curso ${data.course.title}`}
                                    onSubmitted={(ok) => {
                                        if (ok) setSub(false);
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-col items-start gap-3">
                        <Link
                            href={`/cursos/${data.course.id}`}
                            className="inline-flex items-center gap-2 rounded-full bg-[var(--copper)] px-6 py-3 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-110"
                        >
                            Continuar aprendiendo →
                        </Link>
                        <button
                            type="button"
                            onClick={() => setSub((s) => !s)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            🔔 Suscribirme a novedades{sub ? " (cerrar)" : ""}
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
        </section>
    );
}
