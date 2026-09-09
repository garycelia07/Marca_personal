"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listPublishedCourses, getCourse, type Course } from "@/lib/api/courses";
import { publicBackendOrigin, whatsappHref } from "@/lib/site";
import { LeadForm } from "@/components/lead-form";
import { BellIcon, WhatsAppIcon, ArrowRightIcon } from "@/components/ui-icons";

interface HeroCourse {
    course: Course;
    cover: string;
    video: string | undefined;
    ytId: string | undefined;
}

const YT_SRC = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export function CoursesHero() {
    const [data, setData] = useState<HeroCourse | null>(null);
    const [state, setState] = useState<"load" | "none" | "ok">("load");
    const [play, setPlay] = useState(false);
    const [subOpen, setSubOpen] = useState(false);
    const [afterContinue, setAfterContinue] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 50 });
                const ordered = [...result.items].sort((a, b) =>
                    (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
                );
                for (const cand of ordered.slice(0, 8)) {
                    if (cancelled) return;
                    let video: string | undefined;
                    let ytId: string | undefined;
                    try {
                        const detail = await getCourse(cand.id);
                        const mods = [...(detail.modules ?? [])].sort((a, b) => a.order - b.order);
                        const first = (mods[0]?.lessons ?? [])
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .find((l) => l.videoUrl && l.videoUrl.trim())?.videoUrl;
                        if (first) {
                            const raw = first.trim();
                            const ym = YT_SRC.exec(raw);
                            if (ym) {
                                ytId = ym[1];
                                video = raw;
                            } else if (/^https?:\/\//.test(raw)) {
                                video = raw;
                            } else {
                                video = `${publicBackendOrigin()}${raw.startsWith("/") ? raw : `/${raw}`}`;
                            }
                        }
                    } catch {
                        /* probar el siguiente curso real */
                    }
                    if (cancelled) return;
                    setData({
                        course: cand,
                        cover: cand.coverImageUrl ?? "",
                        video,
                        ytId,
                    });
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
        setToast("¡Listo! Nos comunicaremos contigo pronto. ✅");
        window.setTimeout(() => setToast(null), 5200);
        if (afterContinue) {
            window.setTimeout(() => router.push(afterContinue), 900);
            setAfterContinue(null);
        }
    }

    const poster = data.ytId
        ? `https://i.ytimg.com/vi/${data.ytId}/hqdefault.jpg`
        : data.cover || null;

    const playing = data.ytId || data.video;

    return (
        <section className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-12">
            <div className="overflow-hidden rounded-3xl border hairline bg-[#171713] text-white">
                <div className="relative aspect-video w-full sm:aspect-[21/9]">
                    {play && playing ? (
                        data.ytId ? (
                            <iframe
                                className="h-full w-full bg-black"
                                src={`https://www.youtube-nocookie.com/embed/${data.ytId}?autoplay=1&rel=0&playsinline=1`}
                                title="Primera clase"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video key={data.video} src={data.video} controls autoPlay playsInline className="h-full w-full bg-black object-contain" />
                        )
                    ) : (
                        <button type="button" disabled={!playing} onClick={() => setPlay(true)} className="group relative flex h-full w-full items-center justify-center">
                            {poster ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={poster} alt={`Portada real del curso ${data.course.title}`} className="h-full w-full object-cover" />
                            ) : (
                                <span className="absolute inset-0 bg-gradient-to-br from-[#2d2c27] to-[#1f1a17]" />
                            )}
                            <span className="absolute inset-0 bg-gradient-to-t from-[#171713]/85 to-transparent" />
                            {playing ? <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--copper)] pl-1 text-4xl text-[var(--forest-deep)] shadow-2xl sm:h-24 sm:w-24">▶</span> : null}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-6 px-5 py-6 sm:px-8 sm:py-8">
                    <div className="max-w-xl">
                        <p className="eyebrow text-[var(--copper)]">Curso real · {data.course.title}</p>
                        <h2 className="display-font mt-2 text-3xl sm:text-4xl">Mira la primera lección real de {data.course.title}</h2>
                        <p className="mt-2 text-sm text-white/75">Para continuar aprender primero suscríbete; nos contactaremos contigo.</p>
                    </div>
                    <div className="flex flex-col items-start gap-3">
                        <button type="button" onClick={() => continueAfterSubscribe(`/cursos/${data.course.id}`)} className="rounded-full bg-[var(--copper)] px-6 py-3 text-sm font-bold text-[var(--forest-deep)]">Continuar aprendiendo →</button>
                        <button type="button" onClick={openSubscribeOnly} className="rounded-full border border-white/30 px-6 py-3 text-sm text-white"><BellIcon /> Suscribirme a novedades</button>
                    </div>
                </div>
            </div>
            {toast ? <div role="status" className="fixed bottom-6 right-6 z-[90] max-w-sm rounded-xl border hairline bg-[var(--paper)] px-5 py-4 text-sm font-semibold text-[var(--forest-deep)] shadow-xl">{toast}</div> : null}
            {subOpen && data ? <SubscribeModal courseTitle={data.course.title} onClose={() => setSubOpen(false)} onSubmitted={handleSubDone} /> : null}
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Suscríbete">
            <div className="absolute inset-0 bg-[#171713]/85 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border hairline bg-[var(--paper)] p-6 text-[var(--foreground)] sm:p-8">
                <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border hairline text-sm font-bold hover:text-[var(--copper)]">✕</button>
                <p className="eyebrow">Newsletter</p>
                <h3 className="display-font mt-2 text-3xl">Suscríbete</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">Deja tu correo para recibir novedades y acceder al programa “{courseTitle}”.</p>
                <div className="mt-5">
                    <LeadForm courseName={`Newsletter: ${courseTitle}`} submitLabel="Quiero suscribirme" onSubmitted={onSubmitted} />
                </div>
            </div>
        </div>
    );
}
