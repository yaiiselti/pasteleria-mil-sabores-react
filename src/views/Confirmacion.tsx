import { useEffect, useState, useRef } from 'react'; 
import { Container, Card, Row, Col, Table, Button, Alert, Tooltip, OverlayTrigger, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { savePedido } from '../services/PasteleriaService';

function Confirmacion() {
  const [orden, setOrden] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [errorSync, setErrorSync] = useState('');
  const [copiado, setCopiado] = useState(false);
  
  const envioIniciado = useRef(false);

  useEffect(() => {
    const procesarOrden = async () => {
      const ordenGuardadaStr = localStorage.getItem('ultimaOrden');
      
      if (ordenGuardadaStr) {
        try {
          const ordenLocal = JSON.parse(ordenGuardadaStr);

          if (!ordenLocal.synced) {
            if (envioIniciado.current) return;
            envioIniciado.current = true;

            const ordenGuardadaDB = await savePedido(ordenLocal);

            if (ordenGuardadaDB) {
              const ordenFinal = { ...ordenGuardadaDB, synced: true };
              setOrden(ordenFinal);
              localStorage.setItem('ultimaOrden', JSON.stringify(ordenFinal));
              
              const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
              if (!historial.find((h: any) => h.id === ordenFinal.id)) {
                 historial.push(ordenFinal);
                 localStorage.setItem('historialPedidos', JSON.stringify(historial));
              }

            } else {
              envioIniciado.current = false; 
              console.warn("Fallo al guardar en BD.");
              setErrorSync("Hubo un problema de conexión. Hemos guardado tu pedido localmente.");
              setOrden(ordenLocal);
            }
          } else {
            setOrden(ordenLocal);
          }
        } catch (e) {
          console.error("Error al procesar orden:", e);
        }
      }
      setCargando(false);
    };

    procesarOrden();
  }, []);

  const handlePrint = () => window.print();

  const copiarID = () => {
    if (orden?.id) {
        navigator.clipboard.writeText(orden.id.toString());
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }
  };

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Generando documento...</p></div>;

  if (!orden) {
    return (
      <Container className="py-5 text-center d-print-none">
        <h3>No hay información de orden reciente.</h3>
        <Link to="/tienda" className="btn btn-principal mt-3">Volver a la Tienda</Link>
      </Container>
    );
  }

  const esMayorista = orden.estado === 'Por Confirmar Stock';

  return (
    <Container className="py-5">
      
      {/* ============================================== */}
      {/* ZONA DE PANTALLA (UX AMIGABLE - NO IMPRIMIR) */}
      {/* ============================================== */}
      <div className="d-print-none animate__animated animate__fadeIn">
          
          {errorSync && (
            <Alert variant="danger" className="shadow-sm border-danger mb-4">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>{errorSync}
            </Alert>
          )}

          {esMayorista && (
             <Alert variant="warning" className="shadow-sm border-warning mb-4">
                <h5 className="alert-heading fw-bold"><i className="fa-solid fa-clock me-2"></i>Solicitud en Revisión</h5>
                <p className="mb-0">
                   Tu pedido mayorista requiere confirmación de stock. Te contactaremos pronto.
                </p>
             </Alert>
          )}

          <div className="alerta-aviso mb-4">
            <i className="fa-solid fa-bell fa-2x me-3 text-warning"></i>
            <div>
                <h5 className="alert-heading fw-bold mb-1">¡No pierdas tu pedido!</h5>
                <p className="mb-0 small">
                    Guarda el número de abajo. Lo necesitarás para saber cuándo llegan tus pasteles.
                </p>
            </div>
          </div>

          {/* TARJETA VISUAL DEL ID + BOTÓN CHOCOLATE */}
          <Card className="shadow-sm border-0 mb-4 text-center p-4 bg-white position-relative overflow-hidden">
             {/* Decoración de fondo */}
             <div style={{position: 'absolute', top: -10, left: -10, width: 100, height: 100, background: '#f8f9fa', borderRadius: '50%', zIndex: 0}}></div>
             
             <div style={{position: 'relative', zIndex: 1}}>
                 <h6 className="text-uppercase text-muted fw-bold mb-3" style={{letterSpacing: '2px'}}>Tu Número de Seguimiento</h6>
                 
                 <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mb-3">
                    {/* El ID Gigante */}
                    <div className="display-3 fw-bold text-dark px-4 py-2 rounded bg-light border border-2 border-white shadow-sm">
                        {orden.id}
                    </div>

                    {/* EL BOTÓN DE COPIAR (Estilo solicitado) */}
                    <OverlayTrigger overlay={<Tooltip>{copiado ? "¡Copiado al portapapeles!" : "Copiar número"}</Tooltip>}>
                        <Button 
                            className="btn-copiar-choco" 
                            onClick={copiarID}
                        >
                            <i className={`fa-solid ${copiado ? 'fa-check' : 'fa-copy'}`}></i>
                            <span>{copiado ? '¡Listo!' : 'Copiar'}</span>
                        </Button>
                    </OverlayTrigger>
                 </div>
                 
                 {esMayorista && <Badge bg="warning" text="dark" className="fs-6 shadow-sm">Estado: Por Confirmar Stock</Badge>}
             </div>
          </Card>

          {/* LA SORPRESA: TARJETA DE TRACKING */}
          <Row className="justify-content-center mb-5">
            <Col md={8}>
                <Link to="/seguimiento" className="tracking-card-sorpresa d-flex align-items-center justify-content-between">
                    <div className="z-1">
                        <h4 className="fw-bold mb-1"><i className="fa-solid fa-magnifying-glass-location me-2"></i>¿Dónde está mi pedido?</h4>
                        <p className="mb-0 text-muted small">
                            Usa tu ID <strong>#{orden.id}</strong> y tu email para ver el estado en tiempo real.
                        </p>
                    </div>
                    <div className="z-1 d-none d-sm-block">
                        <span className="btn-tracking-action">
                            Ir a Rastrear <i className="fa-solid fa-arrow-right ms-1"></i>
                        </span>
                    </div>
                    {/* Icono decorativo de fondo */}
                    <i className="fa-solid fa-truck-fast tracking-bg-icon"></i>
                </Link>
            </Col>
          </Row>

      </div>

      {/* ============================================== */}
      {/* ZONA DE IMPRESIÓN (BOLETA FORMAL SII) */}
      {/* ============================================== */}
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
                <div className="recuadro-rut">
                    <div>R.U.T.: 77.123.456-7</div>
                    <div className="py-2 fs-5">
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
                    <Col xs={7}>{orden.fechaEntrega}</Col>
                    <Col xs={5} className="fw-bold">Forma Pago:</Col>
                    <Col xs={7}>{orden.cliente.medioPago === 'webpay' ? 'WebPay / Tarjeta' : 'Transferencia'}</Col>
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

          {/* BOTONES FINALES DE PANTALLA */}
          <div className="text-center mt-5 d-print-none">
            <div className="d-flex justify-content-center gap-3">
              <Button variant="outline-dark" onClick={handlePrint}>
                <i className="fa-solid fa-print me-2"></i> Descargar Comprobante (PDF)
              </Button>
              <Link to="/tienda" className="btn btn-principal px-4 ">
                Seguir Comprando
              </Link>
            </div>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default Confirmacion;