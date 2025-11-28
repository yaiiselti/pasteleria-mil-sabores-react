import { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Card, Alert } from 'react-bootstrap';
import { getAllMensajes, markAsRead, deleteMensaje } from '../../services/ContactoService';
import type { IMensajeContacto } from '../../services/ContactoService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { useNotification } from '../../context/NotificationContext';

function AdminMensajes() {
  const [mensajes, setMensajes] = useState<IMensajeContacto[]>([]);
  const [filtro, setFiltro] = useState('');
  const { showNotification } = useNotification();

  // Modales
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<IMensajeContacto | null>(null);
  
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState<IMensajeContacto | null>(null);

  const cargarDatos = async () => {
    const data = await getAllMensajes();
    // Ordenamos: Primero los NO leídos, luego por fecha descendente (más recientes arriba)
    const ordenados = data.sort((a, b) => {
      if (a.leido === b.leido) {
        // Si tienen el mismo estado, ordena por fecha (string a fecha)
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
      // Si son distintos, el NO leido (false) va primero
      return a.leido ? 1 : -1;
    });
    setMensajes(ordenados);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mensajesFiltrados = mensajes.filter(m => 
    m.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    m.email.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleVerMensaje = async (mensaje: IMensajeContacto) => {
    setMensajeSeleccionado(mensaje);
    setShowModalDetalle(true);

    // Si es nuevo, lo marcamos como leído al abrirlo
    if (!mensaje.leido) {
      await markAsRead(mensaje.id);
      // Actualización visual inmediata
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

      <Form.Group className="mb-4">
        <Form.Control 
          type="text" 
          placeholder="Buscar por remitente o correo..." 
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ paddingLeft: '15px' }}
        />
      </Form.Group>

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
            {mensajesFiltrados.map((m) => {
              // Estilo condicional: Negrita si no está leído
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
                      {/* BOTÓN GRANDE: LEER */}
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

                      {/* BOTÓN GRANDE: ELIMINAR */}
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
            {mensajesFiltrados.length === 0 && (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No hay mensajes.</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* --- MODAL DE LECTURA --- */}
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
          {/* BOTÓN RESPONDER (Abre el cliente de correo del PC) */}
          <Button variant="primary" href={`mailto:${mensajeSeleccionado?.email}?subject=Respuesta%20Pastelería%20Mil%20Sabores`}>
            <i className="fa-solid fa-reply me-2"></i> Responder
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL ELIMINAR */}
      <ModalConfirmacion show={showModalEliminar} titulo="Eliminar Mensaje" onCancelar={() => setShowModalEliminar(false)} onConfirmar={confirmDelete}>
        <Alert variant="danger" className="text-center mb-0 border-0">
            ¿Borrar el mensaje de <strong>{mensajeAEliminar?.nombre}</strong>?
        </Alert>
      </ModalConfirmacion>

    </div>
  );
}

export default AdminMensajes;