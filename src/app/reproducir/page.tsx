import type { Metadata } from "next";
import { VideoLanding } from "@/components/video-landing";
import { fetchAllContent, pickSection } from "@/lib/cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video exclusivo",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{
    v?: string;
    title?: string;
    msg?: string;
  }>;
};

export default async function ReproducirPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const blocks = await fetchAllContent();
  const hero = pickSection(blocks, "HERO");
  const heroData = (hero?.data ?? {}) as { homeVideoUrl?: string };

  return (
    <VideoLanding
      title={query?.title || "Video exclusivo"}
      videoUrl={query?.v || heroData.homeVideoUrl}
      whatsappMessage={query?.msg}
    />
  );
}
