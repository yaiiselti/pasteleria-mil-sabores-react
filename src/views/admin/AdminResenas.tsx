import { useState, useEffect } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import { getAllResenas, deleteResena } from '../../services/PasteleriaService';
import type { IResena } from '../../services/PasteleriaService';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { StarRating } from '../../components/StarRating';

function AdminResenas() {
  const [resenas, setResenas] = useState<IResena[]>([]);
  
  // Estado para el Modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [resenaAEliminar, setResenaAEliminar] = useState<IResena | null>(null);

  const cargarDatos = async () => {
    const data = await getAllResenas();
    // Opcional: Ordenar por fecha (más nuevas primero)
    // data.reverse(); 
    setResenas(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleDeleteClick = (resena: IResena) => {
    setResenaAEliminar(resena);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (resenaAEliminar) {
      await deleteResena(resenaAEliminar.id);
      await cargarDatos(); // Recargar tabla
      setShowModal(false);
    }
  };

  return (
    <div>
      <h2 className="logo-text mb-4">Gestión de Reseñas</h2>

      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Fecha</th>
              <th>Producto (Código)</th>
              <th>Usuario</th>
              <th>Calificación</th>
              <th>Comentario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resenas.map((r) => (
              <tr key={r.id}>
                <td>{r.fecha}</td>
                <td className="fw-bold text-primary">{r.codigoProducto}</td>
                <td>
                  <div className="fw-bold">{r.nombreUsuario}</div>
                  <small className="text-muted">{r.emailUsuario}</small>
                </td>
                <td>
                  {/* Reutilizamos nuestro componente visual */}
                  <StarRating calificacion={r.calificacion} />
                </td>
                <td>
                  {/* Cortamos el texto si es muy largo */}
                  <div className="text-truncate" style={{ maxWidth: '250px' }} title={r.comentario}>
                    {r.comentario}
                  </div>
                </td>
                <td>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="px-3"
                    onClick={() => handleDeleteClick(r)}
                    title="Eliminar Reseña"
                  >
                    <i className="fa-solid fa-trash me-1"></i> Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {resenas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  <i className="fa-regular fa-comments fa-2x mb-3 d-block"></i>
                  No hay reseñas registradas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de Eliminación (Estilo Serio) */}
      <ModalConfirmacion
        show={showModal}
        titulo="Eliminar Reseña"
        onCancelar={() => setShowModal(false)}
        onConfirmar={confirmDelete}
      >
        <Alert variant="danger" className="text-center mb-0">
          <i className="fa-solid fa-triangle-exclamation fa-2x mb-2 d-block"></i>
          ¿Estás seguro de eliminar la reseña de <strong>{resenaAEliminar?.nombreUsuario}</strong>?
          <br/>
          Esta acción es irreversible.
        </Alert>
      </ModalConfirmacion>
    </div>
  );
}

export default AdminResenas;