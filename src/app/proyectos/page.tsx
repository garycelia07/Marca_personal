import { SiteShell } from "@/components/site-shell";
import { fetchAllContent, pickSection, projectItems } from "@/lib/cms";
import { ProjectsView } from "@/components/projects-view";

export const dynamic = "force-dynamic";

export default async function Proyectos() {
  const content = await fetchAllContent();
  const projects = pickSection(content, "PROJECTS");

  return (
    <SiteShell>
      <ProjectsView items={projectItems(projects)} />
    </SiteShell>
  );
}
