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
        <SiteShell>
            <div className="flex">
                <AdminSidebar />
                <div className="min-h-[calc(100vh-170px)] w-0 flex-1 px-5 py-10 sm:px-8 lg:px-12">
                    {children}
                </div>
            </div>
        </SiteShell>
    );
}