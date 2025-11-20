import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function PagoError() {
  return (
    <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
      <div className="mb-4 text-danger"><i className="fa-solid fa-circle-xmark fa-5x"></i></div>
      <h2 className="logo-text text-danger mb-3">¡Ups! Algo salió mal</h2>
      <Alert variant="warning" className="text-start">
        <p className="mb-0">No pudimos procesar tu pago. Por favor intenta nuevamente.</p>
      </Alert>
      <div className="d-flex gap-3 justify-content-center mt-4">
        <Link to="/checkout"><Button variant="outline-dark">Intentar de nuevo</Button></Link>
        <Link to="/tienda"><Button className="btn-principal">Volver a la Tienda</Button></Link>
      </div>
    </Container>
  );
}
export default PagoError;