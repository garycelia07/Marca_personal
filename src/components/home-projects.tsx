"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getContentJson } from "@/lib/api/content";

type HomeProject = {
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  coverUrl?: string;
  link?: string;
};

export function HomeProjects() {
  const [items, setItems] = useState<HomeProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const data = await getContentJson("PROJECTS");
        const raw = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
        setItems(raw.slice(0, 5).map((r) => ({
          name: String(r.name ?? ""),
          slug: String(r.slug ?? ""),
          tagline: String(r.tagline ?? ""),
          description: String(r.description ?? ""),
          coverUrl: String(r.coverUrl ?? ""),
          link: String(r.link ?? ""),
        })));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="mb-8 flex flex-col gap-6 border-b hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Proyectos</p>
          <h2 className="display-font mt-5 max-w-2xl text-4xl leading-[0.98] tracking-tight sm:text-6xl">
            Ideas que se vuelven <em className="script-font text-[var(--copper)]">realidad.</em>
          </h2>
        </div>
        <Link
          href="/proyectos"
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[var(--copper)] px-6 py-3.5 text-base font-bold text-[var(--forest-deep)] shadow-[0_10px_24px_rgba(244,197,66,0.35)] transition hover:brightness-110 hover:-translate-y-0.5"
        >
          Ver todos los proyectos
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 lg:gap-x-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="animate-pulse shrink-0 w-[72vw] max-w-[330px] snap-start overflow-hidden rounded-2xl border hairline bg-[var(--paper)] sm:w-auto">
              <div className="aspect-[4/3] bg-[var(--line)]" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 rounded bg-[var(--line)]" />
                <div className="h-6 w-3/4 rounded bg-[var(--line)]" />
                <div className="h-4 w-full rounded bg-[var(--line)]" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border hairline px-6 py-14 text-center text-sm text-[var(--ink-soft)]">
          Aún no hay proyectos publicados.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 lg:gap-x-3">
          {items.map((project, index) => {
            const href = project.slug ? `/proyectos#${project.slug}` : "/proyectos";
            const cover = project.coverUrl && project.coverUrl.trim()
              ? project.coverUrl.trim()
              : null;
            return (
              <Link
                key={project.slug || project.name || index}
                href={href}
                className="group card-pop shrink-0 w-[72vw] max-w-[330px] snap-start flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)] sm:w-auto"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--line)]">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={project.name || "Proyecto"}
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--forest)]">
                      <span className="display-font text-5xl text-[var(--background)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-3 py-3.5 sm:px-4 sm:py-5">
                  {project.tagline && (
                    <p className="eyebrow">{project.tagline}</p>
                  )}
                  <h3 className="display-font mt-2.5 text-lg leading-tight">
                    {project.name || "Proyecto"}
                  </h3>
                  {project.description && (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)]">
                    <span>{project.link ? "Conocer más" : "Ver proyecto"}</span>
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}