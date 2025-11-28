import { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProductos, deleteProducto, toggleEstadoProducto } from '../../services/PasteleriaService';
import type { IProducto } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { useNotification } from '../../context/NotificationContext';

function AdminProductos() {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const { showNotification } = useNotification();

  // Estados de Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); 

  // Estado para el Modal
  const [showModal, setShowModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<IProducto | null>(null);

  // --- PAGINACIÓN "VER MÁS" ---
  const [visibleCount, setVisibleCount] = useState(25);

  const cargarDatos = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Reiniciar paginación cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(25);
  }, [filtroTexto, filtroEstado]);

  // --- LÓGICA DE FILTRADO COMBINADO ---
  const productosFiltrados = productos.filter(p => {
    const coincideTexto = 
      p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filtroTexto.toLowerCase());

    const coincideEstado = 
      filtroEstado === 'todos' || 
      (filtroEstado === 'activos' && p.activo !== false) || 
      (filtroEstado === 'inactivos' && p.activo === false);

    return coincideTexto && coincideEstado;
  });

  // PRODUCTOS VISIBLES (Limitados por visibleCount)
  const productosVisibles = productosFiltrados.slice(0, visibleCount);

  // --- Manejador Toggle ---
  const handleToggleEstado = async (producto: IProducto) => {
    try {
        const nuevoEstado = await toggleEstadoProducto(producto.codigo);
        setProductos(prev => prev.map(p => 
            p.codigo === producto.codigo ? { ...p, activo: nuevoEstado } : p
        ));
        showNotification(
            `Producto ${nuevoEstado ? 'Habilitado' : 'Inhabilitado'} correctamente`, 
            nuevoEstado ? 'success' : 'warning'
        );
    } catch (error) {
        showNotification('Error al cambiar estado', 'danger');
    }
  };

  const handleDeleteClick = (producto: IProducto) => {
    setProductoAEliminar(producto);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (productoAEliminar) {
      await deleteProducto(productoAEliminar.codigo);
      await cargarDatos(); 
      setShowModal(false);
      showNotification('Producto eliminado', 'success');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="logo-text">Gestión de Productos</h2>
        <Link to="/admin/productos/nuevo" className="btn btn-success">
          <i className="fa-solid fa-plus me-2"></i> Nuevo Producto
        </Link>
      </div>

      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group controlId="filtro-busqueda">
              <Form.Label className="small text-muted fw-bold">Buscar</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  style={{ paddingLeft: '35px' }}
                />
                <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ top: '12px', left: '12px' }}></i>
              </div>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="filtro-disponibilidad">
              <Form.Label className="small text-muted fw-bold">Disponibilidad</Form.Label>
              <Form.Select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={filtroEstado !== 'todos' ? 'border-primary text-primary fw-bold' : ''}
              >
                <option value="todos">Todos los productos</option>
                <option value="activos"> Solo Disponibles</option>
                <option value="inactivos"> Solo inhabilitado</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Estado</th>
              <th>Código</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosVisibles.map((p) => (
              <tr key={p.codigo} className={!p.activo ? 'bg-light text-muted' : ''}>
                <td>
                    <Form.Check 
                        type="switch"
                        id={`switch-${p.codigo}`}
                        checked={p.activo !== false}
                        onChange={() => handleToggleEstado(p)}
                        title={p.activo ? "Producto Habilitado" : "Producto Inhabilitado"}
                        style={{ cursor: 'pointer' }}
                    />
                    <small className={`fw-bold ${p.activo ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                    </small>
                </td>
                <td className="fw-bold">{p.codigo}</td>
                <td>
                  <img 
                    src={p.imagenes[0]} 
                    alt="" 
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', opacity: p.activo ? 1 : 0.5 }} 
                  />
                </td>
                <td>
                    {p.nombre}
                    {!p.activo && <Badge bg="danger" className="ms-2">No Disponible</Badge>}
                </td>
                <td><span className="badge bg-secondary">{p.categoria}</span></td>
                <td>${p.precio.toLocaleString('es-CL')}</td>
                <td>
                  <div className="d-flex gap-2"> 
                    <Link 
                      to={`/admin/productos/editar/${p.codigo}`} 
                      className="btn btn-outline-primary btn-sm px-3"
                      title="Editar"
                    >
                      <i className="fa-solid fa-pen me-1"></i> Editar
                    </Link>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="px-3"
                      onClick={() => handleDeleteClick(p)}
                      title="Eliminar"
                    >
                      <i className="fa-solid fa-trash me-1"></i> Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {productosVisibles.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* BOTÓN VER MÁS */}
      {productosFiltrados.length > visibleCount && (
        <div className="text-center mt-4">
            <Button variant="outline-primary" onClick={() => setVisibleCount(prev => prev + 25)}>
                <i className="fa-solid fa-eye me-2"></i> Ver más productos ({productosFiltrados.length - visibleCount} restantes)
            </Button>
        </div>
      )}

      <ModalConfirmacion
        show={showModal}
        titulo="Eliminar Producto"
        onCancelar={() => setShowModal(false)}
        onConfirmar={confirmDelete}
      >
        <Alert variant="danger" className="text-center mb-0">
          <i className="fa-solid fa-triangle-exclamation fa-2x mb-2 d-block"></i>
          ¿Estás seguro de eliminar <strong>{productoAEliminar?.nombre}</strong>?
          <br />
          Esta acción no se puede deshacer.
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminProductos;