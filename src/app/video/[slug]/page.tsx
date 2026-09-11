import type { Metadata } from "next";
import { VideoLanding, type VideoLandingConfig } from "@/components/video-landing";

export const dynamic = "force-dynamic";

const VIDEO_PRESETS: Record<string, VideoLandingConfig> = {
  home: {
    title: "Video exclusivo",
    videoUrl: "",
    whatsappMessage: "Hola, quiero unirme después de ver el video de Gary Mayhua.",
  },
};

export const metadata: Metadata = {
  title: "Video exclusivo",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    v?: string;
    title?: string;
    msg?: string;
  }>;
};

export default async function VideoBySlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const preset = VIDEO_PRESETS[slug] ?? {};

  return (
    <VideoLanding
      title={query?.title || preset.title || "Video exclusivo"}
      videoUrl={query?.v || preset.videoUrl}
      whatsappMessage={query?.msg || preset.whatsappMessage}
    />
  );
}
