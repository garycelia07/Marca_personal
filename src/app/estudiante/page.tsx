import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { backendFetch } from "@/lib/api/backend";
import type { Enrollment } from "@/lib/api/enrollments";
import type { Material } from "@/lib/api/materials";
import { StudentPlatform, type CatCourse, type StudentUser } from "@/components/student/student-platform";

export const dynamic = "force-dynamic";

export default async function EstudianteDashboard() {
    const user = await getCurrentUser();
    if (!user) redirect("/iniciar-sesion");
    if (user.role !== "STUDENT") redirect("/admin");

    const student: StudentUser = { id: user.id, email: user.email, fullName: user.fullName };

    let enrollment: Enrollment[] = [];
    let cat: CatCourse[] = [];
    try {
        const resp = await backendFetch("/enrollments/me?page=1&limit=100");
        const json = await resp.json().catch(() => null) as { data?: Enrollment[]; items?: Enrollment[] };
        enrollment = Array.isArray((json as { data?: unknown } | null)?.data) ? (json as { data: Enrollment[] }).data : (json?.items ?? []);
    } catch {
        enrollment = [];
    }
    try {
        const resp = await backendFetch("/courses?page=1&limit=100");
        const json = await resp.json().catch(() => null) as { data?: { id: string; title: string; description?: string | null; coverImageUrl?: string | null; modules?: { lessons?: unknown[] }[] }[] };
        cat = (json?.data ?? []).map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description ?? "",
            coverImageUrl: c.coverImageUrl ?? null,
            lessons: (c.modules ?? []).reduce((n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0),
        }));
    } catch {
        cat = [];
    }

    const mineCourseIds = Array.from(new Set(enrollment.map((e) => e.courseId).filter((x): x is string => Boolean(x))));

    const materialsByCourse: Record<string, Material[]> = {};
    await Promise.all(mineCourseIds.map(async (courseId) => {
        try {
            const resp = await backendFetch(`/materials/course/${encodeURIComponent(courseId)}?page=1&limit=100`);
            const json = await resp.json().catch(() => null) as { data?: Material[]; items?: Material[] } | null;
            materialsByCourse[courseId] = Array.isArray(json && (json as { data?: unknown }).data)
                ? (json as { data: Material[] }).data
                : (json?.items ?? []);
        } catch {
            materialsByCourse[courseId] = [];
        }
    }));

    return (
        <StudentPlatform
            user={student}
            myCourseIds={mineCourseIds}
            cat={cat}
            materialsByCourse={materialsByCourse}
        />
    );
}
