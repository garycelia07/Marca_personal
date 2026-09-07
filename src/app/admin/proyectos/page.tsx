import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { ProjectsAdmin } from "@/components/admin/projects-admin";

export default async function AdminProjectsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "ADMIN") {
        redirect("/estudiante");
    }

    return (
        <section>
            <header className="mb-8 border-b hairline pb-6">
                <p className="eyebrow">Panel de administración</p>
                <h1 className="display-font mt-4 text-4xl leading-none sm:text-5xl">Proyectos.</h1>
                <p className="mt-4 text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
                    Cada proyecto tiene portada, video corto público y un enlace «Quiero unirme».
                </p>
            </header>
            <ProjectsAdmin />
        </section>
    );
}