import Link from "next/link";
import { PageIntro, SiteShell } from "@/components/site-shell";
import { siteConfig, whatsappHref } from "@/lib/site";
import { fetchAllContent, pickSection, serviceItems, serviceTitle } from "@/lib/cms";
import { ServicesGrid } from "@/components/services-grid";

export const dynamic = "force-dynamic";

export default async function Servicios() {
  const content = await fetchAllContent();
  const services = pickSection(content, "SERVICES");

  return (
    <SiteShell>
      <PageIntro eyebrow="Servicios / 05" title={serviceTitle(services)}
        description="Formatos pensados para llevar el liderazgo y la educación financiera a la acción." />
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <ServicesGrid items={serviceItems(services)} />
        <div className="mt-10 flex flex-wrap gap-4">
          <a href={whatsappHref()} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105">Pedir información por WhatsApp</a>
          <Link href="/nosotros" className="rounded-full border hairline px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">Conócenos {siteConfig.brand}</Link>
        </div>
      </section>
    </SiteShell>
  );
}
