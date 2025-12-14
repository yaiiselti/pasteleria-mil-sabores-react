import { Row, Col, Card, Table } from 'react-bootstrap';

// Este componente recibe la "orden" como propiedad
interface BoletaProps {
    orden: any;
}

const Boleta = ({ orden }: BoletaProps) => {
  if (!orden) return null;

  const esMayorista = orden.estado === 'Por Confirmar Stock';

  return (
    <Card className="shadow-none border-0" id="documento-impresion">
        <Card.Body className="p-0 p-md-4">
          <Row className="mb-5 align-items-start">
            <Col xs={8}>
                <h2 className="logo-text text-primary mb-2" style={{ fontSize: '2rem' }}>Pastelería Mil Sabores</h2>
                <div className="datos-empresa text-muted">
                    <p className="mb-0"><strong>Giro:</strong> Elaboración y Venta de Productos de Pastelería</p>
                    <p className="mb-0"><strong>Dirección:</strong> Av. Siempre Viva 742, Santiago</p>
                    <p className="mb-0"><strong>Teléfono:</strong> +56 9 9876 5432</p>
                    <p className="mb-0"><strong>Email:</strong> contacto@milsabores.cl</p>
                    <p className="mb-0"><strong>Web:</strong> www.milsabores.cl</p>
                </div>
            </Col>

            <Col xs={4}>
                {/* Asegúrate de tener el CSS 'recuadro-rut' o usa estilos inline aquí si prefieres */}
                <div className="recuadro-rut border border-danger p-2 text-center text-danger fw-bold" style={{borderWidth: '3px'}}>
                    <div>R.U.T.: 77.123.456-7</div>
                    <div className="py-2 fs-5 text-dark">
                        {esMayorista ? 'SOLICITUD DE PEDIDO' : 'BOLETA ELECTRÓNICA'}
                    </div>
                    <div>Nº {orden.id}</div>
                </div>
                <div className="text-center mt-2 text-danger fw-bold small">
                    SII - TROPICONCE
                </div>
            </Col>
          </Row>

          <Row className="mb-4 border border-secondary mx-0 py-3 bg-light bg-opacity-25 rounded-1">
             <Col sm={7} className="border-end">
                <h6 className="fw-bold text-uppercase small mb-3 text-secondary">Datos del Cliente (Receptor)</h6>
                <Row>
                    <Col xs={3} className="fw-bold">Señor(a):</Col>
                    <Col xs={9}>{orden.cliente.nombre}</Col>
                    <Col xs={3} className="fw-bold">Email:</Col>
                    <Col xs={9}>{orden.cliente.email}</Col>
                    <Col xs={3} className="fw-bold">Dirección:</Col>
                    <Col xs={9}>{orden.cliente.direccion}, {orden.cliente.comuna}</Col>
                </Row>
             </Col>

             <Col sm={5}>
                <h6 className="fw-bold text-uppercase small mb-3 text-secondary">Detalles de Emisión</h6>
                <Row>
                    <Col xs={5} className="fw-bold">Fecha Emisión:</Col>
                    <Col xs={7}>{orden.fechaEmision}</Col>
                    <Col xs={5} className="fw-bold">Hora:</Col>
                    <Col xs={7}>{orden.horaEmision}</Col>
                    <Col xs={5} className="fw-bold">Fecha Entrega:</Col>
                    <Col xs={7}>{orden.fechaEntrega || 'Por definir'}</Col>
                </Row>
             </Col>
          </Row>

          <div className="table-responsive mb-0">
            <Table bordered size="sm" className="mb-0">
              <thead className="bg-light text-center text-uppercase small">
                <tr>
                  <th style={{width: '60%'}}>Descripción / Producto</th>
                  <th style={{width: '10%'}}>Cant.</th>
                  <th style={{width: '15%'}}>Precio Unit.</th>
                  <th style={{width: '15%'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orden.productos.map((prod: any, idx: number) => (
                  <tr key={idx}>
                    <td>
                        <span className="fw-bold">{prod.nombre}</span>
                        {prod.mensaje && <div className="small text-muted fst-italic mt-1">Nota: "{prod.mensaje}"</div>}
                    </td>
                    <td className="text-center align-middle">{prod.cantidad}</td>
                    <td className="text-end align-middle">${prod.precio.toLocaleString('es-CL')}</td>
                    <td className="text-end align-middle fw-bold">${(prod.precio * prod.cantidad).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Row className="justify-content-end mt-0">
            <Col md={5} xs={6}>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <td className="bg-light fw-bold text-end">Subtotal Neto:</td>
                    <td className="text-end">${orden.subtotal?.toLocaleString('es-CL')}</td>
                  </tr>
                  {orden.descuento > 0 && (
                    <tr>
                      <td className="bg-light fw-bold text-end text-success">Descuento:</td>
                      <td className="text-end text-success">-${orden.descuento?.toLocaleString('es-CL')}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="bg-light fw-bold text-end fs-5">TOTAL A PAGAR:</td>
                    <td className="text-end fw-bold fs-5">${orden.total?.toLocaleString('es-CL')}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <div className="mt-5 pt-4 text-center small text-muted border-top d-none d-print-block">
             <p className="mb-1">Gracias por preferir Pastelería Mil Sabores.</p>
             <p className="mb-0">Copia Cliente - Documento generado electrónicamente.</p>
          </div>
        </Card.Body>
    </Card>
  );
};

export default Boleta;