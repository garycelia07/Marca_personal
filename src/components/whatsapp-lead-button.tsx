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
            <span className="whatsapp-float-hand" aria-hidden="true">
                <svg viewBox="0 0 64 64" role="img" focusable="false" className="h-12 w-12">
                    <path
                        fill="#ffd6a6"
                        d="M30.4 6.8c-2.4 0-4.3 1.9-4.3 4.3v25.2l-3.5-4.2a4.5 4.5 0 0 0-6.7-.3 4.7 4.7 0 0 0-.4 6.1l10.6 14.4a12.2 12.2 0 0 0 9.8 5h6.5c6.5 0 11.8-5.3 11.8-11.8V29.1a4.1 4.1 0 0 0-7.2-2.7 4.1 4.1 0 0 0-7-2.2 4.1 4.1 0 0 0-6.9-2V11.1c0-2.4-1.9-4.3-4.3-4.3Z"
                    />
                    <path
                        fill="none"
                        stroke="#9b6029"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M30.4 6.8c-2.4 0-4.3 1.9-4.3 4.3v25.2l-3.5-4.2a4.5 4.5 0 0 0-6.7-.3 4.7 4.7 0 0 0-.4 6.1l10.6 14.4a12.2 12.2 0 0 0 9.8 5h6.5c6.5 0 11.8-5.3 11.8-11.8V29.1a4.1 4.1 0 0 0-7.2-2.7 4.1 4.1 0 0 0-7-2.2 4.1 4.1 0 0 0-6.9-2V11.1c0-2.4-1.9-4.3-4.3-4.3Z"
                    />
                    <path
                        fill="none"
                        stroke="#9b6029"
                        strokeLinecap="round"
                        strokeWidth="3"
                        d="M33.1 22.4v14.7M40.1 24.2v12.9M47.1 26.5v10.6"
                    />
                    <path
                        fill="#ffffff"
                        d="M23.2 57.2h28.5v5H23.2z"
                    />
                </svg>
            </span>
            {/* Glifo oficial de WhatsApp en verde, sin fondo */}
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="whatsapp-float-icon h-[3.35rem] w-[3.35rem] drop-shadow-lg"
            >
                <path
                    fill="#25D366"
                    d="M19.1 4.9A9.9 9.9 0 0 0 12 2a10 10 0 0 0-8.7 15l-1.1 4 4.1-1.1A10 10 0 0 0 12 22h.1a10 10 0 0 0 7-17.1ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.7.7-2.3-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.3.2-.3.6-1.1.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.3-.5-.3h-.5c-.2 0-.5.1-.7.3-.7.7-.9 1.6-.2 2.6 1.2 2.4 3.1 4.2 5.6 5.1.9.3 1.6.2 2.2-.1.6-.3.9-.8 1-1.2.1-.2.1-.4-.1-.5Z"
                />
            </svg>
        </a>
    );
}
