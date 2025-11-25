import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Confirmacion() {
  const [orden, setOrden] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const ordenGuardada = localStorage.getItem('ultimaOrden');
    if (ordenGuardada) {
      try {
        setOrden(JSON.parse(ordenGuardada));
      } catch (e) {
        console.error("Error:", e);
      }
    }
    setCargando(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (cargando) return <div className="text-center py-5">Procesando pedido...</div>;

  if (!orden) {
    return (
      <Container className="py-5 text-center">
        <h3>No hay información de orden reciente.</h3>
        <Link to="/" className="btn btn-principal mt-3">Volver al Inicio</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow border-0 p-4" id="boleta-content">
        <Card.Body>
          
          {/* --- ENCABEZADO DE LA BOLETA --- */}
          <div className="text-center mb-4 border-bottom pb-4">
            <h2 className="logo-text text-primary mb-1">Pastelería Mil Sabores</h2>
            <p className="text-muted mb-1">Av. Siempre Viva 742, Santiago</p>
            <p className="text-muted mb-3">RUT: 77.123.456-7</p>
            
            <div className="d-inline-block border px-4 py-2 bg-light rounded">
              <h4 className="mb-0">Boleta Electrónica Nº {orden.id}</h4>
            </div>
          </div>

          {/* --- DATOS DE EMISIÓN Y CLIENTE --- */}
          <Row className="mb-4">
            <Col md={6}>
              <h6 className="text-uppercase text-muted small fw-bold">Datos del Cliente</h6>
              <p className="mb-0"><strong>Señor(a):</strong> {orden.cliente.nombre}</p>
              <p className="mb-0"><strong>Dirección:</strong> {orden.cliente.direccion}</p>
              <p className="mb-0"><strong>Fecha Entrega:</strong> {orden.fechaEntrega}</p>
            </Col>
            <Col md={6} className="text-md-end">
              <h6 className="text-uppercase text-muted small fw-bold">Detalles Emisión</h6>
              <p className="mb-0"><strong>Fecha:</strong> {orden.fechaEmision}</p>
              <p className="mb-0"><strong>Hora:</strong> {orden.horaEmision}</p>
              <p className="mb-0"><strong>Pago:</strong> {orden.cliente.medioPago === 'webpay' ? 'Tarjeta Crédito/Débito' : 'Transferencia'}</p>
            </Col>
          </Row>

          {/* --- DETALLE DE PRODUCTOS --- */}
          <div className="table-responsive mb-4">
            <Table bordered hover size="sm">
              <thead className="bg-light">
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-end">Precio Unit.</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {orden.productos.map((prod: any) => (
                  <tr key={prod.idUnico}>
                    <td>{prod.nombre} {prod.mensaje && <span className="small text-muted">({prod.mensaje})</span>}</td>
                    <td className="text-center">{prod.cantidad}</td>
                    <td className="text-end">${prod.precio.toLocaleString('es-CL')}</td>
                    <td className="text-end">${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* --- TOTALES --- */}
          <Row className="justify-content-end">
            <Col md={5}>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-end">Subtotal:</td>
                    <td className="text-end">${orden.subtotal.toLocaleString('es-CL')}</td>
                  </tr>
                  {orden.descuento > 0 && (
                    <tr className="text-success">
                      <td className="text-end">Descuento:</td>
                      <td className="text-end">-${orden.descuento.toLocaleString('es-CL')}</td>
                    </tr>
                  )}
                  <tr className="border-top fs-5 fw-bold">
                    <td className="text-end">Total a Pagar:</td>
                    <td className="text-end">${orden.total.toLocaleString('es-CL')}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* --- PIE DE PÁGINA --- */}
          <div className="text-center mt-5 pt-3 border-top">
            <h4 className="logo-text text-success">¡Gracias por su compra!</h4>
            <p className="text-muted small">Esperamos que disfrute de la dulzura de la vida.</p>
            
            <div className="d-flex justify-content-center gap-3 mt-4 no-print">
              <Button variant="outline-secondary" onClick={handlePrint}>
                <i className="fa-solid fa-print me-2"></i> Imprimir Boleta
              </Button>
              <Link to="/tienda" className="btn btn-principal">
                Volver a la Tienda
              </Link>
            </div>
          </div>

        </Card.Body>
      </Card>

      {/* Estilo para ocultar botones al imprimir */}
      <style>{`
        @media print {
          .no-print, .main-header, .main-footer { display: none !important; }
          #boleta-content { border: none !important; shadow: none !important; }
        }
      `}</style>
    </Container>
  );
}

export default Confirmacion;