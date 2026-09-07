"use client";

import { useEffect, useState } from "react";

type SiteImageProps = {
    slot: "hero" | "proyectos" | "servicios";
    fallbackSrc: string;
    alt: string;
    className?: string;
    priority?: boolean;
};

export function SiteImage({ slot, fallbackSrc, alt, className, priority }: SiteImageProps) {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/site/${slot}`, { method: "HEAD" })
            .then((res) => {
                if (!cancelled) setSrc(res.ok ? `/api/site/${slot}?v=${Date.now()}` : fallbackSrc);
            })
            .catch(() => {
                if (!cancelled) setSrc(fallbackSrc);
            });
        return () => {
            cancelled = true;
        };
    }, [slot, fallbackSrc]);

    return <img src={src ?? fallbackSrc} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
}

