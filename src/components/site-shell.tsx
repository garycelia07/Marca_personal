"use client";

import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/header";

export function SiteShell({ children, hideHeader = false }: { children: React.ReactNode; hideHeader?: boolean }) {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {!hideHeader && <SiteHeader />}
            <main>{children}</main>
            <SiteFooter />
        </div>
    );
}

export function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <span className="eyebrow">{number}</span>
            <span className="h-px w-8 bg-[var(--copper)]" />
            <span className="eyebrow">{children}</span>
        </div>
    );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return (
        <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-20 sm:px-8 lg:px-12 lg:pb-24 lg:pt-28">
            <div className="max-w-4xl reveal">
                <p className="eyebrow mb-5">{eyebrow}</p>
                <h1 className="display-font max-w-4xl text-5xl leading-[0.95] sm:text-7xl lg:text-[7.5rem]">{title}</h1>
                <p className="mt-8 max-w-xl text-base leading-7 text-[var(--ink-soft)] sm:text-lg">{description}</p>
            </div>
        </section>
    );
}
