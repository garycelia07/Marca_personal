import Link from "next/link";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";
import { siteConfig, whatsappHref } from "@/lib/site";
import { fetchAllContent, pickSection, servicesData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Servicios() {
  const content = await fetchAllContent();
  const services = servicesData(pickSection(content, "SERVICES"));

  return (
    <SiteShell>
      <PageIntro eyebrow="Servicios / 05" title={services.title ?? "Servicios y formación."}
        description="Formatos pensados para llevar el liderazgo y la educación financiera a la acción." />
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid gap-px overflow-hidden rounded-2xl border hairline bg-[var(--line)] md:grid-cols-2 lg:grid-cols-3">
          {(services.items ?? []).map((service) => (
            <article key={service.name} className="flex flex-col bg-[var(--background)] p-7">
              <SectionLabel number="·">Servicio</SectionLabel>
              <h2 className="display-font mt-12 text-3xl leading-none">{service.name ?? ""}</h2>
              <p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">{service.description ?? ""}</p>
            </article>
          ))}
        </div>
        {(services.items ?? []).length === 0 ? (
          <p className="mt-6 text-sm text-[var(--ink-soft)]">Los servicios se publican desde el panel de administración.</p>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-4">
          <a href={whatsappHref()} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105">Pedir información por WhatsApp</a>
          <Link href="/nosotros" className="rounded-full border hairline px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Conócenos {siteConfig.brand}</Link>
        </div>
      </section>
    </SiteShell>
  );
}
