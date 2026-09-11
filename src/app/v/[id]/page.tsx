import type { Metadata } from "next";
import { VideoLanding } from "@/components/video-landing";
import { VIDEO_PRESETS } from "@/lib/video-presets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video exclusivo",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    v?: string;
    title?: string;
    msg?: string;
  }>;
};

export default async function ShortVideoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const preset = VIDEO_PRESETS[id] ?? {};

  return (
    <VideoLanding
      title={query?.title || preset.title || "Video exclusivo"}
      videoUrl={query?.v || preset.videoUrl}
      whatsappMessage={query?.msg || preset.whatsappMessage}
    />
  );
}
