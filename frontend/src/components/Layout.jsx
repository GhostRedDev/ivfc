import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Users,
    Shirt,
    Trophy,
    Banknote,
    FileText,
    Settings,
    LogOut,
    LayoutDashboard,
    UserCog,
    Activity,
    Shield
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-emerald text-white shadow-md shadow-emerald/20"
                : "text-pale-slate hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const Layout = () => {
    const { logout, user } = useAuth();

    return (
        <div className="flex min-h-screen bg-alice-blue">
            {/* Sidebar */}
            <aside className="w-64 bg-charcoal text-white shadow-xl flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald to-pale-slate bg-clip-text text-transparent">
                        Club Valencia
                    </h1>
                    <p className="text-xs text-lilac-ash mt-1">Panel Administrativo</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
                    <SidebarItem icon={Users} label="Jugadores" to="/jugadores" />
                    <SidebarItem icon={Trophy} label="Categorías" to="/categorias" />
                    <SidebarItem icon={Shield} label="Equipos" to="/equipos" />
                    <SidebarItem icon={UserCog} label="Entrenamientos" to="/entrenamientos" />
                    <SidebarItem icon={Users} label="Personal" to="/personal" /> {/* Reused icon or find better */}
                    <SidebarItem icon={Trophy} label="Campeonatos" to="/campeonatos" />

                    <SidebarItem icon={Shirt} label="Uniformes" to="/uniformes" />
                    <SidebarItem icon={Banknote} label="Pagos" to="/pagos" />
                    <SidebarItem icon={FileText} label="Documentación" to="/documentacion" />

                    {user?.role === 'admin' && (
                        <SidebarItem icon={Settings} label="Configuración" to="/configuracion" />
                    )}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
