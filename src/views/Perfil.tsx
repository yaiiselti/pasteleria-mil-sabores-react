import { useState } from 'react';
import { Container, Card, Row, Col, Badge, Table, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getUsuarios, saveUsuario } from '../services/PasteleriaService';
import type { IUsuario } from '../services/PasteleriaService';

function Perfil() {
  const { user, logout, updateUserSession } = useAuth();
  const { showNotification } = useNotification();

  // Estados para el Modal de Edición
  const [showModal, setShowModal] = useState(false);
  const [datosEditables, setDatosEditables] = useState({
    nombre: '',
    apellidos: '',
    email: '', 
    run: '',   
    password: '' 
  });

  // --- LÓGICA DE HISTORIAL POR USUARIO ---
  const obtenerMisPedidos = () => {
    if (!user) return [];
    
    // 1. Leemos todo el historial global
    const historialGlobal = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
    
    // 2. Filtramos SOLO los que pertenecen al usuario conectado
    // (Asumiendo que en el checkout se guardó el email en orden.cliente.email)
    const misPedidos = historialGlobal.filter((orden: any) => 
      orden.cliente.email.toLowerCase() === user.email.toLowerCase()
    );
    
    // Ordenamos para ver el más reciente primero
    return misPedidos.reverse();
  };

  const pedidos = obtenerMisPedidos();
  // ---------------------------------------

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
        tipo: user?.rol === 'Administrador' ? 'Administrador' : 'Cliente'
      };

      await saveUsuario(usuarioActualizado);
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

        {/* Tarjeta de Historial de Pedidos */}
        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Mis Pedidos Anteriores</h5>
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