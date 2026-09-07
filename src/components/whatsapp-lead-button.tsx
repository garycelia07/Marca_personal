"use client";

import { SocialIcon } from "@/components/footer";
import { whatsappHref } from "@/lib/site";

/**
 * Botón flotante de WhatsApp. Solo abre la conversación en el número configurado.
 * NO registra leads vacíos: los contactos con datos se guardan vía los formularios
 * (Formulario de contacto / "Quiero inscribirme"), que es lo que aparece en /admin/contactos.
 */
export function WhatsAppLeadButton() {
    return (
        <a
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer"
            aria-label="Escribir por WhatsApp"
            title="Escribir por WhatsApp"
            className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-xs font-bold text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1da851] sm:bottom-8 sm:right-8"
        >
            <SocialIcon name="whatsapp" />
        </a>
    );
}