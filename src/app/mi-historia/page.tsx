import { SiteShell } from "@/components/site-shell";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Milestone = {
  year: string;
  title: string;
  body: string;
};

const MILESTONES: Milestone[] = [
  {
    year: "2009",
    title: "El comienzo",
    body: "Partí desde cero, sin recursos económicos pero con una visión clara de lo que quería lograr. Empecé a formarme en ventas y marketing digital.",
  },
  {
    year: "2013",
    title: "Ingreso al sector inmobiliario",
    body: "Me uní a Ciudapolis, la primera franquicia inmobiliaria peruana, dando mis primeros pasos como agente inmobiliario.",
  },
  {
    year: "2016",
    title: "Primera inversión",
    body: "Adquirí mi primera propiedad invirtiendo todos mis ahorros. Ese momento cambió mi comprensión del dinero para siempre.",
  },
  {
    year: "2019",
    title: "Expansión como speaker",
    body: "Comencé a dictar charlas y asesorías personalizadas de ventas, formando a emprendedores en mentalidad de inversión y liderazgo.",
  },
  {
    year: "2022",
    title: "Proyectos propios",
    body: "Impulsé proyectos inmobiliarios como Residencial Amazon Garden en Tingo María, consolidando mi rol como inversionista activo.",
  },
  {
    year: "2026",
    title: "Plataforma digital y nuevas marcas",
    body: "Lancé presencia en nuevas plataformas de inversión (Yala) y marcas asociadas (Cluv360), integrando marketing, bienes raíces e inversión bajo una sola visión.",
  },
];

export default function MiHistoria() {
  return (
    <SiteShell>
      <section className="relative bg-[var(--background)] text-[var(--foreground)]">
        {/* HERO CON MAYOR LUMINOSIDAD Y VISIBILIDAD EN MÓVIL */}
        <div className="sticky top-0 z-0 flex h-[85vh] sm:h-screen w-full flex-col justify-center overflow-hidden border-b border-[var(--line)] px-5 py-12 text-center sm:px-12 sm:py-28 lg:py-36">
          <div className="absolute inset-0 -z-10 h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29uZmVyZW5jaWElMjBhY2FkJUMzJUE5bWljYXxlbnwwfHwwfHx8MA%3D%3D"
              alt="Fondo Mi Historia"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-90 sm:opacity-80"
            />
            {/* Overlay sutil para no oscurecer demasiado la imagen en móviles */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 sm:bg-black/30" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-2">
            <h1 className="display-font text-4xl uppercase leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl drop-shadow-lg">
              Mi{" "}
              <span className="text-[var(--copper)]">
                Historia
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-100 sm:mt-6 sm:text-lg drop-shadow-md">
              Cada logro fue construido sobre fracasos, lecciones y la
              decisión inquebrantable de no rendirse.
            </p>
          </div>
        </div>

        {/* CONTENIDO DESLIZANTE CON BACKDROP Y PADDING ADAPTADO A MÓVIL */}
        <div className="relative z-10 bg-[var(--background)]/80 sm:bg-[var(--background)]/60 backdrop-blur-md sm:backdrop-blur-sm border-t border-[var(--line)] shadow-2xl">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-10 lg:pb-28 lg:pt-20">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
              {/* TIMELINE */}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded bg-[var(--copper)]/45"
                />

                <ol className="space-y-10 sm:space-y-12">
                  {MILESTONES.map((m) => (
                    <li
                      key={m.year}
                      className="relative pl-9 sm:pl-16"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--copper)] bg-[var(--background)]"
                      >
                        <span className="h-2 w-2 rounded-full bg-[var(--copper)]" />
                      </span>

                      <p className="font-mono text-xs sm:text-sm font-bold tracking-[0.16em] text-[var(--copper)]">
                        {m.year}
                      </p>

                      <h3 className="display-font mt-1 text-xl sm:text-[1.7rem] leading-tight text-[var(--foreground)]">
                        {m.title}
                      </h3>

                      <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-[15px] leading-relaxed text-[var(--ink-soft)]">
                        {m.body}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* CITA + IMAGEN GRANDE + NOMBRE */}
              <div className="flex flex-col mt-4 lg:mt-0">
                <blockquote className="display-font text-xl sm:text-[1.65rem] italic leading-snug text-[var(--foreground)] border-l-2 border-[var(--copper)] pl-4 lg:border-l-0 lg:pl-0">
                  “La disciplina convierte el propósito en resultado; cada paso,
                  aunque pequeño, es parte de una visión más grande.”
                </blockquote>

                <div className="relative mt-6 sm:mt-8 w-full lg:mt-10">
                  <img
                    src="/foto.avif"
                    alt="Retrato de Gary Mayhua"
                    className="h-auto w-full object-contain rounded-xl sm:rounded-none"
                  />
                </div>

                <div className="mt-6 flex justify-center sm:mt-8 lg:mt-10">
                  <span className="display-font text-base sm:text-xl font-semibold text-[var(--copper)]">
                    — Gary Mayhua
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <section className="border-t border-[var(--line)] bg-[var(--background)]/90 sm:bg-[var(--background)]/75 text-[var(--foreground)]">
            <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-14 text-center sm:px-10 lg:py-28">
              <h2 className="display-font text-3xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Únete a formar tu{" "}
                <span className="text-[var(--copper)]">
                  propia historia
                </span>
              </h2>

              <p className="mt-4 sm:mt-6 max-w-xl text-sm sm:text-lg leading-relaxed text-[var(--ink-soft)]">
                Cada gran historia empieza con una decisión. Hoy puede ser la
                tuya.
              </p>

              <a
                href="/cursos"
                className="group mt-8 sm:mt-10 inline-flex items-center gap-2.5 rounded-full bg-[var(--copper)] px-7 py-3 sm:px-8 sm:py-3.5 text-sm font-bold text-[var(--background)] transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--copper)]"
              >
                Unirme a cursos de líderes

                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </section>
        </div>
      </section>
    </SiteShell>
  );
}