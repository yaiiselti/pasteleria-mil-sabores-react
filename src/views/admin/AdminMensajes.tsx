import { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Card, Alert, Row, Col } from 'react-bootstrap'; // Importamos Row y Col
import { getAllMensajes, markAsRead, deleteMensaje } from '../../services/ContactoService';
import type { IMensajeContacto } from '../../services/ContactoService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { useNotification } from '../../context/NotificationContext';

function AdminMensajes() {
  const [mensajes, setMensajes] = useState<IMensajeContacto[]>([]);
  const { showNotification } = useNotification();

  // --- FILTROS ---
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // Nuevo Filtro

  // --- PAGINACIÓN ---
  const [visibleCount, setVisibleCount] = useState(25);

  // Modales
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<IMensajeContacto | null>(null);
  
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState<IMensajeContacto | null>(null);

  const cargarDatos = async () => {
    const data = await getAllMensajes();
    // Ordenamos: Primero los NO leídos, luego por fecha descendente
    const ordenados = data.sort((a, b) => {
      if (a.leido === b.leido) {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
      return a.leido ? 1 : -1;
    });
    setMensajes(ordenados);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Reiniciar paginación al cambiar cualquier filtro
  useEffect(() => {
    setVisibleCount(25);
  }, [filtroTexto, filtroEstado]);

  // --- LÓGICA DE FILTRADO COMBINADO ---
  const mensajesFiltrados = mensajes.filter(m => {
    // 1. Filtro Texto
    const texto = filtroTexto.toLowerCase();
    const coincideTexto = 
      m.nombre.toLowerCase().includes(texto) || 
      m.email.toLowerCase().includes(texto);

    // 2. Filtro Estado (Nuevo)
    const coincideEstado = 
      filtroEstado === 'todos' ||
      (filtroEstado === 'no_leidos' && !m.leido) ||
      (filtroEstado === 'leidos' && m.leido);

    return coincideTexto && coincideEstado;
  });

  // MENSAJES VISIBLES (Paginados)
  const mensajesVisibles = mensajesFiltrados.slice(0, visibleCount);

  const handleVerMensaje = async (mensaje: IMensajeContacto) => {
    setMensajeSeleccionado(mensaje);
    setShowModalDetalle(true);

    if (!mensaje.leido) {
      await markAsRead(mensaje.id);
      setMensajes(prev => prev.map(m => m.id === mensaje.id ? { ...m, leido: true } : m));
    }
  };

  const handleDeleteClick = (mensaje: IMensajeContacto) => {
    setMensajeAEliminar(mensaje);
    setShowModalEliminar(true);
  };

  const confirmDelete = async () => {
    if (mensajeAEliminar) {
      await deleteMensaje(mensajeAEliminar.id);
      await cargarDatos();
      setShowModalEliminar(false);
      showNotification('Mensaje eliminado.', 'success');
    }
  };

  return (
    <div>
      <h2 className="logo-text mb-4">Buzón de Mensajes</h2>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-white p-3 rounded shadow-sm mb-4 border">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold">Buscar</Form.Label>
              <div className="position-relative">
                <Form.Control 
                  type="text" 
                  placeholder="Buscar por remitente o correo..." 
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
              <Form.Label className="small text-muted fw-bold">Estado</Form.Label>
              <Form.Select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={filtroEstado === 'no_leidos' ? 'text-primary fw-bold border-primary' : ''}
              >
                <option value="todos">Todos los mensajes</option>
                <option value="no_leidos">📩 No Leídos</option>
                <option value="leidos">📨 Leídos</option>
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
              <th>Fecha</th>
              <th>Remitente</th>
              <th>Asunto / Resumen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mensajesVisibles.map((m) => {
              const estiloNoLeido = !m.leido ? { fontWeight: 'bold', color: '#000' } : { color: '#6c757d' };
              return (
                <tr key={m.id} className={!m.leido ? "bg-white" : "bg-light"}>
                  <td>
                    {!m.leido ? (
                      <Badge bg="primary" className="blink">NUEVO</Badge>
                    ) : (
                      <Badge bg="secondary" text="light" className="fw-normal">Leído</Badge>
                    )}
                  </td>
                  <td className="small text-muted" style={{ minWidth: '100px' }}>{m.fecha}</td>
                  <td style={estiloNoLeido}>
                    <div>{m.nombre}</div>
                    <div className="small fw-normal text-muted">{m.email}</div>
                  </td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: '300px', ...estiloNoLeido }}>
                       {m.comentario}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant={!m.leido ? "primary" : "outline-secondary"} 
                        size="sm" 
                        onClick={() => handleVerMensaje(m)}
                        className="px-3"
                        title="Leer Mensaje Completo"
                      >
                        <i className={`fa-solid ${!m.leido ? 'fa-envelope' : 'fa-envelope-open'} me-1`}></i> 
                        Leer
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteClick(m)}
                        className="px-3"
                        title="Eliminar Mensaje"
                      >
                        <i className="fa-solid fa-trash me-1"></i> Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {mensajesVisibles.length === 0 && (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No se encontraron mensajes con estos filtros.</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* BOTÓN VER MÁS */}
      {mensajesFiltrados.length > visibleCount && (
        <div className="text-center mt-4">
            <Button variant="outline-primary" onClick={() => setVisibleCount(prev => prev + 25)}>
                <i className="fa-solid fa-eye me-2"></i> Ver más mensajes ({mensajesFiltrados.length - visibleCount} restantes)
            </Button>
        </div>
      )}

      {/* --- MODAL DETALLE --- */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-primary">
            <i className="fa-regular fa-envelope me-2"></i> 
            Mensaje de Contacto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {mensajeSeleccionado && (
            <>
              <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                <div>
                    <h5 className="mb-1 fw-bold">{mensajeSeleccionado.nombre}</h5>
                    <div className="text-muted">
                        <i className="fa-solid fa-at me-1"></i>
                        <a href={`mailto:${mensajeSeleccionado.email}`} className="text-decoration-none">
                            {mensajeSeleccionado.email}
                        </a>
                    </div>
                </div>
                <div className="text-end text-muted">
                    <small>Recibido el:</small><br/>
                    <strong>{mensajeSeleccionado.fecha}</strong>
                </div>
              </div>
              <Card className="bg-light border-0 shadow-sm">
                <Card.Body className="p-4" style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: '1.6', color: '#333' }}>
                    {mensajeSeleccionado.comentario}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</Button>
          <Button variant="primary" href={`mailto:${mensajeSeleccionado?.email}?subject=Respuesta%20Pastelería%20Mil%20Sabores`}>
            <i className="fa-solid fa-reply me-2"></i> Responder
          </Button>
        </Modal.Footer>
      </Modal>

      <ModalConfirmacion show={showModalEliminar} titulo="Eliminar Mensaje" onCancelar={() => setShowModalEliminar(false)} onConfirmar={confirmDelete}>
        <Alert variant="danger" className="text-center mb-0 border-0">
            ¿Borrar el mensaje de <strong>{mensajeAEliminar?.nombre}</strong>?
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminMensajes;