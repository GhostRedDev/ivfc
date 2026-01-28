import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, Plus, FileEdit, Trash2, Calendar, MapPin, Users } from "lucide-react"

export default function EntrenamientosPage() {
    const { token } = useAuth()
    const [entrenamientos, setEntrenamientos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [equipos, setEquipos] = useState([]) // All teams or filtered? 
    // Ideally we fetch teams per category selected in form, but fetching all for now or fetching on demand

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentId, setCurrentId] = useState(null)

    const initialFormState = {
        categoria_id: "",
        equipo_id: "null", // String "null" for Select handling
        fecha: new Date().toISOString().split('T')[0],
        hora: "16:00",
        lugar: "Cancha Principal",
        tema: "",
        observaciones: "",
        estado: "programado"
    }
    const [formData, setFormData] = useState(initialFormState)
    const [formTeams, setFormTeams] = useState([]) // Teams available for selected category

    useEffect(() => {
        fetchEntrenamientos()
        fetchCategorias()
    }, [])

    const fetchEntrenamientos = async () => {
        const res = await fetch("http://localhost:8000/api/entrenamientos", {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) setEntrenamientos(await res.json())
    }

    const fetchCategorias = async () => {
        const res = await fetch("http://localhost:8000/api/categorias", {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) setCategorias(await res.json())
    }

    // When category changes in form, fetch teams
    const handleCategoryChange = async (catId) => {
        setFormData(prev => ({ ...prev, categoria_id: catId, equipo_id: "null" }))
        // Fetch teams
        const res = await fetch(`http://localhost:8000/api/categorias/${catId}/equipos`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) setFormTeams(await res.json())
        else setFormTeams([])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = isEditMode
            ? `http://localhost:8000/api/entrenamientos/${currentId}`
            : "http://localhost:8000/api/entrenamientos"

        const method = isEditMode ? "PUT" : "POST"

        const payload = {
            ...formData,
            equipo_id: formData.equipo_id === "null" ? null : formData.equipo_id
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setIsModalOpen(false)
                fetchEntrenamientos()
                setFormData(initialFormState)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const openEdit = async (entrenamiento) => {
        setIsEditMode(true)
        setCurrentId(entrenamiento.id)

        // Populate form
        // Need to fetch teams for the category first or ensure state is ready
        if (entrenamiento.categoria_id) {
            const res = await fetch(`http://localhost:8000/api/categorias/${entrenamiento.categoria_id}/equipos`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) setFormTeams(await res.json())
        }

        setFormData({
            categoria_id: entrenamiento.categoria_id,
            equipo_id: entrenamiento.equipo_id ? entrenamiento.equipo_id.toString() : "null",
            fecha: entrenamiento.fecha,
            hora: entrenamiento.hora,
            lugar: entrenamiento.lugar,
            tema: entrenamiento.tema,
            observaciones: entrenamiento.observaciones,
            estado: entrenamiento.estado
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro de eliminar este entrenamiento?")) return
        await fetch(`http://localhost:8000/api/entrenamientos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        fetchEntrenamientos()
    }

    const openCreate = () => {
        setFormData(initialFormState)
        setIsEditMode(false)
        setFormTeams([])
        setCurrentId(null)
        setIsModalOpen(true)
    }

    return (
        <div className="p-8 space-y-8 bg-alice-blue min-h-screen">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-charcoal flex items-center gap-2">
                    <Activity className="text-emerald" /> Gestión de Entrenamientos
                </h1>
                <Button onClick={openCreate} className="bg-emerald text-white hover:bg-emerald/90">
                    <Plus className="mr-2 h-4 w-4" /> Programar Nuevo
                </Button>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Editar Entrenamiento" : "Programar Entrenamiento"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select value={formData.categoria_id.toString()} onValueChange={handleCategoryChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Equipo (Opcional)</Label>
                                <Select
                                    value={formData.equipo_id?.toString() || "null"}
                                    onValueChange={(v) => setFormData({ ...formData, equipo_id: v })}
                                    disabled={!formData.categoria_id || formTeams.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formTeams.length === 0 && formData.categoria_id ? "Sin equipos definidos" : "Toda la categoría"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Toda la categoría</SelectItem>
                                        {formTeams.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Hora</Label>
                                <Input type="time" value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Lugar</Label>
                            <Input value={formData.lugar} onChange={e => setFormData({ ...formData, lugar: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Tema / Objetivo</Label>
                            <Input value={formData.tema} onChange={e => setFormData({ ...formData, tema: e.target.value })} placeholder="Ej. Resistencia Aeróbica" />
                        </div>

                        <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
                        </div>

                        {isEditMode && (
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="programado">Programado</SelectItem>
                                        <SelectItem value="realizado">Realizado</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90">
                                {isEditMode ? "Actualizar Sesión" : "Guardar Sesión"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Sesiones Programadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha / Hora</TableHead>
                                <TableHead>Categoría / Equipo</TableHead>
                                <TableHead>Tema</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entrenamientos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">No hay entrenamientos registrados</TableCell>
                                </TableRow>
                            ) : (
                                entrenamientos.map(ent => (
                                    <TableRow key={ent.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald" /> {ent.fecha}</span>
                                                <span className="text-xs text-muted-foreground">{ent.hora} hrs</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Badge variant="outline" className="w-fit mb-1 bg-blue-50 text-blue-700 border-blue-200">
                                                    {ent.categoria_nombre}
                                                </Badge>
                                                {ent.equipo_nombre ? (
                                                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> Equipo {ent.equipo_nombre}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Toda la categoría</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-charcoal">{ent.tema || "Entrenamiento General"}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {ent.lugar}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`
                                                ${ent.estado === 'programado' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                ${ent.estado === 'realizado' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                                                ${ent.estado === 'cancelado' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                                            `}>
                                                {ent.estado.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(ent)}>
                                                    <FileEdit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(ent.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
