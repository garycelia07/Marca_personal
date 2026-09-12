import Image from "next/image";
import Link from "next/link";
import { whatsappHref } from "@/lib/site";

export function CoursesHero() {
    return (
        <section className="mx-auto max-w-[1440px] overflow-hidden px-5 pt-8 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 lg:items-center">
                {/* Imagen a la izquierda — mismo tamaño que el contenido */}
                <div className="relative aspect-[4/3] w-full max-w-[760px] overflow-hidden rounded-3xl border hairline bg-[#171713]">
                    <Image
                        src="/curso.png"
                        alt="Cursos de Gary Mayhua"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-[center_12%]"
                    />
                </div>

                {/* Contenido a la derecha */}
                <div className="flex flex-col items-start justify-center">
                    <h1 className="display-font mt-4 text-4xl leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl text-[var(--foreground)]">
                        Cursos que transforman <em className="script-font text-[var(--copper)] font-normal">tu perspectiva.</em>
                    </h1>

                    <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--ink-soft)] lg:text-lg">
                        Programas de liderazgo, educación financiera e inversión con propósito. Aprende a construir patrimonio, crecer con disciplina y crear oportunidades que multipliquen tus resultados.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-3">
                        <Link
                            href="/cursos"
                            className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--copper)] px-7 py-3.5 text-sm font-bold text-[var(--forest-deep)] shadow-[0_10px_24px_rgba(244,197,66,0.35)] transition hover:brightness-110 hover:-translate-y-0.5"
                        >
                            Explorar cursos
                            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </Link>
                        <a
                            href={whatsappHref()}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition hover:brightness-105"
                        >
                            Escríbenos por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
