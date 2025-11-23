import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container className="py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-4">¡wuaja! Página no encontrada</h2>
      <p className="text-muted mb-4 lead">
        Parece que la página que buscas no existe o ha sido movida a otro lugar.
      </p>
      <div>
        <Link to="/">
          <Button className="btn-principal btn-lg px-5">
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </Container>
  );
}

export default NotFound;