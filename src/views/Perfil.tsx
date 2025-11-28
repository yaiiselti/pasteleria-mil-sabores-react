import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Table, Button, Modal, Form, Alert, ListGroup, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getUsuarios, saveUsuario } from '../services/AdminService';
import type { IUsuario } from '../services/AdminService';
import { updateEstadoPedido, getAllPedidos } from '../services/PasteleriaService';
import ModalConfirmacion from '../components/ModalConfirmacion';

function Perfil() {
  const { user, logout, updateUserSession } = useAuth();
  const { showNotification } = useNotification();

  // Estados para Pedidos
  const [misPedidos, setMisPedidos] = useState<any[]>([]);
  
  // Estados para Modales
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalCancelar, setShowModalCancelar] = useState(false);

  // Estado para ver contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Datos seleccionados
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);
  
  // Formulario Edición
  const [datosEditables, setDatosEditables] = useState({
    nombre: '', apellidos: '', email: '', run: '', password: ''
  });

  // --- 1. CARGA DE PEDIDOS ---
  const cargarMisPedidos = async () => {
    if (!user) return;
    const todosLosPedidos = await getAllPedidos();
    const mios = todosLosPedidos.filter(p => p.cliente.email.toLowerCase() === user.email.toLowerCase());
    setMisPedidos(mios.reverse()); 
  };

  useEffect(() => {
    cargarMisPedidos();
  }, [user]);

  // --- LÓGICA DE BENEFICIOS ---
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

  // --- MANEJADORES DE EDICIÓN DE PERFIL ---
  const handleOpenEditModal = async () => {
    if (user) {
      const usuariosDB = await getUsuarios();
      const usuarioReal = usuariosDB.find(u => u.run === user.run);
      
      if (usuarioReal) {
        setDatosEditables({
          nombre: usuarioReal.nombre,
          apellidos: usuarioReal.apellidos,
          email: usuarioReal.email,
          run: usuarioReal.run,
          password: usuarioReal.password || '' 
        });
        setMostrarPassword(false); // Resetear visor
        setShowModalEditar(true);
      }
    }
  };

  const handleGuardarPerfil = async () => {
    // Validación de Duplicados
    const usuariosDB = await getUsuarios();
    const emailOcupado = usuariosDB.some(u => 
      u.email.toLowerCase() === datosEditables.email.toLowerCase().trim() && 
      u.run !== user?.run 
    );

    if (emailOcupado) {
      showNotification('Error: Ese correo ya está en uso por otro usuario.', 'danger');
      return;
    }

    try {
      const usuarioActualizado: IUsuario = {
        ...datosEditables,
        tipo: user?.rol === 'Administrador' ? 'Administrador' : 'Cliente',
        fechaNacimiento: user?.fechaNacimiento,
        codigoPromo: user?.codigoPromo
      };

      await saveUsuario(usuarioActualizado);
      
      updateUserSession({ 
        nombre: datosEditables.nombre,
        apellidos: datosEditables.apellidos,
        email: datosEditables.email
      });

      showNotification('Perfil actualizado correctamente', 'success');
      setShowModalEditar(false);
    } catch (error) {
      showNotification('Error al actualizar el perfil', 'danger');
    }
  };

  // --- MANEJADORES DE PEDIDOS ---
  const handleVerDetalle = (pedido: any) => {
    setPedidoSeleccionado(pedido);
    setShowModalDetalle(true);
  };

  const handleSolicitarCancelacion = () => {
    setShowModalDetalle(false);
    setShowModalCancelar(true);
  };

  const confirmarCancelacion = async () => {
    if (pedidoSeleccionado) {
        await updateEstadoPedido(pedidoSeleccionado.id, 'Cancelado');
        await cargarMisPedidos();
        setShowModalCancelar(false);
        setPedidoSeleccionado(null);
        showNotification('Pedido cancelado exitosamente.', 'warning');
    }
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
      <Row className="g-4">
        
        {/* COLUMNA IZQUIERDA: TARJETA DE USUARIO */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4 text-center">
            <Card.Body className="p-4">
              <div className="mb-3 position-relative d-inline-block">
                <i className="fa-solid fa-circle-user fa-6x text-secondary"></i>
                <div className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-1"></div>
              </div>
              <h4 className="fw-bold mb-0">{user.nombre} {user.apellidos}</h4>
              <p className="text-muted mb-1">{user.email}</p>
              <Badge bg="light" text="dark" className="border mb-3">{user.run}</Badge>
              
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={handleOpenEditModal}>
                    <i className="fa-solid fa-user-pen me-2"></i> Editar Datos
                </Button>
                <Button variant="outline-danger" onClick={logout}>
                    <i className="fa-solid fa-right-from-bracket me-2"></i> Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-warning text-dark fw-bold">
                <i className="fa-solid fa-star me-2"></i> Mis Beneficios
            </Card.Header>
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

        {/* COLUMNA DERECHA: LISTA DE PEDIDOS */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 logo-text text-primary">Mis Pedidos Recientes</h5>
                <Badge bg="primary" pill>{misPedidos.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {misPedidos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-basket-shopping fa-3x mb-3 text-secondary opacity-50"></i>
                  <p>Aún no has realizado pedidos.</p>
                  <Link to="/tienda" className="btn btn-sm btn-principal">¡Ir a comprar algo rico!</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4">Orden</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th className="text-end pe-4">Detalle</th> 
                      </tr>
                    </thead>
                    <tbody>
                      {misPedidos.map((pedido: any) => (
                        <tr key={pedido.id}>
                          <td className="ps-4 fw-bold text-primary">#{pedido.id}</td>
                          <td>
                            <div className="small">{pedido.fechaEmision}</div>
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>{pedido.horaEmision}</small>
                          </td>
                          <td className="fw-bold">${pedido.total.toLocaleString('es-CL')}</td>
                          <td>
                            <Badge bg={getBadgeVariant(pedido.estado || 'Pendiente')}>
                              {pedido.estado || 'Pendiente'}
                            </Badge>
                          </td>
                          <td className="text-end pe-4">
                            {/* BOTÓN GRANDE ESTILO ADMIN */}
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="px-3"
                                onClick={() => handleVerDetalle(pedido)}
                                title="Ver detalle completo"
                            >
                                <i className="fa-solid fa-eye me-2"></i> Ver Detalle
                            </Button>
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

      {/* --- MODAL 1: EDITAR PERFIL --- */}
      <Modal show={showModalEditar} onHide={() => setShowModalEditar(false)} centered backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title className="logo-text text-primary">Editar Mis Datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" value={datosEditables.nombre} onChange={(e) => setDatosEditables({...datosEditables, nombre: e.target.value})} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control type="text" value={datosEditables.apellidos} onChange={(e) => setDatosEditables({...datosEditables, apellidos: e.target.value})} />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={datosEditables.email} onChange={(e) => setDatosEditables({...datosEditables, email: e.target.value})} />
                    </Form.Group>
                </Col>
                
                {/* INPUT DE CONTRASEÑA CON VISOR (OJITO) */}
                <Col md={12}>
                    <Form.Group>
                        <Form.Label>Contraseña</Form.Label>
                        <InputGroup>
                            <Form.Control 
                                type={mostrarPassword ? "text" : "password"} 
                                placeholder="(Sin cambios)" 
                                value={datosEditables.password} 
                                onChange={(e) => setDatosEditables({...datosEditables, password: e.target.value})} 
                            />
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                title={mostrarPassword ? "Ocultar" : "Mostrar"}
                            >
                                <i className={mostrarPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                            </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">Deja en blanco para mantener la actual.</Form.Text>
                    </Form.Group>
                </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEditar(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardarPerfil}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL 2: DETALLE DEL PEDIDO --- */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-secondary">
             Detalle de Compra #{pedidoSeleccionado?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {pedidoSeleccionado && (
            <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h6 className="mb-1 text-muted">Estado del Pedido:</h6>
                        <Badge bg={getBadgeVariant(pedidoSeleccionado.estado)} className="fs-6">
                            {pedidoSeleccionado.estado}
                        </Badge>
                    </div>
                    <div className="text-end">
                        <h6 className="mb-1 text-muted">Fecha de Entrega Estimada:</h6>
                        <span className="fw-bold text-dark">{pedidoSeleccionado.fechaEntrega}</span>
                    </div>
                </div>

                <h6 className="fw-bold mb-3 border-bottom pb-2">Productos</h6>
                <ListGroup variant="flush" className="mb-4">
                    {pedidoSeleccionado.productos.map((prod: any, idx: number) => (
                        <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                            <div>
                                <div className="fw-bold">{prod.nombre}</div>
                                <div className="text-muted small">Cantidad: {prod.cantidad}</div>
                                {prod.mensaje && (
                                    <div className="small text-warning fst-italic mt-1">
                                        <i className="fa-solid fa-pen-fancy me-1"></i> "{prod.mensaje}"
                                    </div>
                                )}
                            </div>
                            <span className="fw-bold">${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <div className="d-flex justify-content-between border-top pt-3 mt-3">
                    <span className="fs-5">Total Pagado:</span>
                    <span className="fs-4 fw-bold text-success">${pedidoSeleccionado.total.toLocaleString('es-CL')}</span>
                </div>

                {pedidoSeleccionado.estado === 'Pendiente' && (
                    <Alert variant="light" className="mt-4 border d-flex justify-content-between align-items-center">
                        <div className="small text-muted">
                            <i className="fa-solid fa-circle-info me-2"></i>
                            ¿Hubo un error? Puedes cancelar mientras esté pendiente.
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={handleSolicitarCancelacion}>
                            Cancelar Pedido
                        </Button>
                    </Alert>
                )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL 3: CONFIRMACIÓN --- */}
      <ModalConfirmacion
        show={showModalCancelar}
        titulo="Cancelar Pedido"
        onCancelar={() => setShowModalCancelar(false)}
        onConfirmar={confirmarCancelacion}
      >
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation fa-3x text-warning mb-3"></i>
          <p>¿Estás seguro de que deseas cancelar el pedido <strong>#{pedidoSeleccionado?.id}</strong>?</p>
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </div>
      </ModalConfirmacion>

    </Container>
  );
}

export default Perfil;