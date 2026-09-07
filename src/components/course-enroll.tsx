"use client";

import { useState } from "react";
import { LeadForm } from "@/components/lead-form";

export function EnrollCourseButton({ courseTitle }: { courseTitle: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[var(--copper)] px-6 py-3 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-105"
            >
                Quiero inscribirme a este curso
            </button>

            {open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Inscripción al curso">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6 sm:p-8">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border hairline text-sm font-bold hover:border-[var(--copper)] hover:text-[var(--copper)]"
                            aria-label="Cerrar"
                        >✕</button>
                        <p className="eyebrow">Inscripción / {courseTitle}</p>
                        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                            Deja tus datos. Alguien del equipo te contactará para confirmar la inscripción.
                        </p>
                        <div className="mt-5">
                            <LeadForm courseName={courseTitle} submitLabel="Solicitar inscripción" onSubmitted={() => undefined} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
