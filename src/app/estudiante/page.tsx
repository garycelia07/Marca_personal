import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { backendFetch } from "@/lib/api/backend";
import type { Enrollment } from "@/lib/api/enrollments";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

type Catalog = { id: string; title: string; description: string; coverImageUrl?: string | null; lessons: number };

export const dynamic = "force-dynamic";

export default async function EstudianteDashboard() {
    const user = await getCurrentUser();
    if (!user) redirect("/iniciar-sesion");
    if (user.role !== "STUDENT") redirect("/admin");

    let enrollment: Enrollment[] = [];
    let cat: Catalog[] = [];
    try {
        const resp = await backendFetch("/enrollments/me?page=1&limit=100");
        const json = await resp.json().catch(() => null) as { data?: Enrollment[]; items?: Enrollment[] };
        enrollment = Array.isArray((json as { data?: unknown } | null)?.data) ? (json as { data: Enrollment[] }).data : (json?.items ?? []);
    } catch { enrollment = []; }
    try {
        const resp = await backendFetch("/courses?page=1&limit=100");
        const json = await resp.json().catch(() => null) as { data?: { id: string; title: string; description?: string | null; coverImageUrl?: string | null; modules?: { lessons?: unknown[] }[] }[] };
        cat = (json?.data ?? []).map((c) => ({
            id: c.id, title: c.title, description: c.description ?? "", coverImageUrl: c.coverImageUrl,
            lessons: (c.modules ?? []).reduce((n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0),
        }));
    } catch { cat = []; }

    const mine = enrollment
        .map((e) => ({ enrollment: e, item: cat.find((c) => c.id === e.courseId) }))
        .filter((x): x is { enrollment: Enrollment; item: Catalog } => Boolean(x.item));
    const mineIds = new Set(mine.map((m) => m.item.id));
    const locked = cat.filter((c) => !mineIds.has(c.id));
    const initials = user.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

    return (
        <SiteShell>
            <PageIntro eyebrow="Panel estudiantil" title="Tu espacio de crecimiento."
                description={`Hola, ${user.fullName}. Aquí están tus cursos inscritos para ver y reproducir sus videos.`} />
            <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--forest)] text-base text-[var(--background)]">{initials || "A"}</span>
                    <div>
                        <p className="text-sm font-semibold">{user.fullName}</p>
                        <p className="text-xs text-[var(--ink-soft)]">{user.email}</p>
                    </div>
                    <span className="ml-auto rounded-full border hairline bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-[var(--forest-deep)]">ESTUDIANTE</span>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border hairline bg-[var(--paper)] p-5"><p className="eyebrow">Cursos inscritos</p><p className="display-font mt-3 text-4xl">{mine.length}</p></div>
                    <div className="rounded-xl border hairline bg-[var(--paper)] p-5"><p className="eyebrow">Videos con acceso</p><p className="display-font mt-3 text-4xl">{mine.reduce((n, m) => n + m.item.lessons, 0)}</p></div>
                    <div className="rounded-xl border hairline bg-[var(--paper)] p-5"><p className="eyebrow">En el catálogo</p><p className="display-font mt-3 text-4xl">{cat.length}</p></div>
                </div>

                <SectionLabel number="01">Mis cursos inscritos</SectionLabel>
                {mine.length === 0 ? (
                    <p className="mt-4 rounded-2xl border hairline bg-[var(--paper)] px-6 py-10 text-center text-sm text-[var(--ink-soft)]">
                        Aún no tienes cursos habilitados. Cuando compres y el administrador te lo habilite, aparecerá aquí para ver sus videos.
                    </p>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {mine.map(({ enrollment: enr, item }) => (
                            <article key={enr.id} className="flex flex-col rounded-2xl border hairline bg-[var(--paper)] p-5">
                                <p className="text-sm font-semibold">{item.title}</p>
                                {item.description && <p className="mt-2 text-sm text-[var(--ink-soft)] line-clamp-2">{item.description}</p>}
                                <div className="mt-auto flex items-center justify-between pt-4">
                                    <p className="text-xs text-[var(--ink-soft)]">
                                        {enr.expiresAt ? `Vence ${new Date(enr.expiresAt).toLocaleDateString("es-ES")}` : "Sin vencimiento"}
                                    </p>
                                    <Link href={`/cursos/${item.id}`} className="rounded-full bg-[var(--forest)] px-4 py-2 text-xs font-semibold text-[var(--background)] transition hover:bg-[var(--copper)]">▶ Abrir y ver videos</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className="mt-14 border-t hairline pt-10">
                    <SectionLabel number="02">Catálogo disponible</SectionLabel>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">Otros cursos que aún no tienes. Al comprarlos, el administrador te habilita el acceso para verlos.</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {locked.length === 0 ? (
                            <p className="text-sm text-[var(--ink-soft)]">No hay más cursos disponibles por ahora.</p>
                        ) : locked.map((cur) => (
                            <article key={cur.id} className="flex flex-col rounded-2xl border hairline bg-[var(--paper)]">
                                <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--line)]">
                                    {cur.coverImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={cur.coverImageUrl} alt={cur.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[var(--forest)] text-xl text-[var(--background)]">🔒</div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--copper)]">🔒 Curso cerrado</p>
                                    <h3 className="display-font mt-2 text-2xl leading-tight">{cur.title}</h3>
                                    {cur.description && <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-soft)]">{cur.description}</p>}
                                    <Link href={`/cursos/${cur.id}`} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--copper)] px-4 py-2 text-xs font-bold text-[var(--forest-deep)] transition hover:brightness-105">Inscribirme</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </SiteShell>
    );
}

