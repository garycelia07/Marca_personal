"use client";

import { useEffect, useState } from "react";
import { getContentJson } from "@/lib/api/content";

type MediaKind =
  | { type: "youtube"; embed: string; thumb: string }
  | { type: "vimeo"; embed: string }
  | { type: "file"; url: string };

function youtubeInfo(url: string): { embed: string; thumb: string } | null {
  const clean = url.trim();
  const match = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(clean);
  if (!match) return null;
  const id = match[1];
  return {
    embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

function vimeoInfo(url: string): { embed: string } | null {
  const match = /(?:vimeo\.com|player\.vimeo\.com\/video)\/(\d+)(?:[/?#].*)?$/i.exec(url.trim());
  return match ? { embed: `https://player.vimeo.com/video/${match[1]}?playsinline=1&title=0&byline=0&portrait=0` } : null;
}

function resolveMedia(url?: unknown): MediaKind | null {
  if (typeof url !== "string" || !url.trim()) return null;
  const raw = url.trim();
  const youtube = youtubeInfo(raw);
  if (youtube) return { type: "youtube", ...youtube };
  const vimeo = vimeoInfo(raw);
  if (vimeo) return { type: "vimeo", ...vimeo };
  return { type: "file", url: raw };
}

export function HomeLookVideo() {
  const [media, setMedia] = useState<MediaKind | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getContentJson("HERO")
      .then((data) => {
        if (!cancelled) setMedia(resolveMedia(data.homeVideoUrl));
      })
      .catch(() => {
        if (!cancelled) setMedia(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!media) {
    return (
      <div className="flex aspect-video min-h-[260px] items-center justify-center rounded-2xl border hairline bg-[var(--line)] px-6 text-center text-sm text-[var(--ink-soft)]">
        Video Home pendiente.
      </div>
    );
  }

  if (media.type === "file") {
    return (
      <video
        src={media.url}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full rounded-2xl border hairline bg-black object-cover shadow-2xl"
      >
        Tu navegador no puede reproducir el video.
      </video>
    );
  }

  if (media.type === "youtube" && !play) {
    return (
      <button
        type="button"
        onClick={() => setPlay(true)}
        className="group relative aspect-video w-full overflow-hidden rounded-2xl border hairline bg-black text-white shadow-2xl"
        aria-label="Reproducir video Home"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.thumb} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--copper)] pl-1 text-2xl text-[var(--forest-deep)] shadow-xl transition group-hover:scale-110">
            ▶
          </span>
        </span>
      </button>
    );
  }

  return (
    <iframe
      src={media.embed}
      title="Video Home"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      className="aspect-video w-full rounded-2xl border hairline bg-black shadow-2xl"
    />
  );
}
