import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Vistas Públicas
import Home from './views/Home';
import Tienda from './views/Tienda';
import Producto from './views/Producto';
import Carrito from './views/Carrito';
import Checkout from './views/Checkout';
import Confirmacion from './views/Confirmacion';
import Login from './views/Login';
import Registro from './views/Registro';
import Nosotros from './views/Nosotros';
import Blog from './views/BLog';
import BlogArticulo1 from './views/BlogArticulo1';
import BlogArticulo2 from './views/BlogArticulo2';
import Contacto from './views/Contacto';
import Perfil from './views/Perfil';
import PagoError from './views/PagoError';
import NotFound from './views/NotFound'; // <--- IMPORTAR

// Vistas Admin
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './views/admin/AdminDashboard';
import AdminProductos from './views/admin/AdminProductos';
import AdminProductoForm from './views/admin/AdminProductoForm';
import AdminUsuarios from './views/admin/AdminUsuarios';
import AdminUsuarioForm from './views/admin/AdminUsuarioForm';
import AdminResenas from './views/admin/AdminResenas';
import AdminPedidos from './views/admin/AdminPedidos';

// Componente de Seguridad
import RutaProtegida from './components/RutaProtegida'; // <--- IMPORTAR

// Layout para las vistas públicas (Header + Main + Footer)
const PublicLayout = () => {
  return (
    <>
      <Header />
      <main className="py-5" style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- ZONA PÚBLICA --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:codigo" element={<Producto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/pago-error" element={<PagoError />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog-articulo-1" element={<BlogArticulo1 />} />
          <Route path="/blog-articulo-2" element={<BlogArticulo2 />} />
          <Route path="/contacto" element={<Contacto />} />

          <Route element={<RutaProtegida />}>
             <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route element={<RutaProtegida soloAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            
            <Route path="productos" element={<AdminProductos />} />
            <Route path="productos/nuevo" element={<AdminProductoForm />} />
            <Route path="productos/editar/:codigo" element={<AdminProductoForm />} />
            
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="usuarios/nuevo" element={<AdminUsuarioForm />} />
            <Route path="usuarios/editar/:run" element={<AdminUsuarioForm />} />
            <Route path="resenas" element={<AdminResenas />} />
            <Route path="pedidos" element={<AdminPedidos />} />
          </Route>
        </Route>

        {/* --- RUTA 404 (Siempre al final) --- */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;