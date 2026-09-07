import { WhatsAppLeadButton } from "@/components/whatsapp-lead-button";

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

const socialLinks: { label: string; href: string; icon: SocialIconName }[] = [
    { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
    { label: "TikTok", href: "https://www.tiktok.com/", icon: "tiktok" },
];

export function SiteFooter() {
    return (
        <footer className="relative border-t hairline bg-[var(--paper)]">
            <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
                <div className="grid gap-12 border-b hairline pb-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
                    <div>
                        <p className="eyebrow">Hablemos de lo que sigue</p>
                        <h2 className="display-font mt-5 max-w-2xl text-4xl leading-none sm:text-6xl">Una conversación puede cambiar la dirección.</h2>
                        <a href="mailto:hola@aurea.com" className="editorial-link mt-8 text-sm font-semibold">hola@aurea.com</a>
                    </div>
                    <div className="flex flex-col justify-between gap-8 lg:items-end">
                        <p className="max-w-xs text-sm leading-6 text-[var(--ink-soft)] lg:text-right">Construir patrimonio. Multiplicar posibilidades. Encontrarnos también es parte del proceso.</p>
                        <div className="flex flex-wrap gap-5 text-sm font-semibold" aria-label="Redes sociales">
                            {socialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={`Visitar ${social.label}`} className="flex items-center gap-2 transition hover:text-[var(--copper)]"><SocialIcon name={social.icon} /><span>{social.label}</span></a>)}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-5 pt-8 text-sm text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
                    <span className="display-font text-xl text-[var(--foreground)]">Áurea<span className="text-[var(--copper)]">.</span></span>
                    <span>© 2026 Áurea</span>
                </div>
            </div>
            <WhatsAppLeadButton />
        </footer>
    );
}
