import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { backendFetch } from "@/lib/api/backend";
import type { Enrollment } from "@/lib/api/enrollments";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

// Datos de ejemplo eliminados: la pantalla usa únicamente los datos reales del estudiante.
const progress: { label: string; value: number; note: string }[] = [];
const nextLessons: { title: string; module: string; time: string }[] = [];

export default async function EstudianteDashboard() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "STUDENT") {
        redirect("/admin");
    }

    let myEnrollments: Enrollment[] = [];
    try {
        const response = await backendFetch("/enrollments/me?page=1&limit=100");
        const payload = await response.json().catch(() => null) as { data?: Enrollment[]; items?: Enrollment[] } | null;
        const list = Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: Enrollment[] }).data : (payload?.items ?? []);
        if (response.ok) myEnrollments = list;
    } catch {
        // los cursos asignados no bloquean el panel
    }
    const myCourseIds = new Set(myEnrollments.flatMap((e) => (e.courseId ? [e.courseId] : [])));

    // Otros cursos publicados a los que aún no está matriculado.
    let otherCourses: { id: string; title: string; description?: string; coverImageUrl?: string | null; moduleCount?: number }[] = [];
    try {
        const res = await backendFetch("/courses?page=1&limit=100");
        const payload = await res.json().catch(() => null) as { data?: { id: string; title: string; description?: string | null; coverImageUrl?: string | null; modules?: unknown[] }[] } | null;
        const items = Array.isArray(payload?.data) ? payload.data : [];
        otherCourses = items.filter((c) => !myCourseIds.has(c.id)).map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description ?? undefined,
            coverImageUrl: c.coverImageUrl,
            moduleCount: Array.isArray(c.modules) ? c.modules.length : 0,
        }));
    } catch {
        otherCourses = [];
    }

    const initials = user.fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <SiteShell>
            <PageIntro
                eyebrow="Panel estudiantil"
                title="Tu espacio de crecimiento."
                description={`Hola, ${user.fullName}. Sigue tu avance, retoma donde lo dejaste y accede a los recursos de tu programa.`}
            />
            <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--forest)] text-base text-[var(--background)]">{initials || "A"}</span>
                    <div>
                        <p className="text-sm font-semibold">{user.fullName}</p>
                        <p className="text-xs text-[var(--ink-soft)]">{user.email}</p>
                    </div>
                    <span className="ml-auto rounded-full border hairline bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-[var(--forest-deep)]">ESTUDIANTE</span>
                </div>

                <div className="mt-14 grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
                    <section>
                        <SectionLabel number="01">Tu avance</SectionLabel>
                        <ul className="mt-8 space-y-5">
                            {progress.map((item) => (
                                <li key={item.label} className="rounded-md border hairline bg-[var(--paper)] p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold">{item.label}</p>
                                        <p className="text-xs text-[var(--ink-soft)]">{item.value}%</p>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--line)]">
                                        <div className="h-full bg-[var(--copper)]" style={{ width: `${item.value}%` }} />
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--ink-soft)]">{item.note}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <SectionLabel number="02">Continúa donde lo dejaste</SectionLabel>
                            <Link href="/mi-historia" className="editorial-link text-sm font-semibold">Mi historia</Link>
                        </div>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {nextLessons.map((lesson) => (
                                <Link key={lesson.title} href="/mi-historia" className="group rounded-md border hairline bg-[var(--background)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--copper)] hover:bg-[var(--lime)]">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border hairline text-[var(--copper)] transition group-hover:rotate-45">▶</span>
                                    <h3 className="display-font mt-12 text-3xl">{lesson.title}</h3>
                                    <p className="mt-4 text-sm text-[var(--ink-soft)]">{lesson.module}</p>
                                    <p className="mt-2 text-xs text-[var(--ink-soft)]">{lesson.time}</p>
                                </Link>
                            ))}
                            <Link href="/servicios" className="flex items-center justify-center rounded-md border border-dashed hairline bg-transparent p-6 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                                Ver más recursos ↗
                            </Link>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link href="/mi-historia" className="rounded-full bg-[var(--forest)] px-7 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">Continuar aprendiendo</Link>
                            <Link href="https://wa.me/?text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20una%20mentor%C3%ADa." target="_blank" rel="noreferrer" className="rounded-full border hairline px-7 py-3 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Agendar una mentoría</Link>
                        </div>
                    </section>

                    <section className="mt-12 border-t hairline pt-8 lg:col-span-2">
                        <SectionLabel number="03">Mis cursos asignados</SectionLabel>
                        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                            {myEnrollments.length === 0 ? (
                                <li className="rounded-md border hairline bg-[var(--paper)] px-4 py-6 text-sm text-[var(--ink-soft)]">
                                    Aún no tienes cursos asignados. Cuando compres y el admin te habilite uno, aparecerá aquí y podrás ver sus videos.
                                </li>
                            ) : (
                                myEnrollments.map((enrollment) => (
                                    <li key={enrollment.id} className="group rounded-xl border hairline bg-[var(--paper)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--copper)]">
                                        <p className="text-sm font-semibold">{enrollment.course?.title ?? "Curso"}</p>
                                        {enrollment.expiresAt && <p className="mt-1 text-xs text-[var(--ink-soft)]">Acceso hasta: {new Date(enrollment.expiresAt).toLocaleDateString("es-ES")}</p>}
                                        <Link
                                            href={enrollment.courseId ? `/cursos/${enrollment.courseId}` : "/estudiante"}
                                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-4 py-2 text-xs font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]"
                                        >
                                            ▶ Ver y reproducir videos
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </section>

                    {otherCourses.length > 0 && (
                        <section className="mt-12 border-t hairline pt-8 lg:col-span-2">
                            <SectionLabel number="04">Otros cursos disponibles</SectionLabel>
                            <p className="mt-2 text-sm text-[var(--ink-soft)]">
                                Cursos del catálogo a los que aún no tienes acceso. Si te interesa uno, solicita tu inscripción y se te habilitará al comprarlo.
                            </p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {otherCourses.map((other) => (
                                    <article key={other.id} className="flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                                        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--line)]">
                                            {other.coverImageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={other.coverImageUrl} alt={other.title} loading="lazy" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[var(--forest)] text-[var(--background)]">✦</div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Curso</p>
                                            <h3 className="display-font mt-2 text-2xl leading-tight">{other.title}</h3>
                                            {other.description && <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-soft)]">{other.description}</p>}
                                            <Link
                                                href={`/cursos/${other.id}`}
                                                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--copper)] px-4 py-2 text-xs font-bold text-[var(--forest-deep)] transition hover:brightness-105"
                                            >
                                                Inscribirme al curso
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )

                    }
                </div>
            </section>
        </SiteShell>
    );
}