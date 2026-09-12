import Link from "next/link";
import { siteConfig, whatsappHref } from "@/lib/site";
import { VideoShareButton } from "@/components/video-share-button";
import { WhatsAppIcon } from "@/components/ui-icons";

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
  const message = whatsappMessage ?? `Hola, quiero ser parte después de ver el video de ${siteConfig.brand}.`;

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
            className="video-whatsapp-cta inline-flex animate-[whatsapp-nudge_1.8s_ease-in-out_infinite] items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/20 transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <span className="video-whatsapp-hand" aria-hidden="true">
              <svg viewBox="0 0 64 64" focusable="false" className="h-8 w-8">
                <path
                  fill="#ffd6a6"
                  d="M30.4 6.8c-2.4 0-4.3 1.9-4.3 4.3v25.2l-3.5-4.2a4.5 4.5 0 0 0-6.7-.3 4.7 4.7 0 0 0-.4 6.1l10.6 14.4a12.2 12.2 0 0 0 9.8 5h6.5c6.5 0 11.8-5.3 11.8-11.8V29.1a4.1 4.1 0 0 0-7.2-2.7 4.1 4.1 0 0 0-7-2.2 4.1 4.1 0 0 0-6.9-2V11.1c0-2.4-1.9-4.3-4.3-4.3Z"
                />
                <path
                  fill="none"
                  stroke="#9b6029"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M30.4 6.8c-2.4 0-4.3 1.9-4.3 4.3v25.2l-3.5-4.2a4.5 4.5 0 0 0-6.7-.3 4.7 4.7 0 0 0-.4 6.1l10.6 14.4a12.2 12.2 0 0 0 9.8 5h6.5c6.5 0 11.8-5.3 11.8-11.8V29.1a4.1 4.1 0 0 0-7.2-2.7 4.1 4.1 0 0 0-7-2.2 4.1 4.1 0 0 0-6.9-2V11.1c0-2.4-1.9-4.3-4.3-4.3Z"
                />
                <path fill="none" stroke="#9b6029" strokeLinecap="round" strokeWidth="3" d="M33.1 22.4v14.7M40.1 24.2v12.9M47.1 26.5v10.6" />
              </svg>
            </span>
            <WhatsAppIcon className="video-whatsapp-icon h-5 w-5 shrink-0" />
            Unirme por WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[var(--copper)] hover:text-[var(--copper)]"
          >
            Conocer más
          </Link>
          <VideoShareButton title={title} />
        </div>
      </section>
    </main>
  );
}
