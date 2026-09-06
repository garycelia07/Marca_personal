"use client";

import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialIconName } from "@/components/footer";
import { SectionLabel, SiteShell } from "@/components/site-shell";

const projects = [
    { number: "01", type: "Patrimonio", title: "Casa Nómada", text: "Arquitectura para vivir, invertir y dejar una huella que permanece." },
    { number: "02", type: "Educación", title: "Círculo Capital", text: "Una comunidad para tomar decisiones financieras con criterio y calma." },
    { number: "03", type: "Digital", title: "Mapa de Futuro", text: "Herramientas para convertir una intención en un plan medible." },
];

const heroSocials: { label: string; href: string; icon: SocialIconName }[] = [
    { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
    { label: "TikTok", href: "https://www.tiktok.com/", icon: "tiktok" },
    { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
    { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
];

export default function Home() {
    return (
        <SiteShell>
            <section className="hero-portrait-bg relative overflow-hidden px-4 py-5 text-[var(--foreground)] sm:px-8 sm:py-8 lg:py-10">
                <div className="hero-panel-in mx-auto grid min-h-[590px] max-w-[1440px] overflow-hidden lg:grid-cols-[0.9fr_1.35fr]">
                    <div className="hero-copy order-2 flex flex-col justify-center px-6 py-10 sm:px-12 lg:order-1 lg:px-14 lg:py-16">
                        <p className="eyebrow">Liderazgo · Patrimonio · Propósito</p>
                        <p className="mt-5 text-sm font-semibold text-[var(--ink-soft)]">Hola, soy</p>
                        <h1 className="script-font mt-2 text-6xl leading-[0.78] text-[var(--copper)] sm:text-7xl">Áurea</h1>
                        <p className="mt-8 max-w-md text-2xl leading-tight sm:text-3xl">Los grandes sueños comienzan siendo un simple sueño.</p>
                        <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">Acompañamos a personas que quieren crecer con intención, invertir con claridad y construir una vida con más posibilidades.</p>
                        <div className="mt-8 flex flex-wrap items-center gap-5"><Link href="/servicios" className="rounded-md bg-[var(--copper)] px-5 py-3 text-sm font-semibold text-[var(--forest-deep)] transition hover:brightness-110">Explorar acompañamiento</Link><Link href="/mi-historia" className="editorial-link text-sm font-semibold">Mi historia</Link></div>
                        <div className="mt-9 flex items-center gap-3" aria-label="Redes sociales">{heroSocials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]"><SocialIcon name={social.icon} /></a>)}</div>
                    </div>
                    <div className="hero-image-in group relative order-1 min-h-[430px] overflow-hidden lg:order-2 lg:min-h-[590px]"><Image src="/foto.avif" alt="Retrato profesional de un mentor y líder" fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain object-[10%_bottom] grayscale-[8%] transition-[filter] duration-500 group-hover:brightness-110" /><div className="hero-chips-in absolute bottom-5 right-4 z-10 flex flex-col items-end gap-3 sm:right-8 lg:bottom-10 lg:right-6"><div className="flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">↗</span><p className="text-xs font-semibold text-[var(--foreground)]">Mentoría</p></div><div className="mr-4 flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">◈</span><p className="text-xs font-semibold text-[var(--foreground)]">Patrimonio</p></div><div className="mr-8 flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">✦</span><p className="text-xs font-semibold text-[var(--foreground)]">Educación financiera</p></div></div></div>
                </div>
            </section>
            <section className="border-y hairline bg-[var(--paper)]">
<div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
                    <div className="reveal"><SectionLabel number="01">La mirada</SectionLabel><p className="mt-16 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">Una filosofía práctica para convertir intención en movimiento.</p></div>
                    <div className="reveal delay-1"><p className="display-font max-w-4xl text-4xl leading-[1.02] sm:text-6xl">No se trata solo de llegar más lejos. Se trata de saber para qué.</p><div className="mt-10 flex flex-col gap-8 border-t hairline pt-8 sm:flex-row sm:items-start sm:justify-between"><p className="max-w-md text-base leading-7 text-[var(--ink-soft)]">Áurea nace de una convicción sencilla: las decisiones que cambian una vida combinan visión, disciplina y una comunidad que te devuelve perspectiva.</p><Link href="/nosotros" className="editorial-link shrink-0 text-sm font-semibold">Nuestra forma de trabajar</Link></div></div>
                </div>
            </section>
            <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
                <div className="mb-14 flex flex-col gap-6 border-b hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div><SectionLabel number="02">Lo que estamos construyendo</SectionLabel><h2 className="display-font mt-5 max-w-2xl text-4xl leading-[0.98] sm:text-6xl">Ideas que se vuelven lugares.</h2></div>
                    <Link href="/proyectos" className="editorial-link text-sm font-semibold">Ver todos los proyectos</Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {projects.map((project) => <article key={project.number} className="group reveal border hairline bg-[var(--background)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--copper)] hover:bg-[var(--lime)] sm:p-8"><div className="flex items-center justify-between"><p className="eyebrow">{project.number}</p><span className="flex h-8 w-8 items-center justify-center rounded-full border hairline text-[var(--copper)] transition group-hover:rotate-45">↗</span></div><p className="mt-16 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{project.type}</p><h3 className="display-font mt-3 text-4xl">{project.title}</h3><p className="mt-5 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">{project.text}</p></article>)}
                </div>
            </section>
            <section className="bg-[var(--forest)] text-[var(--background)]">
                <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
                    <div><SectionLabel number="03">Un siguiente capítulo</SectionLabel><p className="mt-10 max-w-xs text-sm leading-6 text-[var(--copper-soft)]">Una conversación es el primer paso para poner una idea en marcha.</p></div>
                    <div><p className="display-font max-w-3xl text-4xl leading-[0.98] sm:text-6xl">La transformación no es un evento. Es una práctica.</p><Link href="/iniciar-sesion" className="editorial-link mt-10 text-sm font-semibold text-[var(--background)]">Comenzar una conversación</Link></div>
                </div>
            </section>
        </SiteShell>
    );
}
