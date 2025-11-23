import { useState, useEffect } from 'react';
import { Table, Button, Alert, Form, Row, Col, Badge } from 'react-bootstrap';
import { getAllResenas, deleteResena} from '../../services/PasteleriaService';
import type{ IResena } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { StarRating } from '../../components/StarRating';

function AdminResenas() {
  const [resenas, setResenas] = useState<IResena[]>([]);
  
  // --- ESTADOS PARA FILTROS ---
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstrellas, setFiltroEstrellas] = useState('todas');

  // Estado para el Modal
  const [showModal, setShowModal] = useState(false);
  const [resenaAEliminar, setResenaAEliminar] = useState<IResena | null>(null);

  const cargarDatos = async () => {
    const data = await getAllResenas();
    // Ordenamos por fecha (más nuevas primero) para que el admin vea lo último
    setResenas(data.reverse());
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const resenasFiltradas = resenas.filter((r) => {
    // 1. Filtro por Texto (Busca en nombre, email, producto o comentario)
    const texto = filtroTexto.toLowerCase();
    const coincideTexto = 
      r.nombreUsuario.toLowerCase().includes(texto) ||
      r.emailUsuario.toLowerCase().includes(texto) ||
      r.codigoProducto.toLowerCase().includes(texto) ||
      r.comentario.toLowerCase().includes(texto);

    // 2. Filtro por Estrellas
    const coincideEstrellas = 
      filtroEstrellas === 'todas' || r.calificacion.toString() === filtroEstrellas;

    return coincideTexto && coincideEstrellas;
  });

  const handleDeleteClick = (resena: IResena) => {
    setResenaAEliminar(resena);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (resenaAEliminar) {
      await deleteResena(resenaAEliminar.id);
      await cargarDatos();
      setShowModal(false);
    }
  };

  return (
    <div>
      <h2 className="logo-text mb-4">Gestión de Reseñas</h2>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Buscar</Form.Label>
              <div className="position-relative">
                <Form.Control 
                  type="text" 
                  placeholder="Buscar por usuario, producto o palabra clave..." 
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  style={{ paddingLeft: '35px' }} // Espacio para el ícono
                />
                <i 
                  className="fa-solid fa-magnifying-glass position-absolute text-muted" 
                  style={{ top: '12px', left: '12px' }}
                ></i>
              </div>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Calificación</Form.Label>
              <Form.Select 
                value={filtroEstrellas} 
                onChange={(e) => setFiltroEstrellas(e.target.value)}
              >
                <option value="todas">Todas las calificaciones</option>
                <option value="5">⭐⭐⭐⭐⭐ (Excelentes)</option>
                <option value="4">⭐⭐⭐⭐ (Buenas)</option>
                <option value="3">⭐⭐⭐ (Regulares)</option>
                <option value="2">⭐⭐ (Malas)</option>
                <option value="1">⭐ (Pésimas)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Usuario</th>
              <th>Calificación</th>
              <th>Comentario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resenasFiltradas.map((r) => (
              <tr key={r.id}>
                <td className="text-nowrap small">{r.fecha}</td>
                
                <td>
                  <Badge bg="light" text="dark" className="border">
                    {r.codigoProducto}
                  </Badge>
                </td>
                
                <td>
                  <div className="fw-bold small">{r.nombreUsuario}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.emailUsuario}</div>
                </td>
                
                <td style={{ minWidth: '110px' }}>
                  <StarRating calificacion={r.calificacion} />
                </td>
                
                <td>
                  <div 
                    className="text-truncate text-secondary fst-italic" 
                    style={{ maxWidth: '250px' }} 
                    title={r.comentario}
                  >
                    "{r.comentario}"
                  </div>
                </td>
                
                <td>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleDeleteClick(r)}
                    title="Eliminar Reseña"
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="fa-solid fa-trash"></i> 
                    <span className="d-none d-lg-inline">Eliminar</span>
                  </Button>
                </td>
              </tr>
            ))}
            
            {resenasFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  <i className="fa-solid fa-filter-circle-xmark fa-3x mb-3 text-secondary opacity-50"></i>
                  <p>No se encontraron reseñas con esos filtros.</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      <ModalConfirmacion
        show={showModal}
        titulo="Eliminar Reseña"
        onCancelar={() => setShowModal(false)}
        onConfirmar={confirmDelete}
      >
        <Alert variant="danger" className="text-center mb-0 border-0">
          <div className="mb-3">
            <i className="fa-solid fa-circle-exclamation fa-3x text-danger"></i>
          </div>
          <h5>¿Estás seguro?</h5>
          <p className="mb-0">
            Vas a eliminar la opinión de <strong>{resenaAEliminar?.nombreUsuario}</strong> sobre el producto <strong>{resenaAEliminar?.codigoProducto}</strong>.
          </p>
          <small className="d-block mt-2 text-muted">Esta acción no se puede deshacer.</small>
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminResenas;