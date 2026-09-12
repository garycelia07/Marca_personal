"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookIcon, DashboardIcon, EditIcon, ExternalLinkIcon, MailIcon, UsersGroupIcon, AttachmentIcon } from "@/components/admin/admin-icons";

type NavIcon = typeof DashboardIcon;

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
    );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

const adminLinks: { label: string; href: string; icon: NavIcon }[] = [
    { label: "Panel", href: "/admin", icon: DashboardIcon },
    { label: "Estudiantes", href: "/admin/estudiantes", icon: UsersGroupIcon },
    { label: "Cursos", href: "/admin/cursos", icon: BookIcon },
    { label: "Materiales", href: "/admin/materiales", icon: AttachmentIcon },
    { label: "Proyectos", href: "/admin/proyectos", icon: EditIcon },
    { label: "Servicios", href: "/admin/servicios", icon: EditIcon },
    { label: "Contenido", href: "/admin/contenido", icon: EditIcon },
    { label: "Contactos", href: "/admin/contactos", icon: MailIcon },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Al cambiar de ruta, se cierra el menú en móvil.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Cerrar con la tecla Escape.
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    function isActive(href: string): boolean {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    }

    async function handleLogout() {
        const originalUrl = window.location.href;
        try {
            await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
        } catch {
            /* seguir igual aunque falle la petición */
        }
        try {
            window.localStorage.removeItem("aurea_user");
            window.localStorage.removeItem("aurea_access_token");
        } catch {
            /* ignorar */
        }
        setOpen(false);
        if (originalUrl && new URL(originalUrl).pathname.startsWith("/admin")) {
            window.location.href = "/iniciar-sesion";
        } else {
            router.push("/iniciar-sesion");
            router.refresh();
        }
    }

    return (
        <>
            {/* Barra superior (solo móvil) con botón hamburguesa */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b hairline bg-[var(--paper)] px-4 py-3 lg:hidden">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest)]">
                        <span className="display-font text-base text-[var(--background)]">G</span>
                    </span>
                    <span className="display-font text-base text-[var(--foreground)]">Gary <span className="text-[var(--copper)]">Mayhua</span></span>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label={open ? "Cerrar menú de administración" : "Abrir menú de administración"}
                    className="flex h-10 w-10 items-center justify-center rounded-full border hairline text-[var(--forest)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
                >
                    <MenuIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Overlay para cerrar el menú en móvil */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Panel lateral: drawer deslizante en móvil, fijo en escritorio */}
            <aside
                aria-label="Navegación de administración"
                className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[84vw] transform-gpu flex-col overflow-y-auto border-r hairline bg-[var(--paper)] shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-60 lg:min-w-60 lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between gap-2.5 border-b hairline px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest)]">
                            <span className="display-font text-base text-[var(--background)]">G</span>
                        </span>
                        <span className="display-font text-lg text-[var(--foreground)]">Gary <span className="text-[var(--copper)]">Mayhua</span></span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar menú"
                        className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)] hover:text-[var(--copper)] lg:hidden"
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
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
                <button
                    type="button"
                    onClick={() => { void handleLogout(); }}
                    className="group mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)] hover:text-white"
                >
                    <span className="h-[18px] w-[18px] shrink-0 transition group-hover:text-white">
                        <LogoutIcon />
                    </span>
                    <span>Cerrar sesión</span>
                </button>
                <Link href="/" onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--lime)] hover:text-[var(--forest)]">
                    <span className="h-[18px] w-[18px] shrink-0 text-[var(--copper)] transition group-hover:text-[var(--forest)]">
                        <ExternalLinkIcon />
                    </span>
                    <span>Ver sitio público</span>
                </Link>
            </div>
            </aside>
        </>
    );
}