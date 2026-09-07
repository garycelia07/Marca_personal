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
  {
    number: "01",
    type: "Arquitectura & Concepto",
    title: "Santuario Urbano",
    text: "Un espacio concebido para fusionar la tranquilidad de la naturaleza con el dinamismo de la vida moderna.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    alt: "Diseño interior minimalista y moderno con luz natural",
  },
  {
    number: "02",
    type: "Diseño Interior",
    title: "Atelier Áurea",
    text: "Estructuras limpias y materiales nobles que definen un entorno de alto rendimiento y elegancia.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    alt: "Espacio de arquitectura vanguardista con acabados finos",
  },
  {
    number: "03",
    type: "Desarrollo Espacial",
    title: "Pabellón de Cristal",
    text: "Geometría sobria pensada para potenciar la perspectiva, la luz y la conexión con el entorno.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    alt: "Estructura arquitectónica conceptual de estilo minimalista",
  },
];

const heroSocials: { label: string; href: string; icon: SocialIconName }[] = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
  { label: "TikTok", href: "https://www.tiktok.com/", icon: "tiktok" },
  { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
];

const contactChannels = [
  {
    label: "WhatsApp",
    value: "+51 987 654 321",
    href: "https://wa.me/51987654321",
    icon: "whatsapp" // O el nombre del icono en tu sistema actual
  },
  {
    label: "Email",
    value: "hola@aurea.com",
    href: "mailto:hola@aurea.com",
    icon: "email"
  }
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
          <div className="reveal"><SectionLabel number="01">La mirada</SectionLabel><p className="mt-16 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">Una filosofía práctica para convertir intención en movimiento.</p><div className="mt-14 border-t hairline pt-8"><p className="eyebrow">Pilares</p><ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]"><li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "0ms" }}>Visión</li><li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "600ms" }}>Disciplina</li><li className="float-y rounded-full border hairline px-3 py-1.5 transition-colors hover:border-[var(--copper)] hover:text-[var(--copper)]" style={{ animationDelay: "1200ms" }}>Comunidad</li></ul></div></div>
          <div className="reveal delay-1"><h2 className="display-font max-w-4xl text-4xl leading-[1.02] sm:text-6xl">No se trata solo de llegar más lejos. <em className="script-font text-[var(--copper)]">Se trata</em> de saber para qué.</h2><div className="mt-10 flex flex-col gap-8 border-t hairline pt-8 sm:flex-row sm:items-start sm:justify-between"><p className="max-w-md text-base leading-7 text-[var(--ink-soft)]">Áurea nace de una convicción sencilla: las decisiones que cambian una vida combinan visión, disciplina y una comunidad que te devuelve perspectiva.</p><Link href="/nosotros" className="editorial-link shrink-0 text-sm font-semibold">Nuestra forma de trabajar</Link></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mb-14 flex flex-col gap-6 border-b hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel number="02">Lo que estamos construyendo</SectionLabel>
            <h2 className="display-font mt-5 max-w-2xl text-4xl leading-[0.98] tracking-tight sm:text-6xl">
              Ideas que se vuelven <em className="script-font text-[var(--copper)]">lugares.</em>
            </h2>
          </div>
          <Link href="/proyectos" className="editorial-link shrink-0 text-sm font-semibold tracking-wide">
            Ver todos los proyectos
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.number}
              className={`group relative flex flex-col items-center justify-between rounded-xl border hairline bg-[var(--paper)] p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md reveal ${index % 2 === 0 ? "from-top" : "from-bottom"
                }`}
            >
              <div className="absolute top-0 right-6 h-1 w-12 bg-[var(--copper)] rounded-b" />

              {/* Número de fondo adaptado a temas con opacidad */}
              <span className="absolute left-6 top-4 text-5xl font-extrabold text-[var(--foreground)] opacity-10 select-none pointer-events-none">
                {project.number}
              </span>

              <div className="relative mt-6 mb-6 flex h-20 w-20 items-center justify-center">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--line)] p-1">
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    className="object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--copper)]">
                  {project.type}
                </p>
                <h3 className="display-font mt-2 text-2xl font-bold text-[var(--foreground)]">
                  {project.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[var(--ink-soft)] max-w-xs">
                  {project.text}
                </p>
              </div>

              <Link
                href="/proyectos"
                className="mt-8 w-full rounded-md bg-[var(--copper)] py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--forest-deep)] transition-all duration-200 hover:brightness-110"
              >
                Explorar
              </Link>
            </article>
          ))}
        </div>
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
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-[var(--copper)] shadow-sm transition-transform duration-200 group-hover:scale-105">
                      <SocialIcon name={item.icon} className="h-4 w-4 fill-current" />
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
            <div className="mt-6 flex justify-end">            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
