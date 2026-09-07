import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export function DashboardIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
    );
}

export function UsersIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3.5 19c0-3 2.7-5 5.5-5s5.5 2 5.5 5" />
            <path d="M17 8.5c2.2 0 4 1.5 4 4" />
            <path d="M15.5 19c.2-2.5 1.8-4 3.5-4" />
            <circle cx="18.5" cy="6.5" r="2.5" />
        </svg>
    );
}

export function BookIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <path d="M4 5.5A2 2 0 0 1 6 3.5h11.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H6a2 2 0 0 0-2 2V5.5Z" />
            <path d="M4 18.5A2 2 0 0 1 6 16.5h11.5" />
        </svg>
    );
}

export function AttachmentIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <path d="M21.5 11.5v6a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4h6" />
            <path d="M13.5 6.5 18 2" />
            <path d="M18 7V2h-5" />
        </svg>
    );
}

export function EditIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7.5 18.5 3 20l1.5-4.5L16.5 3.5Z" />
        </svg>
    );
}

export function MailIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

export function ExternalLinkIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <path d="M14 4h6v6" />
            <path d="M20 4 10 14" />
            <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
        </svg>
    );
}

export function ChartIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <path d="M4 20V10" />
            <path d="M10 20V4" />
            <path d="M16 20v-7" />
            <path d="M22 20H2" />
        </svg>
    );
}

export function SearchIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4.5-4.5" />
        </svg>
    );
}

export function UsersGroupIcon(props: IconProps) {
    return (
        <svg aria-hidden="true" {...baseProps} {...props}>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
            <path d="M16 5.5a3.5 3.5 0 0 1 0 7" />
            <path d="M22 19.5c0-2.5-1.8-4.2-4.5-4.8" />
        </svg>
    );
}
