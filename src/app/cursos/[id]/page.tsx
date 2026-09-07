import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageIntro, SiteShell } from "@/components/site-shell";
import { getCourse } from "@/lib/api/courses";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const course = await getCourse(id);
        return {
            title: `${course.title} | Áurea`,
            description: course.description ?? undefined
        };
    } catch {
        return { title: "Curso | Áurea" };
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
                                                <li key={lesson.id} className="px-5 py-3 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-[var(--copper)]">▶</span>
                                                        <p className="text-sm font-semibold">{lesson.title}</p>
                                                    </div>
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
                            <Link href="/iniciar-sesion" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">
                                Iniciar sesión para acceder
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