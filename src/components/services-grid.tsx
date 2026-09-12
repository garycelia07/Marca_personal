"use client";

import { useState } from "react";
import { serviceCoverUrl, whatsappHref } from "@/lib/site";
import { LeadForm } from "@/components/lead-form";
import { WhatsAppIcon, UserPlusIcon } from "@/components/ui-icons";

type ServiceItem = { name?: string; slug?: string; tagline?: string; description?: string; coverUrl?: string };

function ServiceBadge() {
    return (
        <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--copper)]">
            <UserPlusIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Servicio</span>
        </span>
    );
}

export function ServicesGrid({ items }: { items: ServiceItem[] }) {
    const [open, setOpen] = useState<ServiceItem | null>(null);

    if (items.length === 0) {
        return <p className="text-sm text-[var(--ink-soft)]">Los servicios se publican desde el panel de administración.</p>;
    }
    return (
        <>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 lg:gap-x-3">
                {items.map((service, index) => {
                    const src = (service.coverUrl && service.coverUrl.trim()) ? service.coverUrl.trim() : serviceCoverUrl(service.name ?? "");
                    return (
                        <article key={service.slug ?? service.name ?? index} className="group shrink-0 w-[240px] snap-start flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                            <div className="relative aspect-[5/4] overflow-hidden bg-[var(--line)]">
                                {src ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={src} alt={service.name ?? "Servicio"} loading="lazy" className="h-full w-full object-cover" />
                                ) : null}
                            </div>
                            <div className="flex flex-1 flex-col px-3 py-3.5 sm:px-4 sm:py-5">
                                <ServiceBadge />
                                <h2 className="display-font mt-2 break-words text-lg leading-tight">{service.name}</h2>
                                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">{service.description ?? ""}</p>
                                <button
                                    type="button"
                                    onClick={() => setOpen(service)}
                                    className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--copper)] px-4 py-2 text-xs font-bold text-[var(--forest-deep)] transition hover:brightness-105"
                                >
                                    Solicitar servicio →
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {open && <ServiceModal service={open} onClose={() => setOpen(null)} />}
        </>
    );
}

function ServiceModal({ service, onClose }: { service: ServiceItem; onClose: () => void }) {
    const [sent, setSent] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const waMsg = `Hola, me interesa el servicio de "${service.name || ""}". Quiero solicitarlo.`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Servicio: ${service.name}`}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)] sm:p-8">
                <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border hairline bg-[var(--paper)] text-sm font-bold hover:border-[var(--copper)] hover:text-[var(--copper)]" aria-label="Cerrar">✕</button>
                <ServiceBadge />
                <h3 className="display-font mt-2 break-words text-3xl leading-tight">{service.name}</h3>
                {service.description && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--ink-soft)]">{service.description}</p>}

                {sent ? (
                    <p role="status" aria-live="polite" className="mt-6 rounded-lg border border-[var(--forest)] bg-[var(--lime)] px-5 py-4 text-sm font-semibold text-[var(--forest-deep)]">
                        ✓ ¡Gracias! Te contactaremos para coordinar el servicio.
                    </p>
                ) : showForm ? (
                    <div className="mt-6 rounded-xl border hairline bg-[var(--lime)] p-5">
                        <p className="font-semibold">Déjame tus datos para {service.name}</p>
                        <div className="mt-4">
                            <LeadForm
                                onSubmitted={(ok) => {
                                    if (ok) { setSent(true); setShowForm(false); }
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => setShowForm(true)} className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] sm:w-auto">
                            <UserPlusIcon className="h-4 w-4 shrink-0" />
                            <span>Dejar mis datos</span>
                        </button>
                        <a href={whatsappHref(waMsg)} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 sm:w-auto">
                            <WhatsAppIcon className="h-4 w-4 shrink-0" />
                            <span>Contactarme por WhatsApp</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

