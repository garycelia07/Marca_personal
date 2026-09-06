import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

const stats = [
    { label: "Usuarios activos", value: "1.284" },
    { label: "Programas activos", value: "6" },
    { label: "Ingresos del mes", value: "€ 18.240" },
    { label: "Sesiones esta semana", value: "312" },
];

const recentActivity = [
    { who: "Lucía Ferrer", what: "Verificó su identidad", when: "hace 2 min" },
    { who: "Miguel Ángel R.", what: "Inscribió a Programa Patrimonio", when: "hace 18 min" },
    { who: "Julieta Paz", what: "Completó el módulo 3", when: "hace 1 h" },
    { who: "Nicolás Varas", what: "Solicitó una mentoría", when: "hace 3 h" },
];

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "ADMIN") {
        redirect("/estudiante");
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
                eyebrow="Panel de administración"
                title="Bienvenido."
                description={`Hola, ${user.fullName}. Aquí tienes el pulso de Áurea: actividad reciente, programas y métricas en un solo lugar.`}
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
                    {stats.map((stat) => (
                        <article key={stat.label} className="border hairline bg-[var(--background)] p-6">
                            <p className="eyebrow">{stat.label}</p>
                            <p className="display-font mt-4 text-4xl">{stat.value}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-14 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
                    <section>
                        <div className="mb-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <SectionLabel number="01">Accesos rápidos</SectionLabel>
                            <Link href="/servicios" className="editorial-link text-sm font-semibold">Ver servicios</Link>
                        </div>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {[
                                { title: "Gestionar programas", desc: "Crea y edita programas y becas activas." },
                                { title: "Validar estudiantes", desc: "Revisa identidades e inscripciones pendientes." },
                                { title: "Publicar recursos", desc: "Sube materiales y lecciones al catálogo." },
                                { title: "Métricas", desc: "Explora el detalle de ingresos y conversiones." },
                            ].map((card) => (
                                <Link key={card.title} href="#" className="group rounded-md border hairline bg-[var(--background)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--copper)] hover:bg-[var(--lime)]">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border hairline text-[var(--copper)] transition group-hover:rotate-45">↗</span>
                                    <h3 className="display-font mt-12 text-3xl">{card.title}</h3>
                                    <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{card.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionLabel number="02">Actividad reciente</SectionLabel>
                        <ul className="mt-8 space-y-4">
                            {recentActivity.map((entry) => (
                                <li key={entry.who} className="rounded-md border hairline bg-[var(--paper)] p-4">
                                    <p className="text-sm font-semibold">{entry.who}</p>
                                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{entry.what}</p>
                                    <p className="mt-2 text-xs text-[var(--ink-soft)]">{entry.when}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </section>
        </SiteShell>
    );
}