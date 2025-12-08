import { useEffect, useState, useRef } from 'react'; 
import { Container, Card, Row, Col, Table, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { savePedido } from '../services/PasteleriaService';
import { useAuth } from '../context/AuthContext';

function Confirmacion() {
  const [orden, setOrden] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [errorSync, setErrorSync] = useState('');
  
  // SEMÁFORO: Evita doble guardado
  const envioIniciado = useRef(false);

  useEffect(() => {
    const procesarOrden = async () => {
      const ordenGuardadaStr = localStorage.getItem('ultimaOrden');
      
      if (ordenGuardadaStr) {
        try {
          const ordenLocal = JSON.parse(ordenGuardadaStr);

          // Si no está sincronizada con el backend, la enviamos
          if (!ordenLocal.synced) {
            
            if (envioIniciado.current) return;
            envioIniciado.current = true;

            const ordenGuardadaDB = await savePedido(ordenLocal);

            if (ordenGuardadaDB) {
              // El Backend ya asignó ID y ESTADO (Pendiente o Por Confirmar Stock)
              const ordenFinal = { ...ordenGuardadaDB, synced: true };
              setOrden(ordenFinal);
              
              // Actualizamos localstorage y el historial
              localStorage.setItem('ultimaOrden', JSON.stringify(ordenFinal));
              
              // Agregamos al historial local por si acaso
              const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
              // Verificamos si ya existe para no duplicar en local
              if (!historial.find((h: any) => h.id === ordenFinal.id)) {
                 historial.push(ordenFinal);
                 localStorage.setItem('historialPedidos', JSON.stringify(historial));
              }

            } else {
              envioIniciado.current = false; 
              console.warn("Fallo al guardar en BD.");
              setErrorSync("Hubo un problema de conexión. Guardaremos tu pedido localmente.");
              // Fallback: Mostramos lo local
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

  const handlePrint = () => {
    window.print();
  };

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Procesando tu pedido...</p></div>;

  if (!orden) {
    return (
      <Container className="py-5 text-center">
        <h3>No hay información de orden reciente.</h3>
        <Link to="/tienda" className="btn btn-principal mt-3">Volver a la Tienda</Link>
      </Container>
    );
  }

  // Detectamos si es un pedido Mayorista
  const esMayorista = orden.estado === 'Por Confirmar Stock';

  return (
    <Container className="py-5">
      
      {errorSync && <Alert variant="warning"><i className="fa-solid fa-triangle-exclamation me-2"></i>{errorSync}</Alert>}

      {/* ALERTA DE NIVEL 2 (MAYORISTA) */}
      {esMayorista && (
         <Alert variant="warning" className="shadow-sm border-warning mb-4">
            <h5 className="alert-heading fw-bold"><i className="fa-solid fa-clock me-2"></i>Solicitud Recibida (Sujeta a Confirmación)</h5>
            <p className="mb-0">
               Dado que tu pedido incluye productos al por mayor, debe ser revisado por un administrador para confirmar stock y fecha de entrega exacta. 
               Te notificaremos cuando cambie a estado <strong>"Pendiente"</strong>.
            </p>
         </Alert>
      )}

      {/* ÉXITO ESTÁNDAR (RETAIL) */}
      {!esMayorista && !errorSync && (
          <Alert variant="success" className="shadow-sm border-success mb-4 text-center">
             <h5 className="mb-0"><i className="fa-solid fa-check-circle me-2"></i>¡Pedido Confirmado Exitosamente!</h5>
          </Alert>
      )}

      <Card className="shadow border-0 p-4" id="boleta-content">
        <Card.Body>
          
          {/* --- ENCABEZADO --- */}
          <div className="text-center mb-4 border-bottom pb-4">
            <h2 className="logo-text text-primary mb-1">Pastelería Mil Sabores</h2>
            <p className="text-muted mb-1">Av. Siempre Viva 742, Santiago</p>
            <p className="text-muted mb-3">RUT: 77.123.456-7</p>
            
            <div className={`d-inline-block border px-4 py-2 rounded ${esMayorista ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light'}`}>
              <h4 className="mb-0">
                 {esMayorista ? `Solicitud Mayorista Nº ${orden.id}` : `Boleta Electrónica Nº ${orden.id}`}
              </h4>
              {esMayorista && <Badge bg="warning" text="dark" className="mt-2">Estado: Por Confirmar Stock</Badge>}
            </div>
          </div>

          {/* --- DATOS DE EMISIÓN Y CLIENTE --- */}
          <Row className="mb-4">
            <Col md={6}>
              <h6 className="text-uppercase text-muted small fw-bold">Datos del Cliente</h6>
              <p className="mb-0"><strong>Señor(a):</strong> {orden.cliente.nombre}</p>
              <p className="mb-0"><strong>Dirección:</strong> {orden.cliente.direccion}</p>
              <p className="mb-0"><strong>Fecha Solicitada:</strong> {orden.fechaEntrega}</p>
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
                {orden.productos.map((prod: any, idx: number) => (
                  <tr key={idx}>
                    <td>
                        {prod.nombre} 
                        {prod.mensaje && <div className="small text-muted fst-italic">"{prod.mensaje}"</div>}
                    </td>
                    <td className="text-center fw-bold">{prod.cantidad}</td>
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
                    <td className="text-end">${orden.subtotal?.toLocaleString('es-CL')}</td>
                  </tr>
                  {orden.descuento > 0 && (
                    <tr className="text-success">
                      <td className="text-end">Descuento:</td>
                      <td className="text-end">-${orden.descuento?.toLocaleString('es-CL')}</td>
                    </tr>
                  )}
                  <tr className="border-top fs-5 fw-bold">
                    <td className="text-end">Total a Pagar:</td>
                    <td className="text-end">${orden.total?.toLocaleString('es-CL')}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* --- PIE DE PÁGINA --- */}
          <div className="text-center mt-5 pt-3 border-top">
            <h4 className={`logo-text ${esMayorista ? 'text-warning' : 'text-success'}`}>
                {esMayorista ? '¡Solicitud Enviada!' : '¡Gracias por su compra!'}
            </h4>
            <p className="text-muted small">
                {esMayorista ? 'Nos pondremos en contacto a la brevedad.' : 'Esperamos que disfrute de la dulzura de la vida.'}
            </p>
            
            <div className="d-flex justify-content-center gap-3 mt-4 no-print">
              <Button variant="outline-secondary" onClick={handlePrint}>
                <i className="fa-solid fa-print me-2"></i> {esMayorista ? 'Imprimir Solicitud' : 'Imprimir Boleta'}
              </Button>
              <Link to="/tienda" className="btn btn-principal">
                Volver a la Tienda
              </Link>
            </div>
          </div>

        </Card.Body>
      </Card>

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