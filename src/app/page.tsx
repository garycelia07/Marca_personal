"use client";

import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialIconName } from "@/components/footer";
import { LeadForm } from "@/components/lead-form";
import { FeaturedCourses } from "@/components/featured-courses";
import { HomeProjects } from "@/components/home-projects";
import { SectionLabel, SiteShell } from "@/components/site-shell";

const heroSocials: { label: string; href: string; icon: SocialIconName }[] = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
  { label: "TikTok", href: "https://www.tiktok.com/", icon: "tiktok" },
  { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
];

const contactChannels: { label: string; value: string; href: string; icon: SocialIconName }[] = [
  {
    label: "WhatsApp",
    value: "+51 964 045 066",
    href: "https://wa.me/51964045066",
    icon: "whatsapp",
  },
  {
    label: "Email",
    value: "tipsinmobiliaria24@gmail.com",
    href: "mailto:tipsinmobiliaria24@gmail.com",
    icon: "facebook", // Cambiado por una opción válida de SocialIconName
  },
];

export default function Home() {
  return (
    <SiteShell>
      <section className="hero-portrait-bg relative overflow-hidden px-4 py-5 text-[var(--foreground)] sm:px-8 sm:py-8 lg:py-10">
        <div className="hero-panel-in mx-auto grid min-h-[590px] max-w-[1440px] overflow-hidden lg:grid-cols-[0.9fr_1.35fr]">
          <div className="hero-copy order-2 flex flex-col justify-center px-6 py-10 sm:px-12 lg:order-1 lg:px-14 lg:py-16">
            <p className="eyebrow">Liderazgo · Patrimonio · Propósito</p>
            <p className="mt-5 text-sm font-semibold text-[var(--ink-soft)]">Hola, soy</p>
            <h1 className="script-font mt-2 text-6xl leading-[0.78] text-[var(--copper)] sm:text-7xl">Gary Mayhua</h1>
            <p className="mt-8 max-w-md text-2xl leading-tight sm:text-3xl">Los grandes sueños comienzan siendo un simple sueño.</p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">Acompañamos a personas que quieren crecer con intención, invertir con claridad y construir una vida con más posibilidades.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/servicios" className="rounded-md bg-[var(--copper)] px-5 py-3 text-sm font-semibold text-[var(--forest-deep)] transition hover:brightness-110">Explorar acompañamiento</Link>
              <Link href="/mi-historia" className="editorial-link text-sm font-semibold">Mi historia</Link>
            </div>
            <div className="mt-9 flex items-center gap-3" aria-label="Redes sociales">
              {heroSocials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>
          <div className="hero-image-in group relative order-1 min-h-[430px] overflow-hidden lg:order-2 lg:min-h-[590px]">
            <Image src="/foto.avif" alt="Retrato profesional de un mentor y líder" fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain object-[10%_bottom] grayscale-[8%] transition-[filter] duration-500 group-hover:brightness-110" />
            <div className="hero-chips-in absolute bottom-5 right-4 z-10 flex flex-col items-end gap-3 sm:right-8 lg:bottom-10 lg:right-6">
              <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">↗</span>
                <p className="text-xs font-semibold text-[var(--foreground)]">Mentoría</p>
              </div>
              <div className="mr-4 flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">◈</span>
                <p className="text-xs font-semibold text-[var(--foreground)]">Patrimonio</p>
              </div>
              <div className="mr-8 flex w-fit items-center gap-2 rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip)] px-3 py-2 shadow-[0_8px_20px_var(--hero-shadow)] backdrop-blur-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-xs text-[var(--copper)]">✦</span>
                <p className="text-xs font-semibold text-[var(--foreground)]">Educación financiera</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y hairline bg-[var(--paper)]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
          <div className="reveal">
            <SectionLabel number="01">La mirada</SectionLabel>
            <p className="mt-16 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">Una filosofía práctica para convertir intención en movimiento.</p>
            <div className="mt-14 border-t hairline pt-8">
              <p className="eyebrow">Pilares</p>
              <ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
                <li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "0ms" }}>Visión</li>
                <li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "600ms" }}>Disciplina</li>
                <li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "1200ms" }}>Comunidad</li>
              </ul>
            </div>
          </div>
          <div className="reveal delay-1">
            <h2 className="display-font max-w-4xl text-4xl leading-[1.02] sm:text-6xl">No se trata solo de llegar más lejos. <em className="script-font text-[var(--copper)]">Se trata</em> de saber para qué.</h2>
            <div className="mt-10 flex flex-col gap-8 border-t hairline pt-8 sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-md text-base leading-7 text-[var(--ink-soft)]">Gary Mayhua nace de una convicción sencilla: las decisiones que cambian una vida combinan visión, disciplina y una comunidad que te devuelve perspectiva.</p>
              <Link href="/nosotros" className="editorial-link shrink-0 text-sm font-semibold">Nuestra forma de trabajar</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[var(--background)]">
        <HomeProjects />
      </section>
      <FeaturedCourses />
      <section className="bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-28">
          <div className="flex flex-col">
            <div>
              <p className="eyebrow text-[var(--copper)]">Contacto Directo</p>
              <h2 className="display-font mt-5 text-4xl leading-[0.98] tracking-tight sm:text-6xl">
                Hablemos de lo que <em className="script-font text-[var(--copper)]">sigue.</em>
              </h2>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
                Una conversación estratégica es el primer paso para estructurar e impulsar tu próximo proyecto.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              <span aria-hidden="true" className="block h-[1px] w-14 bg-[var(--copper)]" />

              <div className="space-y-4 text-sm font-medium">
                {contactChannels.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 text-[var(--foreground)] transition-colors hover:text-[var(--copper)]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-[var(--copper)] shadow-sm transition-transform duration-200 group-hover:scale-105 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-current">
                      <SocialIcon name={item.icon} />
                    </span>
                    <span>{item.value}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-xl sm:p-10">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
                <div>
                  <p className="eyebrow text-[var(--copper)]">Escríbenos</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    Inicia tu solicitud y te responderemos en menos de 24 horas.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <LeadForm />
              </div>
            </div>
            <div className="mt-6 flex justify-end"></div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}