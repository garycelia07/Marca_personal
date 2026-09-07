import { PageIntro, SiteShell } from "@/components/site-shell";
import { fetchAllContent, pickSection, projectTitle, projectItems } from "@/lib/cms";
import { ProjectsGallery } from "@/components/projects-gallery";

export const dynamic = "force-dynamic";

export default async function Proyectos() {
  const content = await fetchAllContent();
  const projects = pickSection(content, "PROJECTS");

  return (
    <SiteShell>
      <PageIntro eyebrow="Proyectos / 04" title={projectTitle(projects)}
        description="Iniciativas y apuestas orientadas a liderazgo e inversión inmobiliaria." />
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <ProjectsGallery items={projectItems(projects)} />
      </section>
    </SiteShell>
  );
}
