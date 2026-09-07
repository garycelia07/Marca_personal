import Link from "next/link";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";
import { fetchAllContent, pickSection, projectsData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Proyectos() {
  const content = await fetchAllContent();
  const projects = projectsData(pickSection(content, "PROJECTS"));

  return (
    <SiteShell>
      <PageIntro eyebrow="Proyectos / 04" title={projects.title ?? "Proyectos."}
        description="Iniciativas y apuestas orientadas a liderazgo e inversión inmobiliaria." />
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2">
          {(projects.items ?? []).map((project) => (
            <article key={project.name} className="flex flex-col justify-between rounded-2xl border hairline bg-[var(--background)] p-8 sm:p-10">
              <div><SectionLabel number="·">Proyecto</SectionLabel>
                <h2 className="display-font mt-8 text-3xl leading-none sm:text-4xl">{project.name ?? ""}</h2>
                <p className="mt-5 max-w-md text-sm leading-6 text-[var(--ink-soft)]">{project.description ?? ""}</p>
              </div>
              <Link href="/servicios" className="editorial-link mt-10 text-sm font-semibold">Ver servicios</Link>
            </article>
          ))}
        </div>
        {(projects.items ?? []).length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">Aún no hay proyectos publicados.</p>
        ) : null}
      </section>
    </SiteShell>
  );
}
