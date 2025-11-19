import { Row, Col, Card } from 'react-bootstrap';

function AdminDashboard() {
  return (
    <div>
      <h2 className="logo-text mb-4">Dashboard</h2>
      <p className="text-muted">Resumen de las actividades de la tienda.</p>

      <Row className="g-4">
        {/* Tarjeta 1 */}
        <Col md={4}>
          <Card className="border-0 shadow-sm text-white bg-primary h-100">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <h1 className="display-4 fw-bold">16</h1>
              <p className="mb-0 fs-5">Productos Totales</p>
            </Card.Body>
          </Card>
        </Col>

        {/* Tarjeta 2 */}
        <Col md={4}>
          <Card className="border-0 shadow-sm text-white bg-success h-100">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <h1 className="display-4 fw-bold">3</h1>
              <p className="mb-0 fs-5">Usuarios Registrados</p>
            </Card.Body>
          </Card>
        </Col>

        {/* Tarjeta 3 */}
        <Col md={4}>
          <Card className="border-0 shadow-sm text-white bg-warning h-100">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <h1 className="display-4 fw-bold text-dark">$400k</h1>
              <p className="mb-0 fs-5 text-dark">Ventas del Mes</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;