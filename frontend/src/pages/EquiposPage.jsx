import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Trash2, Edit, Shield, Shirt, RefreshCw } from "lucide-react"

export default function EquiposPage() {
    const { token } = useAuth()
    const [teams, setTeams] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [loading, setLoading] = useState(true)

    // Create/Edit Team State
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newTeam, setNewTeam] = useState({ nombre: "", categoria_id: "", entrenador_id: null })

    // Manage Squad State
    const [selectedTeam, setSelectedTeam] = useState(null) // detailed team with players
    const [eligiblePlayers, setEligiblePlayers] = useState([]) // players in category but not in this team (or any team?)
    const [squadLoading, setSquadLoading] = useState(false)

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const [resTeams, resCats] = await Promise.all([
                fetch("http://localhost:8000/api/equipos", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("http://localhost:8000/api/categorias", { headers: { Authorization: `Bearer ${token}` } })
            ])

            const teamsData = await resTeams.json()
            const catsData = await resCats.json()

            setTeams(teamsData)
            setCategories(catsData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTeams = selectedCategory === "all"
        ? teams
        : teams.filter(t => t.categoria_id.toString() === selectedCategory)

    const handleCreateTeam = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/equipos", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(newTeam)
            })
            if (res.ok) {
                const result = await res.json()
                const newId = result.id

                // Upload Logo if present
                const fileInput = document.getElementById("equipo_logo")
                if (fileInput && fileInput.files[0]) {
                    const uploadData = new FormData()
                    uploadData.append('file', fileInput.files[0])

                    await fetch(`http://localhost:8000/api/equipos/${newId}/logo`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: uploadData
                    })
                }

                setIsCreateOpen(false)
                setNewTeam({ nombre: "", categoria_id: "", entrenador_id: null })
                fetchInitialData()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteTeam = async (id) => {
        if (!confirm("are you sure?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/equipos/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) fetchInitialData()
        } catch (error) {
            console.error(error)
        }
    }

    const openManageSquad = async (team) => {
        setSelectedTeam({ ...team, players: [] }) // Optimistic open
        setSquadLoading(true)
        try {
            // 1. Fetch detailed team info (with current players)
            const resTeam = await fetch(`http://localhost:8000/api/equipos/${team.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const teamData = await resTeam.json()

            // 2. Fetch all eligible players in this category
            const resEligible = await fetch(`http://localhost:8000/api/categorias/${team.categoria_id}/players`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const allEligible = await resEligible.json() // This returns players in category not assigned to ANY team (usually) OR all players?
            // Wait, check CategoriaController::getEligiblePlayers
            // It returns players NOT in `categoria_jugador`. 

            // Actually, we need players assigned to the CATEGORY, but maybe not assigned to a TEAM yet?
            // The current `getEligiblePlayers` in Categoria might be for "Players not in Category".

            // We need a specific endpoint: "Players in Category X".
            // Let's rely on standard logic: 
            // We need to fetch ALL players in the Category.
            // Then locally filter which ones are in THIS team vs Others vs None.

            // Let's re-use: `findWithDetails` in Categoria returns `players` array (all in category).
            const resCatDetails = await fetch(`http://localhost:8000/api/categorias/${team.categoria_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const catDetails = await resCatDetails.json()

            // catDetails.players contains all players in the category. 
            // We can split them: 
            // - assigned to this team
            // - assigned to other team
            // - unassigned (equipo_id is null)

            // teamData.players comes from our new endpoint, containing only players in THIS team.

            setSelectedTeam(teamData)
            setEligiblePlayers(catDetails.players || [])

        } catch (error) {
            console.error(error)
        } finally {
            setSquadLoading(false)
        }
    }

    const handleAssignPlayer = async (playerId) => {
        // Assign to THIS team
        try {
            const res = await fetch(`http://localhost:8000/api/categorias/${selectedTeam.categoria_id}/assign-player-team`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    jugador_id: playerId,
                    equipo_id: selectedTeam.id
                })
            })
            if (res.ok) {
                // Refresh data
                openManageSquad(selectedTeam)
                fetchInitialData() // Update counts if needed
            }
        } catch (error) { console.error(error) }
    }

    const handleRemovePlayer = async (playerId) => {
        // Set team to null
        try {
            const res = await fetch(`http://localhost:8000/api/categorias/${selectedTeam.categoria_id}/assign-player-team`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    jugador_id: playerId,
                    equipo_id: null
                })
            })
            if (res.ok) {
                openManageSquad(selectedTeam)
                fetchInitialData()
            }
        } catch (error) { console.error(error) }
    }

    if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-emerald" /></div>

    return (
        <div className="p-8 bg-alice-blue min-h-screen space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal tracking-tight">Equipos</h1>
                    <p className="text-lilac-ash">Gestión de subdivisiones y plantillas por categoría</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald hover:bg-emerald/90 text-white shadow-md transition-all hover:scale-105">
                    <Users className="mr-2 h-4 w-4" /> Nuevo Equipo
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-pale-slate/30 shadow-sm">
                <Shield className="text-lilac-ash" />
                <div className="w-64">
                    <Label className="text-xs text-lilac-ash mb-1 block">Filtrar por Categoría</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="border-pale-slate/50">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams.map(team => (
                    <Card key={team.id} className="hover:shadow-xl transition-all duration-300 border-pale-slate/30 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="mb-1 bg-alice-blue text-charcoal border-pale-slate/50">
                                    {categories.find(c => c.id === team.categoria_id)?.nombre || "Unknown"}
                                </Badge>
                                <CardTitle className="text-xl text-charcoal group-hover:text-emerald transition-colors">{team.nombre}</CardTitle>
                            </div>
                            <div className="h-12 w-12 bg-alice-blue rounded-full flex items-center justify-center text-emerald group-hover:bg-emerald group-hover:text-white transition-all duration-300">
                                {team.logo_url ? (
                                    <img src={`http://localhost:8000${team.logo_url}`} className="h-full w-full object-cover rounded-full" alt={team.nombre} />
                                ) : (
                                    <Shield className="h-6 w-6" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="w-full border-pale-slate/50 hover:bg-alice-blue hover:text-emerald" onClick={() => openManageSquad(team)}>
                                    <Users className="mr-2 h-4 w-4" /> Plantilla
                                </Button>
                                <Button variant="ghost" size="icon" className="text-lilac-ash hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteTeam(team.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Team Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-charcoal">Crear Nuevo Equipo</DialogTitle>
                        <DialogDescription className="text-lilac-ash">Define una subdivisión para una categoría (ej. "Equipo A")</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre del Equipo</Label>
                            <Input
                                placeholder="Ej. Equipo Azul"
                                value={newTeam.nombre}
                                onChange={e => setNewTeam({ ...newTeam, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select
                                value={newTeam.categoria_id}
                                onValueChange={v => setNewTeam({ ...newTeam, categoria_id: v })}
                            >
                                <SelectTrigger><SelectValue placeholder="Seleccionar Categoría" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Escudo / Logo (Opcional)</Label>
                            <Input id="equipo_logo" type="file" accept="image/*" className="cursor-pointer bg-alice-blue" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateTeam} className="bg-emerald text-white hover:bg-emerald/90">Crear Equipo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Squad Modal */}
            <Dialog open={!!selectedTeam} onOpenChange={(o) => !o && setSelectedTeam(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-charcoal flex items-center gap-2">
                            Gestionar Plantilla - <span className="text-emerald">{selectedTeam?.nombre}</span>
                        </DialogTitle>
                        <DialogDescription className="text-lilac-ash">
                            Arrastra o selecciona jugadores para moverlos entre la lista general y el equipo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden min-h-0 pt-4">
                        {/* Available Players (In Category, but not in THIS team) */}
                        <div className="flex flex-col bg-alice-blue rounded-lg p-4 h-full overflow-hidden border border-pale-slate/30">
                            <h3 className="font-semibold text-sm mb-3 text-lilac-ash uppercase flex justify-between">
                                <span>Disponibles en Categoría</span>
                            </h3>
                            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                                {squadLoading ? <div className="text-center py-4 text-lilac-ash">Cargando...</div> :
                                    eligiblePlayers
                                        .filter(p => p.equipo_id !== selectedTeam?.id) // Exclude if already in this team
                                        .map(p => (
                                            <div key={p.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center border border-transparent hover:border-emerald/50 transition-colors group">
                                                <div>
                                                    <p className="font-medium text-sm text-charcoal">{p.nombre} {p.apellido}</p>
                                                    <p className="text-xs text-lilac-ash">
                                                        {p.equipo_id ? `En otro equipo (ID: ${p.equipo_id})` : "Sin equipo"}
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleAssignPlayer(p.id)}>
                                                    <UserPlus className="h-4 w-4 text-lilac-ash group-hover:text-emerald transition-colors" />
                                                </Button>
                                            </div>
                                        ))}
                                {!squadLoading && eligiblePlayers.filter(p => p.equipo_id !== selectedTeam?.id).length === 0 && (
                                    <div className="text-center text-lilac-ash text-sm py-8">No hay jugadores disponibles</div>
                                )}
                            </div>
                        </div>

                        {/* Current Squad (In this team) */}
                        <div className="flex flex-col bg-emerald/5 rounded-lg p-4 h-full overflow-hidden border border-emerald/10">
                            <h3 className="font-semibold text-sm mb-3 text-emerald uppercase flex justify-between">
                                <span>Plantilla Actual</span>
                                <Badge className="bg-emerald text-white hover:bg-emerald">{selectedTeam?.players?.length || 0}</Badge>
                            </h3>
                            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                                {squadLoading ? <div className="text-center py-4 text-lilac-ash">Cargando...</div> :
                                    selectedTeam?.players?.map(p => (
                                        <div key={p.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center border border-emerald/20">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-emerald/10 rounded-full flex items-center justify-center text-xs font-bold text-emerald">
                                                    {p.numero_dorsal || "#"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-charcoal">{p.nombre} {p.apellido}</p>
                                                    <p className="text-xs text-lilac-ash">{p.posicion || "Jugador"}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 text-lilac-ash" onClick={() => handleRemovePlayer(p.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                {!squadLoading && (!selectedTeam?.players || selectedTeam.players.length === 0) && (
                                    <div className="text-center text-emerald/40 text-sm py-8">Arrastra jugadores aquí</div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

