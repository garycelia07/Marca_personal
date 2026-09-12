import { SiteShell } from "@/components/site-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * Layout compartido para el panel de administración.
 * Provee la navegación lateral (sidebar) y el marco público (header + footer).
 * Se renderiza bajo demanda: las páginas leen la cookie de sesión vía cookies().
 */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SiteShell hideHeader>
            <div className="flex flex-col lg:flex-row">
                <AdminSidebar />
                <div className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
                    {children}
                </div>
            </div>
        </SiteShell>
    );
}