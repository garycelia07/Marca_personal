import Link from "next/link";
import { SiteShell, SectionLabel } from "@/components/site-shell";
import { siteConfig, whatsappHref } from "@/lib/site";
import { fetchAllContent, pickSection, heroData, projectsData, servicesData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await fetchAllContent();
  const hero = heroData(pickSection(content, "HERO"));
  const projects = projectsData(pickSection(content, "PROJECTS"));
  const services = servicesData(pickSection(content, "SERVICES"));

  const heroSocials = hero.socialLinks
    ? Object.entries(hero.socialLinks).filter(([, url]) => typeof url === "string" && url.length > 0)
    : [];

  return (
    <SiteShell>
      <section className="hero-portrait-bg relative overflow-hidden px-4 py-5 text-[var(--foreground)] sm:px-8 sm:py-8 lg:py-10">
        <div className="mx-auto grid min-h-[560px] max-w-[1440px] items-center gap-10 lg:grid-cols-2">
          <div className="order-2 px-2 lg:order-1">
            <p className="eyebrow">{siteConfig.byline}</p>
            <h1 className="display-font mt-6 text-5xl leading-[0.98] sm:text-7xl">
              {hero.title ?? "Liderazgo, finanzas e inversión inmobiliaria"}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-7 text-[var(--ink-soft)]">
              {hero.subtitle ?? "Gary Mayhua — formación en liderazgo y educación financiera."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/servicios" className="rounded-md bg-[var(--copper)] px-5 py-3 text-sm font-semibold text-[var(--forest-deep)] transition hover:brightness-110">
                Ver servicios
              </Link>
              <Link href="/mi-historia" className="editorial-link text-sm font-semibold">Mi historia</Link>
            </div>
            {heroSocials.length > 0 && (
              <div className="mt-9 flex flex-wrap items-center gap-3" aria-label="Redes sociales">
                {heroSocials.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} className="rounded-full border border-black/15 px-4 py-2 text-sm transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
                    {name}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="order-1 lg:order-2">
            {hero.photoUrl ? (
              <img src={hero.photoUrl} alt={siteConfig.brand} className="h-auto w-full max-w-md rounded-2xl object-cover" />
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-[var(--forest)] text-[var(--background)]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
          <SectionLabel number="01">Lo que hacemos</SectionLabel>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="border-t hairline pt-6">
              <p className="eyebrow text-[var(--copper-soft)]">Servicios</p>
              <h2 className="display-font mt-4 text-3xl sm:text-4xl">{services.title ?? "Formación y acompañamiento"}</h2>
            </article>
            <div className="flex flex-col gap-4">
              {services.items && services.items.length > 0
                ? services.items.map((service) => (
                    <div key={service.name} className="rounded-md bg-[var(--paper)] p-5 text-[var(--foreground)]">
                      <p className="font-semibold">{service.name ?? ""}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{service.description ?? ""}</p>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      </section>

      {projects.items && projects.items.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex items-end justify-between">
            <SectionLabel number="02">Proyectos</SectionLabel>
            <Link href="/proyectos" className="editorial-link text-sm font-semibold">Ver proyectos</Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {projects.items.map((project) => (
              <article key={project.name} className="flex items-start justify-between rounded-xl border hairline p-6">
                <div>
                  <h3 className="display-font text-2xl leading-none">{project.name ?? ""}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">{project.description ?? ""}</p>
                </div>
                <span className="text-xl text-[var(--copper)]" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 rounded-2xl bg-[var(--paper)] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="display-font text-3xl leading-none sm:text-4xl">¿Empezamos una conversación?</h2>
            <p className="mt-3 text-sm text-[var(--ink-soft)]">Cuéntanos tu caso por WhatsApp o escríbenos un correo.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {siteConfig.whatsapp ? (
              <a href={whatsappHref()} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105">
                WhatsApp
              </a>
            ) : null}
            <a href={`mailto:${siteConfig.contactEmail}`} className="rounded-full border hairline px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]">
              Contactar
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

