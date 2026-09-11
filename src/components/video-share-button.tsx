"use client";

import { useState } from "react";

export function VideoShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#10100e]"
      >
        Compartir
      </button>
      {copied ? (
        <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#10100e] shadow-lg">
          Enlace copiado
        </span>
      ) : null}
    </div>
  );
}
