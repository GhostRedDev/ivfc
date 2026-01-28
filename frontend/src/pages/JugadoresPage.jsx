
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"
import { FileText, Trash2, RefreshCcw, Upload, Eye, User, HeartPulse, ShieldAlert, Award, BookOpen, Activity } from "lucide-react"

export default function JugadoresPage() {
    const { token } = useAuth()
    const [jugadores, setJugadores] = useState([])
    const [categorias, setCategorias] = useState([])

    // Initial State including all new fields
    const initialFormState = {
        primer_nombre: "", segundo_nombre: "", primer_apellido: "", segundo_apellido: "",
        fecha_nacimiento: "", cedula: "", telefono_contacto: "", direccion: "",
        representante_nombre: "", representante_cedula: "", representante_telefono: "",
        tipo_sangre: "", alergias: "",
        tiempo_entrenamiento: "", categoria_objetivo: "", categoria_id: "",
        antecedentes_patologicos: "", antecedentes_deportivos: "", antecedentes_academicos: "",
        // Default skills with 0 rating
        habilidades: {
            "Velocidad": 0, "Resistencia": 0, "Fuerza": 0, "Control de Balón": 0,
            "Pase Corto": 0, "Pase Largo": 0, "Tiro": 0, "Cabeceo": 0,
            "Marcaje": 0, "Táctica": 0
        }
    }

    const [formData, setFormData] = useState(initialFormState)
    const [loading, setLoading] = useState(true)
    const [isUnderAge, setIsUnderAge] = useState(false)

    // Document Modal State
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const [documents, setDocuments] = useState([])
    const [docType, setDocType] = useState("cedula")
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

    useEffect(() => {
        fetchJugadores()
        fetchCategorias()
    }, [])

    const fetchCategorias = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/categorias", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setCategorias(await res.json())
            }
        } catch (error) {
            console.error("Error fetching categorias:", error)
        }
    }

    useEffect(() => {
        if (formData.fecha_nacimiento) {
            const age = calculateAge(formData.fecha_nacimiento)
            setIsUnderAge(age < 18)
        }
    }, [formData.fecha_nacimiento])

    const calculateAge = (dateString) => {
        if (!dateString) return 0
        const today = new Date()
        const birthDate = new Date(dateString)
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const fetchJugadores = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/jugadores", {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            // Ensure habilidades is parsed if it comes as string (though fetch usually handles JSON response)
            // If backend sends it as JSON column, Laravel typically decodes it. 
            // We map data to ensure structure if needed.
            setJugadores(data)
        } catch (error) {
            console.error("Error fetching jugadores:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSkillChange = (skillName, value) => {
        setFormData(prev => ({
            ...prev,
            habilidades: { ...prev.habilidades, [skillName]: value }
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Construct payload
        const payload = {
            ...formData,
            nombre: `${formData.primer_nombre} ${formData.segundo_nombre}`.trim(),
            apellido: `${formData.primer_apellido} ${formData.segundo_apellido}`.trim(),
        }

        try {
            const res = await fetch("http://localhost:8000/api/jugadores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                const result = await res.json()
                const newId = result.id

                // Upload Photo if present
                const fileInput = document.getElementById("registro_foto");
                if (fileInput && fileInput.files[0]) {
                    const uploadData = new FormData()
                    uploadData.append("file", fileInput.files[0])
                    uploadData.append("tipo", "foto")

                    await fetch(`http://localhost:8000/api/jugadores/${newId}/documentos`, {
                        method: "POST", // Use DocumentController logic
                        headers: { Authorization: `Bearer ${token}` },
                        body: uploadData
                    })
                }

                setFormData(initialFormState)
                alert("Jugador registrado exitosamente.")
                setIsRegisterModalOpen(false)
                fetchJugadores()
            } else {
                const err = await res.json()
                alert(err.error || JSON.stringify(err))
            }
        } catch (error) {
            console.error("Error creating jugador:", error)
        }
    }


    const toggleActive = async (id, currentStatus) => {
        try {
            let url = `http://localhost:8000/api/jugadores/${id}`
            let method = "DELETE"

            if (!currentStatus) {
                url = `http://localhost:8000/api/jugadores/${id}/restore`
                method = "POST"
            }

            const res = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) fetchJugadores()
        } catch (err) {
            console.error(err)
        }
    }

    // Document Functions
    const openDocumentModal = async (player) => {
        setSelectedPlayer(player)
        const age = calculateAge(player.fecha_nacimiento);
        if (age < 18) setDocType("foto_representante");
        else setDocType("cedula");
        fetchDocuments(player.id)
    }

    const fetchDocuments = async (playerId) => {
        const res = await fetch(`http://localhost:8000/api/jugadores/${playerId}/documentos`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            setDocuments(await res.json())
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        const fileInput = e.target.elements.file
        if (!fileInput.files[0]) return

        const formDataUpload = new FormData()
        formDataUpload.append("file", fileInput.files[0])
        formDataUpload.append("tipo", docType)

        const res = await fetch(`http://localhost:8000/api/jugadores/${selectedPlayer.id}/documentos`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataUpload
        })

        if (res.ok) {
            fetchDocuments(selectedPlayer.id)
            fileInput.value = ""
        }
    }

    const deleteDocument = async (docId) => {
        if (!confirm("¿Eliminar documento?")) return
        const res = await fetch(`http://localhost:8000/api/documentos/${docId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) fetchDocuments(selectedPlayer.id)
    }

    return (
        <div className="p-8 space-y-8 bg-alice-blue min-h-screen">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-pale-slate/30">
                <h1 className="text-2xl font-bold text-charcoal">Gestión de Jugadores</h1>
                <Button
                    className="bg-emerald hover:bg-emerald/90 text-white font-bold shadow-md transition-all hover:scale-105"
                    onClick={() => setIsRegisterModalOpen(true)}
                >
                    <User className="mr-2 h-4 w-4" /> Registrar Nuevo Jugador
                </Button>
            </div>

            {/* Registration Modal */}
            <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-charcoal flex items-center gap-2">
                            <User className="text-emerald" /> Registro y Evaluación Integral
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="identidad" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-alice-blue p-1 rounded-lg">
                                <TabsTrigger value="identidad" className="flex gap-2 text-md data-[state=active]:bg-white data-[state=active]:text-emerald data-[state=active]:shadow-sm"><User size={18} /> Identidad</TabsTrigger>
                                <TabsTrigger value="legal" className="flex gap-2 text-md data-[state=active]:bg-white data-[state=active]:text-emerald data-[state=active]:shadow-sm"><ShieldAlert size={18} /> Legal</TabsTrigger>
                                <TabsTrigger value="historial" className="flex gap-2 text-md data-[state=active]:bg-white data-[state=active]:text-emerald data-[state=active]:shadow-sm"><BookOpen size={18} /> Historial</TabsTrigger>
                                <TabsTrigger value="habilidades" className="flex gap-2 text-md data-[state=active]:bg-white data-[state=active]:text-emerald data-[state=active]:shadow-sm"><Award size={18} /> Habilidades</TabsTrigger>
                            </TabsList>

                            {/* --- IDENTITY --- */}
                            <TabsContent value="identidad" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Primer Nombre</Label>
                                        <Input value={formData.primer_nombre} onChange={e => setFormData({ ...formData, primer_nombre: e.target.value })} required placeholder="Miguel" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Segundo Nombre</Label>
                                        <Input value={formData.segundo_nombre} onChange={e => setFormData({ ...formData, segundo_nombre: e.target.value })} placeholder="Ángel" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Primer Apellido</Label>
                                        <Input value={formData.primer_apellido} onChange={e => setFormData({ ...formData, primer_apellido: e.target.value })} required placeholder="Pérez" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Segundo Apellido</Label>
                                        <Input value={formData.segundo_apellido} onChange={e => setFormData({ ...formData, segundo_apellido: e.target.value })} placeholder="Díaz" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Cédula de Identidad</Label>
                                        <Input value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })} required placeholder="V-12345678" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Fecha Nacimiento</Label>
                                        <Input type="date" value={formData.fecha_nacimiento} onChange={e => setFormData({ ...formData, fecha_nacimiento: e.target.value })} required />
                                        {formData.fecha_nacimiento && (
                                            <p className={`text-sm mt-1 font-semibold ${isUnderAge ? 'text-amber-600' : 'text-emerald'}`}>
                                                Edad: {calculateAge(formData.fecha_nacimiento)} años
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Teléfono Contacto</Label>
                                        <Input value={formData.telefono_contacto} onChange={e => setFormData({ ...formData, telefono_contacto: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-charcoal/80">Dirección de Habitación</Label>
                                    <Textarea value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} placeholder="Dirección completa..." />
                                </div>
                            </TabsContent>

                            {/* --- LEGAL --- */}
                            <TabsContent value="legal" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                {isUnderAge ? (
                                    <div className="bg-amber-50 border-l-8 border-amber-500 p-4 rounded-r">
                                        <div className="flex items-center gap-2 text-amber-800 font-bold text-lg mb-1">
                                            <ShieldAlert /> Mensaje del Sistema
                                        </div>
                                        <p className="text-amber-700">
                                            El jugador es <strong>menor de edad ({calculateAge(formData.fecha_nacimiento)} años)</strong>.
                                            Es obligatorio registrar los datos completos del representante legal.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-emerald/10 border-l-8 border-emerald p-4 rounded-r">
                                        <p className="text-emerald font-medium">El jugador es mayor de edad. Los datos del representante son opcionales.</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-6 bg-alice-blue p-6 rounded-lg border border-pale-slate/30">
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Nombre Representante</Label>
                                        <Input value={formData.representante_nombre} onChange={e => setFormData({ ...formData, representante_nombre: e.target.value })} required={isUnderAge} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Cédula Representante</Label>
                                        <Input value={formData.representante_cedula} onChange={e => setFormData({ ...formData, representante_cedula: e.target.value })} required={isUnderAge} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Teléfono Representante</Label>
                                        <Input value={formData.representante_telefono} onChange={e => setFormData({ ...formData, representante_telefono: e.target.value })} required={isUnderAge} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- HISTORY / MEDICAL --- */}
                            <TabsContent value="historial" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Medical */}
                                    <div className="space-y-4 border border-pale-slate/30 p-4 rounded-lg bg-red-50">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-red-700"><HeartPulse /> Ficha Médica</h3>
                                        <div className="space-y-2">
                                            <Label className="text-charcoal/80">Tipo de Sangre</Label>
                                            <Select value={formData.tipo_sangre} onValueChange={(v) => setFormData({ ...formData, tipo_sangre: v })}>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="O+">Top O+</SelectItem>
                                                    <SelectItem value="O-">O-</SelectItem>
                                                    <SelectItem value="A+">A+</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-charcoal/80">Antecedentes Patológicos / Alergias</Label>
                                            <Textarea className="bg-white" value={formData.antecedentes_patologicos} onChange={e => setFormData({ ...formData, antecedentes_patologicos: e.target.value })} placeholder="Enfermedades previas, cirugías, alergias..." />
                                        </div>
                                    </div>

                                    {/* Sports/Academic */}
                                    <div className="space-y-4 border border-pale-slate/30 p-4 rounded-lg bg-alice-blue">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-charcoal"><BookOpen className="text-emerald" /> Académico y Deportivo</h3>
                                        <div className="space-y-2">
                                            <Label className="text-charcoal/80">Antecedentes Deportivos</Label>
                                            <div className="mb-2">
                                                <Select onValueChange={(v) => setFormData(prev => ({
                                                    ...prev,
                                                    antecedentes_deportivos: prev.antecedentes_deportivos ? `${prev.antecedentes_deportivos}\n- ${v}` : `- ${v}`
                                                }))}>
                                                    <SelectTrigger className="w-full bg-white mb-2">
                                                        <SelectValue placeholder="+ Agregar Tipo de Formación" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Academia Privada">Academia Privada</SelectItem>
                                                        <SelectItem value="Escuela Municipal">Escuela Municipal</SelectItem>
                                                        <SelectItem value="Club Profesional (Canteras)">Club Profesional (Canteras)</SelectItem>
                                                        <SelectItem value="Colegio / Institución Educativa">Colegio / Institución Educativa</SelectItem>
                                                        <SelectItem value="Entrenamiento Personalizado">Entrenamiento Personalizado</SelectItem>
                                                        <SelectItem value="Liga Barrial / Recreativo">Liga Barrial / Recreativo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Textarea
                                                className="bg-white min-h-[100px]"
                                                value={formData.antecedentes_deportivos}
                                                onChange={e => setFormData({ ...formData, antecedentes_deportivos: e.target.value })}
                                                placeholder="Describa la trayectoria..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-charcoal/80">Antecedentes Académicos</Label>
                                            <Textarea className="bg-white" value={formData.antecedentes_academicos} onChange={e => setFormData({ ...formData, antecedentes_academicos: e.target.value })} placeholder="Nivel de estudio, institución..." />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- SKILLS --- */}
                            <TabsContent value="habilidades" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <Label className="text-charcoal/80">Categoría Asignada</Label>
                                        <Select
                                            value={formData.categoria_id?.toString() || ""}
                                            onValueChange={(v) => {
                                                const cat = categorias.find(c => c.id.toString() === v);
                                                setFormData({ ...formData, categoria_id: v, categoria_objetivo: cat ? cat.nombre : "" })
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione Categoría Real" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categorias.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.nombre} ({c.anio_inicio}-{c.anio_fin})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 border p-3 rounded-md bg-alice-blue">
                                            <input
                                                type="checkbox"
                                                id="sin_experiencia"
                                                className="h-4 w-4 rounded border-gray-300 text-emerald focus:ring-emerald"
                                                checked={formData.tiempo_entrenamiento === "Sin experiencia"}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({ ...prev, tiempo_entrenamiento: "Sin experiencia", antecedentes_deportivos: "Nuevo Ingreso - Sin trayectoria previa" }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, tiempo_entrenamiento: "", antecedentes_deportivos: "" }));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="sin_experiencia" className="font-medium cursor-pointer text-charcoal/80">
                                                Nuevo Ingreso (Sin Experiencia Previa)
                                            </Label>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-charcoal/80">Tiempo de Entrenamiento Previo</Label>
                                            <Select
                                                value={formData.tiempo_entrenamiento}
                                                onValueChange={(v) => setFormData({ ...formData, tiempo_entrenamiento: v })}
                                                disabled={formData.tiempo_entrenamiento === "Sin experiencia"}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Seleccione tiempo..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    <SelectItem value="Sin experiencia">Sin experiencia</SelectItem>
                                                    <SelectItem value="Menos de 1 mes">Menos de 1 mes</SelectItem>
                                                    {Array.from({ length: 11 }, (_, i) => i + 1).map(m => (
                                                        <SelectItem key={`mes-${m}`} value={`${m} meses`}>{m} meses</SelectItem>
                                                    ))}
                                                    <SelectItem value="1 año">1 año</SelectItem>
                                                    {Array.from({ length: 14 }, (_, i) => i + 2).map(y => (
                                                        <SelectItem key={`anio-${y}`} value={`${y} años`}>{y} años</SelectItem>
                                                    ))}
                                                    <SelectItem value="Más de 15 años">Más de 15 años</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-6 bg-alice-blue border-pale-slate/30">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-charcoal"><Award className="text-yellow-500" /> Evaluador de Habilidades (1-10)</h3>

                                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                        {Object.entries(formData.habilidades).map(([skill, value]) => (
                                            <div key={skill} className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-md font-semibold text-charcoal">{skill}</Label>
                                                    <span className="font-bold text-emerald text-lg">{value}</span>
                                                </div>
                                                <StarRating value={value} onChange={(v) => handleSkillChange(skill, v)} max={10} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <Button type="submit" className="w-full bg-emerald text-white hover:bg-emerald/90 text-xl py-8 shadow-xl transition-all hover:scale-[1.01]">
                                        Registrar Ficha Completa
                                    </Button>
                                    <p className="text-center text-lilac-ash mt-4 text-sm">Asegúrese de haber completado todos los campos obligatorios en las pestañas anteriores.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </form>
                </DialogContent>
            </Dialog>

            {/* List */}
            <Card className="border-pale-slate/30 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-charcoal px-2">Plantilla de Jugadores</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-pale-slate/30 hover:bg-transparent">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="text-charcoal/70">Nombre Completo</TableHead>
                                <TableHead className="text-charcoal/70">Edad</TableHead>
                                <TableHead className="text-charcoal/70">Categoría</TableHead>
                                <TableHead className="text-charcoal/70">Promedio Hab.</TableHead>
                                <TableHead className="text-charcoal/70">Estado</TableHead>
                                <TableHead className="text-charcoal/70">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jugadores.map((p) => {
                                // Calculate average skill if string exists
                                let avgSkill = 0;
                                if (p.habilidades) {
                                    try {
                                        const skills = typeof p.habilidades === 'string' ? JSON.parse(p.habilidades) : p.habilidades;
                                        const values = Object.values(skills);
                                        if (values.length > 0) avgSkill = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
                                    } catch (e) { }
                                }

                                return (
                                    <TableRow key={p.id} className={!p.activo ? "opacity-60 bg-gray-50 bg-stripe" : "hover:bg-alice-blue transition-colors border-pale-slate/20"}>
                                        <TableCell>
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-alice-blue border border-pale-slate/30">
                                                {p.foto_url ? (
                                                    <img
                                                        src={`http://localhost:8000${p.foto_url}`}
                                                        alt={p.primer_nombre}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-lilac-ash">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-charcoal">{p.primer_nombre} {p.primer_apellido}</div>
                                            <div className="text-xs text-muted-foreground">{p.cedula}</div>
                                        </TableCell>
                                        <TableCell>{p.edad} años</TableCell>
                                        <TableCell>
                                            {p.categoria_nombre ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {p.categoria_nombre}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Sin Asignar</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {avgSkill > 0 ? (
                                                <div className="flex items-center gap-1 text-yellow-600 font-bold">
                                                    <StarRating value={Math.round(avgSkill)} max={1} readonly /> {avgSkill}
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.activo ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-600'}`}>
                                                {p.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openDocumentModal(p)}
                                                title="Documentos"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant={p.activo ? "ghost" : "default"}
                                                size="sm"
                                                className={p.activo ? "text-red-500 hover:text-red-600 hover:bg-red-50" : ""}
                                                onClick={() => toggleActive(p.id, p.activo)}
                                            >
                                                {p.activo ? <Trash2 className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Document / Photo Modal */}
            <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Documentos: {selectedPlayer?.primer_nombre ?? selectedPlayer?.nombre} {selectedPlayer?.primer_apellido ?? selectedPlayer?.apellido}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <form onSubmit={handleUpload} className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
                            <Label className="font-semibold text-charcoal">Subir Documento o Foto</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Tipo</Label>
                                    <Select value={docType} onValueChange={setDocType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="foto_representante" className="font-bold text-emerald">📸 Foto Representante</SelectItem>
                                            <SelectItem value="cedula">Cédula</SelectItem>
                                            <SelectItem value="partida_nacimiento">Partida Nacimiento</SelectItem>
                                            <SelectItem value="foto">Foto Jugador</SelectItem>
                                            <SelectItem value="ficha_medica">Ficha Médica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Archivo</Label>
                                    <Input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90"><Upload className="mr-2 h-4 w-4" /> Subir Archivo</Button>
                        </form>

                        <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                            {documents.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Sin documentos archivados</p> : (
                                <ul className="space-y-2">
                                    {documents.map(doc => (
                                        <li key={doc.id} className="flex justify-between items-center bg-white border p-3 rounded shadow-sm">
                                            <div className="flex items-center gap-3">
                                                {doc.tipo.includes('foto') ?
                                                    <div className="h-8 w-8 bg-emerald/10 rounded-full flex items-center justify-center text-emerald">📸</div>
                                                    : <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">📄</div>
                                                }
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium capitalize">{doc.tipo.replace('_', ' ')}</span>
                                                    <span className="text-xs text-gray-400">{doc.formato}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <a href={`http://localhost:8000${doc.ruta_archivo}`} target="_blank" rel="noreferrer">
                                                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                                </a>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteDocument(doc.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
