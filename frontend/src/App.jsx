import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';

import Home from './pages/Home.jsx';
import Carta from './pages/Carta.jsx';
import Eventos from './pages/Eventos.jsx';
import SobreNosotros from './pages/SobreNosotros.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import RecuperarPassword from './pages/RecuperarPassword.jsx';
import RestablecerPassword from './pages/RestablecerPassword.jsx';
import Reservas from './pages/Reservas.jsx';
import Panel from './pages/Panel.jsx';
import PanelProductos from './pages/PanelProductos.jsx';
import PanelReservasSalon from './pages/PanelReservasSalon.jsx';
import PanelEstadisticas from './pages/PanelEstadisticas.jsx';
import PanelClientes from './pages/PanelClientes.jsx';
import PanelAmbientes from './pages/PanelAmbientes.jsx';
import PanelFinanzas from './pages/PanelFinanzas.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/restablecer-password" element={<RestablecerPassword />} />
        <Route path="/reservas" element={<Reservas />} />

        <Route path="/panel" element={<RutaProtegida><Panel /></RutaProtegida>} />
        <Route path="/panel/productos" element={
          <RutaProtegida rolesPermitidos={['admin', 'cocina', 'almacen']}><PanelProductos /></RutaProtegida>
        } />
        <Route path="/panel/reservas-salon" element={
          <RutaProtegida rolesPermitidos={['admin', 'salon']}><PanelReservasSalon /></RutaProtegida>
        } />
        <Route path="/panel/estadisticas" element={
          <RutaProtegida rolesPermitidos={['admin', 'caja']}><PanelEstadisticas /></RutaProtegida>
        } />
        <Route path="/panel/clientes" element={
          <RutaProtegida rolesPermitidos={['admin']}><PanelClientes /></RutaProtegida>
        } />
        <Route path="/panel/ambientes" element={
          <RutaProtegida rolesPermitidos={['admin']}><PanelAmbientes /></RutaProtegida>
        } />
        <Route path="/panel/finanzas" element={
          <RutaProtegida rolesPermitidos={['admin', 'caja']}><PanelFinanzas /></RutaProtegida>
        } />

        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}
