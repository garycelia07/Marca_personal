import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { backendGetJson, tokenFromCookies, type Paginated } from "@/lib/api/backend";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

type CourseRef = {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    coverImageUrl?: string | null;
};

type EnrollmentRow = {
    id: string;
    courseId: string;
    expiresAt?: string | null;
    progressPercent: number;
    course: CourseRef;
};

type CourseDetail = CourseRef & {
    modules?: {
        id: string;
        title: string;
        order: number;
        lessons?: { id: string; title: string; videoUrl?: string | null }[];
    }[];
    materials?: { id: string; title: string; mimeType: string; isPublic: boolean }[];
};

function fmtDate(value?: string | null): string {
    if (!value) return "Sin fecha de vencimiento";
    return new Date(value).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
}

export default async function EstudianteDashboard() {
    const user = await getCurrentUser();
    if (!user) redirect("/iniciar-sesion");
    if (user.role !== "STUDENT") redirect("/admin");

    const token = await tokenFromCookies();
    const myCatalog = await backendGetJson<Paginated<EnrollmentRow>>("/enrollments/me", token).catch(() => null);
    const enrollments = myCatalog?.data ?? [];

    const details: CourseDetail[] = [];
    for (const row of enrollments) {
        const detail = await backendGetJson<CourseDetail>(`/courses/${row.courseId}`, token).catch(() => null);
        if (detail) details.push(detail);
    }

    const expired = enrollments.filter(
        (e) => e.expiresAt && new Date(e.expiresAt).getTime() < Date.now()
    ).length;

    const initials = (user.fullName || "G")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <SiteShell>
            <PageIntro
                eyebrow="Panel estudiantil"
                title="Tu espacio de aprendizaje."
                description={`Hola, ${user.fullName}. Estas son las rutas y materiales a los que tienes acceso desde la plataforma.`}
            />
            <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--forest)] text-base text-[var(--background)]">{initials}</span>
                    <div>
                        <p className="text-sm font-semibold">{user.fullName}</p>
                        <p className="text-xs text-[var(--ink-soft)]">{user.email}</p>
                    </div>
                    <span className="ml-auto rounded-full border hairline bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-[var(--forest-deep)]">ESTUDIANTE</span>
                </div>

                {expired > 0 && (
                    <p className="mt-6 rounded-md border border-[var(--danger)] bg-[var(--lime)] px-4 py-3 text-sm text-[var(--danger)]">
                        Tienes {expired} curso(s) con acceso vencido. Contacta a soporte para renovarlo.
                    </p>
                )}

                <div className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1.6fr]">
                    <section>
                        <SectionLabel number="01">Resumen</SectionLabel>
                        <ul className="mt-6 space-y-3 text-sm">
                            <li className="flex items-center justify-between border hairline bg-[var(--paper)] px-4 py-3">
                                <span className="text-[var(--ink-soft)]">Cursos inscritos</span>
                                <span className="display-font text-2xl">{enrollments.length}</span>
                            </li>
                            {enrollments.slice(0, 6).map((row) => (
                                <li key={row.id} className="border hairline bg-[var(--paper)] px-4 py-3">
                                    <p className="font-semibold">{row.course.title}</p>
                                    <p className="mt-1 text-xs text-[var(--ink-soft)]">
                                        Progreso {row.progressPercent}% · Vence: {fmtDate(row.expiresAt)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center justify-between">
                            <SectionLabel number="02">Contenido asignado</SectionLabel>
                            <Link href="/" className="editorial-link text-sm font-semibold">Volver al inicio</Link>
                        </div>
                        {details.length === 0 ? (
                            <p className="mt-10 rounded-md border hairline bg-[var(--paper)] px-5 py-8 text-sm text-[var(--ink-soft)]">
                                Aún no tienes cursos asignados en esta cuenta.
                            </p>
                        ) : (
                            <div className="mt-8 grid gap-5 md:grid-cols-1">
                                {details.map((course) => {
                                    const moduleCount = course.modules?.length ?? 0;
                                    const lessonCount =
                                        course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;
                                    const materialCount = course.materials?.length ?? 0;
                                    return (
                                        <article key={course.id} className="border hairline bg-[var(--background)] p-6 sm:p-8">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <SectionLabel number="03">Curso</SectionLabel>
                                                <span className="text-xs text-[var(--ink-soft)]">
                                                    {moduleCount} mód. · {lessonCount} lec. · {materialCount} materi.
                                                </span>
                                            </div>
                                            <h2 className="display-font mt-4 text-3xl leading-none">{course.title}</h2>
                                            {course.description && (
                                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{course.description}</p>
                                            )}

                                            {course.modules && course.modules.length > 0 && (
                                                <div className="mt-6 border-t hairline pt-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Módulos y lecciones</p>
                                                    <ul className="mt-3 space-y-3">
                                                        {course.modules.map((mod) => (
                                                            <li key={mod.id}>
                                                                <p className="text-sm font-semibold">{mod.title}</p>
                                                                {mod.lessons && mod.lessons.length > 0 && (
                                                                    <ul className="mt-2 space-y-1 pl-4">
                                                                        {mod.lessons.map((lesson) => (
                                                                            <li key={lesson.id} className="flex items-start justify-between gap-4 rounded-md bg-[var(--paper)] px-3 py-2">
                                                                                <span className="text-sm text-[var(--ink-soft)]">{lesson.title}</span>
                                                                                {lesson.videoUrl ? (
                                                                                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[var(--copper)] hover:underline">Ver video</a>
                                                                                ) : null}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {course.materials && course.materials.length > 0 && (
                                                <div className="mt-6 border-t hairline pt-5">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">Materiales del curso</p>
                                                    <ul className="mt-3 space-y-2">
                                                        {course.materials.map((material) => (
                                                            <li key={material.id} className="flex items-center justify-between gap-4 rounded-md border hairline px-4 py-2">
                                                                <span className="text-sm">{material.title}</span>
                                                                <a href={`/api/file/${material.id}`} className="shrink-0 text-sm font-semibold text-[var(--copper)] hover:underline" target="_blank" rel="noreferrer">
                                                                    Descargar ↗
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </SiteShell>
    );
}
