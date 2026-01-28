import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar } from "lucide-react"

export default function CampeonatosPage() {
    const { token } = useAuth()
    const [campeonatos, setCampeonatos] = useState([])
    const [formData, setFormData] = useState({
        nombre: "",
        fecha_inicio: "",
        fecha_fin: ""
    })

    useEffect(() => {
        fetchCampeonatos()
    }, [])

    const fetchCampeonatos = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/campeonatos", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCampeonatos(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch("http://localhost:8000/api/campeonatos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setFormData({ nombre: "", fecha_inicio: "", fecha_fin: "" })
                fetchCampeonatos()
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Campeonatos</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Nuevo Campeonato</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Campeonato</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre del Campeonato</Label>
                                <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Inicio</Label>
                                    <Input type="date" value={formData.fecha_inicio} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Fin</Label>
                                    <Input type="date" value={formData.fecha_fin} onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Guardar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campeonatos.map(c => (
                    <Card key={c.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">{c.nombre}</CardTitle>
                            <Trophy className="h-5 w-5 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-lilac-ash mb-4">
                                <Calendar className="h-4 w-4 mr-2" />
                                {c.fecha_inicio || 'TBA'} - {c.fecha_fin || 'TBA'}
                            </div>
                            <div className="flex justify-between items-center">
                                <Badge variant={c.activo ? "default" : "secondary"}>
                                    {c.activo ? "En curso" : "Finalizado"}
                                </Badge>
                                <Button variant="outline" size="sm">Detalles</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
