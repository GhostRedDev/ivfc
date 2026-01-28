import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import PersonalPage from "./pages/PersonalPage";
import JugadoresPage from "./pages/JugadoresPage";
import CategoriasPage from "./pages/CategoriasPage";
import EquiposPage from "./pages/EquiposPage";
import CampeonatosPage from "./pages/CampeonatosPage";
import UniformesPage from "./pages/UniformesPage";
import PagosPage from "./pages/PagosPage";
import EntrenamientosPage from "./pages/EntrenamientosPage";
import DocumentacionPage from "./pages/DocumentacionPage";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/jugadores" element={<JugadoresPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/equipos" element={<EquiposPage />} />
            <Route path="/campeonatos" element={<CampeonatosPage />} />
            <Route path="/uniformes" element={<UniformesPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/entrenamientos" element={<EntrenamientosPage />} />
            <Route path="/documentacion" element={<DocumentacionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
