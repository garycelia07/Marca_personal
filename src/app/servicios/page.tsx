
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { siteConfig, whatsappHref } from "@/lib/site";
import { fetchAllContent, pickSection, serviceItems } from "@/lib/cms";
import { ServicesGrid } from "@/components/services-grid";

export const dynamic = "force-dynamic";

const MARQUEE_MSG = [
  "Mentorías personalizadas",
  "Educación en liderazgo",
  "Asesoría en inversión inmobiliaria",
  "Caminemos tu crecimiento",
];

/** Cinta corrida (marquee) reutilizada del estilo de Proyectos. */
function ServicesMarquee() {
  const Strip = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {MARQUEE_MSG.map((phrase) => (
        <span key={phrase} className="flex items-center text-sm font-semibold uppercase tracking-[0.22em]">
          <span className="px-6">{phrase}</span>
          <span className="text-[var(--copper)]">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <section className="marquee-mask overflow-hidden border-y hairline bg-[var(--forest)] py-4 text-[var(--background)]">
      <div className="marquee-track flex w-max">
        {Strip}
        {Strip}
      </div>
    </section>
  );
}

export default async function Servicios() {
  const content = await fetchAllContent();
  const services = pickSection(content, "SERVICES");

  return (
    <SiteShell>
      <PageHero slot="servicios">
        Acompaño a profesionales y emprendedores en liderazgo, educación financiera e inversión
        inmobiliaria con formatos cercanos y accionables — presencial o remoto.
      </PageHero>

      <ServicesMarquee />

      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Acompañamiento</p>
            <h2 className="display-font mt-3 text-4xl leading-none sm:text-5xl">Elige tu formato</h2>
          </div>
          <p className="hidden text-sm text-[var(--ink-soft)] sm:block">
            Servicios para tu siguiente nivel.
          </p>
        </div>

        <ServicesGrid items={serviceItems(services)} />

        <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border hairline bg-[var(--paper)] p-6 sm:p-8">
          <div className="flex-1">
            <h3 className="display-font text-2xl leading-tight">¿No encuentras lo que buscas?</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
              Conversemos un momento y armamos un plan a tu medida. Escríbeme por WhatsApp o cuéntanos cómo podemos colaborar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={whatsappHref()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105">
              Pedir información por WhatsApp
            </a>
            <Link href="/nosotros" className="rounded-full border hairline px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
              Conócenos {siteConfig.brand}
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
