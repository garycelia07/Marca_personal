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
      <section className="bg-[var(--background)] text-[var(--foreground)]">
        {/* HERO */}
        <div className="relative w-full overflow-hidden border-b border-[var(--line)] px-6 py-20 text-center sm:px-12 sm:py-28 lg:py-36">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y29uZmVyZW5jaWElMjBhY2FkJUMzJUE5bWljYXxlbnwwfHwwfHx8MA%3D%3D"
              alt="Fondo Mi Historia"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-black/65" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <h1 className="display-font text-5xl uppercase leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
              Mi{" "}
              <span className="text-[var(--copper)]">
                Historia
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
              Cada logro fue construido sobre fracasos, lecciones y la
              decisión inquebrantable de no rendirse.
            </p>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-10 lg:pb-28 lg:pt-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
            {/* TIMELINE */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded bg-[var(--copper)]/45"
              />

              <ol className="space-y-12">
                {MILESTONES.map((m) => (
                  <li
                    key={m.year}
                    className="relative pl-12 sm:pl-16"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--copper)] bg-[var(--background)]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[var(--copper)]" />
                    </span>

                    <p className="font-mono text-sm font-bold tracking-[0.16em] text-[var(--copper)]">
                      {m.year}
                    </p>

                    <h3 className="display-font mt-1 text-2xl leading-tight text-[var(--foreground)] sm:text-[1.7rem]">
                      {m.title}
                    </h3>

                    <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--ink-soft)]">
                      {m.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* IMAGEN + CITA */}
            <div className="flex flex-col">
              <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
                <img
                  src="/gary.avif"
                  alt="Gary Mayhua brindando una conferencia"
                  className="h-full w-full object-cover"
                />
              </div>

              <figure className="mt-8 lg:mt-10">
                <blockquote className="display-font text-2xl italic leading-snug text-[var(--foreground)] sm:text-[1.65rem]">
                  “La disciplina convierte el propósito en resultado; cada
                  paso, aunque pequeño, es parte de una visión más grande.”
                </blockquote>

                <figcaption className="mt-5 display-font text-lg font-semibold text-[var(--copper)]">
                  — Gary Mayhua
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--line)] bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:px-10 lg:py-28">
          <h2 className="display-font text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Únete a formar tu{" "}
            <span className="text-[var(--copper)]">
              propia historia
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
            Cada gran historia empieza con una decisión. Hoy puede ser la
            tuya.
          </p>

          <a
            href="/cursos"
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-[var(--copper)] px-8 py-3.5 text-sm font-bold text-[var(--background)] transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--copper)]"
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
    </SiteShell>
  );
}