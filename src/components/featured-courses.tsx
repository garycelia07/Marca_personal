"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listPublishedCourses, type Course } from "@/lib/api/courses";

function formatModulesCount(count: number): string {
    if (!count) return "Sin módulos";
    return `${count} ${count === 1 ? "módulo" : "módulos"}`;
}

export function FeaturedCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void Promise.resolve().then(async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 3 });
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
            <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mb-12 flex flex-col gap-6 border-b hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Aprendizaje</p>
                        <h2 className="display-font mt-5 max-w-2xl text-4xl leading-[0.98] sm:text-6xl">Cursos que transforman <em className="script-font text-[var(--copper)]">tu perspectiva.</em></h2>
                    </div>
                    <Link href="/cursos" className="editorial-link text-sm font-semibold">Ver todos los cursos</Link>
                </div>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="animate-pulse rounded-2xl border hairline bg-[var(--paper)]">
                                <div className="aspect-[4/3] rounded-t-2xl bg-[var(--line)]" />
                                <div className="space-y-3 p-6">
                                    <div className="h-3 w-20 rounded bg-[var(--line)]" />
                                    <div className="h-6 w-3/4 rounded bg-[var(--line)]" />
                                    <div className="h-4 w-full rounded bg-[var(--line)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                        {courses.map((course, index) => (
                            <Link key={course.id} href={`/cursos/${course.id}`} className="group card-pop flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {course.coverImageUrl ? (
                                        <Image src={course.coverImageUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover transition duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[var(--forest)]">
                                            <span className="display-font text-5xl text-[var(--background)]">{String(index + 1).padStart(2, "0")}</span>
                                        </div>
                                    )}
                                    <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--copper)]/40 bg-[var(--lime)]/90 text-sm font-bold text-[var(--copper)] backdrop-blur-sm">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="flex flex-1 flex-col px-5 py-6 sm:px-7 sm:py-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{formatModulesCount(course.modules?.length)}</p>
                                    <h3 className="display-font mt-4 text-3xl leading-tight">{course.title}</h3>
                                    {course.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">{course.description}</p>}
                                    <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)]">
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