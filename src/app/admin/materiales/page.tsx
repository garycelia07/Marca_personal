import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { MaterialsManager } from "@/components/admin/materials-manager";

export default async function AdminMaterialsPage() {
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
                <h1 className="display-font mt-4 text-4xl leading-none sm:text-5xl">Materiales.</h1>
                <p className="mt-4 text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
                    Sube, reemplaza y organiza los PDFs e imágenes de la plataforma y de la landing page.
                </p>
            </header>
            <MaterialsManager />
        </section>
    );
}