"use client";

import { whatsappHref } from "@/lib/site";

export function WhatsAppLeadButton() {
    return (
        <a
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer"
            aria-label="Escribir por WhatsApp"
            title="Escribir por WhatsApp"
            className="whatsapp-float group fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center transition hover:scale-110 sm:bottom-8 sm:right-8"
        >
            <span className="whatsapp-float-ring" aria-hidden="true" />
            <span className="whatsapp-float-hand" aria-hidden="true">☝</span>
            {/* Glifo oficial de WhatsApp en verde, sin fondo */}
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="whatsapp-float-icon h-12 w-12 drop-shadow-lg"
            >
                <path
                    fill="#25D366"
                    d="M19.1 4.9A9.9 9.9 0 0 0 12 2a10 10 0 0 0-8.7 15l-1.1 4 4.1-1.1A10 10 0 0 0 12 22h.1a10 10 0 0 0 7-17.1ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.7.7-2.3-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.3.2-.3.6-1.1.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.3-.5-.3h-.5c-.2 0-.5.1-.7.3-.7.7-.9 1.6-.2 2.6 1.2 2.4 3.1 4.2 5.6 5.1.9.3 1.6.2 2.2-.1.6-.3.9-.8 1-1.2.1-.2.1-.4-.1-.5Z"
                />
            </svg>
        </a>
    );
}
