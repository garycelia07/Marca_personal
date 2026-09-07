"use client";

import { useState } from "react";
import { createLead, type ApiError } from "@/lib/api/leads";

function errorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "message" in error) {
        return String((error as ApiError).message);
    }
    return fallback;
}

export function LeadForm({ courseName, submitLabel, onSubmitted }: { courseName?: string; submitLabel?: string; onSubmitted?: (ok: boolean) => void }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState<{ variant: "success" | "error"; message: string } | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (sending) return;
        if (!name.trim() && !email.trim() && !phone.trim()) {
            setFeedback({ variant: "error", message: "Incluye al menos tu nombre, correo o teléfono." });
            return;
        }
        setSending(true);
        setFeedback(null);
        const full = courseName ? `Quiero inscribirme al curso: ${courseName}.` + (message ? `\n${message}` : "") : message;
        try {
            await createLead({ name, email, phone, message: full, channel: "CONTACT_FORM" });
            setFeedback({ variant: "success", message: "¡Listo! Te contactaremos para coordinar la inscripción." });
            setName(""); setEmail(""); setPhone(""); setMessage("");
            onSubmitted?.(true);
        } catch (error) {
            setFeedback({ variant: "error", message: errorMessage(error, "No fue posible enviar tu mensaje.") });
        } finally {
            setSending(false);
        }
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Nombre</span>
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]" placeholder="María Gómez" />
                </label>
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Correo</span>
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]" placeholder="maria@correo.com" />
                </label>
            </div>
            <label className="block">
                <span className="mb-2 block text-sm font-semibold">Teléfono / WhatsApp</span>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className="w-full border-b border-[var(--forest)] bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]" placeholder="+51 987 654 321" />
            </label>
            <label className="block">
                <span className="mb-2 block text-sm font-semibold">Mensaje</span>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="w-full resize-none rounded-md border hairline bg-transparent px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--copper)]" placeholder="Quisiera información sobre la próxima capacitación." />
            </label>

            {feedback && (
                <p role="status" aria-live="polite" className={`rounded-md border px-4 py-3 text-sm leading-6 ${feedback.variant === "success" ? "border-[var(--forest)] bg-[var(--lime)] text-[var(--forest-deep)]" : "border-[var(--danger)] bg-[var(--lime)] text-[var(--danger)]"}`}>
                    {feedback.variant === "success" ? "✓ " : "⚠ "}{feedback.message}
                </p>
            )}

            <div className="flex justify-center">
                <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-7 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">
                    {sending && (
                        <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent"
                            aria-hidden="true"
                        />
                    )}

                    {sending ? "Enviando…" : "Enviar mensaje"}
                </button>
            </div>
        </form>
    );
}