import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Shirt, Save, RefreshCw, Printer, Shield, Upload, Type } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Visual Component for the Jersey
const JerseyPreview = ({ colorPrimary, colorSecondary, number, name, type = "home", logoUrl, teamName }) => (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center transition-all duration-500 ease-in-out hover:scale-105 perspective-1000">
        <svg viewBox="0 0 500 600" className="w-full h-full drop-shadow-2xl" style={{ maxHeight: '500px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))' }}>
            <defs>
                {/* Fabric Texture Filter */}
                <filter id="fabricNoise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" in="noise" result="coloredNoise" />
                    <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
                    <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
                </filter>

                {/* 3D Lighting Gradients */}
                <linearGradient id="bodyShade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="black" stopOpacity="0.3" />
                    <stop offset="15%" stopColor="black" stopOpacity="0.05" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="85%" stopColor="black" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="black" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="sleeveShadeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="black" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="black" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="sleeveShadeRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="black" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="black" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="shortsShade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="black" stopOpacity="0.4" />
                    <stop offset="20%" stopColor="black" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.05" />
                    <stop offset="80%" stopColor="black" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="black" stopOpacity="0.4" />
                </linearGradient>
            </defs>

            {/* --- JERSEY GROUP --- */}
            <g transform="translate(0, 10)">
                {/* 1. Base Shape with Main Color */}
                <path
                    d="M130 40 
                       L110 65 Q115 75 90 95 L60 70 L90 30 Q110 10 150 15 L250 10 L350 15 Q390 10 410 30 L440 70 L410 95 Q385 75 390 65
                       L370 40
                       L370 320 
                       Q250 340 130 320
                       L130 40
                       Z"
                    fill={colorPrimary}
                    stroke="none"
                />

                {/* 2. Fabric Texture Overlay */}
                <path
                    d="M130 40 L110 65 Q115 75 90 95 L60 70 L90 30 Q110 10 150 15 L250 10 L350 15 Q390 10 410 30 L440 70 L410 95 Q385 75 390 65 L370 40 L370 320 Q250 340 130 320 L130 40 Z"
                    fill="url(#bodyShade)"
                    style={{ mixBlendMode: 'multiply' }}
                />

                {/* 3. Collar - Realistic V-Neck with Depth */}
                <path
                    d="M150 15 Q250 80 350 15"
                    fill="none"
                    stroke={colorSecondary}
                    strokeWidth="8"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}
                />
                <path
                    d="M150 15 Q250 80 350 15"
                    fill="none"
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* 4. Sleeve Details & Cuffs */}
                <path d="M60 70 L90 95" stroke={colorSecondary} strokeWidth="6" strokeLinecap="round" />
                <path d="M440 70 L410 95" stroke={colorSecondary} strokeWidth="6" strokeLinecap="round" />

                {/* 5. Realistic Folds/Wrinkles (Subtle dark paths) */}
                {/* Armpits */}
                <path d="M130 70 Q150 100 130 150" stroke="black" strokeWidth="2" fill="none" opacity="0.1" />
                <path d="M370 70 Q350 100 370 150" stroke="black" strokeWidth="2" fill="none" opacity="0.1" />
                {/* Waist bunching */}
                <path d="M150 310 Q200 300 250 315 Q300 300 350 310" stroke="black" strokeWidth="3" fill="none" opacity="0.1" />

                {/* 6. Side Panels / Design Accents */}
                <path d="M130 40 L130 320" stroke={colorSecondary} strokeWidth="0" fill="none" />
                <path d="M370 40 L370 320" stroke={colorSecondary} strokeWidth="0" fill="none" />

                {/* 7. Logo Placement with natural curve warp simulation (simple y-offset) */}
                {logoUrl && (
                    <g transform="translate(260, 60)">
                        <image
                            href={logoUrl}
                            x="0"
                            y="0"
                            height="50"
                            width="50"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))' }}
                        />
                    </g>
                )}

                {/* 8. Team Name - Arched slightly */}
                {teamName && (
                    <text
                        x="250"
                        y="140"
                        textAnchor="middle"
                        fill={colorSecondary}
                        fontSize="28"
                        fontFamily="Arial, sans-serif"
                        fontWeight="900"
                        letterSpacing="1"
                        className="uppercase"
                        style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                        }}
                    >
                        {teamName}
                    </text>
                )}

                {/* 9. Big Number with Sheen */}
                <text
                    x="250"
                    y="260"
                    textAnchor="middle"
                    fill={colorSecondary}
                    fontSize="110"
                    fontFamily="Impact, sans-serif"
                    fontWeight="bold"
                    style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                >
                    {number || "10"}
                </text>
            </g>

            {/* --- SHORTS GROUP --- */}
            <g transform="translate(0, 330)">
                {/* 1. Base Shorts Shape */}
                <path
                    d="M130 10 
                       Q250 0 370 10
                       L390 180 
                       L260 180 L250 100 L240 180 
                       L110 180 
                       L130 10 Z"
                    fill={colorPrimary}
                    stroke="none"
                />

                {/* 2. Shorts Lighting Overlay */}
                <path
                    d="M130 10 Q250 0 370 10 L390 180 L260 180 L250 100 L240 180 L110 180 L130 10 Z"
                    fill="url(#shortsShade)"
                    style={{ mixBlendMode: 'multiply' }}
                />

                {/* 3. Elastic Waistband details */}
                <path d="M130 10 Q250 0 370 10" stroke={colorSecondary} strokeWidth="4" fill="none" opacity="0.8" />
                <path d="M132 20 Q250 10 368 20" stroke="black" strokeWidth="1" fill="none" opacity="0.2" />

                {/* 4. Side Stripes */}
                <path d="M130 10 L110 180" stroke={colorSecondary} strokeWidth="6" fill="none" />
                <path d="M370 10 L390 180" stroke={colorSecondary} strokeWidth="6" fill="none" />

                {/* 5. Crotch Folds */}
                <path d="M250 100 L220 50" stroke="black" strokeWidth="2" opacity="0.1" />
                <path d="M250 100 L280 50" stroke="black" strokeWidth="2" opacity="0.1" />

                {/* 6. Shorts Number */}
                <text
                    x="340"
                    y="160"
                    textAnchor="middle"
                    fill={colorSecondary}
                    fontSize="32"
                    fontFamily="Impact, sans-serif"
                    fontWeight="bold"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                    {number || "10"}
                </text>
            </g>
        </svg>
    </div>
)

