"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { listPublishedCourses, type Course } from "@/lib/api/courses";
import { whatsappHref } from "@/lib/site";
import { LeadForm } from "@/components/lead-form";
import { WhatsAppIcon, UserPlusIcon } from "@/components/ui-icons";

function formatModulesCount(count: number | undefined): string {
    if (!count) return "Sin módulos";
    return `${count} ${count === 1 ? "módulo" : "módulos"}`;
}

export function CoursesGrid() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [contactTitle, setContactTitle] = useState<string | null>(null);

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
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 xl:grid-cols-4">
                {shown.map((course) => (
                    <div key={course.id} className="card-pop shrink-0 w-[270px] snap-start flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] transition hover:border-[var(--copper)]">
                        <button
                            type="button"
                            onClick={() => setContactTitle(course.title)}
                            className="group relative aspect-[16/10] block w-full overflow-hidden"
                        >
                            {course.coverImageUrl ? (
                                <Image src={course.coverImageUrl} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 320px" className="object-cover transition duration-700 group-hover:scale-110" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center bg-[var(--forest)]">
                                    <span className="display-font text-5xl text-[var(--background)]">
                                        {course.title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "C"}
                                    </span>
                                </span>
                            )}
                            <span className="absolute inset-0 bg-[#171713]/0 transition group-hover:bg-[#171713]/15" />
                        </button>
                        <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-6">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{formatModulesCount(course.modules?.length)}</p>
                            <button type="button" onClick={() => setContactTitle(course.title)} className="mt-2 text-left display-font text-xl leading-tight transition hover:text-[var(--copper)] sm:text-3xl">{course.title}</button>
                            {course.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">{course.description}</p>}
                            <div className="mt-auto flex flex-col gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setContactTitle(course.title)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--copper)] px-4 py-2.5 text-xs font-bold text-[var(--forest-deep)] transition hover:brightness-105"
                                >
                                    <UserPlusIcon />
                                    Inscribirme / Contactar
                                </button>
                                <a
                                    href={whatsappHref(`Hola, me interesa el curso "${course.title}". Quiero inscribirme.`)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/40 px-4 py-2.5 text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366]/10"
                                >
                                    <WhatsAppIcon />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
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

            {contactTitle ? (
                <CourseContactModal title={contactTitle} onClose={() => setContactTitle(null)} />
            ) : null}
        </>
    );
}

function CourseContactModal({ title, onClose }: { title: string; onClose: () => void }) {
    const waLink = whatsappHref(`Hola, me interesa el curso "${title}". Quiero inscribirme.`);
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Inscribirme: ${title}`}>
            <div className="absolute inset-0 bg-[#171713]/85 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6 text-[var(--foreground)] sm:p-8">
                <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border hairline text-sm font-bold hover:text-[var(--copper)]">✕</button>
                <p className="eyebrow">Quiero este curso</p>
                <h3 className="display-font mt-2 text-3xl leading-tight">Inscribirme · {title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">Deja tus datos para que el equipo te contacte (llegará como un contacto para el admin).</p>
                <div className="mt-5 flex flex-col gap-3">
                    <LeadForm courseName={title} submitLabel="Solicitar inscripción" onSubmitted={(ok) => { if (ok) onClose(); }} />
                    <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105">
                        <WhatsAppIcon />
                        O prefieres WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}