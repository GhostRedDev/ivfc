import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Github, GalleryVerticalEnd } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()
    const videoRef = useRef(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75; // Slow motion effect
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Auto-play was prevented. This is expected in some browsers or if user hasn't interacted.
                    // Silencing the error to avoid console noise.
                    console.log("Auto-play prevented (expected behavior):", e.name);
                });
            }
        }
    }, [])

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
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* ... Left Side content remains same ... */}
            <div className="flex flex-col bg-charcoal text-white p-6 md:p-10">
                <div className="flex justify-start mb-10">
                    <a href="#" className="flex items-center gap-3 font-medium text-white text-xl tracking-wide">
                        <div className="flex gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg overflow-hidden border border-white/20 transition-transform hover:scale-105">
                                <img src="/logo.png" alt="Logo 1" className="h-full w-full object-contain p-2 opacity-90 hover:opacity-100" />
                            </div>
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg overflow-hidden border border-white/20 transition-transform hover:scale-105">
                                <img src="/logo1.jpeg" alt="Logo 2" className="h-full w-full object-contain p-2 opacity-90 hover:opacity-100" />
                            </div>
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg overflow-hidden border border-white/20 transition-transform hover:scale-105">
                                <img src="/logo2.png" alt="Logo 3" className="h-full w-full object-contain p-2 opacity-90 hover:opacity-100" />
                            </div>
                        </div>
                        <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white">
                            Club Valencia
                        </span>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-3xl font-semibold tracking-tight text-white">
                                Login to your account
                            </h1>
                            <p className="text-sm text-lilac-ash">
                                Enter your username below to login to your account
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-white">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <a href="#" className="text-sm text-lilac-ash hover:text-white">
                                                Forgot your password?
                                            </a>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md bg-charcoal border border-zinc-700 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Restablecer Contraseña</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <p className="text-sm text-zinc-400">
                                                    Ingresa tu usuario. Tu contraseña será restablecida a un valor por defecto.
                                                </p>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reset-username">Usuario</Label>
                                                    <Input
                                                        id="reset-username"
                                                        placeholder="admin"
                                                        className="bg-zinc-800 border-zinc-700 text-white"
                                                        onChange={(e) => window.resetUsername = e.target.value}
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full bg-emerald hover:bg-emerald/90"
                                                    onClick={async () => {
                                                        const u = window.resetUsername;
                                                        if (!u) return alert("Ingresa usuario");
                                                        try {
                                                            const res = await fetch("http://localhost:8000/api/reset-password", {
                                                                method: "POST",
                                                                body: JSON.stringify({ username: u })
                                                            });
                                                            const data = await res.json();
                                                            alert(data.message);
                                                        } catch (e) {
                                                            alert("Error");
                                                        }
                                                    }}
                                                >
                                                    Restablecer
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-emerald"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-emerald text-white hover:bg-emerald/90">
                                Login
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-charcoal px-2 text-zinc-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white">
                            <Github className="mr-2 h-4 w-4" />
                            Login with GitHub
                        </Button>

                        <p className="px-8 text-center text-sm text-zinc-500">
                            Don't have an account?{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-white">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            {/* Right Side Video */}
            <div className="relative hidden bg-zinc-900 lg:block overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                    <span className="sr-only">Football Video</span>
                </div>
                <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                >
                    <source src="https://cdn.coverr.co/videos/coverr-football-game-5364/1080p.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
        </div>
    )
}
