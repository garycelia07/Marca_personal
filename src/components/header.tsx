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

function ThemeToggle() {
    // Por defecto el sitio inicia en MODO OSCURO.
    const [dark, setDark] = useState(true);

    useEffect(() => {
        try {
            // Respeta una preferencia previa explícita del usuario (solo si eligió claro).
            if (window.localStorage.getItem("mp-theme") === "light") {
                setDark(false);
                document.documentElement.classList.remove("dark");
            }
        } catch {
            /* mantener el modo oscuro por defecto */
        }
    }, []);

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
            <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
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

            {/* Overlay para cerrar y oscurecer el fondo */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            {/* Panel deslizante desde la derecha */}
            <div
                className={`fixed right-0 top-0 z-50 flex h-full w-[78vw] max-w-sm transform-gpu flex-col overflow-y-auto border-l hairline bg-[var(--background)] px-7 py-6 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
                aria-label="Navegación móvil"
                aria-hidden={!open}
            >
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
                        <img src="/gary.avif" alt="Gary Mayhua" className="h-10 w-auto object-contain" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar menú"
                        className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-lg transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`rounded-lg px-4 py-3 text-lg transition hover:bg-[var(--line)] hover:text-[var(--copper)] ${pathname === item.href ? "font-semibold text-[var(--copper)]" : "text-[var(--ink-soft)]"}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/iniciar-sesion"
                        onClick={() => setOpen(false)}
                        className="mt-3 rounded-full border border-[var(--forest)] px-4 py-3 text-center text-base font-semibold text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--background)]"
                    >
                        Login
                    </Link>
                </nav>
            </div>
        </header>
    );
}
    