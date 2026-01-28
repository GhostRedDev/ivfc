import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Banknote } from "lucide-react"

export default function PagosPage() {
    const { token } = useAuth()
    const [pagos, setPagos] = useState([])
    const [jugadores, setJugadores] = useState([])
    const [formData, setFormData] = useState({
        jugador_id: "",
        personal_id: "",
        monto: "",
        concepto: "",
        metodo_pago: "efectivo"
    })
    const [tipoPago, setTipoPago] = useState("jugador") // 'jugador' | 'personal'
    const [personal, setPersonal] = useState([])

    useEffect(() => {
        fetchJugadores()
        fetchPersonal()
    }, [])

    const fetchJugadores = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/jugadores", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) setJugadores(await res.json())
        } catch (error) { console.error(error) }
    }

    const fetchPersonal = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/personal", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) setPersonal(await res.json())
        } catch (error) { console.error(error) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = { ...formData, monto: parseFloat(formData.monto) }
            // Filter out empty ID fields based on type
            if (tipoPago === "jugador") {
                payload.personal_id = null
            } else {
                payload.jugador_id = null
            }

            const res = await fetch("http://localhost:8000/api/pagos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setFormData({ jugador_id: "", personal_id: "", monto: "", concepto: "", metodo_pago: "efectivo" })
                alert("Pago registrado exitosamente")
                // Optional: fetchPagos()
            } else {
                const err = await res.json()
                alert("Error: " + (err.message || "Error desconocido"))
            }
        } catch (error) { console.error(error) }
    }

    return (
        <div className="space-y-8 bg-alice-blue p-8 min-h-screen">
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Gestión de Tesorería</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="max-w-xl shadow-md border-emerald/20">
                    <CardHeader className="bg-emerald text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Banknote className="h-6 w-6" />
                            Registrar Nuevo Pago
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-charcoal font-semibold">Tipo de Beneficiario</Label>
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant={tipoPago === "jugador" ? "default" : "outline"}
                                        className={tipoPago === "jugador" ? "bg-emerald hover:bg-emerald/90" : "text-emerald border-emerald"}
                                        onClick={() => { setTipoPago("jugador"); setFormData({ ...formData, personal_id: "" }); }}
                                    >
                                        Atleta / Jugador
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={tipoPago === "personal" ? "default" : "outline"}
                                        className={tipoPago === "personal" ? "bg-charcoal text-white hover:bg-charcoal/90" : "text-charcoal border-charcoal"}
                                        onClick={() => { setTipoPago("personal"); setFormData({ ...formData, jugador_id: "" }); }}
                                    >
                                        Personal / Staff
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-charcoal font-semibold">
                                    {tipoPago === "jugador" ? "Seleccionar Jugador" : "Seleccionar Empleado"}
                                </Label>
                                {tipoPago === "jugador" ? (
                                    <Select value={formData.jugador_id} onValueChange={(v) => setFormData({ ...formData, jugador_id: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Buscar Jugador..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {jugadores.filter(j => j.activo).map(j => (
                                                <SelectItem key={j.id} value={j.id.toString()}>
                                                    {j.nombre} {j.apellido} - {j.cedula}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Select value={formData.personal_id} onValueChange={(v) => setFormData({ ...formData, personal_id: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Buscar Personal..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {personal.filter(p => p.activo).map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.nombre} {p.apellido} - {p.cargo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-charcoal font-semibold">Monto ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.monto}
                                        onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                        required
                                        className="font-mono text-lg"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-charcoal font-semibold">Método de Pago</Label>
                                    <Select value={formData.metodo_pago} onValueChange={(v) => setFormData({ ...formData, metodo_pago: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="efectivo">Efectivo 💵</SelectItem>
                                            <SelectItem value="transferencia">Transferencia 🏦</SelectItem>
                                            <SelectItem value="pago_movil">Pago Móvil 📱</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-charcoal font-semibold">Concepto / Motivo</Label>
                                <Input
                                    placeholder={tipoPago === "jugador" ? "Ej: Mensualidad Febrero" : "Ej: Quincena 1 - Febrero"}
                                    value={formData.concepto}
                                    onChange={e => setFormData({ ...formData, concepto: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full bg-emerald hover:bg-emerald/90 text-white font-bold py-6 text-lg shadow-lg transition-transform hover:scale-[1.02]">
                                <Banknote className="mr-2 h-5 w-5" /> Registrar Pago
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History placeholder or chart could go here */}
                <div className="space-y-4">
                    <Card className="bg-charcoal text-white border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>Resumen rápido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lilac-ash">Historial reciente de transacciones...</p>
                            {/* Listing logic would go here */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
