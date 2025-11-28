import { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importamos Link para navegar
import { getProductos, getAllResenas, getAllPedidos } from '../../services/PasteleriaService';
import { getUsuarios } from '../../services/AdminService';
import { getAllMensajes } from '../../services/ContactoService'; 

function AdminDashboard() {
  // Estados para guardar los conteos reales
  const [totalProductos, setTotalProductos] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalMensajes, setTotalMensajes] = useState(0);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      const prods = await getProductos();
      const users = await getUsuarios();
      const reviews = await getAllResenas();
      const pedidos = await getAllPedidos();
      const mensajes = await getAllMensajes(); 
      setTotalProductos(prods.length);
      setTotalUsuarios(users.length);
      setTotalResenas(reviews.length);
      setTotalPedidos(pedidos.length);
      setTotalMensajes(mensajes.length);
    };
    cargarDatos();
  }, []);

  return (
    <div>
      <h2 className="logo-text mb-4">Panel de Control</h2>
      <p className="text-muted mb-5">Bienvenido al sistema de gestión de Pastelería Mil Sabores.</p>

      <Row className="g-4">

        {/* TARJETA 1: PRODUCTOS (Azul) */}
        <Col md={4}>
          <Card
            as={Link}
            to="/admin/productos"
            className="border-0 shadow-sm text-white bg-primary h-100 text-decoration-none transform-hover"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-box-open fa-3x mb-3 opacity-75"></i>
              <h1 className="display-4 fw-bold mb-0">{totalProductos}</h1>
              <p className="mb-0 fs-5 text-white-50">Productos Activos</p>
              <span className="mt-3 btn btn-light btn-sm rounded-pill px-3 text-primary fw-bold">
                Gestionar <i className="fa-solid fa-arrow-right ms-1"></i>
              </span>
            </Card.Body>
          </Card>
        </Col>

        {/* TARJETA 2: USUARIOS (Verde) */}
        <Col md={4}>
          <Card
            as={Link}
            to="/admin/usuarios"
            className="border-0 shadow-sm text-white bg-success h-100 text-decoration-none"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-users fa-3x mb-3 opacity-75"></i>
              <h1 className="display-4 fw-bold mb-0">{totalUsuarios}</h1>
              <p className="mb-0 fs-5 text-white-50">Usuarios Registrados</p>
              <span className="mt-3 btn btn-light btn-sm rounded-pill px-3 text-success fw-bold">
                Gestionar <i className="fa-solid fa-arrow-right ms-1"></i>
              </span>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            as={Link}
            to="/admin/resenas"
            className="border-0 shadow-sm text-white bg-info h-100 text-decoration-none"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-star fa-3x mb-3 text-white opacity-75"></i>
              <h1 className="display-4 fw-bold mb-0">{totalResenas}</h1>
              <p className="mb-0 fs-5 text-white-50">Reseñas</p>
              <span className="mt-3 btn btn-light btn-sm rounded-pill px-3 text-info fw-bold">
                Gestionar <i className="fa-solid fa-arrow-right ms-1"></i>
              </span>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card 
            as={Link} 
            to="/admin/pedidos" 
            className="border-0 shadow-sm text-white bg-danger h-100 text-decoration-none"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-receipt fa-3x mb-3 opacity-75"></i>
              <h1 className="display-4 fw-bold mb-0">{totalPedidos}</h1>
              <p className="mb-0 fs-5 text-white-50">Pedidos Totales</p>
              <span className="mt-3 btn btn-light btn-sm rounded-pill px-3 text-danger fw-bold">
                Gestionar <i className="fa-solid fa-arrow-right ms-1"></i>
              </span>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            as={Link}
            to="/admin/mensajes"
            className="border-0 shadow-sm text-white bg-secondary h-100 text-decoration-none"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-envelope fa-3x mb-3 opacity-75"></i>
              <h1 className="display-4 fw-bold mb-0">{totalMensajes}</h1>
              <p className="mb-0 fs-5 text-white-50">Mensajes</p>
              <span className="mt-3 btn btn-light btn-sm rounded-pill px-3 text-secondary fw-bold">
                Gestionar <i className="fa-solid fa-arrow-right ms-1"></i>
              </span>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            as={Link}
            to="/"
            className="border-0 shadow-sm text-white bg-warning h-100 text-decoration-none"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-shop fa-3x mb-3 opacity-75 text-dark"></i>
              <h1 className="display-4 fw-bold mb-0 text-dark">Tienda</h1>
              <p className="mb-0 fs-5 text-dark opacity-75">Ver Vista Cliente</p>
              <span className="mt-3 btn btn-dark btn-sm rounded-pill px-3 fw-bold">
                Ir Ahora <i className="fa-solid fa-arrow-up-right-from-square ms-1"></i>
              </span>
            </Card.Body>
          </Card>
        </Col>
        

      </Row>
    </div>
  );
}

export default AdminDashboard;