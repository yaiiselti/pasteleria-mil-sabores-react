import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importamos Navigate

function Confirmacion() {
  const [orden, setOrden] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Intentamos leer inmediatamente al cargar
    const ordenGuardada = localStorage.getItem('ultimaOrden');
    
    if (ordenGuardada) {
      try {
        setOrden(JSON.parse(ordenGuardada));
      } catch (e) {
        console.error("Error al leer la orden:", e);
      }
    }
    setCargando(false);
  }, []);

  if (cargando) {
    return <div className="text-center py-5">Procesando pedido...</div>;
  }

  // Si no hay orden, redirigir al Home o mostrar mensaje
  if (!orden) {
    return (
      <Container className="py-5 text-center">
        <div className="mb-4 text-muted">
          <i className="fa-solid fa-circle-question fa-5x"></i>
        </div>
        <h3>No hay información de orden reciente.</h3>
        <p>Parece que no has completado ningún proceso de compra.</p>
        <Link to="/" className="btn btn-principal mt-3">Volver al Inicio</Link>
      </Container>
    );
  }

  // Si SÍ hay orden, mostramos el resumen
  return (
    <Container className="py-5">
      <Card className="shadow border-0">
        <Card.Body className="p-5">
          
          <div className="text-center mb-5">
            <i className="fa-solid fa-circle-check fa-4x text-success mb-3"></i>
            <h2 className="logo-text text-success mb-3">¡Compra Exitosa!</h2>
            <p className="lead">Gracias por tu preferencia, <strong>{orden.cliente.nombre}</strong>.</p>
            <p className="text-muted">Orden #{orden.id} - Fecha: {orden.fecha}</p>
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <h5 className="mb-3 border-bottom pb-2">Detalles de Envío</h5>
              <p className="mb-1"><strong>Dirección:</strong> {orden.cliente.direccion}</p>
              <p className="mb-1"><strong>Comuna:</strong> {orden.cliente.comuna || 'No especificada'}</p>
              <p className="mb-1"><strong>Email:</strong> {orden.cliente.email}</p>
            </Col>
            <Col md={6}>
              <h5 className="mb-3 border-bottom pb-2">Resumen de Pago</h5>
              <p className="mb-1"><strong>Método:</strong> Tarjeta de Crédito</p>
              <p className="mb-1"><strong>Total Pagado:</strong> <span className="fw-bold text-primary fs-5">${orden.total.toLocaleString('es-CL')}</span></p>
            </Col>
          </Row>

          <h5 className="mb-3">Productos</h5>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="bg-light">
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-end">Precio Unit.</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orden.productos.map((prod: any) => (
                  <tr key={prod.idUnico}>
                    <td>
                      {prod.nombre}
                      {prod.mensaje && <div className="small text-muted fst-italic">Msg: "{prod.mensaje}"</div>}
                    </td>
                    <td className="text-center">{prod.cantidad}</td>
                    <td className="text-end">${prod.precio.toLocaleString('es-CL')}</td>
                    <td className="text-end fw-bold">${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="text-center mt-5">
            <Link to="/tienda" className="btn btn-principal px-5 rounded-pill">
              Seguir Comprando
            </Link>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default Confirmacion;