import { useState, useEffect } from 'react';
import { Table, Button, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProductos, deleteProducto } from '../../services/PasteleriaService';
import type { IProducto } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';

function AdminProductos() {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [filtro, setFiltro] = useState('');

  // Estado para el Modal (Estilo "Serio" para admin)
  const [showModal, setShowModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<IProducto | null>(null);

  // Cargar productos al inicio
  const cargarDatos = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado en tiempo real
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  // Manejo de eliminación
  const handleDeleteClick = (producto: IProducto) => {
    setProductoAEliminar(producto);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (productoAEliminar) {
      await deleteProducto(productoAEliminar.codigo);
      await cargarDatos(); // Recargamos la tabla
      setShowModal(false);
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

      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o código..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </Form.Group>

      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Código</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.codigo}>
                <td className="fw-bold">{p.codigo}</td>
                <td>
                  <img src={p.imagenes[0]} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td>{p.nombre}</td>
                <td><span className="badge bg-secondary">{p.categoria}</span></td>
                <td>${p.precio.toLocaleString('es-CL')}</td>
                <td>
                  <div className="d-flex gap-2"> {/* Usamos flexbox con gap para separar */}
                    
                    <Link 
                      to={`/admin/productos/editar/${p.codigo}`} 
                      className="btn btn-outline-primary btn-sm px-3" // px-3 los hace más anchos
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
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de Confirmación (Reutilizamos el componente, pero el estilo es "danger" por contexto) */}
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