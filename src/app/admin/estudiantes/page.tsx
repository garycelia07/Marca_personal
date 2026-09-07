import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { StudentsManager } from "@/components/admin/students-manager";

export default async function AdminStudentsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/iniciar-sesion");
    }

    if (user.role !== "ADMIN") {
        redirect("/estudiante");
    }

    void user;

    return (
        <section>
            <header className="mb-8 border-b hairline pb-6">
                <p className="eyebrow">Panel de administración</p>
                <h1 className="display-font mt-4 text-4xl leading-none sm:text-5xl">Estudiantes.</h1>
                <p className="mt-4 text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
                    Crea, edita, elimina y gestiona la vigencia de acceso de los estudiantes de Áurea.
                </p>
            </header>
            <StudentsManager />
        </section>
    );
}