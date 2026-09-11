"use client";

import { useState } from "react";

export function VideoShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function showCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        showCopied();
      } else {
        await navigator.clipboard.writeText(url);
        showCopied();
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        showCopied();
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
        className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#10100e] shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[var(--copper)] hover:text-[var(--forest-deep)]"
      >
        Compartir
      </button>
      {copied ? (
        <span
          role="status"
          aria-live="polite"
          className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--copper)] px-4 py-2 text-xs font-black text-[var(--forest-deep)] shadow-xl"
        >
          ¡Enlace copiado!
        </span>
      ) : null}
    </div>
  );
}
