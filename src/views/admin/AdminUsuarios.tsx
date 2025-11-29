import { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Badge, Modal, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; 
import { getUsuarios, deleteUsuario } from '../../services/AdminService';
import type { IUsuario } from '../../services/AdminService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [filtro, setFiltro] = useState('');
  
  // Modales
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<IUsuario | null>(null);
  
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<IUsuario | null>(null);

  const { user, logout } = useAuth(); // Importamos logout para auto-eliminación
  const { showNotification } = useNotification();
  const navigate = useNavigate(); // Para redirigir tras auto-eliminación
  const SUPER_ADMIN_EMAIL = 'admin@duoc.cl';

  const cargarDatos = async () => {
    const data = await getUsuarios();
    setUsuarios(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    u.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    u.run.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleDeleteClick = (usuario: IUsuario) => {
    // REGLA 1: El Super Admin es INTOCABLE
    if (usuario.email === SUPER_ADMIN_EMAIL) {
      showNotification('⛔ ACCIÓN DENEGADA: El Administrador Principal es intocable.', 'danger');
      return;
    }

    // REGLA 2: Permitir borrar cualquier otro (incluso a uno mismo, con advertencia)
    setUsuarioAEliminar(usuario);
    setShowModalEliminar(true);
  };

  const confirmDelete = async () => {
    if (usuarioAEliminar) {
      await deleteUsuario(usuarioAEliminar.run);
      
      // REGLA 3: Si me eliminé a mí mismo -> EXPULSIÓN INMEDIATA
      if (user && usuarioAEliminar.run === user.run) {
         setShowModalEliminar(false);
         logout(); // Cerramos sesión
         navigate('/login'); // Redirigimos al login
         showNotification('Tu cuenta ha sido eliminada. Sesión cerrada.', 'info');
         return;
      }

      await cargarDatos();
      setShowModalEliminar(false);
      showNotification('Usuario eliminado correctamente.', 'success');
    }
  };

  const handleVerDetalle = (usuario: IUsuario) => {
    setUsuarioSeleccionado(usuario);
    setShowModalDetalle(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="logo-text">Gestión de Usuarios</h2>
        <Link to="/admin/usuarios/nuevo" className="btn btn-success">
          <i className="fa-solid fa-user-plus me-2"></i> Nuevo Usuario
        </Link>
      </div>

      <Form.Group className="mb-4">
        <Form.Control 
          type="text" 
          placeholder="Buscar por nombre, apellido o RUN..." 
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </Form.Group>

      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>RUN</th>
              <th>Nombre Completo</th>
              <th>Correo</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => {
              const esSuperAdmin = u.email === SUPER_ADMIN_EMAIL;
              const soyYo = user?.run === u.run;

              return (
                <tr key={u.run} className={soyYo ? "table-warning" : ""}>
                  <td className="fw-bold">{u.run} {soyYo && <span className="badge bg-primary ms-2">Tú</span>}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td>
                    {u.email}
                    {esSuperAdmin && <i className="fa-solid fa-crown text-warning ms-2" title="Super Admin"></i>}
                  </td>
                  <td><Badge bg={u.tipo === 'Administrador' ? 'danger' : 'info'}>{u.tipo}</Badge></td>
                  <td>
                    <div className="d-flex gap-2">
                      {/* BOTÓN VER FICHA */}
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => handleVerDetalle(u)} 
                        className="px-3" 
                        title="Ver Ficha Completa"
                      >
                        <i className="fa-solid fa-eye me-1"></i> Ficha
                      </Button>

                      {/* BOTÓN EDITAR */}
                      <Link 
                        to={`/admin/usuarios/editar/${u.run}`} 
                        className="btn btn-outline-primary btn-sm px-3" 
                        title="Editar Datos"
                      >
                        <i className="fa-solid fa-pen me-1"></i> Editar
                      </Link>
                      
                      {/* BOTÓN ELIMINAR */}
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteClick(u)}
                        className="px-3"
                        disabled={esSuperAdmin} // Solo deshabilitado visualmente para Super Admin
                        style={esSuperAdmin ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                        title={esSuperAdmin ? "No se puede eliminar" : "Eliminar Usuario"}
                      >
                        <i className="fa-solid fa-trash me-1"></i> Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* MODAL DETALLE (Ficha Completa) */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="logo-text text-success">Ficha de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {usuarioSeleccionado && (
            <div className="text-center">
              <div className="mb-3"><i className="fa-solid fa-circle-user fa-5x text-secondary"></i></div>
              <h4 className="fw-bold">{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellidos}</h4>
              <Badge bg={usuarioSeleccionado.tipo === 'Administrador' ? 'danger' : 'info'} className="mb-4">{usuarioSeleccionado.tipo}</Badge>
              
              <Row className="text-start border-top pt-3">
                <Col xs={6} className="mb-2"><strong>RUN:</strong></Col>
                <Col xs={6} className="mb-2 text-muted">{usuarioSeleccionado.run}</Col>
                
                <Col xs={6} className="mb-2"><strong>Email:</strong></Col>
                <Col xs={6} className="mb-2 text-muted">{usuarioSeleccionado.email}</Col>
                
                <Col xs={6} className="mb-2"><strong>Región:</strong></Col>
                <Col xs={6} className="mb-2 text-muted">{usuarioSeleccionado.region || 'No especificada'}</Col>
                
                <Col xs={6} className="mb-2"><strong>Comuna:</strong></Col>
                <Col xs={6} className="mb-2 text-muted">{usuarioSeleccionado.comuna || 'No especificada'}</Col>
                
                {/* Restauramos visualización de estos datos */}
                <Col xs={6} className="mb-2"><strong>Cumpleaños:</strong></Col>
                <Col xs={6} className="mb-2 text-muted">{usuarioSeleccionado.fechaNacimiento || 'No registrado'}</Col>
                
                <Col xs={6} className="mb-2"><strong>Código Promo:</strong></Col>
                <Col xs={6} className="mb-2 text-muted">{usuarioSeleccionado.codigoPromo || 'Ninguno'}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModalDetalle(false)}>Cerrar</Button></Modal.Footer>
      </Modal>

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      <ModalConfirmacion show={showModalEliminar} titulo="Eliminar Usuario" onCancelar={() => setShowModalEliminar(false)} onConfirmar={confirmDelete}>
        <Alert variant="danger" className="text-center mb-0">
          {usuarioAEliminar?.run === user?.run ? (
             <>
               <i className="fa-solid fa-triangle-exclamation fa-2x mb-2 d-block text-danger"></i>
               <strong>¡ADVERTENCIA DE SEGURIDAD!</strong><br/>
               Estás a punto de eliminar <strong>tu propia cuenta</strong>.
               <br/><br/>
               Si confirmas, se cerrará tu sesión inmediatamente y perderás acceso al panel de administración.
             </>
          ) : (
             <>
                ¿Estás seguro de eliminar al usuario <strong>{usuarioAEliminar?.nombre}</strong>?
                <br/>Esta acción es irreversible.
             </>
          )}
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminUsuarios;