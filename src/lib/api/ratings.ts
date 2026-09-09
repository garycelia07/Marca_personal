export type RatingItem = {
    id: string;
    fullName?: string;
    stars: number;
    comment?: string | null;
    createdAt?: string;
};

export type RatingSummary = {
    ratings: RatingItem[];
    average: number;
    total: number;
};

export type CreateRatingInput = {
    stars: number;
    comment?: string;
};

const BASE = "/api/courses";

export async function getCourseRatings(courseId: string): Promise<RatingSummary> {
    const res = await fetch(`${BASE}/${encodeURIComponent(courseId)}/ratings`, { cache: "no-store" });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
        throw Object.assign(new Error((payload && payload.message) || "No se pudieron cargar las calificaciones."), { status: res.status });
    }
    return payload as RatingSummary;
}

export async function submitCourseRating(courseId: string, input: CreateRatingInput): Promise<unknown> {
    const res = await fetch(`${BASE}/${encodeURIComponent(courseId)}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
        throw Object.assign(new Error((payload && payload.message) || "No se pudo guardar la calificación."), { status: res.status });
    }
    return payload;
}
