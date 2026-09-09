"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listPublishedCourses, type Course } from "@/lib/api/courses";

function formatModulesCount(count: number | undefined): string {
    if (!count) return "Sin módulos";
    return `${count} ${count === 1 ? "módulo" : "módulos"}`;
}

export function FeaturedCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void Promise.resolve().then(async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 4 });
                setCourses(result.items);
            } catch {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        });
    }, []);

    if (!loading && courses.length === 0) {
        return null;
    }

    return (
        <section className="border-t hairline bg-[var(--background)]">
            <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
                <div className="mb-8 flex flex-col gap-6 border-b hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Aprendizaje</p>
                        <h2 className="display-font mt-5 max-w-2xl text-4xl leading-[0.98] sm:text-6xl">Cursos que transforman <em className="script-font text-[var(--copper)]">tu perspectiva.</em></h2>
                    </div>
                    <Link href="/cursos" className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[var(--copper)] px-6 py-3.5 text-base font-bold text-[var(--forest-deep)] shadow-[0_10px_24px_rgba(244,197,66,0.35)] transition hover:brightness-110 hover:-translate-y-0.5">Ver todos los cursos<span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span></Link>
                </div>

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="animate-pulse rounded-2xl border hairline bg-[var(--paper)]">
                                <div className="aspect-[4/3] rounded-t-2xl bg-[var(--line)]" />
                                <div className="space-y-3 p-5">
                                    <div className="h-3 w-20 rounded bg-[var(--line)]" />
                                    <div className="h-6 w-3/4 rounded bg-[var(--line)]" />
                                    <div className="h-4 w-full rounded bg-[var(--line)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {courses.map((course) => (
                            <Link key={course.id} href="/cursos" className="group card-pop flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {course.coverImageUrl ? (
                                        <Image src={course.coverImageUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover transition duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[var(--forest)]">
                                            <span className="display-font text-5xl text-[var(--background)]">
                                                {course.title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "C"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col px-4 py-5 sm:px-5 sm:py-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{formatModulesCount(course.modules?.length)}</p>
                                    <h3 className="display-font mt-3 text-2xl leading-tight">{course.title}</h3>
                                    {course.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">{course.description}</p>}
                                    <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)]">
                                        <span className="eyebrow">Explorar curso</span>
                                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}