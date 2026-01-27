import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await login(username, password)
        if (result.success) {
            navigate("/")
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-alice-blue">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-charcoal">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para acceder al sistema.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <div className="grid gap-2">
                            <Label htmlFor="username">Usuario</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-emerald text-white hover:bg-emerald/90" type="submit">Ingresar</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
