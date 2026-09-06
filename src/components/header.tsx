"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Mi Historia", href: "/mi-historia" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Servicios", href: "/servicios" },
];

const USER_STORAGE_KEY = "aurea_user";

type StoredUser = {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "STUDENT";
    accessExpiresAt: string | null;
};

function initialsFor(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

function readStoredUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(USER_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredUser;
        return parsed && (parsed.role === "ADMIN" || parsed.role === "STUDENT") ? parsed : null;
    } catch {
        return null;
    }
}

function ThemeToggle() {
    const [dark, setDark] = useState(false);

    function toggleTheme() {
        const nextDark = !dark;
        document.documentElement.classList.toggle("dark", nextDark);
        window.localStorage.setItem("aurea-theme", nextDark ? "dark" : "light");
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

function LogoutButton() {
    const router = useRouter();

    function handleLogout() {
        try {
            window.localStorage.removeItem(USER_STORAGE_KEY);
        } catch {
            // ignorar
        }
        void fetch("/api/auth/logout", { method: "POST" })
            .catch(() => null)
            .finally(() => {
                router.push("/");
            });
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--background)]"
        >
            Cerrar sesión
        </button>
    );
}

function DashboardLink({ role }: { role: "ADMIN" | "STUDENT" }) {
    const href = role === "ADMIN" ? "/admin" : "/estudiante";
    const label = role === "ADMIN" ? "Administración" : "Mi espacio";
    return (
        <Link href={href} className="text-sm font-semibold text-[var(--copper)] transition hover:text-[var(--forest)]">
            {label}
        </Link>
    );
}

export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<StoredUser | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setUser(readStoredUser());
    }, [pathname]);

    return (
        <header className="sticky top-0 z-20 border-b hairline bg-[color:var(--background)]/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest)] font-serif text-lg text-[var(--background)]">A</span>
                    <span className="display-font text-xl font-semibold tracking-normal">Áurea<span className="text-[var(--copper)]">.</span></span>
                </Link>
                <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
                    {navigation.map((item) => (
                        <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={`text-sm transition hover:text-[var(--copper)] ${pathname === item.href ? "font-semibold text-[var(--copper)]" : "text-[var(--ink-soft)]"}`}>
                            {item.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest)] text-xs font-semibold text-[var(--background)]">{initialsFor(user.fullName)}</span>
                                <div className="hidden leading-tight xl:block">
                                    <p className="text-sm font-semibold">{user.fullName}</p>
                                    <p className="text-xs text-[var(--ink-soft)]">{user.role === "ADMIN" ? "Administración" : "Estudiante"}</p>
                                </div>
                            </div>
                            <DashboardLink role={user.role} />
                            <LogoutButton />
                        </>
                    ) : (
                        <Link href="/iniciar-sesion" className="rounded-md border border-[var(--forest)] px-4 py-2 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--forest)] hover:text-[var(--background)]">Iniciar sesión</Link>
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
                        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-lg text-[var(--ink-soft)] transition hover:text-[var(--copper)]">{item.label}</Link>)}
                        {user ? (
                            <>
                                <span className="border-t hairline pt-4 text-sm font-semibold">{user.fullName}</span>
                                <Link href={user.role === "ADMIN" ? "/admin" : "/estudiante"} onClick={() => setOpen(false)} className="text-lg font-semibold text-[var(--copper)]">{user.role === "ADMIN" ? "Panel de administración" : "Mi espacio"}</Link>
                                <div onClick={() => setOpen(false)}><LogoutButton /></div>
                            </>
                        ) : (
                            <Link href="/iniciar-sesion" onClick={() => setOpen(false)} className="text-lg text-[var(--ink-soft)] transition hover:text-[var(--copper)]">Iniciar sesión</Link>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
    