"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listPublishedCourses, type Course } from "@/lib/api/courses";

function formatModulesCount(count: number | undefined): string {
    if (!count) return "Sin módulos";
    return `${count} ${count === 1 ? "módulo" : "módulos"}`;
}

export function CoursesGrid() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void Promise.resolve().then(async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 100 });
                setCourses(result.items);
            } catch {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        });
    }, []);

    const PER_PAGE = 8; // 4 de ancho x 2 filas
    const totalPages = Math.max(1, Math.ceil(courses.length / PER_PAGE));
    const activePage = Math.min(page, totalPages);
    const shown = courses.slice((activePage - 1) * PER_PAGE, activePage * PER_PAGE);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="animate-pulse rounded-2xl border hairline bg-[var(--paper)]">
                        <div className="aspect-[16/10] rounded-t-2xl bg-[var(--line)]" />
                        <div className="space-y-3 p-6">
                            <div className="h-3 w-20 rounded bg-[var(--line)]" />
                            <div className="h-6 w-3/4 rounded bg-[var(--line)]" />
                            <div className="h-4 w-full rounded bg-[var(--line)]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="rounded-2xl border hairline bg-[var(--paper)] px-6 py-16 text-center">
                <p className="eyebrow">Próximamente</p>
                <p className="display-font mt-4 text-3xl">Estamos preparando nuevos cursos.</p>
                <p className="mt-3 text-sm text-[var(--ink-soft)]">Vuelve pronto para descubrir programas diseñados para tu crecimiento.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {shown.map((course) => (
                    <Link key={course.id} href={`/cursos/${course.id}`} className="group card-pop flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)]">
                        <div className="relative aspect-[16/10] overflow-hidden">
                            {course.coverImageUrl ? (
                                <Image src={course.coverImageUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 320px" className="object-cover transition duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[var(--forest)]">
                                    <span className="display-font text-5xl text-[var(--background)]">
                                        {course.title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "C"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{formatModulesCount(course.modules?.length)}</p>
                            <h3 className="display-font mt-4 text-2xl leading-tight sm:text-3xl">{course.title}</h3>
                            {course.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">{course.description}</p>}
                            <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)]">
                                <span className="eyebrow">Ver curso</span>
                                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {totalPages > 1 ? (
                <nav aria-label="Paginación" className="mt-12 flex flex-wrap items-center justify-center gap-2">
                    <button type="button" onClick={() => setPage(activePage - 1)} disabled={activePage <= 1} aria-label="Página anterior" className="rounded-full border hairline px-4 py-2 text-sm disabled:opacity-40">←</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            aria-current={p === activePage ? "page" : undefined}
                            className={`h-10 w-10 rounded-full text-sm ${p === activePage ? "bg-[var(--forest)] font-semibold text-[var(--background)]" : "border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)]"}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button type="button" onClick={() => setPage(activePage + 1)} disabled={activePage >= totalPages} aria-label="Página siguiente" className="rounded-full border hairline px-4 py-2 text-sm disabled:opacity-40">→</button>
                </nav>
            ) : null}
        </>
    );
}