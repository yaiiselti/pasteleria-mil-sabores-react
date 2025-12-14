import { useState, useEffect } from 'react';
import { Table, Form, Alert, Button, Row, Col, Modal, Card, Badge } from 'react-bootstrap';
import { getAllPedidos, updateEstadoPedido, deletePedido, getProductos, updatePedidoProductos } from '../../services/PasteleriaService';
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

  // Estado para marcar items listos (Usamos IDs de Base de Datos)
  const [itemsListos, setItemsListos] = useState<number[]>([]);

  // 1. MODIFICACIÓN ESTRATÉGICA: Agregamos el Estado de Nivel 2 (Mayorista)
  // Lo ponemos primero o con un color distintivo (Naranja Fuerte) para llamar la atención del Admin.
  const ESTADOS_PEDIDO = [
    { value: 'Por Confirmar Stock', label: '⏳ Por Confirmar Stock', color: '#fd7e14', variant: 'warning' }, 
    { value: 'Pendiente', label: '🟡 Pendiente', color: '#ffc107', variant: 'warning' },
    { value: 'En Preparación', label: '🔵 En Preparación', color: '#0dcaf0', variant: 'info' },
    { value: 'En Reparto', label: '🚚 En Reparto', color: '#0d6efd', variant: 'primary' },
    { value: 'Entregado', label: '🟢 Entregado', color: '#198754', variant: 'success' },
    { value: 'Cancelado', label: '🔴 Cancelado', color: '#dc3545', variant: 'danger' },
  ];

  const cargarDatos = async () => {
    try {
      const [dataPedidos, dataProductos] = await Promise.all([
        getAllPedidos(),
        getProductos()
      ]);
      // Ordenar: Lo más nuevo primero
      setPedidos(dataPedidos.sort((a, b) => b.id - a.id));
      setProductosCatalogo(dataProductos);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setVisibleCount(25);
  }, [filtroTexto, filtroEstado]);

  const pedidosFiltrados = pedidos.filter((p) => {
    const texto = filtroTexto.toLowerCase();
    const nombreCliente = p.cliente?.nombre || '';
    const emailCliente = p.cliente?.email || '';
    
    const matchTexto =
      p.id.toString().includes(texto) ||
      nombreCliente.toLowerCase().includes(texto) ||
      emailCliente.toLowerCase().includes(texto);
      
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  const pedidosVisibles = pedidosFiltrados.slice(0, visibleCount);

  const handleEstadoChange = async (id: number, nuevoEstado: string) => {
    // Aquí el Admin aprueba el pedido mayorista pasándolo a 'Pendiente' u otro estado
    await updateEstadoPedido(id, nuevoEstado);
    
    // Feedback específico si aprobó un mayorista
    if (nuevoEstado === 'Pendiente') {
        setMensajeExito(`Pedido #${id} APROBADO y enviado a cocina.`);
    } else {
        setMensajeExito(`Pedido #${id} actualizado a: ${nuevoEstado}`);
    }
    
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

  // --- CORRECCIÓN CRÍTICA: USAR .id (BD) ---
  const handleVerDetalle = (pedido: IPedido) => {
    setPedidoSeleccionado(pedido);

    const listosPrevios = pedido.productos
      .filter((p: any) => p.listo === true)
      .map((p: any) => p.id); 

    setItemsListos(listosPrevios);
    setShowModalDetalle(true);
  };

  const handleGuardarCambiosDetalle = async () => {
    if (!pedidoSeleccionado) return;

    const productosActualizados = pedidoSeleccionado.productos.map((prod: any) => ({
      ...prod,
      listo: itemsListos.includes(prod.id) 
    }));

    await updatePedidoProductos(pedidoSeleccionado.id, productosActualizados);
    await cargarDatos();
    setShowModalDetalle(false);
    setMensajeExito(`Progreso del pedido #${pedidoSeleccionado.id} guardado correctamente.`);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const toggleItemListo = (id: number) => { 
    setItemsListos(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const getBadgeVariant = (estado: string) => {
    const config = ESTADOS_PEDIDO.find(e => e.value === estado);
    // Fallback visual si el estado no coincide exactamente
    return config ? config.variant : 'secondary';
  };

  const getStatusColor = (estado: string) => {
    const config = ESTADOS_PEDIDO.find(e => e.value === estado);
    return config ? config.color : '#6c757d';
  };

  const verificarDisponibilidad = (codigoProducto: string) => {
    const productoEnCatalogo = productosCatalogo.find(p => p.codigo === codigoProducto);
    return !(!productoEnCatalogo || productoEnCatalogo.activo === false);
  };

  const getCategoriaProducto = (codigo: string) => {
    const prod = productosCatalogo.find(p => p.codigo === codigo);
    return prod ? prod.categoria : 'Pastelería';
  };

  const getTicketId = (id: number) => {
    if (!id) return 'TKT-????'; 
    return `TKT-${id.toString().slice(-4).padStart(4, '0')}`;
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
                  <div className="fw-bold">{p.cliente?.nombre || 'Desconocido'}</div>
                  <small className="text-muted">{p.cliente?.email}</small>
                </td>
                <td className="fw-bold text-success">${p.total.toLocaleString('es-CL')}</td>
                <td style={{ minWidth: '200px' }}> {/* Aumentamos un poco el ancho para el nuevo estado largo */}
                  <Form.Select
                    size="sm"
                    value={p.estado || 'Pendiente'}
                    onChange={(e) => handleEstadoChange(p.id, e.target.value)}
                    className="fw-bold border-2"
                    style={{
                      borderColor: getStatusColor(p.estado),
                      color: getStatusColor(p.estado),
                      backgroundColor: p.estado === 'Por Confirmar Stock' ? '#fff3cd' : 'white' // Fondo sutil para destacar
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

      {pedidosFiltrados.length > visibleCount && (
        <div className="text-center mt-4">
          <Button variant="outline-primary" onClick={() => setVisibleCount(prev => prev + 25)}>
            <i className="fa-solid fa-eye me-2"></i> Ver más pedidos ({pedidosFiltrados.length - visibleCount} restantes)
          </Button>
        </div>
      )}

      {/* --- MODAL DETALLE PEDIDO (INTACTO, SOLO RECIBE DATOS) --- */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} size="xl" centered>
        {/* ... (El contenido del modal es el mismo del archivo original, no requiere cambios lógicos) ... */}
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-primary">
            <i className="fa-solid fa-clipboard-list me-2"></i>
            Detalle Pedido #{pedidoSeleccionado?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {pedidoSeleccionado && (
            <Row>
              <Col lg={4} className="mb-4 mb-lg-0 border-end">
                <div className="pe-lg-3">
                  <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">Información General</h5>

                  <Card className="mb-3 border-0 shadow-sm bg-light">
                    <Card.Body>
                      <h6 className="fw-bold text-secondary mb-3">Cliente</h6>
                      <p className="mb-1"><i className="fa-regular fa-user me-2 text-muted"></i>{pedidoSeleccionado.cliente?.nombre}</p>
                      <p className="mb-1"><i className="fa-regular fa-envelope me-2 text-muted"></i>{pedidoSeleccionado.cliente?.email}</p>
                      <p className="mb-1"><i className="fa-solid fa-location-dot me-2 text-muted"></i>{pedidoSeleccionado.cliente?.direccion}, {pedidoSeleccionado.cliente?.comuna}</p>
                    </Card.Body>
                  </Card>

                  <div className="mb-4">
                    <h6 className="fw-bold text-secondary">Estado del Pedido:</h6>
                    <Badge bg={getBadgeVariant(pedidoSeleccionado.estado)} className="fs-6 py-2 px-3 w-100 mt-1">
                      {pedidoSeleccionado.estado}
                    </Badge>
                  </div>

                  <div className="text-muted small">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Fecha Emisión:</span>
                      <strong>{pedidoSeleccionado.fechaEmision} {pedidoSeleccionado.horaEmision}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Fecha Entrega Solicitada:</span>
                      <strong className="text-primary">{pedidoSeleccionado.fechaEntrega}</strong>
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={8}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Tickets de Productos (Cocina)</h5>
                  <Badge bg="secondary">Total Ítems: {pedidoSeleccionado.productos.reduce((acc: number, item: any) => acc + item.cantidad, 0)}</Badge>
                </div>

                <div className="d-grid gap-3" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
                  {pedidoSeleccionado.productos.map((prod: any) => {
                    const disponible = verificarDisponibilidad(prod.codigo);
                    const isReady = itemsListos.includes(prod.id); 
                    const ticketId = getTicketId(prod.id);         
                    const categoria = getCategoriaProducto(prod.codigo);

                    return (
                      <Card
                        key={prod.id} 
                        className={`border-0 shadow-sm transition-all ${isReady ? 'bg-success bg-opacity-10' : 'bg-white'}`}
                        style={{
                          borderLeft: `5px solid ${isReady ? '#198754' : '#0d6efd'}`,
                          opacity: isReady ? 0.8 : 1
                        }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between">
                            <div className="d-flex flex-column gap-1 flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Badge bg="dark" className="font-monospace px-2 py-1">
                                  <i className="fa-solid fa-ticket me-1"></i> {ticketId}
                                </Badge>
                                {!disponible && <Badge bg="danger" className="blink">NO DISPONIBLE EN CATÁLOGO</Badge>}
                              </div>

                              <h5 className={`fw-bold mb-1 ${isReady ? 'text-success text-decoration-line-through' : 'text-dark'}`}>
                                {prod.nombre}
                              </h5>

                              <div className="d-flex align-items-center gap-3 text-muted small">
                                <span><i className="fa-solid fa-tag me-1"></i> {categoria}</span>
                                <span><i className="fa-solid fa-dollar-sign me-1"></i> {prod.precio.toLocaleString('es-CL')} c/u</span>
                              </div>

                              <div className={`mt-3 p-3 rounded border ${prod.mensaje ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light border-light'}`}>
                                <div className="d-flex align-items-start">
                                  <i className={`fa-solid fa-pen-nib mt-1 me-2 ${prod.mensaje ? 'text-warning' : 'text-muted'}`}></i>
                                  <div>
                                    <strong className="d-block text-dark small mb-1">DEDICATORIA / MENSAJE:</strong>
                                    {prod.mensaje
                                      ? <span className="fst-italic fs-6 text-dark">"{prod.mensaje}"</span>
                                      : <span className="text-muted small fst-italic">(Sin mensaje personalizado)</span>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex flex-column align-items-end justify-content-between ps-3 border-start ms-3" style={{ minWidth: '120px' }}>
                              <div className="text-end">
                                <small className="text-muted d-block">Cantidad</small>
                                <span className="display-6 fw-bold text-primary">x{prod.cantidad}</span>
                              </div>

                              <div className="mt-3 w-100 text-end">
                                <Form.Check
                                  type="checkbox"
                                  id={`check-${prod.id}`} 
                                  checked={isReady}
                                  onChange={() => toggleItemListo(prod.id)} 
                                  label={isReady ? "LISTO" : "PENDIENTE"}
                                  className={`fw-bold user-select-none ${isReady ? 'text-success' : 'text-secondary'}`}
                                  style={{ cursor: 'pointer' }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-top bg-white sticky-bottom">
                  {(pedidoSeleccionado.descuento && pedidoSeleccionado.descuento > 0) ? (
                    <div className="d-flex flex-column align-items-end">
                      <div className="d-flex justify-content-between w-50 mb-1 text-muted">
                        <span>Subtotal:</span>
                        <span>${(pedidoSeleccionado.subtotal || 0).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="d-flex justify-content-between w-50 mb-2 text-success">
                        <span><i className="fa-solid fa-tag me-1"></i>Descuento:</span>
                        <span>- ${(pedidoSeleccionado.descuento).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="d-flex justify-content-between w-50 border-top pt-2">
                        <span className="fw-bold text-dark">Total a Pagar:</span>
                        <span className="fw-bold fs-3 text-success">${pedidoSeleccionado.total.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Total a Pagar del Pedido:</span>
                      <span className="fw-bold fs-3 text-success">${pedidoSeleccionado.total.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</Button>
          <Button variant="primary" onClick={handleGuardarCambiosDetalle}>
            <i className="fa-solid fa-save me-2"></i> Guardar Cambios
          </Button>
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