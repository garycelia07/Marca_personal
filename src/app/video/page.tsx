import type { Metadata } from "next";
import { VideoLanding } from "@/components/video-landing";

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

export default async function VideoPage({ searchParams }: PageProps) {
  const query = await searchParams;

  return (
    <VideoLanding
      title={query?.title || "Video exclusivo"}
      videoUrl={query?.v}
      whatsappMessage={query?.msg}
    />
  );
}
