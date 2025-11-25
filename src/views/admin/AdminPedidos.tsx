import { useState, useEffect } from 'react';
import { Table, Form, Alert, Button, Row, Col } from 'react-bootstrap';
import { getAllPedidos, updateEstadoPedido, deletePedido } from '../../services/PasteleriaService';
import type { IPedido } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';

function AdminPedidos() {
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [mensajeExito, setMensajeExito] = useState('');

  // --- 1. NUEVOS ESTADOS PARA FILTROS ---
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Estados para el Modal de Eliminación
  const [showModal, setShowModal] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState<IPedido | null>(null);

  const cargarDatos = async () => {
    const data = await getAllPedidos();
    setPedidos(data.reverse()); // Más recientes primero
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- 2. LÓGICA DE FILTRADO ---
  const pedidosFiltrados = pedidos.filter((p) => {
    // A. Filtro por Texto (ID, Nombre, Email)
    const texto = filtroTexto.toLowerCase();
    const matchTexto = 
      p.id.toString().includes(texto) || 
      p.cliente.nombre.toLowerCase().includes(texto) ||
      p.cliente.email.toLowerCase().includes(texto);

    // B. Filtro por Estado
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;

    return matchTexto && matchEstado;
  });

  const handleEstadoChange = async (id: number, nuevoEstado: string) => {
    await updateEstadoPedido(id, nuevoEstado);
    setMensajeExito(`Pedido #${id} actualizado a: ${nuevoEstado}`);
    await cargarDatos();
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const handleDeleteClick = (pedido: IPedido) => {
    setPedidoAEliminar(pedido);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (pedidoAEliminar) {
      await deletePedido(pedidoAEliminar.id);
      await cargarDatos();
      setShowModal(false);
      setPedidoAEliminar(null);
      setMensajeExito('Pedido eliminado correctamente.');
      setTimeout(() => setMensajeExito(''), 3000);
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

  return (
    <div>
      <h2 className="logo-text mb-4">Gestión de Pedidos</h2>

      {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}

      {/* --- 3. BARRA DE FILTROS --- */}
      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-3">
          
          {/* Filtro 1: Buscador General */}
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
                <i 
                  className="fa-solid fa-magnifying-glass position-absolute text-muted" 
                  style={{ top: '12px', left: '12px' }}
                ></i>
              </div>
            </Form.Group>
          </Col>
          
          {/* Filtro 2: Estado del Pedido */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Filtrar por Estado</Form.Label>
              <Form.Select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">🟡 Pendiente</option>
                <option value="En Preparación">🔵 En Preparación</option>
                <option value="En Reparto">🚚 En Reparto</option>
                <option value="Entregado">🟢 Entregado</option>
                <option value="Cancelado">🔴 Cancelado</option>
              </Form.Select>
            </Form.Group>
          </Col>

        </Row>
      </div>

      {/* --- TABLA (Usa pedidosFiltrados) --- */}
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
            {pedidosFiltrados.map((p) => (
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
                <td className="fw-bold text-success">
                  ${p.total.toLocaleString('es-CL')}
                </td>
                
                <td style={{ minWidth: '170px' }}>
                  <Form.Select 
                    size="sm"
                    value={p.estado || 'Pendiente'}
                    onChange={(e) => handleEstadoChange(p.id, e.target.value)}
                    className={`border-${getBadgeVariant(p.estado)} text-${getBadgeVariant(p.estado)} fw-bold`}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Preparación">En Preparación</option>
                    <option value="En Reparto">En Reparto</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </Form.Select>
                </td>

                <td>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleDeleteClick(p)}
                    title="Eliminar Pedido"
                    className="d-flex align-items-center gap-2 px-3"
                  >
                    <i className="fa-solid fa-trash"></i>
                    <span className="d-none d-lg-inline">Eliminar</span>
                  </Button>
                </td>

              </tr>
            ))}
            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  <i className="fa-solid fa-filter-circle-xmark fa-3x mb-3 text-secondary opacity-50"></i>
                  <p>No se encontraron pedidos con esos filtros.</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ModalConfirmacion
        show={showModal}
        titulo="Eliminar Pedido"
        onCancelar={() => setShowModal(false)}
        onConfirmar={confirmDelete}
      >
        <Alert variant="danger" className="text-center mb-0 border-0">
          <div className="mb-3">
            <i className="fa-solid fa-circle-exclamation fa-3x text-danger"></i>
          </div>
          <h5>¿Estás seguro?</h5>
          <p className="mb-0">
            Vas a eliminar el pedido <strong>#{pedidoAEliminar?.id}</strong>.
          </p>
          <small className="d-block mt-2 text-muted">
            Esta acción es permanente y no se puede deshacer.
          </small>
        </Alert>
      </ModalConfirmacion>

    </div>
  );
}

export default AdminPedidos;