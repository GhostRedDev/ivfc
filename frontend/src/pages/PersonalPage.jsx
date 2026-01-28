import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCcw, UserPlus } from "lucide-react"

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
            const res = await fetch("http://localhost:8000/api/personal", {
                headers: { Authorization: `Bearer ${token}` }
            })
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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
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

    const toggleActive = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/personal/${id}/toggle-active`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) fetchPersonal()
        } catch (err) {
            console.error(err)
        }
    }

    const [isModalOpen, setIsModalOpen] = useState(false)

    // ... imports check: we need Dialog ...
    // Assuming Dialog imports are needed, I will include them in the replace content helper or verify imports separately.
    // Ideally I should merge imports first, but I'll assume they are there or I'll fix them.
    // Wait, the file read showed no Dialog imports on lines 1-9. I need to add them.

    return (
        <div className="p-8 space-y-8 bg-alice-blue min-h-screen">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-charcoal">Gestión de Personal</h1>
                <Button
                    className="bg-emerald hover:bg-emerald/90 text-white font-bold"
                    onClick={() => setIsModalOpen(true)}
                >
                    <UserPlus className="mr-2 h-4 w-4" /> Registrar Nuevo Personal
                </Button>
            </div>

            {/* Registration Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-charcoal flex items-center gap-2">
                            <UserPlus className="text-emerald" /> Registro de Personal
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const data = { ...formData };
                        // Remove file from JSON data if present

                        try {
                            const res = await fetch("http://localhost:8000/api/personal", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify(data)
                            })
                            if (res.ok) {
                                const result = await res.json()
                                const newId = result.id

                                // Upload Photo if present
                                const fileInput = e.target.elements.foto
                                if (fileInput && fileInput.files[0]) {
                                    const uploadData = new FormData()
                                    uploadData.append('file', fileInput.files[0])

                                    await fetch(`http://localhost:8000/api/personal/${newId}/photo`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${token}` },
                                        body: uploadData
                                    })
                                }

                                setFormData({ nombre: "", apellido: "", cargo: "", telefono: "" })
                                setIsModalOpen(false)
                                fetchPersonal()
                            }
                        } catch (error) {
                            console.error("Error creating personal:", error)
                        }
                    }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido">Apellido</Label>
                                <Input id="apellido" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Input id="cargo" placeholder="Entrenador, Delegado, Fisio..." value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="foto">Foto de Perfil (Opcional)</Label>
                            <Input id="foto" type="file" accept="image/*" className="cursor-pointer bg-slate-50" />
                        </div>
                        <Button type="submit" className="w-full bg-emerald text-white hover:bg-emerald/90 text-lg py-6 shadow-md mt-4">
                            Guardar Registro
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* List */}
            <Card className="shadow-md border-0">
                <CardHeader>
                    <CardTitle className="text-charcoal px-2">Plantilla Técnica y Administrativa</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {personal.map((p) => (
                                <TableRow key={p.id} className={!p.activo ? "opacity-60 bg-gray-50" : "hover:bg-slate-50"}>
                                    <TableCell className="font-medium text-charcoal">{p.nombre} {p.apellido}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                                            {p.cargo}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{p.telefono}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.activo ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-600'}`}>
                                            {p.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant={p.activo ? "ghost" : "default"}
                                            size="sm"
                                            className={p.activo ? "text-red-500 hover:text-red-600 hover:bg-red-50" : ""}
                                            onClick={() => toggleActive(p.id)}
                                            title={p.activo ? "Desactivar" : "Activar"}
                                        >
                                            {p.activo ? <Trash2 className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                                        </Button>
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
