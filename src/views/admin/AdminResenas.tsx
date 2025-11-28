import { useState, useEffect } from 'react';
import { Table, Button, Alert, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import { getAllResenas, deleteResena} from '../../services/PasteleriaService';
import type{ IResena } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { StarRating } from '../../components/StarRating';

function AdminResenas() {
  const [resenas, setResenas] = useState<IResena[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstrellas, setFiltroEstrellas] = useState('todas');

  // PAGINACIÓN
  const [visibleCount, setVisibleCount] = useState(25);

  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [resenaAEliminar, setResenaAEliminar] = useState<IResena | null>(null);

  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [resenaSeleccionada, setResenaSeleccionada] = useState<IResena | null>(null);

  const cargarDatos = async () => {
    const data = await getAllResenas();
    setResenas(data.reverse());
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setVisibleCount(25);
  }, [filtroTexto, filtroEstrellas]);

  const resenasFiltradas = resenas.filter((r) => {
    const texto = filtroTexto.toLowerCase();
    const coincideTexto = 
      r.nombreUsuario.toLowerCase().includes(texto) ||
      r.emailUsuario.toLowerCase().includes(texto) ||
      r.codigoProducto.toLowerCase().includes(texto) ||
      r.comentario.toLowerCase().includes(texto);
    const coincideEstrellas = 
      filtroEstrellas === 'todas' || r.calificacion.toString() === filtroEstrellas;
    return coincideTexto && coincideEstrellas;
  });

  // RESEÑAS VISIBLES
  const resenasVisibles = resenasFiltradas.slice(0, visibleCount);

  const handleDeleteClick = (resena: IResena) => {
    setResenaAEliminar(resena);
    setShowModalEliminar(true);
  };

  const confirmDelete = async () => {
    if (resenaAEliminar) {
      await deleteResena(resenaAEliminar.id);
      await cargarDatos();
      setShowModalEliminar(false);
    }
  };

  const handleVerDetalle = (resena: IResena) => {
    setResenaSeleccionada(resena);
    setShowModalDetalle(true);
  };

  return (
    <div>
      <h2 className="logo-text mb-4">Gestión de Reseñas</h2>

      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Buscar</Form.Label>
              <div className="position-relative">
                <Form.Control type="text" placeholder="Buscar..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} style={{ paddingLeft: '35px' }} />
                <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ top: '12px', left: '12px' }}></i>
              </div>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Calificación</Form.Label>
              <Form.Select value={filtroEstrellas} onChange={(e) => setFiltroEstrellas(e.target.value)}>
                <option value="todas">Todas</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

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
            {resenasVisibles.map((r) => (
              <tr key={r.id}>
                <td className="text-nowrap small">{r.fecha}</td>
                <td><Badge bg="light" text="dark" className="border">{r.codigoProducto}</Badge></td>
                <td>
                  <div className="fw-bold small">{r.nombreUsuario}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.emailUsuario}</div>
                </td>
                <td style={{ minWidth: '110px' }}><StarRating calificacion={r.calificacion} /></td>
                <td>
                  <div className="text-truncate text-secondary fst-italic" style={{ maxWidth: '250px' }} title={r.comentario}>
                    "{r.comentario}"
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={() => handleVerDetalle(r)} 
                      className="px-3"
                      title="Ver Completo"
                    >
                      <i className="fa-solid fa-eye me-1"></i> Ver
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(r)} 
                      className="px-3"
                      title="Eliminar"
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
      {resenasFiltradas.length > visibleCount && (
        <div className="text-center mt-4">
            <Button variant="outline-primary" onClick={() => setVisibleCount(prev => prev + 25)}>
                <i className="fa-solid fa-eye me-2"></i> Ver más reseñas ({resenasFiltradas.length - visibleCount} restantes)
            </Button>
        </div>
      )}

      {/* Modal Detalle */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-secondary">Opinión de Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {resenaSeleccionada && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold">{resenaSeleccionada.nombreUsuario}</h5>
                <span className="text-muted small">{resenaSeleccionada.fecha}</span>
              </div>
              <div className="mb-3">
                <StarRating calificacion={resenaSeleccionada.calificacion} />
                <span className="ms-2 badge bg-light text-dark border">
                  Producto: {resenaSeleccionada.codigoProducto}
                </span>
              </div>
              <div className="p-3 bg-light rounded border fst-italic text-secondary">
                <i className="fa-solid fa-quote-left me-2 text-muted opacity-50"></i>
                {resenaSeleccionada.comentario}
                <i className="fa-solid fa-quote-right ms-2 text-muted opacity-50"></i>
              </div>
              <div className="mt-3 text-end small text-muted">
                Email: {resenaSeleccionada.emailUsuario}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <ModalConfirmacion show={showModalEliminar} titulo="Eliminar Reseña" onCancelar={() => setShowModalEliminar(false)} onConfirmar={confirmDelete}>
        <Alert variant="danger" className="text-center mb-0 border-0">
          ¿Estás seguro de eliminar esta opinión?
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminResenas;