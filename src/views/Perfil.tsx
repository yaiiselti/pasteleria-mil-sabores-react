import { Container, Card, Row, Col, Badge, Table, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // Importación correcta
import { Link } from 'react-router-dom';

function Perfil() {
  const { user, logout } = useAuth();

  // Simulamos leer el historial
  const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
  const ultimaOrden = JSON.parse(localStorage.getItem('ultimaOrden') || 'null');
  const pedidos = ultimaOrden ? [ultimaOrden, ...historial] : historial;

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h3>Debes iniciar sesión para ver tu perfil.</h3>
        <Link to="/login" className="btn btn-principal mt-3">Ir al Login</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="logo-text text-center mb-5">Mi Perfil</h2>
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="mb-3"><i className="fa-solid fa-circle-user fa-6x text-secondary"></i></div>
              <h4>{user.nombre}</h4>
              <p className="text-muted mb-1">{user.email}</p>
              <Badge bg="info" className="mb-3">{user.rol}</Badge>
              <hr />
              <div className="d-grid gap-2">
                <Button variant="outline-danger" onClick={logout}>Cerrar Sesión</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3"><h5 className="mb-0">Historial de Pedidos</h5></Card.Header>
            <Card.Body>
              {pedidos.length === 0 ? (
                <p className="text-center text-muted py-4">Aún no has realizado pedidos.</p>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead><tr><th>Orden #</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
                    <tbody>
                      {pedidos.map((pedido: any, index: number) => (
                        <tr key={index}>
                          <td>#{pedido.id || Math.floor(Math.random() * 1000)}</td>
                          <td>{pedido.fecha || new Date().toLocaleDateString()}</td>
                          <td>${(pedido.total || 0).toLocaleString('es-CL')}</td>
                          <td><Badge bg="success">Entregado</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Perfil;