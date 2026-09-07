"use client";

import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialIconName } from "@/components/footer";
import { socialHref } from "@/lib/site";
import { LeadForm } from "@/components/lead-form";
import { FeaturedCourses } from "@/components/featured-courses";
import { SiteImage } from "@/components/site-image";
import { SectionLabel, SiteShell } from "@/components/site-shell";

const projects = [
    { number: "01", type: "Patrimonio", title: "Casa Nómada", text: "Arquitectura para vivir, invertir y dejar una huella que permanece.", image: "https://images.unsplash.com/photo-1524088469323-9cd88c0b0fbe?auto=format&fit=crop&w=800&h=900", alt: "Arquitectura moderna de hormigón con luz natural" },
    { number: "02", type: "Educación", title: "Círculo Capital", text: "Una comunidad para tomar decisiones financieras con criterio y calma.", image: "https://images.unsplash.com/photo-1522206808703-11b9a1d0f9a0?auto=format&fit=crop&w=800&h=900", alt: "Persona tomando notas financieras en un espacio luminoso" },
    { number: "03", type: "Digital", title: "Mapa de Futuro", text: "Herramientas para convertir una intención en un plan medible.", image: "https://images.unsplash.com/photo-1558619452581-d810042a5e13?auto=format&fit=crop&w=800&h=900", alt: "Interfaz digital con gráficos de proyección" },
];

const heroSocials: { label: string; icon: SocialIconName }[] = [
    { label: "Facebook", icon: "facebook" },
    { label: "TikTok", icon: "tiktok" },
    { label: "Instagram", icon: "instagram" },
    { label: "YouTube", icon: "youtube" },
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
                        <div className="mt-9 flex items-center gap-3" aria-label="Redes sociales">{heroSocials.map((social) => <a key={social.label} href={socialHref(social.icon)} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]"><SocialIcon name={social.icon} /></a>)}</div>
                    </div>
                    <div className="hero-image-in group relative order-1 min-h-[430px] overflow-hidden lg:order-2 lg:min-h-[590px]"><SiteImage slot="hero" fallbackSrc="/foto.avif" alt="Retrato profesional de un mentor y líder" priority className="absolute inset-0 h-full w-full object-contain object-[10%_bottom] grayscale-[8%] transition-[filter] duration-500 group-hover:brightness-110" /><div className="hero-chips-in absolute bottom-5 right-4 z-10 flex flex-col items-end gap-3 sm:right-8 lg:bottom-10 lg:right-6"><div className="flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">↗</span><p className="text-xs font-semibold text-[var(--foreground)]">Mentoría</p></div><div className="mr-4 flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">◈</span><p className="text-xs font-semibold text-[var(--foreground)]">Patrimonio</p></div><div className="mr-8 flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">✦</span><p className="text-xs font-semibold text-[var(--foreground)]">Educación financiera</p></div></div></div>
                </div>
            </section>
            <section className="border-y hairline bg-[var(--paper)]">
<div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
                    <div className="reveal"><SectionLabel number="01">La mirada</SectionLabel><p className="mt-16 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">Una filosofía práctica para convertir intención en movimiento.</p><div className="mt-14 border-t hairline pt-8"><p className="eyebrow">Pilares</p><ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]"><li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "0ms" }}>Visión</li><li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "600ms" }}>Disciplina</li><li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "1200ms" }}>Comunidad</li></ul></div></div>
                    <div className="reveal delay-1"><h2 className="display-font max-w-4xl text-4xl leading-[1.02] sm:text-6xl">No se trata solo de llegar más lejos. <em className="script-font text-[var(--copper)]">Se trata</em> de saber para qué.</h2><div className="mt-10 flex flex-col gap-8 border-t hairline pt-8 sm:flex-row sm:items-start sm:justify-between"><p className="max-w-md text-base leading-7 text-[var(--ink-soft)]">Áurea nace de una convicción sencilla: las decisiones que cambian una vida combinan visión, disciplina y una comunidad que te devuelve perspectiva.</p><Link href="/nosotros" className="editorial-link shrink-0 text-sm font-semibold">Nuestra forma de trabajar</Link></div></div>
                </div>
            </section>
            <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
                <div className="mb-14 flex flex-col gap-6 border-b hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div><SectionLabel number="02">Lo que estamos construyendo</SectionLabel><h2 className="display-font mt-5 max-w-2xl text-4xl leading-[0.98] sm:text-6xl">Ideas que se vuelven <em className="script-font text-[var(--copper)]">lugares.</em></h2></div>
                    <Link href="/proyectos" className="editorial-link text-sm font-semibold">Ver todos los proyectos</Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {projects.map((project) => <article key={project.number} className="group card-pop flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--background)] shadow-[0_18px_40px_-20px_rgba(36,35,31,0.45)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--copper)] hover:shadow-[0_26px_48px_-18px_rgba(36,35,31,0.55)]"><div className="relative aspect-[4/3] overflow-hidden"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover transition duration-700 group-hover:scale-110 group-hover:-rotate-1" /><span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--copper)]/40 bg-[var(--lime)]/90 text-sm font-bold text-[var(--copper)] backdrop-blur-sm">{project.number}</span><span aria-hidden="true" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border hairline bg-[var(--background)]/80 text-[var(--copper)] backdrop-blur-sm transition duration-300 group-hover:rotate-45 group-hover:bg-[var(--copper)] group-hover:text-[var(--forest-deep)]">↗</span></div><div className="px-5 pt-6 sm:px-7 sm:pt-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{project.type}</p><h3 className="display-font mt-4 text-4xl leading-none">{project.title}</h3><p className="mt-5 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">{project.text}</p></div><div className="mt-auto flex items-center gap-2 border-t hairline px-5 pt-4 text-xs font-bold text-[var(--ink-soft)] transition group-hover:text-[var(--copper)] sm:px-7"><span className="eyebrow">Explorar</span><span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span></div></article>)}
                </div>
            </section>
            <FeaturedCourses />
            <section className="bg-[var(--forest)] text-[var(--background)]">
                <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
                    <div>
                        <p className="eyebrow text-[var(--copper-soft)]">Contacto</p>
                        <h2 className="display-font mt-5 text-4xl leading-[0.98] sm:text-6xl">Hablemos de lo que <em className="script-font text-[var(--copper)]">sigue.</em></h2>
                        <p className="mt-10 max-w-xs text-sm leading-6 text-[var(--copper-soft)]">Una conversación es el primer paso para poner una idea en marcha. Déjanos tus datos y te contactaremos.</p>
                        <p aria-hidden="true" className="mt-10 h-[1px] w-14 bg-[var(--copper)]" />
                        <div className="mt-10 space-y-3 text-sm text-[var(--copper-soft)]">
                            <p>WhatsApp: +51 987 654 321</p>
                            <p>Email: hola@aurea.com</p>
                        </div>
                    </div>
                    <div>
                        <div className="rounded-2xl border border-[var(--copper)]/30 bg-[var(--paper)] p-6 sm:p-8">
                            <p className="eyebrow">Escríbenos</p>
                            <p className="mt-2 text-sm text-[var(--ink-soft)]">Déjanos tus datos y te contamos cómo empezar.</p>
                            <div className="mt-6"><LeadForm /></div>
                        </div>
                        <Link href="/iniciar-sesion" className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-[var(--copper)] px-7 py-3 text-sm font-bold text-[var(--forest-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105">Comenzar una conversación <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span></Link>
                    </div>
                </div>
            </section>
        </SiteShell>
    );
}
