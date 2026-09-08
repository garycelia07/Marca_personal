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
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--background)] py-16 sm:py-24 lg:py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">

            {/* Columna Izquierda: Contenido puro */}
            <div className="flex flex-col lg:col-span-6 xl:col-span-7">
              <span className="eyebrow inline-flex self-start items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--copper)]">
                Nosotros / 01
              </span>

              <h1 className="display-font mt-6 text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-7xl xl:text-8xl text-[var(--foreground)]">
                Crecer con <em className="script-font text-[var(--copper)] font-normal">raíz.</em>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--ink-soft)] lg:text-lg">
                Somos una plataforma de pensamiento y acción para quienes entienden el patrimonio como una herramienta de libertad, no como una cifra en pantalla.
              </p>
            </div>
            <div className="relative lg:col-span-6 xl:col-span-5">
              <div className="relative rounded-3xl bg-[var(--copper)] p-4 sm:p-6 shadow-2xl">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80"
                    alt="Persona de la plataforma"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />

                  {/* Botón de reproducción */}
                  <div className="absolute bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--forest-deep)] shadow-lg">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Propósito */}
      <section className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--paper)] py-12 sm:py-16">
        {/* Detalle de línea decorativa curva en la esquina derecha */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="var(--copper)" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 text-center">
          {/* Título pequeño superior */}
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ink-soft)]">
            Nuestra experiencia
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            <span className="font-sans text-2xl font-black uppercase tracking-tighter text-[var(--foreground)] opacity-70 transition-all duration-300 hover:opacity-100 sm:text-3xl">
              YALA
            </span>
            <span className="font-serif text-xl font-medium tracking-wide text-[var(--foreground)] opacity-70 transition-all duration-300 hover:opacity-100 sm:text-2xl">
              Bienes <em className="script-font italic font-normal text-[var(--copper)]">Raíces</em>
            </span>
            <span className="font-mono text-lg font-bold uppercase tracking-[0.25em] text-[var(--foreground)] opacity-70 transition-all duration-300 hover:opacity-100 sm:text-xl">
              FINANZAS
            </span>
            <span className="display-font text-xl font-light uppercase tracking-[0.2em] text-[var(--foreground)] opacity-70 transition-all duration-300 hover:opacity-100 sm:text-2xl">
              LIFE <strong className="font-extrabold text-[var(--copper)]">360</strong>
            </span>

          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores (Optimizado para Modo Oscuro y Claro) */}
      <section className="relative overflow-hidden bg-[var(--background)] py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-20">
            <p className="text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
              Creemos que construir un mejor futuro requiere claridad para decidir,
              visión para avanzar y valores que nos permitan mantenernos firmes
              durante el camino.
            </p>
          </div>
          <div className="relative mx-auto max-w-[1100px]">
            <div className="hidden md:block absolute left-0 right-0 top-0 h-1 bg-[var(--copper)] z-20" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0 md:items-center">
              {/* Misión */}
              <article className="relative flex flex-col items-center justify-start rounded-2xl md:rounded-l-2xl md:rounded-r-none bg-[var(--forest)] px-6 py-10 text-center sm:px-10 border border-white/10 dark:border-white/15 min-h-[320px] md:min-h-[380px]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[var(--paper)] text-[var(--paper)] sm:h-16 sm:w-16">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="sm:w-8 sm:h-8">
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="display-font text-2xl font-bold text-[var(--paper)] sm:text-3xl lg:text-4xl">
                  Misión
                </h3>
                <div className="mt-4 h-px w-12 bg-[var(--paper)]/60 sm:w-16" />
                <p className="mt-5 max-w-[260px] text-xs sm:text-sm leading-relaxed text-[var(--paper)]/90">
                  Convertir claridad en decisiones que transforman, acompañando a cada persona a construir un futuro con dirección y propósito.
                </p>
              </article>

              {/* Visión (Tarjeta destacada) */}
              <article className="relative z-10 flex flex-col items-center justify-start rounded-2xl bg-[var(--copper)] px-6 py-10 text-center shadow-xl shadow-black/20 border border-white/20 min-h-[340px] md:min-h-[440px] md:-my-4 md:scale-105 md:shadow-2xl md:shadow-black/50">
                <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/40 rounded-b-full" />
                <div className="mb-6 flex h-14 w-14 items-center justify-center text-[#1c2e24] sm:h-16 sm:w-16">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="sm:w-[52px] sm:h-[52px]">
                    <path d="M3 12C3 12 6.5 6.5 12 6.5C17.5 6.5 21 12 21 12C21 12 17.5 17.5 12 17.5C6.5 17.5 3 12 3 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3.2" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="display-font text-2xl font-bold text-[#1c2e24] sm:text-3xl lg:text-4xl">
                  Visión
                </h3>
                <div className="mt-4 h-px w-12 bg-[#1c2e24]/40 sm:w-16" />
                <p className="mt-5 max-w-[260px] text-xs font-medium leading-relaxed text-[#1c2e24] sm:text-sm">
                  Una generación que lidera su futuro con libertad, conocimiento y una visión consciente del crecimiento personal y patrimonial.
                </p>
              </article>
              {/* Valores */}
              <article className="relative flex flex-col items-center justify-start rounded-2xl md:rounded-r-2xl md:rounded-l-none bg-[var(--forest-deep)] px-6 py-10 text-center sm:px-10 border border-white/10 dark:border-white/15 min-h-[320px] md:min-h-[380px]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center text-[var(--paper)] sm:h-16 sm:w-16">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="sm:w-12 sm:h-12">
                    <path d="M3 9.5L7 5H17L21 9.5L12 19L3 9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M7 5L9.5 9.5L12 19L14.5 9.5L17 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="display-font text-2xl font-bold text-[var(--paper)] sm:text-3xl lg:text-4xl">
                  Valores
                </h3>
                <div className="mt-4 h-px w-12 bg-[var(--paper)]/60 sm:w-16" />
                <p className="mt-5 max-w-[260px] text-xs sm:text-sm leading-relaxed text-[var(--paper)]/90">
                  Actuamos con claridad, criterio y comunidad para construir relaciones sólidas y decisiones sostenibles en el tiempo.
                </p>
              </article>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-3xl text-center sm:mt-20">
            <p className="text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
              Nuestra misión, visión y valores son el punto de partida de cada decisión que tomamos y de cada relación que construimos.
            </p>
          </div>
        </div>
      </section>

      {/* Principios - Grid Mosaico */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mb-16 text-center">
          <h2 className="display-font text-4xl font-bold sm:text-5xl lg:text-6xl text-[var(--foreground)]">
            Nuestros Principios
          </h2>
          <div className="mt-4 mx-auto h-[1px] w-48 bg-[var(--line)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[var(--line)]">
          {/* Fila 1 */}
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

          {/* Fila 2 */}
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