import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { backendGetJson, tokenFromCookies, type Paginated } from "@/lib/api/backend";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

type DashboardStats = {
    students: { total: number; active: number };
    courses: { total: number; published: number };
    enrollments: { total: number };
    progress: { averagePercent: number; completionRate: number };
    byCourse: { courseId: string; title: string; students: number; averagePercent: number }[];
};

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "ADMIN") {
        redirect("/estudiante");
    }

    const token = await tokenFromCookies();
    const statsRes = await backendGetJson<DashboardStats | null>("/dashboard/stats", token).catch(() => null);
    const studentsRes = await backendGetJson<Paginated<{ id: string; email: string; fullName: string; isActive: boolean; accessExpiresAt: string | null; lastLoginAt: string | null }> | null>("/students?limit=6", token).catch(() => null);
    const recentStudents = studentsRes?.data ?? [];

    const statCards: { label: string; value: string }[] = [
        {
            label: "Estudiantes activos",
            value: statsRes ? `${statsRes.students.active} / ${statsRes.students.total}` : "—",
        },
        { label: "Cursos", value: statsRes ? `${statsRes.courses.published} publi de ${statsRes.courses.total}` : "—" },
        { label: "Inscripciones", value: statsRes ? `${statsRes.enrollments.total}` : "—" },
        {
            label: "Progreso promedio",
            value: statsRes ? `${Math.round(statsRes.progress.averagePercent)}%` : "—",
        },
    ];

    const initials = user.fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <SiteShell>
            <PageIntro
                eyebrow="Panel de administración"
                title="Bienvenido."
                description={`Hola, ${user.fullName}. Aquí tienes las métricas del panel: estudiantes, cursos, inscripciones y avance.`}
            />
            <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--forest)] text-base text-[var(--background)]">{initials || "A"}</span>
                    <div>
                        <p className="text-sm font-semibold">{user.fullName}</p>
                        <p className="text-xs text-[var(--ink-soft)]">{user.email}</p>
                    </div>
                    <span className="ml-auto rounded-full border hairline bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-[var(--forest-deep)]">ADMIN</span>
                </div>

                <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <article key={stat.label} className="border hairline bg-[var(--background)] p-6">
                            <p className="eyebrow">{stat.label}</p>
                            <p className="display-font mt-4 text-4xl">{stat.value}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-14 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
                    <section>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <SectionLabel number="01">Estudiantes recientes</SectionLabel>
                            <Link href="/servicios" className="editorial-link text-sm font-semibold">Ver servicios</Link>
                        </div>
                        {recentStudents.length > 0 ? (
                            <ul className="space-y-3">
                                {recentStudents.map((row) => (
                                    <li key={row.id} className="flex items-center justify-between gap-4 rounded-md border hairline bg-[var(--paper)] px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{row.fullName}</p>
                                            <p className="truncate text-xs text-[var(--ink-soft)]">{row.email}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${row.isActive ? "bg-[var(--lime)] text-[var(--forest-deep)]" : "bg-[var(--ink-soft)] text-white"}`}>
                                            {row.isActive ? "Activo" : "Inactivo"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="rounded-md border hairline bg-[var(--paper)] px-5 py-8 text-sm text-[var(--ink-soft)]">
                                No se pudieron cargar estudiantes (revisa tu sesión admin/backend).
                            </p>
                        )}
                    </section>

                    <section>
                        <SectionLabel number="03">Inscritos por curso</SectionLabel>
                        {statsRes && statsRes.byCourse.length > 0 ? (
                            <ul className="mt-8 space-y-4">
                                {statsRes.byCourse.map((row) => (
                                    <li key={row.courseId} className="rounded-md border hairline bg-[var(--paper)] p-4">
                                        <p className="text-sm font-semibold">{row.title}</p>
                                        <p className="mt-1 text-sm text-[var(--ink-soft)]">
                                            {row.students} estudiante(s) · progreso promedio {Math.round(row.averagePercent)}%
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-8 text-sm text-[var(--ink-soft)]">Sin inscripciones todavía.</p>
                        )}
                    </section>
                </div>
            </section>
        </SiteShell>
    );
}