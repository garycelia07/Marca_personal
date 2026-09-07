import type { Student } from "@/lib/api/students";

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function isExpired(student: Student): boolean {
    if (!student.accessExpiresAt) return false;
    return new Date(student.accessExpiresAt).getTime() < Date.now();
}

/** Construye una lista de páginas para la paginación con elipsis. */
export function buildPageList(page: number, totalPages: number): (number | "…")[] {
    const pages: (number | "…")[] = [];
    for (let index = 1; index <= totalPages; index += 1) {
        if (index === 1 || index === totalPages || Math.abs(index - page) <= 1) {
            pages.push(index);
        } else if (pages[pages.length - 1] !== "…") {
            pages.push("…");
        }
    }
    return pages;
}