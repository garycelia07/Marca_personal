import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { CourseDetail } from "@/components/admin/course-detail";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "ADMIN") {
        redirect("/estudiante");
    }

    void user;

    return <CourseDetail courseId={id} />;
}