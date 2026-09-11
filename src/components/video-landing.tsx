import Link from "next/link";
import { siteConfig, whatsappHref } from "@/lib/site";

type VideoKind =
  | { type: "youtube"; src: string }
  | { type: "vimeo"; src: string }
  | { type: "file"; src: string };

export type VideoLandingConfig = {
  title?: string;
  videoUrl?: string;
  whatsappMessage?: string;
};

function youtubeEmbed(url: string): string | null {
  const match = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url.trim());
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&playsinline=1` : null;
}

function vimeoEmbed(url: string): string | null {
  const match = /(?:vimeo\.com|player\.vimeo\.com\/video)\/(\d+)(?:[/?#].*)?$/i.exec(url.trim());
  return match ? `https://player.vimeo.com/video/${match[1]}?playsinline=1&title=0&byline=0&portrait=0` : null;
}

function resolveVideo(url?: string): VideoKind | null {
  if (!url?.trim()) return null;
  const clean = url.trim();
  const youtube = youtubeEmbed(clean);
  if (youtube) return { type: "youtube", src: youtube };
  const vimeo = vimeoEmbed(clean);
  if (vimeo) return { type: "vimeo", src: vimeo };
  return { type: "file", src: clean };
}

export function VideoLanding({ title = "Video exclusivo", videoUrl, whatsappMessage }: VideoLandingConfig) {
  const video = resolveVideo(videoUrl);
  const message = whatsappMessage ?? `Hola, quiero unirme después de ver el video de ${siteConfig.brand}.`;

  return (
    <main className="min-h-screen bg-[#10100e] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center gap-6">
        <div className="w-full">
          {video ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_90px_-40px_rgba(244,197,66,0.45)]">
              {video.type === "file" ? (
                <video
                  src={video.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full bg-black object-contain"
                >
                  Tu navegador no puede reproducir el video.
                </video>
              ) : (
                <iframe
                  src={video.src}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              )}
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/10 bg-black px-6 text-center text-sm text-white/70">
              Agrega el enlace del video en la URL con ?v=
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <a
            href={whatsappHref(message)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Quiero unirme
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[var(--copper)] hover:text-[var(--copper)]"
          >
            Conocer más
          </Link>
        </div>
      </section>
    </main>
  );
}
