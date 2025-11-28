import { useState, useEffect } from 'react';
import { Table, Form, Alert, Button, Row, Col, Modal, Card, ListGroup, Badge } from 'react-bootstrap';
import { getAllPedidos, updateEstadoPedido, deletePedido, getProductos } from '../../services/PasteleriaService';
import type { IPedido, IProducto } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';

function AdminPedidos() {
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [productosCatalogo, setProductosCatalogo] = useState<IProducto[]>([]); 
  const [mensajeExito, setMensajeExito] = useState('');

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // PAGINACIÓN
  const [visibleCount, setVisibleCount] = useState(25);

  // Modales
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState<IPedido | null>(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<IPedido | null>(null);

  const ESTADOS_PEDIDO = [
    { value: 'Pendiente',      label: '🟡 Pendiente',       color: '#ffc107', variant: 'warning' },
    { value: 'En Preparación', label: '🔵 En Preparación',  color: '#0dcaf0', variant: 'info' },
    { value: 'En Reparto',     label: '🚚 En Reparto',      color: '#0d6efd', variant: 'primary' },
    { value: 'Entregado',      label: '🟢 Entregado',       color: '#198754', variant: 'success' },
    { value: 'Cancelado',      label: '🔴 Cancelado',       color: '#dc3545', variant: 'danger' },
  ];

  const cargarDatos = async () => {
    const [dataPedidos, dataProductos] = await Promise.all([
        getAllPedidos(),
        getProductos()
    ]);
    setPedidos(dataPedidos.reverse());
    setProductosCatalogo(dataProductos);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setVisibleCount(25);
  }, [filtroTexto, filtroEstado]);

  const pedidosFiltrados = pedidos.filter((p) => {
    const texto = filtroTexto.toLowerCase();
    const matchTexto = 
      p.id.toString().includes(texto) || 
      p.cliente.nombre.toLowerCase().includes(texto) ||
      p.cliente.email.toLowerCase().includes(texto);
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  // PEDIDOS VISIBLES
  const pedidosVisibles = pedidosFiltrados.slice(0, visibleCount);

  const handleEstadoChange = async (id: number, nuevoEstado: string) => {
    await updateEstadoPedido(id, nuevoEstado);
    setMensajeExito(`Pedido #${id} actualizado a: ${nuevoEstado}`);
    await cargarDatos();
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const handleDeleteClick = (pedido: IPedido) => {
    setPedidoAEliminar(pedido);
    setShowModalEliminar(true);
  };

  const confirmDelete = async () => {
    if (pedidoAEliminar) {
      await deletePedido(pedidoAEliminar.id);
      await cargarDatos();
      setShowModalEliminar(false);
      setPedidoAEliminar(null);
      setMensajeExito('Pedido eliminado correctamente.');
      setTimeout(() => setMensajeExito(''), 3000);
    }
  };

  const handleVerDetalle = (pedido: IPedido) => {
    setPedidoSeleccionado(pedido);
    setShowModalDetalle(true);
  };

  const getBadgeVariant = (estado: string) => {
    const config = ESTADOS_PEDIDO.find(e => e.value === estado);
    return config ? config.variant : 'secondary';
  };

  const getStatusColor = (estado: string) => {
    const config = ESTADOS_PEDIDO.find(e => e.value === estado);
    return config ? config.color : '#6c757d';
  };

  const verificarDisponibilidad = (codigoProducto: string) => {
    const productoEnCatalogo = productosCatalogo.find(p => p.codigo === codigoProducto);
    if (!productoEnCatalogo || productoEnCatalogo.activo === false) {
        return false; 
    }
    return true;
  };

  return (
    <div>
      <h2 className="logo-text mb-4">Gestión de Pedidos</h2>
      {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}

      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Buscar Pedido</Form.Label>
              <div className="position-relative">
                <Form.Control 
                  type="text" 
                  placeholder="Buscar por ID, Cliente o Correo..." 
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  style={{ paddingLeft: '35px' }}
                />
                <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ top: '12px', left: '12px' }}></i>
              </div>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Filtrar por Estado</Form.Label>
              <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                {ESTADOS_PEDIDO.map((estado) => (
                   <option key={estado.value} value={estado.value} style={{ color: estado.color, fontWeight: 'bold' }}>
                     {estado.label}
                   </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosVisibles.map((p) => (
              <tr key={p.id}>
                <td className="fw-bold">#{p.id}</td>
                <td>
                  <div>{p.fechaEmision}</div>
                  <small className="text-muted">{p.horaEmision}</small>
                </td>
                <td>
                  <div className="fw-bold">{p.cliente.nombre}</div>
                  <small className="text-muted">{p.cliente.email}</small>
                </td>
                <td className="fw-bold text-success">${p.total.toLocaleString('es-CL')}</td>
                <td style={{ minWidth: '180px' }}>
                  <Form.Select 
                    size="sm"
                    value={p.estado || 'Pendiente'}
                    onChange={(e) => handleEstadoChange(p.id, e.target.value)}
                    className="fw-bold border-2"
                    style={{ 
                        borderColor: getStatusColor(p.estado), 
                        color: getStatusColor(p.estado)
                    }}
                  >
                    {ESTADOS_PEDIDO.map((estado) => (
                      <option 
                        key={estado.value} 
                        value={estado.value}
                        style={{ 
                            color: estado.color, 
                            fontWeight: 'bold',
                            padding: '8px'
                        }}
                      >
                        {estado.label}
                      </option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleVerDetalle(p)}
                      title="Ver Detalle"
                      className="px-3"
                    >
                      <i className="fa-solid fa-eye me-1"></i> Ver
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(p)}
                      title="Eliminar"
                      className="px-3"
                    >
                      <i className="fa-solid fa-trash me-1"></i> Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* BOTÓN VER MÁS */}
      {pedidosFiltrados.length > visibleCount && (
        <div className="text-center mt-4">
            <Button variant="outline-primary" onClick={() => setVisibleCount(prev => prev + 25)}>
                <i className="fa-solid fa-eye me-2"></i> Ver más pedidos ({pedidosFiltrados.length - visibleCount} restantes)
            </Button>
        </div>
      )}

      {/* --- MODAL DETALLE PEDIDO --- */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-primary">
            Detalle Pedido #{pedidoSeleccionado?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {pedidoSeleccionado && (
            <Row>
              <Col md={6}>
                <Card className="mb-3 border-0 shadow-sm bg-light">
                  <Card.Body>
                    <h6 className="fw-bold text-secondary mb-3">Información del Cliente</h6>
                    <p className="mb-1"><strong>Nombre:</strong> {pedidoSeleccionado.cliente.nombre}</p>
                    <p className="mb-1"><strong>Email:</strong> {pedidoSeleccionado.cliente.email}</p>
                    <p className="mb-1"><strong>Dirección:</strong> {pedidoSeleccionado.cliente.direccion}</p>
                    <p className="mb-1"><strong>Comuna:</strong> {pedidoSeleccionado.cliente.comuna}</p>
                    <p className="mb-0"><strong>Pago:</strong> {pedidoSeleccionado.cliente.medioPago === 'webpay' ? 'WebPay / Tarjeta' : 'Transferencia'}</p>
                  </Card.Body>
                </Card>
                <div className="mb-3">
                  <strong>Estado actual: </strong> 
                  <Badge bg={getBadgeVariant(pedidoSeleccionado.estado)} className="fs-6 ms-2">
                    {pedidoSeleccionado.estado}
                  </Badge>
                </div>
                <p className="text-muted small">
                  Pedido realizado el {pedidoSeleccionado.fechaEmision} a las {pedidoSeleccionado.horaEmision}.
                  <br/>
                  Fecha de entrega solicitada: <strong>{pedidoSeleccionado.fechaEntrega}</strong>
                </p>
              </Col>
              <Col md={6}>
                <h6 className="fw-bold text-secondary mb-3">Productos Solicitados</h6>
                <ListGroup variant="flush" className="mb-3 border rounded">
                  {pedidoSeleccionado.productos.map((prod: any) => {
                    const disponible = verificarDisponibilidad(prod.codigo);
                    return (
                        <ListGroup.Item key={prod.idUnico} className="d-flex flex-column bg-white">
                        <div className="d-flex justify-content-between align-items-start w-100">
                            <div className="me-auto">
                                <div className="fw-bold">
                                    {prod.nombre}
                                    {!disponible && <Badge bg="danger" className="ms-2 blink">NO DISPONIBLE</Badge>}
                                </div>
                                <small className="text-muted">Cant: {prod.cantidad} x ${prod.precio.toLocaleString('es-CL')}</small>
                            </div>
                            <span className="fw-bold text-dark">${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</span>
                        </div>
                        {!disponible && (
                            <div className="mt-2 p-2 bg-danger bg-opacity-10 border border-danger rounded small text-danger">
                                <i className="fa-solid fa-triangle-exclamation me-1"></i> 
                                <strong>Atención:</strong> Este producto fue inhabilitado del catálogo. Revisa si hay stock o contacta al cliente.
                            </div>
                        )}
                        {prod.mensaje && (
                            <div className="mt-1 p-1 bg-light rounded border border-warning small text-dark w-100">
                                <i className="fa-solid fa-pen-fancy me-1 text-warning"></i> "{prod.mensaje}"
                            </div>
                        )}
                        </ListGroup.Item>
                    );
                  })}
                </ListGroup>
                <div className="d-flex justify-content-between border-top pt-2">
                  <span>Total a Pagar:</span>
                  <span className="fw-bold fs-5 text-success">${pedidoSeleccionado.total.toLocaleString('es-CL')}</span>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <ModalConfirmacion
        show={showModalEliminar}
        titulo="Eliminar Pedido"
        onCancelar={() => setShowModalEliminar(false)}
        onConfirmar={confirmDelete}
      >
        <Alert variant="danger" className="text-center mb-0 border-0">
          ¿Estás seguro de eliminar el pedido <strong>#{pedidoAEliminar?.id}</strong>?
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminPedidos;