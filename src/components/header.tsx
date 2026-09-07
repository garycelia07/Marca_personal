"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navigation = [
    { label: "Inicio", href: "/" },
    { label: "Cursos", href: "/cursos" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Mi Historia", href: "/mi-historia" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Servicios", href: "/servicios" },
];

const USER_STORAGE_KEY = "aurea_user";

function readStoredUser(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const raw = window.localStorage.getItem(USER_STORAGE_KEY);
        return Boolean(raw);
    } catch {
        return false;
    }
}

function ThemeToggle() {
    const [dark, setDark] = useState(false);

    function toggleTheme() {
        const nextDark = !dark;
        document.documentElement.classList.toggle("dark", nextDark);
        window.localStorage.setItem("mp-theme", nextDark ? "dark" : "light");
        setDark(nextDark);
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={dark ? "Modo claro" : "Modo oscuro"}
            className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-sm transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
            {dark ? "☼" : "◐"}
        </button>
    );
}

export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setHasSession(readStoredUser());
        setOpen(false);
    }, [pathname]);

    return (
        <header className="border-b hairline bg-[var(--background)]">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Link href="/" className="flex items-center">
                    <img src="/gary.avif" alt="Gary Mayhua" className="h-10 w-auto object-contain" />
                </Link>

                <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
                    {navigation.map((item) => (
                        <Link key={item.href} href={item.href} className={`text-sm transition hover:text-[var(--copper)] ${pathname === item.href ? "font-semibold text-[var(--copper)]" : "text-[var(--ink-soft)]"}`}>
                            {item.label}
                        </Link>
                    ))}
                    {!hasSession && (
                        <Link href="/iniciar-sesion" className="rounded-md border border-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--background)]">
                            Iniciar sesión
                        </Link>
                    )}
                    <ThemeToggle />
                </nav>

                <div className="flex items-center gap-3 lg:hidden">
                    <ThemeToggle />
                    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"} className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border hairline">
                        <span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" />
                    </button>
                </div>
            </div>

            {open && (
                <nav className="border-t hairline bg-[var(--background)] px-5 py-5 lg:hidden" aria-label="Navegación móvil">
                    <div className="flex flex-col gap-4">
                        {navigation.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-lg text-[var(--ink-soft)] transition hover:text-[var(--copper)]">
                                {item.label}
                            </Link>
                        ))}
                        {!hasSession && (
                            <Link href="/iniciar-sesion" onClick={() => setOpen(false)} className="text-lg text-[var(--ink-soft)] transition hover:text-[var(--copper)]">
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
    