import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { Trash2 } from "lucide-react";

const CategoriasPage = () => {
    const { token } = useAuth();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        nombre: "",
        tipo: "anual",
        anio_inicio: new Date().getFullYear(),
        anio_fin: new Date().getFullYear()
    });

    // State for Manage Modal
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [eligiblePlayers, setEligiblePlayers] = useState([]);
    const [teamStaff, setTeamStaff] = useState([]); // All staff to pick from
    const [categoryDetails, setCategoryDetails] = useState({ players: [], staff: [] });

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/categorias", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setCategorias(data);
        } catch (error) {
            console.error("Error fetching categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/categorias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                setIsCreateOpen(false);
                fetchCategorias();
                setNewItem({ nombre: "", tipo: "anual", anio_inicio: new Date().getFullYear(), anio_fin: new Date().getFullYear() });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [categoryTeams, setCategoryTeams] = useState([]);

    const openManageModal = async (cat) => {
        setSelectedCategory(cat);
        // Fetch details
        const res = await fetch(`http://localhost:8000/api/categorias/${cat.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const details = await res.json();
        setCategoryDetails(details);

        // Fetch eligible players
        const resPlayers = await fetch(`http://localhost:8000/api/categorias/${cat.id}/players`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (resPlayers.ok) {
            const eligible = await resPlayers.json();
            setEligiblePlayers(Array.isArray(eligible) ? eligible : []);
        } else {
            setEligiblePlayers([]);
        }

        // Fetch Teams
        fetchTeamsForCategory(cat.id);

        // Fetch all staff (if not already fetched globally or context) - simplified here
        const resStaff = await fetch(`http://localhost:8000/api/personal`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTeamStaff(await resStaff.json());
    };

    const fetchTeamsForCategory = async (catId) => {
        const res = await fetch(`http://localhost:8000/api/categorias/${catId}/equipos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setCategoryTeams(await res.json());
    }

    const deleteTeam = async (id) => {
        if (!confirm("¿Eliminar equipo?")) return;
        await fetch(`http://localhost:8000/api/equipos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchTeamsForCategory(selectedCategory.id);
    }

    // Missing: Endpoint to assign player to team directly without removing from category?
    // Actually, update player's team via pivot update?
    // We don't have a direct endpoint for updating team in pivot yet in CategoriaController.
    // I need to add one or use a general update.
    // Let's implement assignPlayerToTeam in frontend assuming a new endpoint or update logic.
    // Actually, let's add `updatePlayerTeam` to CategoriaController or similar.
    // For now, I'll stub it out and then implement the backend support.

    const assignPlayerToTeam = async (playerId, teamId) => {
        // We'll use a new endpoint: POST /api/categorias/{id}/assign-player-team
        // Body: { jugador_id, equipo_id }
        // If teamId is "null", pass null.

        await fetch(`http://localhost:8000/api/categorias/${selectedCategory.id}/assign-player-team`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                jugador_id: playerId,
                equipo_id: teamId === "null" ? null : teamId
            })
        });
        // Refresh player list to show new team? We need to re-fetch details.
        // Actually details needs to include team_id.
        // openManageModal(selectedCategory); // This re-fetches everything
    }

    const handleAssignPlayer = async (jugadorId) => {
        await fetch(`http://localhost:8000/api/categorias/${selectedCategory.id}/assign-player`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ jugador_id: jugadorId })
        });
        // Refresh details
        openManageModal(selectedCategory);
    };

    const handleRemovePlayer = async (jugadorId) => {
        await fetch(`http://localhost:8000/api/categorias/${selectedCategory.id}/remove-player`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ jugador_id: jugadorId })
        });
        openManageModal(selectedCategory);
    };

    // Render helpers
    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>Nueva Categoría</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Categoría</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Nombre</Label>
                                <Input
                                    value={newItem.nombre}
                                    onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Ej. Sub 15"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Tipo</Label>
                                <Select
                                    value={newItem.tipo}
                                    onValueChange={(v) => setNewItem({ ...newItem, tipo: v })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="anual">Anual</SelectItem>
                                        <SelectItem value="bianual">Bianual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Año Inicio</Label>
                                <Input
                                    type="number"
                                    value={newItem.anio_inicio}
                                    onChange={(e) => setNewItem({ ...newItem, anio_inicio: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            {newItem.tipo === 'bianual' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Año Fin</Label>
                                    <Input
                                        type="number"
                                        value={newItem.anio_fin}
                                        onChange={(e) => setNewItem({ ...newItem, anio_fin: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                            )}
                        </div>
                        <Button onClick={handleCreate}>Guardar</Button>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorias.map(cat => (
                    <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {cat.nombre}
                            </CardTitle>
                            <Badge variant={cat.activo ? "default" : "secondary"}>
                                {cat.activo ? "Activa" : "Inactiva"}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cat.anio_inicio} {cat.tipo === 'bianual' && `- ${cat.anio_fin}`}</div>
                            <p className="text-xs text-muted-foreground capitalize">
                                {cat.tipo}
                            </p>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => openManageModal(cat)}
                            >
                                Gestionar Equipo
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Manage Modal */}
            <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Gestionar {selectedCategory?.nombre}</DialogTitle>
                    </DialogHeader>



                    <Tabs defaultValue="players" className="w-full">
                        <TabsList>
                            <TabsTrigger value="players">Jugadores</TabsTrigger>
                            <TabsTrigger value="equipos">Equipos / Sub-niveles</TabsTrigger>
                            <TabsTrigger value="staff">Cuerpo Técnico</TabsTrigger>
                        </TabsList>

                        <TabsContent value="equipos" className="space-y-4">
                            <div className="flex gap-2 items-center p-4 bg-blue-50 rounded-lg">
                                <Label className="whitespace-nowrap">Nuevo Equipo:</Label>
                                <Input
                                    placeholder="Nombre del Equipo (ej. Azul)"
                                    id="new-team-name"
                                />
                                <Button onClick={async () => {
                                    const input = document.getElementById('new-team-name');
                                    if (!input.value) return;
                                    await fetch("http://localhost:8000/api/equipos", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ nombre: input.value, categoria_id: selectedCategory.id })
                                    });
                                    input.value = "";
                                    // Refresh teams list logic would go here, need state for teams
                                    fetchTeamsForCategory(selectedCategory.id);
                                }}>
                                    Crear
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryTeams.map(team => (
                                    <Card key={team.id} className="bg-slate-50">
                                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                                            <span className="font-bold">{team.nombre}</span>
                                            <Button variant="ghost" size="sm" onClick={() => deleteTeam(team.id)} className="text-red-500 h-8 w-8 p-0">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm text-gray-500">
                                            {/* Future: List players in this team */}
                                            <p>Asignar jugadores a este equipo (Próximamente)</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {categoryTeams.length === 0 && (
                                    <p className="col-span-2 text-center text-gray-500 py-4">No hay equipos creados en esta categoría.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="players" className="space-y-4">
                            <div className="flex gap-2 items-center p-4 bg-gray-50 rounded-lg">
                                <Label>Asignar Jugador:</Label>
                                <Select onValueChange={(val) => handleAssignPlayer(val)}>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Seleccionar jugador elegible..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eligiblePlayers.length === 0 ? (
                                            <SelectItem value="none" disabled>No han jugadores elegibles</SelectItem>
                                        ) : (
                                            eligiblePlayers.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.nombre} {p.apellido} ({p.cedula})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border rounded-md">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Cédula</th>
                                            <th className="px-4 py-2">Equipo</th>
                                            <th className="px-4 py-2">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(categoryDetails.players) && categoryDetails.players.map(p => (
                                            <tr key={p.id} className="border-t">
                                                <td className="px-4 py-2">{p.nombre} {p.apellido}</td>
                                                <td className="px-4 py-2">{p.cedula}</td>
                                                <td className="px-4 py-2">
                                                    {/* Simplified Team Assignment Dropdown per player */}
                                                    <Select defaultValue={p.equipo_id?.toString()} onValueChange={(v) => assignPlayerToTeam(p.id, v)}>
                                                        <SelectTrigger className="h-8 w-[130px]">
                                                            <SelectValue placeholder="Sin Equipo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="null">Sin Equipo</SelectItem>
                                                            {categoryTeams.map(t => (
                                                                <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Button variant="destructive" size="sm" onClick={() => handleRemovePlayer(p.id)}>
                                                        Quitar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!categoryDetails.players || categoryDetails.players.length === 0) && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                    No hay jugadores asignados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        <TabsContent value="staff">
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                                Funcionalidad de asignación de Staff similar a jugadores (Pendiente de implementar UI final).
                            </div>
                        </TabsContent>
                    </Tabs>

                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoriasPage;
