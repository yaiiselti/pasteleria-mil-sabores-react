import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert,  ListGroup, ProgressBar } from 'react-bootstrap';
import { trackPedido } from '../services/PasteleriaService';

function Seguimiento() {
  const [busqueda, setBusqueda] = useState({ id: '', email: '' });
  const [pedido, setPedido] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda({ ...busqueda, [e.target.name]: e.target.value });
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.id || !busqueda.email) {
      setError('Por favor ingresa ambos datos.');
      return;
    }

    setLoading(true);
    setError('');
    setPedido(null);

    try {
      // Convertimos el ID a número
      const data = await trackPedido(parseInt(busqueda.id), busqueda.email);
      setPedido(data);
    } catch (err) {
      setError('No encontramos ningún pedido con esos datos. Verifica el ID y el correo.');
    } finally {
      setLoading(false);
    }
  };

  // Lógica visual para la barra de progreso (Estilo AliExpress)
  const getProgreso = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 25;
      case 'Por Confirmar Stock': return 25; // Mismo nivel inicial
      case 'En Preparación': return 50;
      case 'En Reparto': return 75;
      case 'Entregado': return 100;
      case 'Cancelado': return 100; // Lleno pero rojo
      default: return 0;
    }
  };

  const getVariant = (estado: string) => estado === 'Cancelado' ? 'danger' : 'success';

  return (
    <Container className="py-5" style={{ maxWidth: '800px' }}>
      <h2 className="text-center logo-text mb-4">Sigue tu Pedido</h2>
      
      {/* TARJETA DE BÚSQUEDA */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-4 bg-light rounded">
          <Form onSubmit={handleBuscar}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label fw-bold>Nº de Pedido (ID)</Form.Label>
                <Form.Control 
                  type="number" 
                  name="id" 
                  placeholder="Ej: 12345" 
                  value={busqueda.id} 
                  onChange={handleChange} 
                />
              </Col>
              <Col md={5}>
                <Form.Label fw-bold>Email de Compra</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  placeholder="ejemplo@correo.com" 
                  value={busqueda.email} 
                  onChange={handleChange} 
                />
              </Col>
              <Col md={3}>
                <Button type="submit" className="w-100 btn-principal" disabled={loading}>
                  {loading ? 'Buscando...' : 'Rastrear'}
                </Button>
              </Col>
            </Row>
          </Form>
          {error && <Alert variant="danger" className="mt-3 mb-0 text-center">{error}</Alert>}
        </Card.Body>
      </Card>

      {/* RESULTADO (BOLETA VIRTUAL) */}
      {pedido && (
        <div className="animate__animated animate__fadeIn">
          
          {/* 1. ENCABEZADO DE ESTADO */}
          <Card className={`mb-4 shadow border-${pedido.estado === 'Cancelado' ? 'danger' : 'primary'}`}>
            <Card.Body className="text-center p-4">
              <h4 className="text-muted small text-uppercase mb-2">Estado Actual</h4>
              <h2 className={`fw-bold text-${pedido.estado === 'Cancelado' ? 'danger' : 'primary'}`}>
                {pedido.estado}
              </h2>

              {/* BARRA DE PROGRESO */}
              <div className="mt-4 px-4">
                <ProgressBar 
                  now={getProgreso(pedido.estado)} 
                  variant={getVariant(pedido.estado)} 
                  animated={pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado'}
                  style={{ height: '10px' }}
                />
                <div className="d-flex justify-content-between mt-2 small text-muted">
                    <span>Recibido</span>
                    <span>Preparación</span>
                    <span>Reparto</span>
                    <span>Entregado</span>
                </div>
              </div>

              {/* ALERTA DE CANCELACIÓN (Tu requerimiento específico) */}
              {pedido.estado === 'Cancelado' && (
                <Alert variant="danger" className="mt-4 mb-0">
                  <i className="fa-solid fa-circle-exclamation me-2"></i>
                  <strong>¡Atención!</strong> Tu pedido ha sido cancelado. 
                  <br/>
                  Esto puede deberse a falta de stock o problemas con el pago. Contáctanos para reembolso.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* 2. DETALLE DE LA COMPRA */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
               <h5 className="mb-0 logo-text text-secondary">Detalle de la Compra #{pedido.id}</h5>
            </Card.Header>
            <Card.Body className="p-4">
                <Row className="mb-4">
                    <Col sm={6}>
                        <h6 className="fw-bold">Cliente:</h6>
                        <p className="mb-0 text-muted">{pedido.cliente.nombre}</p>
                        <p className="mb-0 text-muted">{pedido.cliente.email}</p>
                    </Col>
                    <Col sm={6} className="text-sm-end mt-3 mt-sm-0">
                        <h6 className="fw-bold">Fecha Estimada Entrega:</h6>
                        <p className="fs-5 text-primary fw-bold">{pedido.fechaEntrega || 'Por definir'}</p>
                        <p className="text-muted small">Región: {pedido.cliente.region} / {pedido.cliente.comuna}</p>
                    </Col>
                </Row>

                <h6 className="fw-bold border-bottom pb-2 mb-3">Productos</h6>
                <ListGroup variant="flush">
                    {pedido.productos.map((prod: any, idx: number) => (
                        <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center px-0">
                            <div>
                                <span className="fw-bold text-dark">{prod.cantidad}x </span>
                                <span>{prod.nombre}</span>
                            </div>
                            <span>${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <hr />
                <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Total Pagado:</span>
                    <span className="text-primary">${pedido.total.toLocaleString('es-CL')}</span>
                </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
}

export default Seguimiento;