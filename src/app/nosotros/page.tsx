import Link from "next/link";
import Image from "next/image"; 
import { SectionLabel, SiteShell } from "@/components/site-shell";

const principles = [
  {
    number: "04",
    title: "Claridad",
    text: "Traducimos lo complejo en decisiones estructuradas que puedes sostener en el tiempo sin depender de terceros.",
  },
  {
    number: "05",
    title: "Criterio",
    text: "Invertir no es perseguir el ruido del mercado; es construir convicción propia a partir de datos y análisis real.",
  },
  {
    number: "06",
    title: "Comunidad",
    text: "El crecimiento personal y patrimonial se acelera exponencialmente cuando se comparte perspectiva con pares.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[var(--background)] pt-12 pb-20 sm:pt-20 lg:py-28">
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

          {/* Imagen Hero con overlay sutil */}
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
              Áurea reúne educación, acompañamiento e inversión para convertir la ambición en una práctica con dirección. Trabajamos desde la experiencia, con lenguaje humano y una mirada de largo plazo.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión (Bento Layout) */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Misión */}
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

          {/* Visión */}
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

      {/* Principios */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mb-12 border-b border-[var(--line)] pb-6">
          <SectionLabel number="04">Nuestros Principios</SectionLabel>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.title}
              className="group flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <span className="display-font text-2xl font-bold text-[var(--copper)]">
                  {item.number}
                </span>
                <h3 className="display-font mt-6 text-3xl font-bold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {item.text}
                </p>
              </div>
              <div className="mt-8 h-1 w-12 rounded-full bg-[var(--line)] transition-all duration-300 group-hover:w-full group-hover:bg-[var(--copper)]" />
            </article>
          ))}
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
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              </span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}