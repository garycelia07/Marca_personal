"use client";

import { useEffect, useState } from "react";
import { projectCoverUrl, projectVideoUrl } from "@/lib/site";
import type { ProjectItemExt } from "@/lib/cms";

const TOTAL_SLOTS = 5;

export function ProjectsGallery({ items }: { items: ProjectItemExt[] }) {
    const [open, setOpen] = useState<ProjectItemExt | null>(null);
    const [activeProject, setActiveProject] = useState<number>(-1);
    // `ready` evita el hydration mismatch: el estado de hover solo se aplica
    // después del primer frame del cliente (el SSR no puede saber dónde está el cursor).
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setReady(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    if (items.length === 0) {
        return <p className="text-sm text-[var(--ink-soft)] text-center py-8">Aún no hay proyectos publicados.</p>;
    }

    // Mapea hasta 5 slots; si existen más elementos en `items`, los usará dinámicamente
    const slots = Array.from({ length: TOTAL_SLOTS }, (_, index) => items[index] || null);

    return (
        <>
            <div className="mx-auto flex w-full max-w-[1400px] items-stretch justify-center gap-3 overflow-x-auto py-12 scrollbar-none min-h-[580px]">
                {slots.map((project, index) => {
                    const isActive = ready && activeProject === index && project !== null;

                    if (!project) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="relative flex min-w-[160px] flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)]/30 p-5 opacity-40 select-none"
                            >
                                <div className="flex flex-1 items-center justify-center text-center">
                                    <span className="display-font text-5xl sm:text-7xl leading-none font-extralight text-[var(--ink-soft)] opacity-30">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <div>
                                    <p className="display-font text-xs font-medium tracking-tight text-[var(--ink-soft)]">
                                        Próximamente
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    const cover =
                        project.coverUrl && project.coverUrl.trim()
                            ? project.coverUrl.trim()
                            : projectCoverUrl(project.name ?? "");

                    return (
                        <button
                            type="button"
                            key={project.slug ?? project.name ?? index}
                            onClick={() => setOpen(project)}
                            onMouseEnter={() => { if (ready) setActiveProject(index); }}
                            className={`group relative flex min-w-[180px] flex-1 flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-500 ease-in-out ${isActive
                                    ? "flex-[2.5] border-[var(--copper)] bg-black/80 text-white shadow-2xl scale-[1.01]"
                                    : "border-[var(--line)] bg-[var(--paper)] text-[var(--foreground)] opacity-75 hover:opacity-100"
                                }`}
                            aria-label={`Abrir proyecto ${project.name ?? "sin título"}`}
                        >
                            <div
                                className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <img
                                    src={cover}
                                    alt={project.name ?? "Proyecto"}
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                    className="h-full w-full object-cover grayscale brightness-75 transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            </div>
                            <div className="relative z-10 flex flex-1 items-center justify-center p-5 text-center">
                                <span
                                    className={`display-font text-5xl sm:text-7xl leading-none font-extralight transition-colors duration-300 ${isActive ? "text-white" : "text-[var(--ink-soft)] opacity-40"
                                        }`}
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                            </div>

                            <div className="relative z-10 flex items-end justify-between p-5 pt-10">
                                <div className="text-left">
                                    <h3
                                        className={`display-font text-base sm:text-xl font-medium tracking-tight transition-colors duration-300 ${isActive ? "text-white" : "text-[var(--foreground)]"
                                            }`}
                                    >
                                        {project.name}
                                    </h3>
                                    {project.tagline && (
                                        <p
                                            className={`mt-1 line-clamp-1 text-xs transition-colors duration-300 ${isActive ? "text-gray-300" : "text-[var(--ink-soft)]"
                                                }`}
                                        >
                                            {project.tagline}
                                        </p>
                                    )}
                                </div>

                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isActive
                                            ? "border-white/40 bg-white/10 text-white backdrop-blur-md"
                                            : "border-[var(--line)] text-[var(--ink-soft)]"
                                        }`}
                                >
                                    <span className="text-sm transform transition-transform group-hover:rotate-45">↗</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {open && <Modal project={open} onClose={() => setOpen(null)} />}
        </>
    );
}

function Modal({ project, onClose }: { project: ProjectItemExt; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={project.name ?? "Proyecto"}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border hairline bg-[var(--paper)] text-sm font-bold shadow hover:border-[var(--copper)] hover:text-[var(--copper)]"
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--line)]">
                    <img
                        src={
                            project.coverUrl && project.coverUrl.trim()
                                ? project.coverUrl.trim()
                                : projectCoverUrl(project.name ?? "")
                        }
                        alt={project.name ?? "Proyecto"}
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="p-6 sm:p-8">
                    <p className="eyebrow">Proyecto</p>
                    <h2 className="display-font mt-3 text-4xl leading-tight">{project.name}</h2>
                    {project.description && (
                        <p className="mt-5 whitespace-pre-line text-base leading-7 text-[var(--ink-soft)]">
                            {project.description}
                        </p>
                    )}

                    {(() => {
                        const mediaIfAny = project.videoUrl && project.videoUrl.trim();
                        const src = mediaIfAny || projectVideoUrl(project.name ?? "");
                        const isEmbed = /\.(mp4|webm|ogg)(\?|#|$)/i.test(src);
                        if (!src) return null;
                        return (
                            <div className="mt-6">
                                {isEmbed ? (
                                    <video
                                        key={src}
                                        src={src}
                                        controls
                                        playsInline
                                        preload="metadata"
                                        className="w-full rounded-xl border hairline bg-black"
                                        aria-label="Video del proyecto"
                                    >
                                        Tu navegador no soporta video.
                                    </video>
                                ) : (
                                    <a
                                        href={src}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]"
                                    >
                                        ▶ Ver video del proyecto
                                    </a>
                                )}
                            </div>
                        );
                    })()}

                    <div className="mt-8 flex flex-wrap gap-3">
                        {project.link ? (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[var(--copper)] px-6 py-3 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-105"
                            >
                                Quiero unirme →
                            </a>
                        ) : null}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border hairline px-6 py-3 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}