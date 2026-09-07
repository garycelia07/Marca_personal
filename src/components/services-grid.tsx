import { serviceCoverUrl } from "@/lib/site";

type ServiceItem = { name?: string; slug?: string; tagline?: string; description?: string };

export function ServicesGrid({ items }: { items: ServiceItem[] }) {
    if (items.length === 0) {
        return <p className="text-sm text-[var(--ink-soft)]">Los servicios se publican desde el panel de administración.</p>;
    }
    return (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((service, index) => (
                <article key={service.slug ?? service.name ?? index} className="flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--line)]">
                        <img
                            src={serviceCoverUrl(service.name ?? "")}
                            alt={service.name ?? "Servicio"}
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7">
                        <p className="eyebrow">Servicio</p>
                        <h2 className="display-font mt-3 text-3xl leading-tight">{service.name}</h2>
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--ink-soft)]">{service.description ?? ""}</p>
                    </div>
                </article>
            ))}
        </div>
    );
}
