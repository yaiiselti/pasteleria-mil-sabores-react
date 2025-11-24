import { useState, } from 'react';
import { Container, Card, Row, Col, Badge, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getUsuarios, saveUsuario } from '../services/PasteleriaService';
import type { IUsuario } from '../services/PasteleriaService';

function Perfil() {
  const { user, logout, updateUserSession } = useAuth();
  const { showNotification } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [datosEditables, setDatosEditables] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    run: '',
    password: ''
  });

  // --- 1. LÓGICA DE BENEFICIOS ---
  const calcularEdad = (fecha?: string) => {
    if (!fecha) return 0;
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  const tieneDescuentoEdad = user?.fechaNacimiento ? calcularEdad(user.fechaNacimiento) >= 50 : false;
  const tieneDescuentoCodigo = user?.codigoPromo === 'FELICES50';
  const sinBeneficios = !tieneDescuentoEdad && !tieneDescuentoCodigo;
  // -------------------------------

  const obtenerMisPedidos = () => {
    if (!user) return [];
    const historialGlobal = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
    const misPedidos = historialGlobal.filter((orden: any) => 
      orden.cliente.email.toLowerCase() === user.email.toLowerCase()
    );
    return misPedidos.reverse();
  };

  const pedidos = obtenerMisPedidos();

  const handleOpenModal = async () => {
    if (user) {
      const usuariosDB = await getUsuarios();
      const usuarioReal = usuariosDB.find(u => u.email === user.email);
      
      if (usuarioReal) {
        setDatosEditables({
          nombre: usuarioReal.nombre,
          apellidos: usuarioReal.apellidos,
          email: usuarioReal.email,
          run: usuarioReal.run,
          password: usuarioReal.password || '' 
        });
        setShowModal(true);
      }
    }
  };

  const handleGuardarCambios = async () => {
    try {
      const usuarioActualizado: IUsuario = {
        ...datosEditables,
        // Mantenemos los datos que no se editan en el modal
        fechaNacimiento: user?.fechaNacimiento,
        codigoPromo: user?.codigoPromo,
        tipo: user?.rol === 'Administrador' ? 'Administrador' : 'Cliente'
      };

      await saveUsuario(usuarioActualizado);
      updateUserSession({ 
        nombre: datosEditables.nombre, 
        // Aseguramos que la sesión no pierda estos datos al actualizar
        fechaNacimiento: user?.fechaNacimiento,
        codigoPromo: user?.codigoPromo
      });

      showNotification('Perfil actualizado correctamente', 'success');
      setShowModal(false);
    } catch (error) {
      showNotification('Error al actualizar el perfil', 'danger');
    }
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h3>Debes iniciar sesión para ver tu perfil.</h3>
        <Link to="/login" className="btn btn-principal mt-3">Ir al Login</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="logo-text text-center mb-5">Mi Perfil</h2>

      <Row className="g-4">
        
        {/* COLUMNA IZQUIERDA: DATOS Y BENEFICIOS */}
        <Col md={4}>
          {/* Tarjeta de Datos */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fa-solid fa-circle-user fa-6x text-secondary"></i>
              </div>
              <h4>{user.nombre}</h4>
              <p className="text-muted mb-1">{user.email}</p>
              <Badge bg="info" className="mb-3">{user.rol}</Badge>
              
              <div className="d-grid gap-2 mt-3">
                <Button variant="outline-primary" onClick={handleOpenModal}>
                  <i className="fa-solid fa-pen-to-square me-2"></i> Editar Mis Datos
                </Button>
                <Button variant="outline-danger" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* 2. NUEVA TARJETA: MIS BENEFICIOS */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-warning text-dark fw-bold">
              <i className="fa-solid fa-gift me-2"></i> Mis Beneficios
            </Card.Header>
            <Card.Body>
              {sinBeneficios ? (
                <p className="text-muted small mb-0 text-center">
                  No tienes beneficios activos actualmente.
                </p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {tieneDescuentoEdad && (
                    <Alert variant="success" className="mb-0 py-2 small">
                      <i className="fa-solid fa-cake-candles me-2"></i>
                      <strong>50% DCTO</strong> (Edad de Oro)
                    </Alert>
                  )}
                  {tieneDescuentoCodigo && (
                    <Alert variant="info" className="mb-0 py-2 small">
                      <i className="fa-solid fa-ticket me-2"></i>
                      <strong>10% DCTO</strong> (Cupón Especial)
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA DERECHA: HISTORIAL */}
        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Historial de Pedidos</h5>
            </Card.Header>
            <Card.Body>
              {pedidos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-bag-shopping fa-2x mb-3"></i>
                  <p>Aún no has realizado pedidos con esta cuenta.</p>
                  <Link to="/tienda" className="btn btn-sm btn-principal">Ir a comprar</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Orden #</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((pedido: any, index: number) => (
                        <tr key={index}>
                          <td className="fw-bold">#{pedido.id}</td>
                          <td>{pedido.fecha}</td>
                          <td className="text-primary fw-bold">
                            ${(pedido.total || 0).toLocaleString('es-CL')}
                          </td>
                          <td><Badge bg="success">Entregado</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL DE EDICIÓN */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="logo-text text-primary">Editar Mis Datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control 
                type="text" 
                value={datosEditables.nombre} 
                onChange={(e) => setDatosEditables({...datosEditables, nombre: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control 
                type="text" 
                value={datosEditables.apellidos} 
                onChange={(e) => setDatosEditables({...datosEditables, apellidos: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>RUN (No editable)</Form.Label>
              <Form.Control type="text" value={datosEditables.run} disabled className="bg-light" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email (No editable)</Form.Label>
              <Form.Control type="email" value={datosEditables.email} disabled className="bg-light" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="btn-secundario">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarCambios} className="btn-principal">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default Perfil;