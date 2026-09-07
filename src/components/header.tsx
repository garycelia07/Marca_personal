"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navigation = [
    { label: "Inicio", href: "/" },
    { label: "Cursos", href: "/cursos" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Mi Historia", href: "/mi-historia" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Servicios", href: "/servicios" },
];

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
            className="flex h-10 w-10 items-center justify-center rounded-full border hairline text-base transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
            {dark ? "☼" : "◐"}
        </button>
    );
}

export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="border-b hairline bg-[var(--background)]">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Link href="/" className="flex items-center">
                    <img src="/gary.avif" alt="Gary Mayhua" className="h-12 w-auto object-contain" />
                </Link>

                <div className="ml-auto hidden items-center gap-7 lg:flex">
                    <nav className="flex items-center gap-7" aria-label="Navegación principal">
                        {navigation.map((item) => (
                            <Link key={item.href} href={item.href} className={`whitespace-nowrap text-sm transition hover:text-[var(--copper)] ${pathname === item.href ? "font-semibold text-[var(--copper)]" : "text-[var(--ink-soft)]"}`}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Login + tema, pegados al extremo derecho */}
                    <div className="flex items-center gap-4">
                        <Link href="/iniciar-sesion" className="rounded-md border border-[var(--forest)] px-4 py-2 text-base font-semibold text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--background)]">
                            Login
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>

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
                        <Link href="/iniciar-sesion" onClick={() => setOpen(false)} className="text-lg text-[var(--ink-soft)] transition hover:text-[var(--copper)]">
                            Login
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
    