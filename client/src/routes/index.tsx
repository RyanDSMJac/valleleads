import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Leads from "../pages/Leads";
import Negotiations from "../pages/Negotiations";
import Profile from "../pages/Profile";
import Users from "../pages/Users";
import Customers from "../pages/Customers";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona raiz para dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotas com layout principal */}
        <Route
          path="/dashboard"
          element={
            <MainLayout currentPath={""} onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            } }>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/leads"
          element={
            <MainLayout currentPath={""} onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            } }>
              <Leads />
            </MainLayout>
          }
        />
        <Route
          path="/funil"
          element={
            <MainLayout currentPath={""} onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            } }>
              <Negotiations />
            </MainLayout>
          }
        />
        <Route
          path="/perfil"
          element={
            <MainLayout currentPath={""} onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            } }>
              <Profile />
            </MainLayout>
          }
        />

        {/* Tela de Usuários — proteção de role aplicada dentro do componente */}
        <Route
          path="/usuarios"
          element={
            <MainLayout currentPath={""} onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            } }>
              <Users />
            </MainLayout>
          }
        />

        {/* Tela de Clientes */}
        <Route
          path="/clientes"
          element={
            <MainLayout currentPath={""} onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            } }>
              <Customers />
            </MainLayout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound onNavigate={function (path: string): void {
          throw new Error("Function not implemented.");
        } } />} />
      </Routes>
    </BrowserRouter>
  );
}
