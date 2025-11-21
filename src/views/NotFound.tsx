import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container className="py-5 text-center">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-4">Página no encontrada</h2>
      <p className="text-muted mb-4">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      <Link to="/">
        <Button className="btn-principal btn-lg">Volver al Inicio</Button>
      </Link>
    </Container>
  );
}

export default NotFound;