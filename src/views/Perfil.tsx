import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Table, Button, Modal, Form, Alert, ListGroup, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getUsuarioByRun, saveUsuario } from '../services/AdminService';
import type { IUsuario } from '../services/AdminService';
import { updateEstadoPedido, getAllPedidos } from '../services/PasteleriaService';
import ModalConfirmacion from '../components/ModalConfirmacion';
import { REGIONES_CHILE } from '../Data/regiones';

function Perfil() {
  const { user, logout, updateUserSession } = useAuth();
  const { showNotification } = useNotification();

  const [misPedidos, setMisPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalCancelar, setShowModalCancelar] = useState(false);

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);
  
  const [datosEditables, setDatosEditables] = useState({
    nombre: '', 
    apellidos: '', 
    email: '', 
    run: '', 
    password: '', 
    confirmPassword: '',
    region: '',
    comuna: '',
    direccion: ''
  });

  const cargarMisPedidos = async () => {
    if (!user) return;
    try {
      const todosLosPedidos = await getAllPedidos();
      const mios = todosLosPedidos.filter((p: any) => 
        p.cliente?.email?.toLowerCase() === user.email.toLowerCase()
      );
      mios.sort((a, b) => a.id - b.id);
      const miosNumerados = mios.map((pedido, index) => ({
        ...pedido,
        numeroPersonal: index + 1
      }));
      setMisPedidos(miosNumerados.reverse());
    } catch (error) {
      console.error("Error cargando historial", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisPedidos();
  }, [user]);

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

  const handleOpenEditModal = async () => {
    if (user) {
      const usuarioReal = await getUsuarioByRun(user.run);
      if (usuarioReal) {
        setDatosEditables({
          nombre: usuarioReal.nombre,
          apellidos: usuarioReal.apellidos,
          email: usuarioReal.email,
          run: usuarioReal.run,
          region: usuarioReal.region || '',
          comuna: usuarioReal.comuna || '',
          direccion: usuarioReal.direccion || '', // Ahora esto no dará error gracias a AuthContext y AdminService
          password: '',        
          confirmPassword: ''
        });
        setMostrarPassword(false);
        setShowModalEditar(true);
      }
    }
  };

  // --- CORRECCIÓN DEL ONCHANGE ---
  // Usamos 'any' en el evento para evitar conflictos de tipos entre Input y Select
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setDatosEditables(prev => {
        if (name === 'region') return { ...prev, region: value, comuna: '' };
        return { ...prev, [name]: value };
    });
  };

  const handleGuardarPerfil = async () => {
    if (!datosEditables.nombre.trim() || !datosEditables.apellidos.trim()) {
        showNotification('Nombre y Apellidos son obligatorios.', 'warning'); return;
    }

    if (datosEditables.password || datosEditables.confirmPassword) {
        if (datosEditables.password !== datosEditables.confirmPassword) {
            showNotification('Las contraseñas no coinciden.', 'warning'); return;
        }
        if (datosEditables.password.length < 4) {
            showNotification('La contraseña es muy corta (mínimo 4).', 'warning'); return;
        }
    }

    try {
      const usuarioActualizado: IUsuario = {
        run: datosEditables.run,
        nombre: datosEditables.nombre,
        apellidos: datosEditables.apellidos,
        email: datosEditables.email,
        region: datosEditables.region,
        comuna: datosEditables.comuna,
        direccion: datosEditables.direccion,
        password: datosEditables.password,
        tipo: 'Cliente', 
        fechaNacimiento: user?.fechaNacimiento,
        codigoPromo: user?.codigoPromo
      };

      await saveUsuario(usuarioActualizado);
      
      updateUserSession({ 
        nombre: datosEditables.nombre,
        apellidos: datosEditables.apellidos,
        email: datosEditables.email,
        region: datosEditables.region,
        comuna: datosEditables.comuna,
        direccion: datosEditables.direccion
      });

      showNotification('Perfil actualizado correctamente', 'success');
      setShowModalEditar(false);
    } catch (error) {
      showNotification('Error al actualizar el perfil', 'danger');
    }
  };

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

  const comunasDisponibles = REGIONES_CHILE.find(r => r.region === datosEditables.region)?.comunas || [];

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
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4 text-center">
            <Card.Body className="p-4">
              <div className="mb-3 position-relative d-inline-block">
                <div className="bg-light rounded-circle p-3">
                    <i className="fa-solid fa-user fa-4x text-secondary"></i>
                </div>
                <div className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-2"></div>
              </div>
              <h4 className="fw-bold mb-0">{user.nombre} {user.apellidos}</h4>
              <p className="text-muted mb-2">{user.email}</p>
              
              <div className="text-start border-top pt-3 small">
                 <p className="mb-1"><strong>RUN:</strong> {user.run}</p>
                 <p className="mb-1"><strong>Región:</strong> {user.region || '---'}</p>
                 <p className="mb-1"><strong>Comuna:</strong> {user.comuna || '---'}</p>
                 <p className="mb-3"><strong>Dirección:</strong> {user.direccion || '---'}</p>
              </div>
              
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

        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 logo-text text-primary">Mis Pedidos Recientes</h5>
                <Badge bg="primary" pill>{misPedidos.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                 <div className="text-center py-5">Cargando...</div>
              ) : misPedidos.length === 0 ? (
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
                          <td className="ps-4 fw-bold text-primary">
                             #{pedido.numeroPersonal} 
                          </td>
                          <td>
                            <div className="small">{pedido.fechaEmision}</div>
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>{pedido.horaEmision}</small>
                          </td>
                          <td className="fw-bold">${pedido.total?.toLocaleString('es-CL')}</td>
                          <td>
                            <Badge bg={getBadgeVariant(pedido.estado || 'Pendiente')}>
                              {pedido.estado || 'Pendiente'}
                            </Badge>
                          </td>
                          <td className="text-end pe-4">
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="px-3"
                                onClick={() => handleVerDetalle(pedido)}
                                title="Ver detalle completo"
                            >
                                <i className="fa-solid fa-eye me-2"></i> Ver
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

      <Modal show={showModalEditar} onHide={() => setShowModalEditar(false)} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
            <Modal.Title className="logo-text text-primary">Editar Mis Datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="nombre" value={datosEditables.nombre} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control type="text" name="apellidos" value={datosEditables.apellidos} onChange={handleChange} />
                    </Form.Group>
                </Col>
                
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={datosEditables.email} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control type="text" name="direccion" value={datosEditables.direccion} onChange={handleChange} placeholder="Calle y N°" />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Región</Form.Label>
                        <Form.Select name="region" value={datosEditables.region} onChange={handleChange}>
                            <option value="">Seleccione...</option>
                            {REGIONES_CHILE.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Comuna</Form.Label>
                        <Form.Select name="comuna" value={datosEditables.comuna} onChange={handleChange} disabled={!datosEditables.region}>
                            <option value="">Seleccione...</option>
                            {comunasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                
                <Col md={12}><hr /></Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <InputGroup>
                            <Form.Control 
                                type={mostrarPassword ? "text" : "password"} 
                                placeholder="(Dejar en blanco para no cambiar)" 
                                name="password"
                                value={datosEditables.password} 
                                onChange={handleChange} 
                            />
                            <Button variant="outline-secondary" onClick={() => setMostrarPassword(!mostrarPassword)}>
                                <i className={mostrarPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                        <Form.Control 
                            type="password" 
                            name="confirmPassword"
                            placeholder="Repetir clave nueva" 
                            value={datosEditables.confirmPassword} 
                            onChange={handleChange} 
                        />
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

      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-secondary">
             Detalle de Compra #{pedidoSeleccionado?.numeroPersonal}
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

                <div className="border-top pt-3 mt-3">
                    {(pedidoSeleccionado.descuento && pedidoSeleccionado.descuento > 0) ? (
                        <>
                            <div className="d-flex justify-content-between mb-1 text-muted">
                                <span>Subtotal:</span>
                                <span>${(pedidoSeleccionado.subtotal || 0).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-success">
                                <span><i className="fa-solid fa-tag me-1"></i>Descuento:</span>
                                <span>- ${(pedidoSeleccionado.descuento).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2">
                                <span className="fs-5 fw-bold text-dark">Total Pagado:</span>
                                <span className="fs-4 fw-bold text-success">${pedidoSeleccionado.total.toLocaleString('es-CL')}</span>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex justify-content-between">
                            <span className="fs-5">Total Pagado:</span>
                            <span className="fs-4 fw-bold text-success">${pedidoSeleccionado.total.toLocaleString('es-CL')}</span>
                        </div>
                    )}
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

      <ModalConfirmacion
        show={showModalCancelar}
        titulo="Cancelar Pedido"
        onCancelar={() => setShowModalCancelar(false)}
        onConfirmar={confirmarCancelacion}
      >
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation fa-3x text-warning mb-3"></i>
          <p>¿Estás seguro de que deseas cancelar el pedido <strong>#{pedidoSeleccionado?.numeroPersonal}</strong>?</p>
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </div>
      </ModalConfirmacion>

    </Container>
  );
}

export default Perfil;