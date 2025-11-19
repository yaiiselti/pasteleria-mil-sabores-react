import { Modal, Button } from 'react-bootstrap';

// Definimos qué propiedades necesita este componente para funcionar
interface Props {
  show: boolean;             // ¿Está visible?
  titulo: string;            // Título del modal
  children: React.ReactNode; // El contenido (texto) del cuerpo
  onConfirmar: () => void;   // Función al hacer click en "Confirmar"
  onCancelar: () => void;    // Función al hacer click en "Cancelar"
}

function ModalConfirmacion({ show, titulo, children, onConfirmar, onCancelar }: Props) {
  return (
    <Modal show={show} onHide={onCancelar} centered>
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title as="h4" className="logo-text text-primary">
          {titulo}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center fs-5">
        {children}
      </Modal.Body>
      
      <Modal.Footer className="border-top-0 justify-content-center gap-3">
        <Button variant="outline-secondary" onClick={onCancelar} className="px-4">
          Cancelar
        </Button>
        <Button className="btn-principal px-4" onClick={onConfirmar}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfirmacion;