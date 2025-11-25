import { useState } from 'react';
import { Container, Card, Row, Col, Badge, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getUsuarios, saveUsuario } from '../services/PasteleriaService';
import type { IUsuario } from '../services/PasteleriaService';
import ModalConfirmacion from '../components/ModalConfirmacion';

function Perfil() {
  const { user, logout, updateUserSession } = useAuth();
  const { showNotification } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [datosEditables, setDatosEditables] = useState({
    nombre: '', apellidos: '', email: '', run: '', password: ''
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ordenACancelar, setOrdenACancelar] = useState<any>(null);
  const [refresh, setRefresh] = useState(false); 

  const calcularEdad = (fecha?: string) => {
    if (!fecha) return 0;
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), cumple.getMonth(), cumple.getDate())) edad--;
    return edad;
  };

  const tieneDescuentoEdad = user?.fechaNacimiento ? calcularEdad(user.fechaNacimiento) >= 50 : false;
  const tieneDescuentoCodigo = user?.codigoPromo === 'FELICES50';
  const sinBeneficios = !tieneDescuentoEdad && !tieneDescuentoCodigo;

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
        tipo: user?.rol === 'Administrador' ? 'Administrador' : 'Cliente',
        // Mantenemos datos importantes
        fechaNacimiento: user?.fechaNacimiento,
        codigoPromo: user?.codigoPromo
      };
      await saveUsuario(usuarioActualizado);
      updateUserSession({ nombre: datosEditables.nombre });
      showNotification('Perfil actualizado correctamente', 'success');
      setShowModal(false);
    } catch (error) {
      showNotification('Error al actualizar el perfil', 'danger');
    }
  };

  const abrirModalCancelar = (pedido: any) => {
    setOrdenACancelar(pedido);
    setShowCancelModal(true);
  };

  const confirmarCancelacion = () => {
    if (!ordenACancelar) return;
    const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
    const historialActualizado = historial.map((orden: any) => {
      if (orden.id === ordenACancelar.id) {
        return { ...orden, estado: 'Cancelado' }; 
      }
      return orden;
    });
    localStorage.setItem('historialPedidos', JSON.stringify(historialActualizado));
    showNotification(`Pedido #${ordenACancelar.id} cancelado exitosamente.`, 'warning');
    setShowCancelModal(false);
    setOrdenACancelar(null);
    setRefresh(!refresh); 
  };

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'En Preparación': return 'info';
      case 'En Reparto': return 'primary';
      case 'Entregado': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'secondary';
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
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center">
              <div className="mb-3"><i className="fa-solid fa-circle-user fa-6x text-secondary"></i></div>
              <h4>{user.nombre}</h4>
              <p className="text-muted mb-1">{user.email}</p>
              <Badge bg="info" className="mb-3">{user.rol}</Badge>
              <div className="d-grid gap-2 mt-3">
                <Button variant="outline-primary" onClick={handleOpenModal}><i className="fa-solid fa-pen-to-square me-2"></i> Editar Mis Datos</Button>
                <Button variant="outline-danger" onClick={logout}>Cerrar Sesión</Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-warning text-dark fw-bold"><i className="fa-solid fa-gift me-2"></i> Mis Beneficios</Card.Header>
            <Card.Body>
              {sinBeneficios ? (
                <p className="text-muted small mb-0 text-center">No tienes beneficios activos actualmente.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {tieneDescuentoEdad && <Alert variant="success" className="mb-0 py-2 small"><i className="fa-solid fa-cake-candles me-2"></i><strong>50% DCTO</strong> (Edad de Oro)</Alert>}
                  {tieneDescuentoCodigo && <Alert variant="info" className="mb-0 py-2 small"><i className="fa-solid fa-ticket me-2"></i><strong>10% DCTO</strong> (Cupón Especial)</Alert>}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3"><h5 className="mb-0">Historial de Pedidos</h5></Card.Header>
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
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((pedido: any, index: number) => (
                        <tr key={index}>
                          <td className="fw-bold">#{pedido.id}</td>
                          <td>{pedido.fechaEmision || pedido.fecha}</td>
                          <td className="text-primary fw-bold">${(pedido.total || 0).toLocaleString('es-CL')}</td>
                          <td>
                            <Badge bg={getBadgeVariant(pedido.estado || 'Pendiente')}>
                              {pedido.estado || 'Pendiente'}
                            </Badge>
                          </td>
                          <td>
                            {/* BOTÓN ROJO SÓLIDO (Tu requerimiento) */}
                            {(pedido.estado === 'Pendiente' || !pedido.estado) ? (
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => abrirModalCancelar(pedido)}
                                className="px-3"
                              >
                                Cancelar
                              </Button>
                            ) : (
                              <span className="text-muted small fst-italic">
                                {pedido.estado === 'Cancelado' ? 'Cancelado' : 'En proceso'}
                              </span>
                            )}
                          </td>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="logo-text text-primary">Editar Mis Datos</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" value={datosEditables.nombre} onChange={(e) => setDatosEditables({...datosEditables, nombre: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Apellidos</Form.Label><Form.Control type="text" value={datosEditables.apellidos} onChange={(e) => setDatosEditables({...datosEditables, apellidos: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>RUN (No editable)</Form.Label><Form.Control type="text" value={datosEditables.run} disabled className="bg-light" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email (No editable)</Form.Label><Form.Control type="email" value={datosEditables.email} disabled className="bg-light" /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="btn-secundario">Cancelar</Button>
          <Button variant="primary" onClick={handleGuardarCambios} className="btn-principal">Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>

      <ModalConfirmacion
        show={showCancelModal}
        titulo="Cancelar Pedido"
        onCancelar={() => setShowCancelModal(false)}
        onConfirmar={confirmarCancelacion}
      >
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation fa-3x text-warning mb-3"></i>
          <p>¿Estás seguro de cancelar el pedido <strong>#{ordenACancelar?.id}</strong>?</p>
        </div>
      </ModalConfirmacion>

    </Container>
  );
}

export default Perfil;