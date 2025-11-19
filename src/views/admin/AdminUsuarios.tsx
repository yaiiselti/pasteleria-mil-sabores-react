import { useState, useEffect } from 'react';
import { Table, Button, ButtonGroup, Form, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getUsuarios, deleteUsuario} from '../../services/PasteleriaService';
import type { IUsuario } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [filtro, setFiltro] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<IUsuario | null>(null);

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
    setUsuarioAEliminar(usuario);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (usuarioAEliminar) {
      await deleteUsuario(usuarioAEliminar.run);
      await cargarDatos();
      setShowModal(false);
    }
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
            {usuariosFiltrados.map((u) => (
              <tr key={u.run}>
                <td className="fw-bold">{u.run}</td>
                <td>{u.nombre} {u.apellidos}</td>
                <td>{u.email}</td>
                <td>
                  <Badge bg={u.tipo === 'Administrador' ? 'danger' : 'info'}>
                    {u.tipo}
                  </Badge>
                </td>
                <td>
                  <ButtonGroup size="sm">
                    <Link to={`/admin/usuarios/editar/${u.run}`} className="btn btn-outline-primary">
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                    <Button variant="outline-danger" onClick={() => handleDeleteClick(u)}>
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ModalConfirmacion
        show={showModal}
        titulo="Eliminar Usuario"
        onCancelar={() => setShowModal(false)}
        onConfirmar={confirmDelete}
      >
        <Alert variant="danger" className="text-center mb-0">
          <i className="fa-solid fa-user-xmark fa-2x mb-2 d-block"></i>
          ¿Estás seguro de eliminar al usuario <strong>{usuarioAEliminar?.nombre}</strong>?
          <br/>
          Esta acción es irreversible.
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminUsuarios;