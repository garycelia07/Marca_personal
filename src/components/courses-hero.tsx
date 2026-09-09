"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPublishedCourses, getCourse, type Course } from "@/lib/api/courses";
import { publicBackendOrigin } from "@/lib/site";

interface HeroState {
    course: Course;
    video?: string;
    title: string;
}

export function CoursesHero() {
    const [hero, setHero] = useState<HeroState | null>(null);
    const [state, setState] = useState<"loading" | "none" | "ready">("loading");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 50 });
                // El "más antiguo disponible": si se elimina cualquiera, seguimos con el siguiente más antiguo.
                const ordered = [...result.items].sort((a, b) =>
                    (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
                );

                for (const candidate of ordered.slice(0, 8)) {
                    if (cancelled) return;
                    let firstVideo: string | undefined;
                    try {
                        const detail = await getCourse(candidate.id);
                        const mods = [...(detail.modules ?? [])].sort((a, b) => a.order - b.order);
                        if (mods.length) {
                            const lessons = [...(mods[0].lessons ?? [])].sort((a, b) => a.order - b.order);
                            const withVideo = lessons.find((lesson) => lesson.videoUrl && lesson.videoUrl.trim());
                            if (withVideo?.videoUrl) {
                                firstVideo = withVideo.videoUrl;
                                if (!/^https?:\/\//.test(firstVideo)) {
                                    // Ruta relativa del backend servida en el mismo host.
                                    firstVideo = `${publicBackendOrigin()}${firstVideo.startsWith("/") ? firstVideo : `/${firstVideo}`}`;
                                }
                            }
                        }
                    } catch {
                        /* sin detalle de ese curso: probamos el siguiente */
                    }

                    if (cancelled) return;
                    setHero({
                        course: candidate,
                        title: candidate.title,
                        video: firstVideo,
                    });
                    setState("ready");
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

    if (state !== "ready" || !hero) {
        return state === "none" ? null : <div className="h-72 animate-pulse bg-[var(--line)]" />;
    }

    const cover = hero.course.coverImageUrl ?? "";
    const src = hero.video ?? cover;
    const isVideo = Boolean(hero.video);
    const href = `/cursos/${hero.course.id}`;

    return (
        <div className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[#171713]">
                {isVideo ? (
                    <video
                        className="h-full w-full object-cover"
                        src={src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={cover || undefined}
                    />
                ) : cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" loading="eager" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#171713]/95 via-[#171713]/60 to-[#171713]/40" />
            </div>

            <div className="mx-auto flex min-h-[440px] max-w-[1440px] flex-col justify-end gap-6 px-5 pb-10 pt-16 sm:px-8 lg:min-h-[560px] lg:px-12">
                <p className="eyebrow text-[var(--copper)]">Programa destacado</p>
                <h2 className="display-font max-w-3xl text-4xl leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                    {hero.title}
                </h2>
                {hero.course.description ? (
                    <p className="max-w-xl text-base leading-7 text-white/85 sm:text-lg">{hero.course.description}</p>
                ) : null}
                <div>
                    <Link
                        href={href}
                        className="group inline-flex items-center gap-3 rounded-full bg-[var(--copper)] px-7 py-3.5 text-base font-bold text-[var(--forest-deep)] transition hover:brightness-110"
                    >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--forest-deep)] pl-0.5 text-xs text-[var(--copper)]">▶</span>
                        Ver el programa completo
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
