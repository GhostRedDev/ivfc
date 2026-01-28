import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, UserCog, Wallet, PlusCircle, UserPlus, Banknote, Shield, CalendarClock, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuth();
    const { token } = useAuth()
    const [stats, setStats] = useState({
        players: 0,
        categories: 0,
        teams: 0,
        trainings: 0,
        nextTraining: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [resPlayers, resCats, resTeams, resTrainings] = await Promise.all([
                    fetch("http://localhost:8000/api/jugadores", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://localhost:8000/api/categorias", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://localhost:8000/api/equipos", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("http://localhost:8000/api/entrenamientos", { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const players = await resPlayers.json();
                const cats = await resCats.json();
                const teams = await resTeams.json();
                const trainings = await resTrainings.json();

                // Find next training
                const upcoming = Array.isArray(trainings)
                    ? trainings.filter(t => new Date(t.fecha + ' ' + t.hora) > new Date()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0]
                    : null;

                setStats({
                    players: Array.isArray(players) ? players.length : 0,
                    categories: Array.isArray(cats) ? cats.length : 0,
                    teams: Array.isArray(teams) ? teams.length : 0,
                    trainings: Array.isArray(trainings) ? trainings.length : 0,
                    nextTraining: upcoming
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const StatCard = ({ title, count, subtitle, icon: Icon, colorClass, bgClass }) => (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative bg-white">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                <Icon size={64} />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                <div>
                    <p className="text-sm font-medium text-lilac-ash">{title}</p>
                    <h3 className="text-3xl font-bold text-charcoal mt-2">{loading ? "-" : count}</h3>
                </div>
                {subtitle && <p className="text-xs text-pale-slate mt-2">{subtitle}</p>}
                <div className={`mt-4 p-3 rounded-lg w-fit ${bgClass} ${colorClass}`}>
                    <Icon size={20} />
                </div>
            </CardContent>
        </Card>
    );

    const ActionButton = ({ title, icon: Icon, to, gradient }) => (
        <Link to={to} className="block group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
            <div className="relative p-6 flex flex-col items-center justify-center space-y-3 h-32">
                <div className="p-3 rounded-full bg-white/20 text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                </div>
                <span className="font-semibold text-white text-md tracking-wide">{title}</span>
            </div>
        </Link>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal tracking-tight">Dashboard Principal</h1>
                    <p className="text-lilac-ash">Club Internacional Valencia F.C. - Panel de Control</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-lilac-ash bg-white px-4 py-2 rounded-full shadow-sm border border-pale-slate/20">
                    <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
                    Sistema Operativo v1.0
                </div>
            </div>

            {/* Welcome Banner - Brand Colors */}
            <div className="relative overflow-hidden rounded-2xl bg-charcoal text-white shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield className="w-64 h-64 text-white transform translate-x-12 -translate-y-12 rotate-12" />
                </div>

                <div className="relative p-8 md:p-10 z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald border border-emerald/30">
                            <span>👋 Hola de nuevo</span>
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-white">
                            ¡Bienvenido, {user?.username || 'Admin'}!
                        </h2>
                        <p className="text-pale-slate text-lg leading-relaxed">
                            Aquí tienes el resumen de tu academia hoy. Hay <span className="text-emerald font-bold">{stats.players} jugadores</span> activos y <span className="text-emerald font-bold">{stats.teams} equipos</span> formados.
                        </p>
                        <div className="pt-4 flex gap-3">
                            <Button className="bg-emerald hover:bg-emerald/90 text-white border-none shadow-lg shadow-emerald/20">
                                <UserPlus className="mr-2 h-4 w-4" /> Registrar Jugador
                            </Button>
                            <Button variant="outline" className="bg-transparent border-pale-slate text-pale-slate hover:bg-white/10 hover:text-white hover:border-white">
                                Ver Reportes
                            </Button>
                        </div>
                    </div>

                    {/* Mini Next Training Card */}
                    {stats.nextTraining && (
                        <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 min-w-[280px] shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald rounded-lg text-white">
                                    <CalendarClock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-pale-slate uppercase font-bold">Próximo Entrenamiento</p>
                                    <p className="text-sm font-semibold text-white">{stats.nextTraining.fecha}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-white">{stats.nextTraining.hora}</p>
                                <p className="text-sm text-pale-slate">{stats.nextTraining.tema || "Entrenamiento General"}</p>
                                <div className="mt-2 text-xs text-emerald flex items-center gap-1">
                                    <ArrowRight size={12} />
                                    <span>{stats.nextTraining.lugar || "Cancha Principal"}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid - Using Brand Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Jugadores Activos"
                    count={stats.players}
                    subtitle="Registrados en el sistema"
                    icon={Users}
                    colorClass="text-emerald"
                    bgClass="bg-emerald/10"
                />
                <StatCard
                    title="Equipos"
                    count={stats.teams}
                    subtitle="Escuadras formadas"
                    icon={Shield}
                    colorClass="text-charcoal"
                    bgClass="bg-charcoal/10"
                />
                <StatCard
                    title="Categorías"
                    count={stats.categories}
                    subtitle="Grupos de edad"
                    icon={Trophy}
                    colorClass="text-charcoal"
                    bgClass="bg-pale-slate/20"
                />
                <StatCard
                    title="Entrenamientos"
                    count={stats.trainings}
                    subtitle="Sesiones programadas"
                    icon={CalendarClock}
                    colorClass="text-emerald"
                    bgClass="bg-emerald/10"
                />
            </div>

            {/* Quick Actions & Secondary Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
                        <PlusCircle className="text-lilac-ash" size={20} />
                        Acciones Rápidas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ActionButton
                            title="Registrar Jugador"
                            icon={UserPlus}
                            to="/jugadores"
                            gradient="from-emerald to-emerald/80"
                        />
                        <ActionButton
                            title="Gestión de Equipos"
                            icon={Shield}
                            to="/equipos"
                            gradient="from-charcoal to-gray-800"
                        />
                        <ActionButton
                            title="Programar Entreno"
                            icon={CalendarClock}
                            to="/entrenamientos"
                            gradient="from-emerald to-teal-600"
                        />
                        <ActionButton
                            title="Registrar Pago"
                            icon={Banknote}
                            to="/pagos"
                            gradient="from-charcoal to-slate-700"
                        />
                    </div>
                </div>

                {/* Right: Summary List/Links */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-charcoal">Accesos Directos</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-pale-slate/20 divide-y divide-pale-slate/10">
                        <Link to="/entrenamientos" className="flex items-center justify-between p-4 hover:bg-alice-blue transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald/10 p-2 rounded-lg text-emerald">
                                    <CalendarClock size={18} />
                                </div>
                                <span className="font-medium text-charcoal">Explorar Entrenamientos</span>
                            </div>
                            <ArrowRight size={16} className="text-lilac-ash" />
                        </Link>
                        <Link to="/uniformes" className="flex items-center justify-between p-4 hover:bg-alice-blue transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-charcoal/10 p-2 rounded-lg text-charcoal">
                                    <Shield size={18} />
                                </div>
                                <span className="font-medium text-charcoal">Diseñador de Uniformes</span>
                            </div>
                            <ArrowRight size={16} className="text-lilac-ash" />
                        </Link>
                        <Link to="/documentacion" className="flex items-center justify-between p-4 hover:bg-alice-blue transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald/10 p-2 rounded-lg text-emerald">
                                    <Banknote size={18} />
                                </div>
                                <span className="font-medium text-charcoal">Control de Documentos</span>
                            </div>
                            <ArrowRight size={16} className="text-lilac-ash" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
