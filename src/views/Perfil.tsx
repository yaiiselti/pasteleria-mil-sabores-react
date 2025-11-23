import { useState } from 'react';
import { Container, Card, Row, Col, Badge, Table, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getUsuarios, saveUsuario} from '../services/PasteleriaService';
import type{ IUsuario } from '../services/PasteleriaService';

function Perfil() {
  const { user, logout, updateUserSession } = useAuth();
  const { showNotification } = useNotification();

  // Estados para el Modal de Edición
  const [showModal, setShowModal] = useState(false);
  const [datosEditables, setDatosEditables] = useState({
    nombre: '',
    apellidos: '',
    email: '', // El email no se edita, pero lo necesitamos para buscar
    run: '',   // El run no se edita
    password: '' // Mantenemos la password oculta
  });

  // Datos históricos (Simulados)
  const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
  const ultimaOrden = JSON.parse(localStorage.getItem('ultimaOrden') || 'null');
  const pedidos = ultimaOrden ? [ultimaOrden, ...historial] : historial;

  // Cargar datos reales del usuario al abrir el modal
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
          password: usuarioReal.password || '' // Mantenemos la clave
        });
        setShowModal(true);
      }
    }
  };

  const handleGuardarCambios = async () => {
    try {
      // 1. Creamos el objeto usuario actualizado
      // (Nota: En un caso real, no deberíamos necesitar reenviar todo, pero saveUsuario así funciona)
      const usuarioActualizado: IUsuario = {
        ...datosEditables,
        tipo: user?.rol || 'Cliente'
      };

      // 2. Guardamos en la "Base de Datos"
      await saveUsuario(usuarioActualizado);

      // 3. Actualizamos la sesión en vivo (Header, etc.)
      updateUserSession({ nombre: datosEditables.nombre });

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
        {/* Tarjeta de Datos Personales */}
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
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
                <hr />
                <Button variant="outline-danger" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Tarjeta de Historial */}
        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Historial de Pedidos</h5>
            </Card.Header>
            <Card.Body>
              {pedidos.length === 0 ? (
                <p className="text-center text-muted py-4">Aún no has realizado pedidos.</p>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
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
                          <td>#{pedido.id || Math.floor(Math.random() * 1000)}</td>
                          <td>{pedido.fecha || new Date().toLocaleDateString()}</td>
                          <td>${(pedido.total || 0).toLocaleString('es-CL')}</td>
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