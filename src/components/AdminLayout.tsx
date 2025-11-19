import { Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';

function AdminLayout() {
  const location = useLocation(); // Hook para saber en qué página estamos (para resaltar el menú)

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      
      {/* 1. HEADER DEL ADMIN (Negro/Oscuro para diferenciar) */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4 shadow-sm">
        <Navbar.Brand as={Link} to="/admin" className="logo-text text-white">
          Admin Mil Sabores
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
          <Nav>
            {/* Botón para salir y volver a la tienda pública */}
            <Nav.Link as={Link} to="/" className="text-light d-flex align-items-center">
               Volver a la Tienda <span className="ms-2">→</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* 2. CUERPO PRINCIPAL */}
      <Container fluid className="flex-grow-1">
        <Row className="h-100">
          
          {/* A. BARRA LATERAL (Sidebar) */}
          <Col md={3} lg={2} className="bg-white border-end py-4 d-none d-md-block sidebar">
            <Nav className="flex-column gap-2">
              
              <Nav.Link 
                as={Link} to="/admin" 
                className={`px-3 py-2 rounded ${location.pathname === "/admin" ? "bg-primary text-white" : "text-dark"}`}
              >
                Dashboard
              </Nav.Link>

              <Nav.Link 
                as={Link} to="/admin/productos" 
                className={`px-3 py-2 rounded ${location.pathname.includes("/productos") ? "bg-primary text-white" : "text-dark"}`}
              >
                Productos
              </Nav.Link>

              <Nav.Link 
                as={Link} to="/admin/usuarios" 
                className={`px-3 py-2 rounded ${location.pathname.includes("/usuarios") ? "bg-primary text-white" : "text-dark"}`}
              >
                Usuarios
              </Nav.Link>

            </Nav>
          </Col>

          {/* B. CONTENIDO DE LA VISTA (Aquí se cargará el Dashboard, Productos, etc.) */}
          <Col md={9} lg={10} className="py-4 px-md-4">
            <Outlet /> 
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default AdminLayout;