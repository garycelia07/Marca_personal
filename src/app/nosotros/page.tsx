import Link from "next/link";
import Image from "next/image"; 
import { SectionLabel, SiteShell } from "@/components/site-shell";

const principles = [
  {
    number: "04",
    title: "Claridad",
    text: "Traducimos lo complejo en decisiones estructuradas que puedes sostener en el tiempo sin depender de terceros.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  },
  {
    number: "05",
    title: "Criterio",
    text: "Invertir no es perseguir el ruido del mercado; es construir convicción propia a partir de datos y análisis real.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
  },
  {
    number: "06",
    title: "Comunidad",
    text: "El crecimiento personal y patrimonial se acelera exponencialmente cuando se comparte perspectiva con pares.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[var(--background)] pt-12 pb-20 sm:pt-20 lg:py-10">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--copper)]">
                Nosotros / 01
              </span>
              <h1 className="display-font mt-6 text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                Crecer con <em className="script-font text-[var(--copper)] font-normal">raíz.</em>
              </h1>
            </div>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:text-lg">
              Somos una plataforma de pensamiento y acción para quienes entienden el patrimonio como una herramienta de libertad, no como una cifra en pantalla.
            </p>
          </div>

          {/* Imagen Hero */}
          <div className="relative mt-12 h-[380px] w-full overflow-hidden rounded-3xl border border-[var(--line)] sm:h-[520px] lg:mt-16">
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85"
              alt="Personas conversando en una mesa de trabajo"
              fill
              priority
              sizes="100vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Propósito */}
      <section className="border-y border-[var(--line)] bg-[var(--paper)] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.4fr_1.6fr] lg:px-12">
          <SectionLabel number="01">Propósito</SectionLabel>
          <div className="space-y-8">
            <p className="display-font text-3xl leading-snug sm:text-5xl lg:text-6xl">
              Hacer que más personas puedan tomar el volante de su futuro financiero.
            </p>
            <p className="max-w-3xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
              Nuestra plataforma reúne educación, acompañamiento e inversión para convertir la ambición en una práctica con dirección. Trabajamos desde la experiencia, con lenguaje humano y una mirada de largo plazo.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="group relative flex flex-col justify-between rounded-3xl border border-[var(--line)] bg-[var(--background)] p-8 shadow-sm transition-all duration-300 hover:border-[var(--copper)] sm:p-12">
            <div>
              <div className="flex items-center justify-between">
                <SectionLabel number="02">Misión</SectionLabel>
                <span className="h-2 w-2 rounded-full bg-[var(--copper)]" />
              </div>
              <h2 className="display-font mt-10 text-3xl leading-tight sm:text-4xl">
                Convertir claridad en decisiones que transforman.
              </h2>
            </div>
            <p className="mt-8 text-base leading-relaxed text-[var(--ink-soft)]">
              Acompañar a cada persona a ordenar sus ideas, fortalecer su criterio financiero y construir patrimonio con pasos concretos.
            </p>
          </article>

          <article className="group relative flex flex-col justify-between rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-8 shadow-sm transition-all duration-300 hover:border-[var(--copper)] sm:p-12">
            <div>
              <div className="flex items-center justify-between">
                <SectionLabel number="03">Visión</SectionLabel>
                <span className="h-2 w-2 rounded-full bg-[var(--copper)]" />
              </div>
              <h2 className="display-font mt-10 text-3xl leading-tight sm:text-4xl">
                Una generación que lidera su futuro con libertad.
              </h2>
            </div>
            <p className="mt-8 text-base leading-relaxed text-[var(--ink-soft)]">
              Imaginamos una comunidad donde invertir, aprender y crecer sean prácticas accesibles, conscientes y sostenibles.
            </p>
          </article>
        </div>
      </section>

      {/* Principios - Grid Mosaico (Estilo de la captura: 3x2 intercalado) */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-32">
        <div className="text-center mb-16">
          <h2 className="display-font text-4xl font-bold sm:text-5xl lg:text-6xl text-[var(--foreground)]">
            Nuestros Principios
          </h2>
          <div className="mt-4 mx-auto h-[1px] w-48 bg-[var(--foreground)]" />
        </div>

        {/* Cuadrícula 3x2 Mosaico */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[var(--line)]">
          {/* Fila 1: Imagen 04 | Texto 04 | Imagen 05 */}
          <div className="relative min-h-[320px] border-r border-b border-[var(--line)] bg-[var(--paper)]">
            <Image
              src={principles[0].image}
              alt={principles[0].title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[320px] border-r border-b border-[var(--line)] bg-[var(--paper)]">
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--copper)]">
              {principles[0].number}
            </span>
            <h3 className="display-font mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              {principles[0].title}
            </h3>
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)]">
              {principles[0].text}
            </p>
            <Link
              href="/servicios"
              className="mt-6 inline-block border border-[var(--foreground)] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
            >
              Conocer más
            </Link>
          </div>

          <div className="relative min-h-[320px] border-r border-b border-[var(--line)] bg-[var(--paper)]">
            <Image
              src={principles[1].image}
              alt={principles[1].title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>

          {/* Fila 2: Texto 05 | Imagen 06 | Texto 06 */}
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[320px] border-r border-b border-[var(--line)] bg-[var(--paper)]">
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--copper)]">
              {principles[1].number}
            </span>
            <h3 className="display-font mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              {principles[1].title}
            </h3>
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)]">
              {principles[1].text}
            </p>
            <Link
              href="/servicios"
              className="mt-6 inline-block border border-[var(--foreground)] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
            >
              Conocer más
            </Link>
          </div>

          <div className="relative min-h-[320px] border-r border-b border-[var(--line)] bg-[var(--paper)]">
            <Image
              src={principles[2].image}
              alt={principles[2].title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[320px] border-r border-b border-[var(--line)] bg-[var(--paper)]">
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--copper)]">
              {principles[2].number}
            </span>
            <h3 className="display-font mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              {principles[2].title}
            </h3>
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)]">
              {principles[2].text}
            </p>
            <Link
              href="/servicios"
              className="mt-6 inline-block border border-[var(--foreground)] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
            >
              Conocer más
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] px-8 py-16 sm:px-12 sm:py-20 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-[var(--copper)]">El siguiente paso</p>
            <h2 className="display-font mt-4 text-4xl leading-tight sm:text-6xl">
              El futuro no se adivina. <em className="script-font text-[var(--copper)] font-normal">Se diseña.</em>
            </h2>
          </div>
          <div className="mt-8 lg:mt-0">
            <Link
              href="/servicios"
              className="group inline-flex items-center gap-3 rounded-full bg-[var(--copper)] px-8 py-4 text-sm font-bold text-[var(--forest-deep)] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              <span>Ver cómo podemos ayudarte</span>
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}