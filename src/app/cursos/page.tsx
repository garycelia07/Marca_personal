import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { CoursesGrid } from "@/components/courses-grid";
import { CoursesHero } from "@/components/courses-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Cursos | Gary Mayhua",
    description: "Programas de liderazgo, educación financiera e inversión con propósito.",
};

export default function CursosPage() {
    return (
        <SiteShell>
            <CoursesHero />
            <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
                <div className="mb-8 flex items-end justify-between border-b hairline pb-6">
                    <div>
                        <p className="eyebrow">Aprendizaje</p>
                        <h1 className="display-font mt-3 text-4xl leading-[0.98] sm:text-6xl">Cursos que transforman tu perspectiva.</h1>
                    </div>
                </div>
                <CoursesGrid />
            </section>
            <section className="border-t hairline bg-[var(--forest)] text-[var(--background)]">
                <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
                    <div>
                        <p className="eyebrow text-[var(--copper-soft)]">¿Listo para empezar?</p>
                        <p className="mt-10 max-w-xs text-sm leading-6 text-[var(--copper-soft)]">Accede a tus programas, recursos y conversaciones en curso.</p>
                    </div>
                    <div>
                        <p className="display-font max-w-3xl text-4xl leading-[0.98] sm:text-6xl">La transformación no es un evento. <em className="script-font text-[var(--copper)]">Es una práctica.</em></p>
                        <Link href="/iniciar-sesion" className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-[var(--copper)] px-7 py-3 text-sm font-bold text-[var(--forest-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105">Comenzar una conversación <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span></Link>
                    </div>
                </div>
            </section>
        </SiteShell>
    );
}