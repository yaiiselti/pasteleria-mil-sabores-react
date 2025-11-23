import { Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  // 2. CONSUMIMOS LA FUNCIÓN LOGOUT
  const { logout } = useAuth();

  // Función auxiliar para saber si un link está activo
  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.includes(path)) return true;
    return false;
  };

  // 3. MANEJADOR DE CIERRE DE SESIÓN
  const handleLogout = () => {
    logout();
    navigate('/Login'); // Redirige al login después de salir
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      {/* HEADER ADMIN (Oscuro) */}
      <Navbar bg="dark" variant="dark" expand="md" className="px-3 shadow-sm sticky-top">
        <Navbar.Brand as={Link} to="/admin" className="logo-text text-white">
          Admin Mil Sabores
        </Navbar.Brand>

        {/* Botón Hamburguesa */}
        <Navbar.Toggle aria-controls="admin-navbar-nav" />

        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto">

            {/* --- MENÚ DE NAVEGACIÓN (SOLO MÓVIL) --- */}
            <div className="d-md-none border-bottom border-secondary pb-2 mb-2">
              <Nav.Link as={Link} to="/admin" active={isActive('/admin')}>
                <i className="fa-solid fa-gauge me-2"></i> inicio
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/productos" active={isActive('/admin/productos')}>
                <i className="fa-solid fa-box me-2"></i> Productos
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/usuarios" active={isActive('/admin/usuarios')}>
                <i className="fa-solid fa-users me-2"></i> Usuarios
              </Nav.Link>

              <Nav.Link as={Link} to="/admin/resenas" active={isActive('/admin/resenas')}>
                <i className="fa-solid fa-star me-2"></i> Reseñas
              </Nav.Link>

              {/* 4. BOTÓN CERRAR SESIÓN (MÓVIL) */}
              <Nav.Link onClick={handleLogout} className="text-danger fw-bold">
                <i className="fa-solid fa-power-off me-2"></i> Cerrar Sesión
              </Nav.Link>
            </div>
            {/* --------------------------------------- */}

            {/* Botón de Volver a la Tienda (Siempre visible en el menú superior) */}
            <Nav.Link as={Link} to="/" className="text-white d-flex align-items-center">
              Volver a la Tienda <i className="fa-solid fa-arrow-right-from-bracket ms-2"></i>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="flex-grow-1">
        <Row className="h-100">

          {/* BARRA LATERAL (SOLO ESCRITORIO) */}
          <Col md={3} lg={2} className="bg-white border-end py-4 d-none d-md-block sidebar" style={{ minHeight: '90vh' }}>
            <div className="sticky-top" style={{ top: '80px' }}>
              <h6 className="text-uppercase text-muted small fw-bold mb-3 px-3">Menú Principal</h6>
              <Nav className="flex-column gap-1">

                <Nav.Link
                  as={Link} to="/admin"
                  className={`px-3 py-2 rounded ${isActive('/admin') ? "bg-primary text-white" : "text-dark"}`}
                >
                  <i className="fa-solid fa-gauge me-2"></i> inicio
                </Nav.Link>

                <Nav.Link
                  as={Link} to="/admin/productos"
                  className={`px-3 py-2 rounded ${isActive('/admin/productos') ? "bg-primary text-white" : "text-dark"}`}
                >
                  <i className="fa-solid fa-box me-2"></i> Productos
                </Nav.Link>

                <Nav.Link
                  as={Link} to="/admin/usuarios"
                  className={`px-3 py-2 rounded ${isActive('/admin/usuarios') ? "bg-primary text-white" : "text-dark"}`}
                >
                  <i className="fa-solid fa-users me-2"></i> Usuarios
                </Nav.Link>

                {/* ... después de Usuarios ... */}
                  <Nav.Link 
                    as={Link} to="/admin/resenas" 
                    className={`px-3 py-2 rounded ${isActive('/admin/resenas') ? "bg-primary text-white" : "text-dark"}`}
                  >
                    <i className="fa-solid fa-star me-2"></i> Reseñas
                  </Nav.Link>

                <hr className="my-2" />

                {/* 5. BOTÓN CERRAR SESIÓN (ESCRITORIO) */}
                <Nav.Link
                  onClick={handleLogout}
                  className="px-3 py-2 rounded text-danger hover-danger"
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-power-off me-2"></i> Cerrar Sesión
                </Nav.Link>

              </Nav>
            </div>
          </Col>

          {/* CONTENIDO PRINCIPAL */}
          <Col md={9} lg={10} className="py-4 px-md-4">
            <Outlet />
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default AdminLayout;