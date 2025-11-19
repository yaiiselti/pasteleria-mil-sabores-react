import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Confirmacion() {
  const [orden, setOrden] = useState<any>(null);

  useEffect(() => {
    const ordenGuardada = localStorage.getItem('ultimaOrden');
    if (ordenGuardada) {
      setOrden(JSON.parse(ordenGuardada));
    }
  }, []);

  if (!orden) {
    return (
      <Container className="py-5 text-center">
        <h3>No hay información de orden reciente.</h3>
        <Link to="/" className="btn btn-principal">Volver al Inicio</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow border-0">
        <Card.Body className="p-5">
          
          <div className="text-center mb-5">
            <h2 className="logo-text text-success mb-3">¡Compra Exitosa!</h2>
            <p className="lead">Gracias por tu preferencia, {orden.cliente.nombre}.</p>
            <p className="text-muted">Orden #{orden.id} - Fecha: {orden.fecha}</p>
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <h5 className="mb-3 border-bottom pb-2">Detalles de Envío</h5>
              <p><strong>Dirección:</strong> {orden.cliente.direccion}</p>
              <p><strong>Email:</strong> {orden.cliente.email}</p>
            </Col>
            <Col md={6}>
              <h5 className="mb-3 border-bottom pb-2">Resumen de Pago</h5>
              <p><strong>Método:</strong> Tarjeta de Crédito</p>
              <p><strong>Total Pagado:</strong> <span className="fw-bold text-primary">${orden.total.toLocaleString('es-CL')}</span></p>
            </Col>
          </Row>

          <h5 className="mb-3">Productos</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orden.productos.map((prod: any) => (
                <tr key={prod.idUnico}>
                  <td>{prod.nombre}</td>
                  <td>{prod.cantidad}</td>
                  <td>${prod.precio.toLocaleString('es-CL')}</td>
                  <td>${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-center mt-5">
            <Link to="/tienda" className="btn btn-principal px-5">
              Seguir Comprando
            </Link>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default Confirmacion;