export default function UniformesPage() {
    const { token } = useAuth()
    const [jugadores, setJugadores] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const fileInputRef = useRef(null)

    // Kit Design State
    const [kitDesign, setKitDesign] = useState({
        primary: "#1a365d", // Deep Blue default
        secondary: "#fbbf24", // Amber default
        teamName: "CLUB VALENCIA",
        logo: null // URL string
    })

    const [uniformData, setUniformData] = useState({
        talla_camisa: "M",
        talla_short: "M",
        numero_dorsal: "",
        estado: "sin_uniforme"
    })

    useEffect(() => {
        fetchJugadores()
    }, [])

    const fetchJugadores = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/jugadores", {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setJugadores(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenEdit = async (player) => {
        setSelectedPlayer(player)
        // Fetch specific uniform data
        const res = await fetch(`http://localhost:8000/api/jugadores/${player.id}/uniforme`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            setUniformData({
                talla_camisa: data.talla_camisa || "M",
                talla_short: data.talla_short || "M",
                numero_dorsal: data.numero_dorsal || "",
                estado: data.estado || "sin_uniforme"
            })
        }
    }

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/jugadores/${selectedPlayer.id}/uniforme`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(uniformData)
            })
            if (res.ok) {
                // Determine color based on state for visual feedback
                const newStatus = uniformData.estado;
                // Update local state to reflect change visually immediately? 
                // Currently players list doesn't show status from fetch. 
                // We'd need to update the player object in 'jugadores' list ideally.
                setSelectedPlayer(null)
                fetchJugadores() // Simple refresh
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setKitDesign({ ...kitDesign, logo: url });
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin" /></div>

    return (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-8">
                <div className="flex-1 space-y-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Design Studio
                        </h1>
                        <p className="text-slate-500">Gestor de Indumentaria y Customización del Kit</p>
                    </div>

                    <div className="flex flex-wrap gap-6 items-end">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Colores del Kit
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs text-slate-400">Primario</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={kitDesign.primary}
                                            onChange={(e) => setKitDesign({ ...kitDesign, primary: e.target.value })}
                                            className="h-10 w-10 rounded-lg cursor-pointer border-2 border-white shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs text-slate-400">Secundario</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={kitDesign.secondary}
                                            onChange={(e) => setKitDesign({ ...kitDesign, secondary: e.target.value })}
                                            className="h-10 w-10 rounded-lg cursor-pointer border-2 border-white shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4 flex-1 min-w-[300px]">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <Type className="w-4 h-4" /> Identidad
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs text-slate-400">Nombre del Equipo</Label>
                                    <Input
                                        value={kitDesign.teamName}
                                        onChange={(e) => setKitDesign({ ...kitDesign, teamName: e.target.value })}
                                        placeholder="Ej. CLUB VALENCIA"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-400">Logo</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleLogoUpload}
                                        />
                                        <Button
                                            variant="outline"
                                            className="bg-white border-dashed border-2"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" /> Subir
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Preview Container */}
                <div className="w-full max-w-md aspect-[4/5] bg-slate-100 rounded-3xl flex items-center justify-center border-8 border-white shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-100 to-slate-200" />
                    <div className="w-[90%] h-[90%] z-10">
                        <JerseyPreview
                            colorPrimary={kitDesign.primary}
                            colorSecondary={kitDesign.secondary}
                            teamName={kitDesign.teamName}
                            logoUrl={kitDesign.logo}
                            number="10"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {jugadores.filter(j => j.activo).map(player => (
                    <Card
                        key={player.id}
                        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-none bg-white overflow-hidden relative"
                        onClick={() => handleOpenEdit(player)}
                    >
                        <div className={`absolute top-0 left-0 w-2 h-full 
                            ${player.uniforme_estado === 'con_uniforme' ? 'bg-emerald-500' :
                                player.uniforme_estado === 'en_espera' ? 'bg-yellow-400' : 'bg-slate-200'}`}
                        />

                        <CardHeader className="pl-6 pb-2">
                            <CardTitle className="text-lg font-bold uppercase tracking-tight text-slate-700">
                                {player.primer_nombre} {player.primer_apellido}
                            </CardTitle>
                            <Badge variant="outline" className="w-fit">{new Date(player.fecha_nacimiento).getFullYear()}</Badge>
                        </CardHeader>

                        <CardContent className="pl-6 flex flex-col items-center">
                            {/* Mini Jersey Preview for Player */}
                            <div className="w-32 h-32 transform group-hover:scale-110 transition-transform duration-300">
                                <JerseyPreview
                                    colorPrimary={kitDesign.primary}
                                    colorSecondary={kitDesign.secondary}
                                    teamName={""} // Simplify mini view
                                    number={player.numero_dorsal || "?"}
                                />
                            </div>

                            <div className="mt-4 w-full flex justify-between items-center text-sm text-slate-500 font-mono">
                                <span>Talla: {player.talla_camisa || "-"}</span>
                                <span className="font-bold">#{player.numero_dorsal || "-"}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
                <DialogContent className="max-w-4xl bg-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="fill-blue-600 text-blue-600" />
                            Fitting Room: <span className="text-blue-600">{selectedPlayer?.nombre} {selectedPlayer?.apellido}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-8 py-6">
                        {/* Live Preview Side */}
                        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-inner border border-slate-200">
                            <JerseyPreview
                                colorPrimary={kitDesign.primary}
                                colorSecondary={kitDesign.secondary}
                                teamName={kitDesign.teamName}
                                logoUrl={kitDesign.logo}
                                number={uniformData.numero_dorsal}
                            />
                            <div className="mt-8 text-center space-y-2">
                                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400">Especificaciones</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-700">
                                    <div className="bg-slate-100 px-4 py-2 rounded">Camisa: {uniformData.talla_camisa}</div>
                                    <div className="bg-slate-100 px-4 py-2 rounded">Short: {uniformData.talla_short}</div>
                                </div>
                            </div>
                        </div>

                        {/* Controls Side */}
                        <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Asignación de Dorsal</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-4xl font-black text-slate-300 font-mono">
                                        {uniformData.numero_dorsal || "#"}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Número</Label>
                                        <Input
                                            type="number"
                                            className="text-2xl font-bold tracking-widest h-12"
                                            value={uniformData.numero_dorsal}
                                            onChange={e => setUniformData({ ...uniformData, numero_dorsal: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Talla Camisa</Label>
                                    <Select value={uniformData.talla_camisa} onValueChange={(v) => setUniformData({ ...uniformData, talla_camisa: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["XS", "S", "M", "L", "XL", "XXL"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Talla Short</Label>
                                    <Select value={uniformData.talla_short} onValueChange={(v) => setUniformData({ ...uniformData, talla_short: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["XS", "S", "M", "L", "XL", "XXL"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Estado de Entrega</Label>
                                <Select value={uniformData.estado} onValueChange={(v) => setUniformData({ ...uniformData, estado: v })}>
                                    <SelectTrigger className={
                                        uniformData.estado === 'con_uniforme' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            uniformData.estado === 'en_espera' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''
                                    }>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sin_uniforme">🔴 Sin Uniforme</SelectItem>
                                        <SelectItem value="en_espera">🟡 En Espera / Pedido</SelectItem>
                                        <SelectItem value="con_uniforme">🟢 Entregado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg shadow-lg shadow-slate-200" onClick={handleSave}>
                                <Save className="mr-2 h-5 w-5" /> Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
