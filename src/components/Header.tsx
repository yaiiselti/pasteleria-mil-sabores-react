import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
// 1. IMPORTANTE: Agregamos 'useLocation' para saber la ruta actual
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { totalItems } = useCarrito();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // 2. Obtenemos la ubicación actual (ej: "/tienda")
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 3. Función auxiliar para saber si un link está activo
  // Si la ruta actual es igual a la del link, devuelve la clase negrita
  const getActiveClass = (path: string) => {
    return location.pathname === path ? "nav-link-activo" : "";
  };

  return (
    <Navbar bg="light" expand="lg" className="main-header sticky-top shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="nav-logo">
          <h1 className="logo-text">Pastelería Mil Sabores</h1>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          <Nav className="me-auto nav-menu">
            {/* 4. APLICAMOS LA LÓGICA A CADA ENLACE */}
            <Nav.Link as={Link} to="/" className={getActiveClass('/')}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/tienda" className={getActiveClass('/tienda')}>
              Productos
            </Nav.Link>
            <Nav.Link as={Link} to="/nosotros" className={getActiveClass('/nosotros')}>
              Nosotros
            </Nav.Link>
            <Nav.Link as={Link} to="/blog" className={getActiveClass('/blog')}>
              Blog
            </Nav.Link>
            <Nav.Link as={Link} to="/contacto" className={getActiveClass('/contacto')}>
              Contacto
            </Nav.Link>
          </Nav>

          <Nav className="nav-user align-items-center">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" className={`nav-publico ${getActiveClass('/login')}`}>
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/registro" className={`nav-publico ${getActiveClass('/registro')}`}>
                  Registrar
                </Nav.Link>
              </>
            ) : (
              <NavDropdown 
                title={
                  // Usamos el color chocolate directamente para asegurar el estilo "natural"
                  <span className=" " style={{ color: '#8B4513', fontSize: '1.1rem' }}>
                    Hola, {user?.nombre}
                  </span>
                }
              >
                {user?.rol === 'Administrador' && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin">
                      <i className="fa-solid fa-gauge me-2"></i> Panel Admin
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}
                <NavDropdown.Item as={Link} to="/perfil">
                  <i className="fa-solid fa-user me-2"></i> Mi Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="fa-solid fa-right-from-bracket me-2"></i> Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            )}

            <Nav.Link as={Link} to="/carrito" id="cart-link" className={`ms-3 d-flex align-items-center ${getActiveClass('/carrito')}`}>
              <i className="fa-solid fa-cart-shopping fs-5 me-1" style={{ color: '#8B4513' }}></i> 
              <span style={{ color: '#8B4513' }}>Carrito</span>
              
              {totalItems > 0 && (
               
                <span 
                  className="badge rounded-pill ms-2" 
                  style={{ backgroundColor: '#8B4513', color: 'white' }}
                >
                  {totalItems}
                </span>
              )}
            </Nav.Link>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;