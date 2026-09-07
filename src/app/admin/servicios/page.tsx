import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { ServicesAdmin } from "@/components/admin/services-admin";

export default async function AdminServiciosPage() {
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
                <h1 className="display-font mt-4 text-4xl leading-none sm:text-5xl">Servicios.</h1>
                <p className="mt-4 text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
                    Crea y edita servicios: nombre, descripción y portada subida desde aquí.
                </p>
            </header>
            <ServicesAdmin />
        </section>
    );
}