import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";
import { fetchAllContent, pickSection, storyData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function MiHistoria() {
  const content = await fetchAllContent();
  const story = storyData(pickSection(content, "STORY"));

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[var(--forest)] text-[var(--background)]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <SectionLabel number="03">Mi historia</SectionLabel>
          <h1 className="display-font mt-6 max-w-3xl text-5xl leading-[0.98] sm:text-7xl">
            {story.title ?? "Una trayectoria de liderazgo e inversión."}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--copper-soft)]">
            {story.body ?? ""}
          </p>
        </div>
      </section>
      <PageIntro eyebrow="Mi historia / 03" title="El camino."
        description="Notas, hitos y la intención detrás de este proyecto." />
    </SiteShell>
  );
}
