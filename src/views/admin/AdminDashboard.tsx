import { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; 
import { getProductos, getAllResenas, getAllPedidos } from '../../services/PasteleriaService';
import { getUsuarios } from '../../services/AdminService';
import { getAllMensajes } from '../../services/ContactoService'; 

function AdminDashboard() {
  const [totalProductos, setTotalProductos] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalMensajes, setTotalMensajes] = useState(0);
  
  // 1. NUEVO ESTADO: Contador específico para Nivel 2 (Mayorista)
  const [pedidosPorConfirmar, setPedidosPorConfirmar] = useState(0);

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

      // 2. LÓGICA DE DETECCIÓN: Filtramos los que requieren acción inmediata
      const porConfirmar = pedidos.filter((p: any) => p.estado === 'Por Confirmar Stock');
      setPedidosPorConfirmar(porConfirmar.length);
    };
    cargarDatos();
  }, []);

  return (
    <div>
      <h2 className="logo-text mb-4">Panel de Control</h2>

      {/* 3. ALERTA DE ACCIÓN INMEDIATA: Solo aparece si hay pedidos Nivel 2 */}
      {pedidosPorConfirmar > 0 ? (
        <Alert variant="warning" className="mb-4 shadow-sm border-warning d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <div className="bg-warning text-dark rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <i className="fa-solid fa-boxes-stacked fa-xl"></i>
                </div>
                <div>
                    <h5 className="alert-heading mb-1 fw-bold text-dark">
                        atención, Tienes {pedidosPorConfirmar} pedido(s) Mayorista(s)
                    </h5>
                    <p className="mb-0 text-dark">
                        Requieren confirmación manual de stock antes de pasar a cocina.
                    </p>
                </div>
            </div>
            <Link to="/admin/pedidos" className="btn btn-dark fw-bold px-4">
                Revisar Ahora <i className="fa-solid fa-arrow-right ms-2"></i>
            </Link>
        </Alert>
      ) : (
        <p className="text-muted mb-5">Bienvenido al sistema de gestión de Pastelería Mil Sabores.</p>
      )}

      <Row className="g-4">

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

        {/* 4. MODIFICADO: Tarjeta de Pedidos con indicador visual si hay pendientes */}
        <Col md={4}>
          <Card 
            as={Link} 
            to="/admin/pedidos" 
            className={`border-0 shadow-sm text-white h-100 text-decoration-none ${pedidosPorConfirmar > 0 ? 'bg-warning' : 'bg-danger'}`}
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <div className="position-relative">
                  <i className={`fa-solid fa-receipt fa-3x mb-3 opacity-75 ${pedidosPorConfirmar > 0 ? 'text-dark' : 'text-white'}`}></i>
                  {pedidosPorConfirmar > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                        {pedidosPorConfirmar}
                        <span className="visually-hidden">pedidos por confirmar</span>
                      </span>
                  )}
              </div>
              
              <h1 className={`display-4 fw-bold mb-0 ${pedidosPorConfirmar > 0 ? 'text-dark' : 'text-white'}`}>
                  {totalPedidos}
              </h1>
              <p className={`mb-0 fs-5 ${pedidosPorConfirmar > 0 ? 'text-dark opacity-75' : 'text-white-50'}`}>
                  Pedidos Totales
              </p>
              
              <span className={`mt-3 btn btn-sm rounded-pill px-3 fw-bold ${pedidosPorConfirmar > 0 ? 'btn-dark text-warning' : 'btn-light text-danger'}`}>
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
            className="border-0 shadow-sm text-white bg-dark h-100 text-decoration-none"
            style={{ transition: 'transform 0.2s' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
              <i className="fa-solid fa-shop fa-3x mb-3 opacity-75 text-white"></i>
              <h1 className="display-4 fw-bold mb-0 text-white">Tienda</h1>
              <p className="mb-0 fs-5 text-white-50">Ver Vista Cliente</p>
              <span className="mt-3 btn btn-outline-light btn-sm rounded-pill px-3 fw-bold">
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