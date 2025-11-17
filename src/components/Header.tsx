// Archivo: src/components/Header.tsx

// 1. Importamos los componentes de React-Bootstrap que necesitamos
import { Navbar, Nav, Container } from 'react-bootstrap';
// 2. Importamos el componente "Link" del router para la navegación
import { Link } from 'react-router-dom';

function Header() {
  return (
    // Usamos el componente <Navbar> de Bootstrap
    <Navbar bg="light" expand="lg" className="main-header">
      <Container>
        {/* Usamos "Link" para el logo.
          "as={Link}" le dice a Bootstrap que "actúe como un enlace de React Router".
        */}
        <Navbar.Brand as={Link} to="/" className="nav-logo">
          <h1 className="logo-text">Pastelería Mil Sabores</h1>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          {/* Menú Principal (Tienda) */}
          <Nav className="me-auto nav-menu">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/tienda">Productos</Nav.Link>
            <Nav.Link as={Link} to="/nosotros">Nosotros</Nav.Link>
            <Nav.Link as={Link} to="/blog">Blog</Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
          </Nav>

          {/* Menú de Usuario (Sesión y Carrito) */}
          <Nav className="nav-user">
            {/* Aquí recrearemos la lógica de "Mi Perfil" vs "Login"
              con el Context API en la Fase 3.
              Por ahora, ponemos los enlaces públicos.
            */}
            <Nav.Link as={Link} to="/login" className="nav-publico">Iniciar Sesión</Nav.Link>
            <Nav.Link as={Link} to="/registro" className="nav-publico">Registrar</Nav.Link>
            
            {/*
            <Nav.Link as={Link} to="/perfil" className="nav-cliente">Mi Perfil</Nav.Link>
            <Nav.Link as={Link} to="/admin" className="nav-admin">Panel Admin</Nav.Link>
            <Nav.Link as={Link} to="#" id="logout-link" className="nav-logueado">Cerrar Sesión</Nav.Link>
            */}
            
            <Nav.Link as={Link} to="/carrito" id="cart-link">
              Carrito (0)
            </Nav.Link>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;