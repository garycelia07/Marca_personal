import Link from "next/link";
import { WhatsAppLeadButton } from "@/components/whatsapp-lead-button";
import { socialHref } from "@/lib/site";

export type SocialIconName = "facebook" | "instagram" | "linkedin" | "youtube" | "tiktok" | "whatsapp";

export function SocialIcon({ name }: { name: SocialIconName }) {
    if (name === "facebook") {
        return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M13.4 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.3v8h3.1Z" /></svg>;
    }

    if (name === "instagram") {
        return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" className="fill-current stroke-none" /></svg>;
    }

    if (name === "youtube") {
        return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z" /></svg>;
    }

    if (name === "linkedin") {
        return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M5.2 7.5A2.2 2.2 0 1 0 5.2 3a2.2 2.2 0 0 0 0 4.5ZM3.4 21h3.6V9H3.4v12ZM9.2 9v12h3.6v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4V21h3.6v-6.9c0-3.4-.7-6-4.7-6-1.9 0-3.2 1-3.7 1.9h-.1V9H9.2Z" /></svg>;
    }

    if (name === "tiktok") {
        return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M15.5 3h3c.2 1.8 1.2 3.1 3 3.7v3c-1.1-.1-2.1-.4-3-1v5.8a6.5 6.5 0 1 1-5.6-6.4v3.1a3.4 3.4 0 1 0 2.6 3.3V3Z" /></svg>;
    }

    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M19.1 4.9A9.9 9.9 0 0 0 12 2a10 10 0 0 0-8.7 15l-1.1 4 4.1-1.1A10 10 0 0 0 12 22h.1a10 10 0 0 0 7-17.1ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.7.7-2.3-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.3.2-.3.6-1.1.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.3-.5-.3h-.5c-.2 0-.5.1-.7.3-.7.7-.9 1.6-.2 2.6 1.2 2.4 3.1 4.2 5.6 5.1.9.3 1.6.2 2.2-.1.6-.3.9-.8 1-1.2.1-.2.1-.4-.1-.5Z" /></svg>;
}

type SocialBrand = "facebook" | "tiktok" | "instagram" | "youtube";

const NAV_LINKS = [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Mi Historia", href: "/mi-historia" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Servicios", href: "/servicios" },
];

const SOCIALS = [
    { label: "Facebook", brand: "facebook" },
    { label: "TikTok", brand: "tiktok" },
    { label: "Instagram", brand: "instagram" },
    { label: "YouTube", brand: "youtube" },
] as const satisfies ReadonlyArray<{ label: string; brand: SocialBrand }>;

function IconInstagram() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
            <defs>
                <linearGradient id="ig-footer" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#FEDA75" />
                    <stop offset="0.4" stopColor="#FA7E1E" />
                    <stop offset="0.6" stopColor="#D62976" />
                    <stop offset="1" stopColor="#962FBF" />
                </linearGradient>
            </defs>
            <g fill="none" stroke="url(#ig-footer)" strokeWidth="1.9">
                <rect x="3" y="3" width="18" height="18" rx="5.5" />
                <circle cx="12" cy="12" r="4.1" />
            </g>
            <circle cx="17.4" cy="6.6" r="1.35" fill="url(#ig-footer)" />
        </svg>
    );
}

function BrandIcon({ brand }: { brand: SocialBrand }) {
    if (brand === "instagram") return <IconInstagram />;
    if (brand === "facebook")
        return (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="#1877F2" className="h-6 w-6">
                <path d="M13.5 21.5v-8h2.7l.45-3.1h-3.15V8.4c0-.9.3-1.55 1.6-1.55h1.65V4.1c-.28-.04-1.25-.12-2.38-.12-2.35 0-3.97 1.44-3.97 4.07v2.35H7.5v3.1h2.9v8h3.1Z" />
            </svg>
        );
    if (brand === "youtube")
        return (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
                <path fill="#FF0000" d="M21.7 7.2a2.9 2.9 0 0 0-2-2C18.2 4.7 12 4.7 12 4.7s-6.2 0-7.7.5a2.9 2.9 0 0 0-2 2C2 8.9 2 12 2 12s0 3.1.3 4.8c.2.7.8 1.4 2 1.5 1.5.5 7.7.5 7.7.5s6.2 0 7.7-.5a2.9 2.9 0 0 0 2-1.5c.3-1.7.3-4.8.3-4.8s0-3.1-.3-4.8ZM9.9 15.2V8.7l5.5 3.25L9.9 15.2Z" />
                <path fill="#fff" d="M9.9 8.7v6.5l5.5-3.25L9.9 8.7Z" />
            </svg>
        );
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
            <path fill="#010101" d="M14.4 3h3v.12a4.32 4.32 0 0 0 4.2 4.35v3.15a7.5 7.5 0 0 1-4.2-1.3v5.9a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6.02.9.06v3.1a2.7 2.7 0 1 0 2.6 2.7V3h1.3Z" />
            <path fill="#25F4EE" d="M17.4 3v.12a4.32 4.32 0 0 0 4.2 4.35H17.4V3z" opacity=".9" />
        </svg>
    );
}

export function SiteFooter() {
    return (
        <footer className="site-footer w-full">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-20">
                    <div className="max-w-xs">
                        <p className="display-font text-3xl uppercase leading-none tracking-tight">
                            <span className="use-ft-gold">Gary</span>{" "}
                            <span className="use-ft-head">Mayhua</span>
                        </p>
                        <p className="use-ft-soft mt-5 text-sm leading-6">
                            Conferencista internacional, inversor inmobiliario y mentor de líderes en toda Latinoamérica.
                        </p>
                    </div>
                    <div>
                        <p className="use-ft-soft text-xs font-bold uppercase tracking-[0.2em]">Navegación</p>
                        <ul className="mt-6 space-y-3 text-sm">
                            {NAV_LINKS.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="use-ft-gold-hover">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="use-ft-soft text-xs font-bold uppercase tracking-[0.2em]">Redes sociales</p>
                        <div className="mt-6 flex items-center gap-3">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={socialHref(social.brand)}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Visitar ${social.label}`}
                                    className="use-soc flex h-11 w-11 items-center justify-center rounded-xl border"
                                >
                                    <BrandIcon brand={social.brand} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="use-ft-rule border-t">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs use-ft-soft sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
                    <span>© 2026 Gary Mayhua. Todos los derechos reservados.</span>
                    <span>Desarrollado con propósito…</span>
                </div>
            </div>
            <WhatsAppLeadButton />
        </footer>
    );
}
