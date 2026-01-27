import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import PersonalPage from "./pages/PersonalPage";
import JugadoresPage from "./pages/JugadoresPage";
import { Button } from "@/components/ui/button";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="p-8 bg-alice-blue min-h-screen">
      <h1 className="text-3xl font-bold text-charcoal mb-4">Dashboard</h1>
      <p className="mb-4 text-lilac-ash">Bienvenido al sistema del Club Internacional Valencia F.C.</p>
      <Button onClick={logout} variant="destructive">Cerrar Sesión</Button>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal"
            element={
              <ProtectedRoute>
                <PersonalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jugadores"
            element={
              <ProtectedRoute>
                <JugadoresPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
