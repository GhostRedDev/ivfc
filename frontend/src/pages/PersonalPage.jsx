import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PersonalPage() {
    const { token } = useAuth()
    const [personal, setPersonal] = useState([])
    const [formData, setFormData] = useState({ nombre: "", apellido: "", cargo: "", telefono: "" })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPersonal()
    }, [])

    const fetchPersonal = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/personal")
            const data = await res.json()
            setPersonal(data)
        } catch (error) {
            console.error("Error fetching personal:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch("http://localhost:8000/api/personal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setFormData({ nombre: "", apellido: "", cargo: "", telefono: "" })
                fetchPersonal()
            }
        } catch (error) {
            console.error("Error creating personal:", error)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Registro de Personal</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input id="apellido" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Input id="cargo" placeholder="Entrenador, Delegado..." value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <Button type="submit" className="w-full bg-emerald text-white hover:bg-emerald/90">Registrar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Personal</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Apellido</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {personal.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.nombre}</TableCell>
                                    <TableCell>{p.apellido}</TableCell>
                                    <TableCell>{p.cargo}</TableCell>
                                    <TableCell>{p.activo ? "Activo" : "Inactivo"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
