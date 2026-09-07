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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void Promise.resolve().then(async () => {
            try {
                const result = await listPublishedCourses({ page: 1, limit: 50 });
                setCourses(result.items);
            } catch {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        });
    }, []);

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
                <Link key={course.id} href={`/cursos/${course.id}`} className="group card-pop flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                        {course.coverImageUrl ? (
                            <Image src={course.coverImageUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover transition duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[var(--forest)]">
                                <span className="display-font text-6xl text-[var(--background)]">{String(index + 1).padStart(2, "0")}</span>
                            </div>
                        )}
                        <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lime)]/90 text-sm font-bold text-[var(--copper)] backdrop-blur-sm">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    </div>
                    <div className="flex flex-1 flex-col px-5 py-6 sm:px-7 sm:py-8">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{formatModulesCount(course.modules?.length)}</p>
                        <h3 className="display-font mt-4 text-3xl leading-tight">{course.title}</h3>
                        {course.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">{course.description}</p>}
                        <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)]">
                            <span className="eyebrow">Ver curso</span>
                            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}