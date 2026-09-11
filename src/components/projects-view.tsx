"use client";

import { useEffect, useState } from "react";
import {
  projectCoverUrl,
  projectVideoUrl,
  whatsappHref,
  siteConfig,
} from "@/lib/site";
import type { ProjectItemExt } from "@/lib/cms";
import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";
import { WhatsAppIcon } from "@/components/ui-icons";

const PAGE_SIZE = 8; // 4 columnas x 2 filas en escritorio

type MediaKind =
  | { type: "youtube"; embed: string; thumb: string }
  | { type: "vimeo"; embed: string }
  | { type: "file"; url: string };

function youtubeInfo(url: string): { id: string; embed: string; thumb: string } | null {
  const clean = (url || "").trim();
  const m = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(clean);
  if (!m) return null;
  const id = m[1];
  return {
    id,
    embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

function vimeoInfo(url: string): { id: string; embed: string } | null {
  const clean = (url || "").trim();
  const m = /(?:vimeo\.com|player\.vimeo\.com\/video)\/(\d+)(?:[/?#].*)?$/i.exec(clean);
  if (!m) return null;
  const id = m[1];
  return {
    id,
    embed: `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0`,
  };
}

const MEDIA_FILE_RE = /\.(mp4|webm|ogv|ogg|m4v)(\?|#|$)/i;

/** Decide cómo reproducir el medio SIEMPRE dentro de la app (nunca en otra pestaña). */
function resolveMedia(project: ProjectItemExt): MediaKind | null {
  if (project.videoFileUrl && project.videoFileUrl.trim()) {
    return { type: "file", url: project.videoFileUrl.trim() };
  }
  if (project.videoUrl && project.videoUrl.trim()) {
    const raw = project.videoUrl.trim();
    const yt = youtubeInfo(raw);
    if (yt) return { type: "youtube", embed: yt.embed, thumb: yt.thumb };
    const vm = vimeoInfo(raw);
    if (vm) return { type: "vimeo", embed: vm.embed };
    if (MEDIA_FILE_RE.test(raw)) return { type: "file", url: raw };
  }
  // Último recurso: el clip subido por el proyecto en el backend (mismo flujo actual).
  const fallback = projectVideoUrl(project.name ?? "");
  if (fallback) return { type: "file", url: fallback };
  return null;
}

function coverOf(project: ProjectItemExt): string {
  if (project.coverUrl && project.coverUrl.trim()) return project.coverUrl.trim();
  return projectCoverUrl(project.name ?? "");
}

export function ProjectsView({ items }: { items: ProjectItemExt[] }) {
  const [selected, setSelected] = useState<ProjectItemExt | null>(null);
  const [page, setPage] = useState(1);

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const totalPages = Math.max(1, Math.ceil(safeItems.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const pageStart = (activePage - 1) * PAGE_SIZE;
  const pageItems = safeItems.slice(pageStart, pageStart + PAGE_SIZE);

  function changePage(next: number) {
    setSelected(null);
    setPage(next);
  }

  if (safeItems.length === 0) {
    return (
      <p className="rounded-2xl border hairline bg-[var(--paper)] px-6 py-16 text-center text-sm text-[var(--ink-soft)]">
        Aún no hay proyectos publicados.
      </p>
    );
  }

  return (
    <>
      {/* Hero: imagen editable desde /admin/contenido (slot proyectos) */}
      <PageHero
        slot="proyectos"
        title={<>Construir ideas para hacerlas <em className="script-font text-[var(--copper)]">realidad.</em></>}
      >
        Una mirada a las apuestas que construimos con visión: tiempo, capital y ejecución al
        servicio de transformar ciudades y comunidades.
      </PageHero>

      {/* Cinta / mensaje corriendo */}
      {(() => {
        const content = ["Construir con visión", "Invertir con propósito", "Ejecutar con disciplina", "Dejar huella en cada esquina"];
        const Strip = (
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {content.map((phrase) => (
              <span key={phrase} className="flex items-center text-sm font-semibold uppercase tracking-[0.22em]">
                <span className="px-6">{phrase}</span>
                <span className="text-[var(--copper)]">✦</span>
              </span>
            ))}
          </div>
        );
        return (
          <section className="marquee-mask overflow-hidden border-y hairline bg-[var(--forest)] py-4 text-[var(--background)]">
            <div className="flex w-max marquee-track">
              {Strip}
              {Strip}
            </div>
          </section>
        );
      })()}

      {/* Grilla + paginación */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Portafolio</p>
            <h2 className="display-font mt-3 text-4xl leading-none sm:text-5xl">Proyectos recientes</h2>
          </div>
          <p className="hidden text-sm text-[var(--ink-soft)] sm:block">
            {safeItems.length} {safeItems.length === 1 ? "proyecto" : "proyectos"}
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 lg:gap-x-3">
          {pageItems.map((project) => (
            <button
              key={project.slug ?? project.name ?? coverOf(project)}
              type="button"
              onClick={() => setSelected(project)}
              aria-label={`Ver el proyecto ${project.name ?? "sin título"}`}
              className="group shrink-0 w-[240px] snap-start flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] text-left transition duration-300 hover:-translate-y-1 hover:border-[var(--copper)] hover:shadow-xl"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverOf(project)}
                  alt={project.name ?? "Proyecto"}
                  loading="lazy"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/90 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v2h7.6L5 17.6 6.4 19 17 8.4V16h2V5H8Z" />
                  </svg>
                </span>
              </div>
              <div className="flex flex-1 flex-col px-3 py-3.5 sm:px-4 sm:py-5">
                <h3 className="display-font text-lg leading-tight">{project.name}</h3>
                {project.tagline ? (
                  <p className="mt-1 line-clamp-3 text-xs text-[var(--ink-soft)]">{project.tagline}</p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--copper)] transition group-hover:gap-3">
                  Ver proyecto <span>→</span>
                </span>
              </div>
            </button>
          ))}
        </div>

        {totalPages > 1 ? (
          <nav aria-label="Paginación de proyectos" className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => changePage(activePage - 1)}
              disabled={activePage <= 1}
              aria-label="Página anterior"
              className="rounded-full border hairline px-4 py-2 text-sm disabled:opacity-40"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((numberPage) => (
              <button
                key={numberPage}
                type="button"
                onClick={() => changePage(numberPage)}
                aria-current={numberPage === activePage ? "page" : undefined}
                className={`h-10 w-10 rounded-full text-sm ${
                  numberPage === activePage
                    ? "bg-[var(--forest)] font-semibold text-[var(--background)]"
                    : "border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)]"
                }`}
              >
                {numberPage}
              </button>
            ))}
            <button
              type="button"
              onClick={() => changePage(activePage + 1)}
              disabled={activePage >= totalPages}
              aria-label="Página siguiente"
              className="rounded-full border hairline px-4 py-2 text-sm disabled:opacity-40"
            >
              →
            </button>
          </nav>
        ) : null}
      </section>

      {selected ? <Modal project={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}


function Modal({ project, onClose }: { project: ProjectItemExt; onClose: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [play, setPlay] = useState(false);

  const media = resolveMedia(project);
  const waMessage = `Hola, me interesa el proyecto "${project.name || siteConfig.brand}". Quiero ser parte.`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={project.name ?? "Proyecto"}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] shadow-[0_24px_72px_-24px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border hairline bg-[var(--paper)]/90 text-sm font-bold backdrop-blur-sm transition hover:rotate-90 hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
          ✕
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {/* El video se reproduce aquí, dentro de la app */}
          <div className="relative aspect-video w-full bg-[var(--line)]">
            {media && media.type === "file" ? (
              <video
                key={media.url}
                src={media.url}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full bg-black object-contain"
              >
                Tu navegador no puede reproducir el video.
              </video>
            ) : media && media.type === "youtube" ? (
              play ? (
                <iframe
                  className="h-full w-full"
                  src={media.embed}
                  title={`Video de ${project.name || "proyecto"}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlay(true)}
                  aria-label={`Reproducir video de ${project.name || "proyecto"}`}
                  className="relative h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.thumb}
                    alt="Portada del video"
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--copper)] pl-1 text-2xl text-[var(--forest-deep)] shadow-xl transition hover:scale-110 sm:h-20 sm:w-20">
                      ▶
                    </span>
                  </span>
                </button>
              )
            ) : media && media.type === "vimeo" ? (
              play ? (
                <iframe
                  className="h-full w-full"
                  src={media.embed}
                  title={`Video de ${project.name || "proyecto"}`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlay(true)}
                  aria-label={`Reproducir video de ${project.name || "proyecto"}`}
                  className="relative h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverOf(project)} alt={project.name ?? "Proyecto"} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--copper)] pl-1 text-2xl text-[var(--forest-deep)] shadow-xl transition hover:scale-110 sm:h-20 sm:w-20">
                      ▶
                    </span>
                  </span>
                </button>
              )
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={coverOf(project)} alt={project.name ?? "Proyecto"} className="h-full w-full object-cover" />
            )}
          </div>

          <div className="p-5 sm:p-8">
            <p className="eyebrow">Proyecto</p>
            <h2 className="display-font mt-3 text-3xl leading-tight sm:text-5xl">{project.name}</h2>
            {project.tagline ? (
              <p className="mt-2 text-sm font-semibold text-[var(--ink-soft)]">{project.tagline}</p>
            ) : null}
            {project.description ? (
              <p className="mt-5 whitespace-pre-line text-base leading-7 text-[var(--ink-soft)]">{project.description}</p>
            ) : null}

            <div className="mt-8">
              {sent ? (
                <p role="status" aria-live="polite" className="rounded-xl border border-[var(--forest)] bg-[var(--lime)] px-5 py-4 text-sm font-semibold text-[var(--forest-deep)]">
                  ✓ Gracias{project.name ? `, te contactaremos sobre "${project.name}".` : "! Recibimos tus datos"}
                </p>
              ) : showForm ? (
                <div className="rounded-xl border hairline bg-[var(--lime)] p-5 sm:p-6">
                  <p className="font-semibold">Quiero ser parte · {project.name}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    Déjame tus datos y te alcanzo la información del proyecto.
                  </p>
                  <div className="mt-4">
                    <LeadForm
                      onSubmitted={(ok) => {
                        if (ok) {
                          setSent(true);
                          setShowForm(false);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
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
                  <a
                    href={whatsappHref(waMessage)}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    <WhatsAppIcon />
                    Contáctame por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 rounded-full border hairline px-6 py-3 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
                  >
                    Dejar mis datos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

