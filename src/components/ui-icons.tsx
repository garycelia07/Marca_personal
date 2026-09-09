"use client";

/** Iconos reales (SVG) para botones/acciones — evita usar emoji como iconos. */

export function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
    );
}

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15l-1.2 4.4 4.5-1.2A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.7.7.7-2.6-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1a6.9 6.9 0 0 1-3-2.7c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.1-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.6c-.2 0-.5.1-.7.3-.8.8-1 2-.7 3.3a13 13 0 0 0 4.6 5.2c2.5 1.6 3.7 1.5 4.4 1.3.5-.2 1.2-.8 1.4-1.4.1-.6.1-1-.1-1.1Z" />
        </svg>
    );
}

export function UserPlusIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
    );
}

export function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}
