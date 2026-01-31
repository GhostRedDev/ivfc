import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Search, Eye, Download, File, Image as ImageIcon } from "lucide-react"

export default function DocumentacionPage() {
    const { token } = useAuth()
    const [documents, setDocuments] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/documentos", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setDocuments(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredDocs = documents.filter(d =>
        (d.nombre + " " + d.apellido).toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.cedula.includes(searchTerm) ||
        d.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getIcon = (type) => {
        if (type.includes("foto")) return <ImageIcon className="h-5 w-5 text-purple-500" />
        if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
        return <File className="h-5 w-5 text-blue-500" />
    }

    const formatType = (t) => {
        switch (t) {
            case 'partida_nacimiento': return 'Partida de Nacimiento';
            case 'cedula': return 'Cédula de Identidad';
            case 'ficha_medica': return 'Ficha Médica';
            case 'foto': return 'Fotografía';
            default: return t;
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-charcoal">Documentación Global</h1>
                <p className="text-lilac-ash mt-2">Visión general de todos los documentos cargados en el sistema.</p>
            </div>

            <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">Archivos Recientes</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por jugador o tipo..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Cargando documentos...</div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                            {searchTerm ? "No se encontraron documentos con ese criterio" : "No hay documentos cargados en el sistema"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            {getIcon(doc.tipo)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-charcoal">{doc.nombre} {doc.apellido}</p>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span className="font-semibold text-emerald-600 uppercase tracking-wide">{formatType(doc.tipo)}</span>
                                                <span>•</span>
                                                <span>Subido el {new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.open(`http://localhost:8000${doc.ruta_archivo}`, '_blank')}>
                                            <Eye className="h-4 w-4 mr-2" /> Ver
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
