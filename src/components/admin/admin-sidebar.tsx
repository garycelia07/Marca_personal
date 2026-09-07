"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, DashboardIcon, EditIcon, ExternalLinkIcon, MailIcon, UsersGroupIcon, AttachmentIcon } from "@/components/admin/admin-icons";

type NavIcon = typeof DashboardIcon;

const adminLinks: { label: string; href: string; icon: NavIcon }[] = [
    { label: "Panel", href: "/admin", icon: DashboardIcon },
    { label: "Estudiantes", href: "/admin/estudiantes", icon: UsersGroupIcon },
    { label: "Cursos", href: "/admin/cursos", icon: BookIcon },
    { label: "Materiales", href: "/admin/materiales", icon: AttachmentIcon },
    { label: "Contenido", href: "/admin/contenido", icon: EditIcon },
    { label: "Contactos", href: "/admin/contactos", icon: MailIcon },
];

export function AdminSidebar() {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    }

    return (
        <aside aria-label="Navegación de administración" className="flex w-full flex-col border-r hairline bg-[var(--paper)] lg:w-60 lg:min-w-60">
            <div className="flex items-center gap-2.5 border-b hairline px-5 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest)]">
                    <span className="display-font text-base text-[var(--background)]">A</span>
                </span>
                <span className="display-font text-lg text-[var(--foreground)]">Áurea<span className="text-[var(--copper)]">.</span></span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Menú principal">
                <p className="eyebrow px-2 pb-2">Administración</p>
                {adminLinks.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-[var(--forest)] font-semibold text-[var(--background)]" : "text-[var(--ink-soft)] hover:bg-[var(--lime)] hover:text-[var(--forest)]"}`}
                        >
                            <span className={`h-[18px] w-[18px] shrink-0 transition ${active ? "text-[var(--background)]" : "text-[var(--copper)]"}`}>
                                <item.icon />
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t hairline px-3 py-3">
                <Link href="/" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--lime)] hover:text-[var(--forest)]">
                    <span className="h-[18px] w-[18px] shrink-0 text-[var(--copper)] transition group-hover:text-[var(--forest)]">
                        <ExternalLinkIcon />
                    </span>
                    <span>Ver sitio público</span>
                </Link>
            </div>
        </aside>
    );
}