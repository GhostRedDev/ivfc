import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function JugadoresPage() {
    const { token } = useAuth()
    const [jugadores, setJugadores] = useState([])
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        cedula: "",
        telefono_contacto: ""
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJugadores()
    }, [])

    const fetchJugadores = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/jugadores")
            const data = await res.json()
            setJugadores(data)
        } catch (error) {
            console.error("Error fetching jugadores:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch("http://localhost:8000/api/jugadores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setFormData({ nombre: "", apellido: "", fecha_nacimiento: "", cedula: "", telefono_contacto: "" })
                fetchJugadores()
            } else {
                const err = await res.json()
                alert(JSON.stringify(err))
            }
        } catch (error) {
            console.error("Error creating jugador:", error)
        }
    }

    return (
        <div className="p-8 space-y-8 bg-alice-blue min-h-screen">
            <Card>
                <CardHeader>
                    <CardTitle className="text-charcoal">Registro de Jugadores</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input id="apellido" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label>
                            <Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cedula">Cédula</Label>
                            <Input id="cedula" value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono Contacto</Label>
                            <Input id="telefono" value={formData.telefono_contacto} onChange={e => setFormData({ ...formData, telefono_contacto: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <Button type="submit" className="w-full bg-emerald text-white hover:bg-emerald/90">Registrar Jugador</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-charcoal">Plantilla de Jugadores</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Apellido</TableHead>
                                <TableHead>Edad</TableHead>
                                <TableHead>Categoría (Calc)</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jugadores.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.nombre}</TableCell>
                                    <TableCell>{p.apellido}</TableCell>
                                    <TableCell>{p.edad} años</TableCell>
                                    <TableCell>{new Date(p.fecha_nacimiento).getFullYear()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs ${p.activo ? 'bg-emerald text-white' : 'bg-red-500 text-white'}`}>
                                            {p.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
