"use client";

import { useEffect, useState } from "react";

type Slot = "hero" | "proyectos" | "servicios";

type PageHeroProps = {
    slot: Slot;
    eyebrow: string;
    /** Contenido del titular grande. */
    title: React.ReactNode;
    /** Subtítulo corto (clarito debajo del titular). */
    children?: React.ReactNode;
    minHeightClass?: string;
};

const FALLBACKS: Record<Slot, string> = {
    hero: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2200&q=80",
    proyectos: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=80",
    servicios: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2200&q=80",
};

/**
 * Banner principal de una página pública. La foto se toma del slot editable del
 * panel /admin/contenido (PUT/DELETE sobre /api/site/{slot}). Si el admin borró
 * o aún no subió su imagen, se muestra la foto elegante por defecto.
 */
export function PageHero({ slot, eyebrow, title, children, minHeightClass = "min-h-[420px] lg:min-h-[520px]" }: PageHeroProps) {
    const [img, setImg] = useState<string | null>(null);
    const [broken, setBroken] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const apply = (url: string | null) => {
            if (!cancelled) setImg(url);
        };
        fetch(`/api/site/${slot}`, { method: "HEAD" })
            .then((res) => apply(res.ok ? `/api/site/${slot}?v=${Date.now()}` : null))
            .catch(() => apply(null));
        return () => {
            cancelled = true;
        };
    }, [slot]);

    const src = img && !broken ? img : FALLBACKS[slot];

    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt=""
                    onError={() => setBroken(true)}
                    className="h-full w-full object-cover"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-[#171713]/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
            </div>

            <div className={`relative mx-auto flex ${minHeightClass} max-w-[1440px] flex-col justify-end px-5 py-20 sm:px-8 lg:px-12`}>
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="display-font mt-5 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:text-[6.5rem]">
                    {title}
                </h1>
                {children ? (
                    <div className="mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                        {children}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

