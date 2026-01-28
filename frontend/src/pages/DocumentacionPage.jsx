import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function DocumentacionPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Documentación</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Gestión de Documentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-charcoal/80 mb-4">
                        La gestión de documentos (Cédulas, Partidas de Nacimiento, Fotos, etc.) se realiza directamente desde el perfil de cada jugador.
                    </p>
                    <p className="text-charcoal/80">
                        Diríjase al módulo de <strong>Jugadores</strong>, busque al jugador deseado y haga clic en el botón de documentos <FileText className="inline h-4 w-4" /> para subir o ver sus archivos.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
