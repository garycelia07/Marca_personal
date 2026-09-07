"use client";

import { SocialIcon } from "@/components/footer";
import { whatsappHref } from "@/lib/site";

/**
 * Botón flotante de WhatsApp que además registra el contacto como lead
 * (channel: WHATSAPP) antes de abrir la conversación en el número configurado.
 */
export function WhatsAppLeadButton() {
    function handleClick() {
        // Fire-and-forget: no bloquea la navegación a WhatsApp.
        void fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel: "WHATSAPP", message: "Contacto desde el botón de WhatsApp" }),
            keepalive: true,
        }).catch(() => null);
    }

    return (
        <a
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer"
            onClick={handleClick}
            aria-label="Escribir por WhatsApp"
            title="Escribir por WhatsApp"
            className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-xs font-bold text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1da851] sm:bottom-8 sm:right-8"
        >
            <SocialIcon name="whatsapp" />
        </a>
    );
}