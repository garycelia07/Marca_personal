import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageIntro, SiteShell } from "@/components/site-shell";
import { getCourse } from "@/lib/api/courses";
import { EnrollCourseButton } from "@/components/course-enroll";
import { getCurrentUser } from "@/lib/api/auth";
import { backendFetch } from "@/lib/api/backend";
import { publicBackendOrigin } from "@/lib/site";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const course = await getCourse(id);
        return {
            title: `${course.title} | Gary Mayhua`,
            description: course.description ?? undefined
        };
    } catch {
        return { title: "Curso | Gary Mayhua" };
    }
}

export default async function CursoDetallePage({ params }: Props) {
    // 1. Await explícito de params para Next.js 15+
    const { id } = await params;

    let course;
    try {
        course = await getCourse(id);
    } catch {
        notFound();
    }

    if (!course) {
        notFound();
    }

    const sortedModules = [...(course.modules ?? [])].sort((a, b) => a.order - b.order);
    const backendRoot = publicBackendOrigin();

    // Acceso: si es estudiante con ese curso habilitado, ve "Tengo acceso".
    let hasAccess = false;
    const user = await getCurrentUser();
    if (user?.role === "STUDENT" && course.id) {
        try {
            const res = await backendFetch("/enrollments/me?page=1&limit=100");
            const payload = await res.json().catch(() => null) as { data?: { courseId?: string }[]; items?: { courseId?: string }[] };
            const list = Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: { courseId?: string }[] }).data : (payload?.items ?? []);
            hasAccess = list.some((e) => e.courseId === course.id);
        } catch {
            hasAccess = false;
        }
    }

    return (
        <SiteShell>
            <PageIntro eyebrow="Aprendizaje" title={course.title} description={course.description as string} />
            <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:py-14">
                <Link href="/cursos" className="editorial-link text-sm font-semibold">
                    ← Todos los cursos
                </Link>

                {course.coverImageUrl && (
                    <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-2xl">
                        <Image
                            src={course.coverImageUrl}
                            alt={course.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                )}

                <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
                    <div>
                        {sortedModules.length === 0 ? (
                            <div className="rounded-2xl border hairline bg-[var(--paper)] px-6 py-10 text-center">
                                <p className="eyebrow">Próximamente</p>
                                <p className="mt-2 text-sm text-[var(--ink-soft)]">Este curso está en preparación.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="eyebrow">Contenido del curso</p>
                                {sortedModules.map((module) => (
                                    <article key={module.id} className="overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                                        <div className="flex items-center gap-3 border-b hairline px-5 py-4 sm:px-6">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-sm font-bold text-[var(--copper)]">
                                                {module.order + 1}
                                            </span>
                                            <h2 className="display-font text-xl">{module.title}</h2>
                                        </div>
                                        <ul className="divide-y hairline">
                                            {(module.lessons ?? []).sort((a, b) => a.order - b.order).map((lesson) => (
                                                <li key={lesson.id} className="px-5 py-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-[var(--copper)]">▶</span>
                                                        <p className="text-sm font-semibold">{lesson.title}</p>
                                                    </div>
                                                    {lesson.description ? <p className="mt-1 text-sm text-[var(--ink-soft)]">{lesson.description}</p> : null}
                                                    {hasAccess ? (
                                                        <div className="mt-3">
                                                            <video
                                                                controls
                                                                playsInline
                                                                preload="metadata"
                                                                className="max-w-full rounded-lg border hairline bg-black"
                                                                src={lesson.videoUrl || `${backendRoot}/api/v1/courses/lessons/${lesson.id}/video`}
                                                                aria-label={`Video: ${lesson.title}`}
                                                            >
                                                                Tu navegador no soporta video.
                                                            </video>
                                                        </div>
                                                    ) : null}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border hairline bg-[var(--paper)] p-6">
                            <p className="eyebrow">Resumen</p>
                            <dl className="mt-6 space-y-4 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[var(--ink-soft)]">Módulos</dt>
                                    <dd className="font-semibold">{sortedModules.length}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[var(--ink-soft)]">Lecciones</dt>
                                    <dd className="font-semibold">
                                        {sortedModules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0)}
                                    </dd>
                                </div>
                            </dl>
                            {hasAccess ? (
                            <EnrollCourseButton courseTitle={course.title} hasAccess />
                        ) : (
                            <EnrollCourseButton courseTitle={course.title} />
                        )}
                            <Link href="/iniciar-sesion" className="mt-3 inline-flex w-full items-center justify-center rounded-full border hairline px-6 py-3 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                                Ya tengo acceso · Iniciar sesión
                            </Link>
                            <Link href="/cursos" className="mt-3 inline-flex w-full items-center justify-center rounded-full border hairline px-6 py-3 text-sm font-semibold transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                                Ver más cursos
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </SiteShell>
    );
}