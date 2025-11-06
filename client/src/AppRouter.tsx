import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import ABM from './pages/ABM';
import Clientes from './pages/Clientes';
import Facturacion from './pages/Facturacion';
import SidebarLayout from './components/SideBar/SidebarLayout';
import { Container } from '@mui/material';
import AuthLayout from './Layout/AuthLayout';
import LoginPage from './pages/Login/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PersonasABM from './pages/ABM/PersonasABM';
import ProductosABM from './pages/ABM/ProductosABM';
import Pedidos from './pages/Pedidos';

// Placeholder components for sub-routes
const ClientesABM = () => <Container><h3>Submenú Clientes (ABM)</h3></Container>;
const ConsultasVentas = () => <Container><h3>Submenú Consultas de Ventas</h3></Container>;
const FacturacionClientes = () => <Container><h3>Submenú Facturación (Clientes)</h3></Container>;

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Ruta de login */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>

      {/* Rutas protegidas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <SidebarLayout>
              <Outlet />
            </SidebarLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<h2>Bienvenido al Sistema</h2>} />
        <Route path="abm" element={<ABM />}>
            <Route path="personas" element={<PersonasABM />} />
            <Route path="productos" element={<ProductosABM />} />
            <Route path="clientes" element={<ClientesABM />} />
        </Route>
        <Route path="clientes" element={<Clientes />}>
            <Route path="consultas-ventas" element={<ConsultasVentas />} />
            <Route path="facturacion-clientes" element={<FacturacionClientes />} />
        </Route>
        <Route path="facturacion" element={<Facturacion />} />
      </Route>

      <Route path="pedidos" element={<Pedidos />} />

      {/* Redirección por defecto al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;