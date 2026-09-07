"use client";

import { useState } from "react";
import { projectCoverUrl, projectVideoUrl } from "@/lib/site";
import type { ProjectItemExt } from "@/lib/cms";

export function ProjectsGallery({ items }: { items: ProjectItemExt[] }) {
    const [open, setOpen] = useState<ProjectItemExt | null>(null);

    if (items.length === 0) {
        return <p className="text-sm text-[var(--ink-soft)]">Aún no hay proyectos publicados.</p>;
    }

    return (
        <>
            <div className="grid gap-5 md:grid-cols-2">
                {items.map((project, index) => {
                    const cover = project.coverUrl && project.coverUrl.trim()
                        ? project.coverUrl.trim()
                        : projectCoverUrl(project.name ?? "");
                    const hasLink = Boolean(project.link);
                    return (
                        <button
                            type="button"
                            key={project.slug ?? project.name ?? index}
                            onClick={() => setOpen(project)}
                            className="group text-left"
                            aria-label={`Abrir proyecto ${project.name ?? "sin título"}`}
                        >
                            <article className="flex h-full flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)]">
                                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--line)]">
                                    <img
                                        src={cover}
                                        alt={project.name ?? "Proyecto"}
                                        loading="lazy"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col px-5 py-6 sm:px-7 sm:py-7">
                                    <p className="eyebrow">Proyecto</p>
                                    <h2 className="display-font mt-3 text-3xl leading-tight">{project.name}</h2>
                                    {project.tagline && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">{project.tagline}</p>}
                                    <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)]">
                                        <span>{hasLink ? "Más información" : "Descubrir más"}</span>
                                        <span aria-hidden="true">→</span>
                                    </div>
                                </div>
                            </article>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={project.name ?? "Proyecto"}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border hairline bg-[var(--paper)] text-sm font-bold shadow hover:border-[var(--copper)] hover:text-[var(--copper)]"
                    aria-label="Cerrar"
                >✕</button>

                <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--line)]">
                    <img
                        src={project.coverUrl && project.coverUrl.trim() ? project.coverUrl.trim() : projectCoverUrl(project.name ?? "")}
                        alt={project.name ?? "Proyecto"}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="p-6 sm:p-8">
                    <p className="eyebrow">Proyecto</p>
                    <h2 className="display-font mt-3 text-4xl leading-tight">{project.name}</h2>
                    {project.description && <p className="mt-5 whitespace-pre-line text-base leading-7 text-[var(--ink-soft)]">{project.description}</p>}

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
                            > Quiero unirme → </a>
                        ) : null}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border hairline px-6 py-3 text-sm font-semibold transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                        >Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

