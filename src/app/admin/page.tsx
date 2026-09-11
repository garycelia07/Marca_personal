import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { backendFetch } from "@/lib/api/backend";
import { SectionLabel } from "@/components/site-shell";
import { UsersGroupIcon, BookIcon, MailIcon, AttachmentIcon, EditIcon } from "@/components/admin/admin-icons";

const quickLinks = [
    { title: "Gestionar estudiantes", href: "/admin/estudiantes", desc: "Crea, edita y ajusta la vigencia de acceso de estudiantes.", icon: UsersGroupIcon },
    { title: "Gestionar cursos", href: "/admin/cursos", desc: "Crea y publica cursos, módulos y lecciones.", icon: BookIcon },
    { title: "Gestionar materiales", href: "/admin/materiales", desc: "Sube PDFs e imágenes al VPS.", icon: AttachmentIcon },
    { title: "Editar contenido", href: "/admin/contenido", desc: "Actualiza las secciones del landing page.", icon: EditIcon },
];

/** Formatea una fecha ISO como texto corto en español (ej. "10 sep 2026, 14:30"). */
function formatWhen(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "nuevo";
    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "ADMIN") {
        redirect("/estudiante");
    }

    const firstName = user.fullName.split(/\s+/)[0] ?? "";
    const initials = user.fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

    let metrics: {
        students?: { total?: number; active?: number };
        courses?: { total?: number; published?: number };
        enrollments?: { total?: number };
        leads?: { total?: number; recent?: { id: string; email?: string; name?: string; message?: string | null; createdAt?: string }[] };
    } = {};
    try {
        const res = await backendFetch("/dashboard/stats");
        if (res.ok) metrics = await res.json();
    } catch {
        metrics = {};
    }

    const cards = [
        { label: "Estudiantes registrados", value: metrics.students?.total ?? 0, icon: UsersGroupIcon },
        { label: "Estudiantes activos", value: metrics.students?.active ?? 0, icon: UsersGroupIcon },
        { label: "Cursos publicados", value: metrics.courses?.published ?? 0, icon: BookIcon },
        { label: "Contactos de la web", value: metrics.leads?.total ?? 0, icon: MailIcon },
    ];

    const recent = (metrics.leads?.recent ?? []).slice(0, 5).map((lead) => ({
        key: lead.id,
        who: lead.name || lead.email || "Contacto",
        what: (lead.message || "Solicitó información").slice(0, 60),
        when: lead.createdAt ? formatWhen(lead.createdAt) : "nuevo",
    }));

    return (
        <section>
            <header className="mb-8 border-b hairline pb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--forest)]">
                        <span className="display-font text-lg text-[var(--background)]">{initials || "A"}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="eyebrow">Panel de administración</p>
                        <h1 className="display-font mt-1 text-3xl leading-none sm:text-4xl">Bienvenido, {firstName}.</h1>
                    </div>
                    <span className="rounded-full border hairline bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-[var(--forest-deep)]">ADMIN</span>
                </div>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
                    Aquí tienes el pulso de Gary Mayhua: actividad reciente, programas y métricas en un solo lugar.
                </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <article key={stat.label} className="rounded-xl border hairline bg-[var(--paper)] p-5 transition hover:border-[var(--copper)]">
                            <div className="flex items-center justify-between">
                                <p className="eyebrow">{stat.label}</p>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--copper)]">
                                    <Icon width={16} height={16} />
                                </span>
                            </div>
                            <p className="display-font mt-4 text-3xl">{stat.value}</p>
                        </article>
                    );
                })}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
                <section>
                    <SectionLabel number="01">Accesos rápidos</SectionLabel>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {quickLinks.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link key={card.title} href={card.href} className="group rounded-xl border hairline bg-[var(--background)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--copper)] hover:bg-[var(--lime)]">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-[var(--copper)] transition group-hover:rotate-45 group-hover:border-[var(--copper)]">
                                        <Icon width={18} height={18} />
                                    </span>
                                    <h3 className="display-font mt-5 text-2xl leading-tight">{card.title}</h3>
                                    <p className="mt-2 text-sm leading-5 text-[var(--ink-soft)]">{card.desc}</p>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <SectionLabel number="02">Actividad reciente</SectionLabel>
                    <ul className="mt-6 space-y-3">
                        {recent.length === 0 ? (
                            <li className="rounded-xl border hairline bg-[var(--paper)] p-4 text-sm text-[var(--ink-soft)]">Aún no hay contactos recientes.</li>
                        ) : (
                        recent.map((entry) => (
                            <li key={entry.key} className="rounded-xl border hairline bg-[var(--paper)] p-4 transition hover:border-[var(--copper)]">
                                <p className="text-sm font-semibold">{entry.who}</p>
                                <p className="mt-1 text-sm text-[var(--ink-soft)]">{entry.what}</p>
                                <p className="mt-2 text-xs text-[var(--ink-soft)]">{entry.when}</p>
                            </li>
                        ))
                        )}
                    </ul>
                </section>
            </div>
        </section>
    );
}
