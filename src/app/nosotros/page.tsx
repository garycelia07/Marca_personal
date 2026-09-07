import Link from "next/link";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/lib/site";
import { fetchAllContent, pickSection, aboutData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Nosotros() {
  const content = await fetchAllContent();
  const about = aboutData(pickSection(content, "ABOUT"));

  return (
    <SiteShell>
      <PageIntro eyebrow="Nosotros / 02" title="Quiénes somos."
        description={about.title ?? "Gary Mayhua — liderazgo, finanzas e inversión inmobiliaria."} />
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.5fr_1.5fr]">
          <div className="space-y-10">
            <SectionLabel number="01">Propósito</SectionLabel>
          </div>
          <div>
            <h1 className="display-font max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
              {about.vision ?? "Formar líderes capaces de transformar su entorno."}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
              {about.mission ?? "Contribuimos con conocimiento financiero y liderazgo con propósito."}
            </p>
            <p className="mt-6 text-sm text-[var(--ink-soft)]">
              {siteConfig.brand} · {siteConfig.byline}.
            </p>
            <div className="mt-10"><Link href="/servicios" className="editorial-link text-sm font-semibold">Ver servicios</Link></div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
