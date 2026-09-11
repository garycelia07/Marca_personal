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
                    <p className="eyebrow">Todos los programas</p>
                </div>
                <CoursesGrid />
            </section>
            <section className="border-t bg-[#171713] text-[#fffdf4]">
                <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-28">
                    <div>
                        <p className="eyebrow text-[#f4c542]">¿Listo para empezar?</p>
                        <p className="mt-10 max-w-xs text-sm leading-6 text-[#f4c542]/90">Accede a tus programas, recursos y conversaciones en curso.</p>
                    </div>
                    <div>
                        <p className="display-font max-w-3xl text-4xl leading-[0.98] sm:text-6xl">La transformación no es un evento. <em className="script-font text-[#f4c542]">Es una práctica.</em></p>
                        <Link href="/iniciar-sesion" className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-[#f4c542] px-7 py-3 text-sm font-bold text-[#171713] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105">Comenzar una conversación <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1.5">→</span></Link>
                    </div>
                </div>
            </section>
        </SiteShell>
    );
}