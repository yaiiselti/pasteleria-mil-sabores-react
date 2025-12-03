import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { REGIONES_CHILE } from '../Data/regiones';
import { getProductos } from '../services/PasteleriaService';
import { useNotification } from '../context/NotificationContext';

function Checkout() {
  
  const { items, totalPrecio, subtotal, descuentoTotal, vaciarCarrito } = useCarrito();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification(); // Hook de notificaciones

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    direccion: '',
    region: '', 
    comuna: '',
    tarjeta: '',
    medioPago: '',
    fechaEntrega: '',
    comprobante: '' 
  });

  const [errores, setErrores] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: `${user.nombre} ${user.apellidos || ''}`.trim(),
        email: user.email,
        region: user.region || '',
        comuna: user.comuna || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'region') {
        return { ...prev, region: value, comuna: '' };
      }
      return { ...prev, [name]: value };
    });
    setErrores((prev: any) => ({ ...prev, [name]: '' }));
  };

  const comunasDisponibles = REGIONES_CHILE.find(r => r.region === formData.region)?.comunas || [];
  const formatoMoneda = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);

  const validarFecha = (fechaStr: string) => {
    if (!fechaStr) return false;
    const hoy = new Date();
    const seleccionada = new Date(fechaStr);
    const diferenciaTiempo = seleccionada.getTime() - hoy.getTime();
    const diasDiferencia = diferenciaTiempo / (1000 * 3600 * 24);
    return diasDiferencia >= 2; 
  };

  const validar = () => {
    let esValido = true;
    const nuevosErrores: any = {};

    if (!formData.nombre.trim()) { nuevosErrores.nombre = 'Requerido'; esValido = false; }
    if (!formData.email.includes('@')) { nuevosErrores.email = 'Email inválido'; esValido = false; }
    if (!formData.direccion.trim()) { nuevosErrores.direccion = 'Dirección requerida'; esValido = false; }
    if (!formData.medioPago) { nuevosErrores.medioPago = 'Selecciona un medio de pago'; esValido = false; }
    
    if (!formData.fechaEntrega) {
        nuevosErrores.fechaEntrega = 'Debes elegir una fecha.';
        esValido = false;
    } else if (!validarFecha(formData.fechaEntrega)) {
        nuevosErrores.fechaEntrega = 'Los pedidos deben hacerse con 48hrs de anticipación.';
        esValido = false;
    }

    if (formData.medioPago === 'webpay') {
        const tarjetaLimpia = formData.tarjeta.replace(/\s/g, '');
        if (!/^\d{16}$/.test(tarjetaLimpia)) {
            nuevosErrores.tarjeta = 'Tarjeta inválida (16 dígitos)';
            esValido = false;
        }
    }

    if (formData.medioPago === 'transferencia') {
        if (!formData.comprobante.trim()) {
            nuevosErrores.comprobante = 'Debes ingresar el número de operación.';
            esValido = false;
        }
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validar()) {
      
      // --- 2. VALIDACIÓN DE DISPONIBILIDAD (NOVEDAD) ---
      try {
        // Traemos la lista fresca de productos
        const productosActuales = await getProductos();
        
        // Buscamos si hay algún producto en el carrito que ya no esté activo
        const productosConflictivos = items.filter(itemCarrito => {
            const productoReal = productosActuales.find(p => p.codigo === itemCarrito.codigo);
            // Es conflicto si: No existe OR activo es false
            return !productoReal || productoReal.activo === false;
        });

        if (productosConflictivos.length > 0) {
            // ¡ALERTA! Hay productos "zombies" en el carrito
            const nombres = productosConflictivos.map(p => p.nombre).join(", ");
            
            showNotification(`Lo sentimos, los siguientes productos ya no están disponibles: ${nombres}. Por favor, revísalos en tu carrito.`, 'danger');
            
            // Opcional: Podríamos borrarlos automáticamente o redirigir al carrito
            // navigate('/carrito'); 
            return; // DETENEMOS LA COMPRA
        }

      } catch (error) {
        console.error("Error al validar disponibilidad", error);
        showNotification("Error técnico al validar el pedido. Intente nuevamente.", 'danger');
        return;
      }
      // --------------------------------------------------

      const ahora = new Date();
      const nuevaOrden = {
        id: Math.floor(Math.random() * 1000000),
        fechaEmision: ahora.toLocaleDateString(),
        horaEmision: ahora.toLocaleTimeString(), 
        fechaEntrega: formData.fechaEntrega,     
        cliente: formData,
        productos: items,
        subtotal: subtotal,
        descuento: descuentoTotal,
        total: totalPrecio,
        estado: 'Pendiente' 
      };

      try {
        localStorage.setItem('ultimaOrden', JSON.stringify(nuevaOrden));
        const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
        historial.push(nuevaOrden);
        localStorage.setItem('historialPedidos', JSON.stringify(historial));
      } catch (error) {
        console.error("Error al guardar orden:", error);
        return;
      }

      vaciarCarrito();
      navigate('/confirmacion', { replace: true });
    } else {
      showNotification("Hay errores en el formulario. Revisa los campos.", 'warning');
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">No tienes productos en el carrito.</Alert>
        <Button href="/tienda" className="btn-principal">Volver a la Tienda</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Finalizar Compra</h2>

      <Row className="g-5">
        
        <Col md={7} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="mb-3 logo-text text-primary">Datos de Envío</h4>
              <Form onSubmit={handleSubmit}>
                
                <Row className="g-3">
                  <Col sm={12}>
                    <Form.Group controlId="nombre">
                      <Form.Label>Nombre Completo</Form.Label>
                      <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} isInvalid={!!errores.nombre} />
                      <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col sm={12}>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" placeholder="tu@ejemplo.com" value={formData.email} onChange={handleChange} isInvalid={!!errores.email} />
                      <Form.Control.Feedback type="invalid">{errores.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col sm={12}>
                    <Form.Group controlId="direccion">
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control type="text" name="direccion" placeholder="Calle 123, Depto 4" value={formData.direccion} onChange={handleChange} isInvalid={!!errores.direccion} />
                      <Form.Control.Feedback type="invalid">{errores.direccion}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="region">
                      <Form.Label>Región</Form.Label>
                      <Form.Select name="region" value={formData.region} onChange={handleChange}>
                        <option value="">Selecciona...</option>
                        {REGIONES_CHILE.map((reg) => (
                          <option key={reg.region} value={reg.region}>{reg.region}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="comuna">
                      <Form.Label>Comuna</Form.Label>
                      <Form.Select name="comuna" value={formData.comuna} onChange={handleChange} disabled={!formData.region}>
                        <option value="">Selecciona...</option>
                        {comunasDisponibles.map((com) => (
                          <option key={com} value={com}>{com}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group controlId="fechaEntrega">
                      <Form.Label>Fecha de Entrega Deseada</Form.Label>
                      <Form.Control 
                        type="date" name="fechaEntrega" value={formData.fechaEntrega} onChange={handleChange} 
                        isInvalid={!!errores.fechaEntrega} min={new Date().toISOString().split('T')[0]}
                      />
                      <Form.Control.Feedback type="invalid">{errores.fechaEntrega}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Debes pedir con al menos 48 horas de anticipación.</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <h4 className="mb-3 logo-text text-primary">Medio de Pago</h4>
                
                <div className="mb-3">
                    <Form.Check 
                        type="radio" id="pago-webpay" name="medioPago" label="WebPay / Tarjeta de Crédito"
                        value="webpay" checked={formData.medioPago === 'webpay'} onChange={handleChange} className="mb-2"
                    />
                    <Form.Check 
                        type="radio" id="pago-transferencia" name="medioPago" label="Transferencia Bancaria"
                        value="transferencia" checked={formData.medioPago === 'transferencia'} onChange={handleChange}
                    />
                    {errores.medioPago && <div className="text-danger small mt-1">{errores.medioPago}</div>}
                </div>

                {formData.medioPago === 'webpay' && (
                    <div className="p-3 bg-light rounded mb-3 border">
                        <Form.Group controlId="tarjeta">
                        <Form.Label>Número de Tarjeta</Form.Label>
                        <Form.Control type="text" name="tarjeta" placeholder="0000 0000 0000 0000" value={formData.tarjeta} onChange={handleChange} isInvalid={!!errores.tarjeta} />
                        <Form.Control.Feedback type="invalid">{errores.tarjeta}</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                )}
                
                {formData.medioPago === 'transferencia' && (
                    <div className="bg-white border border-info rounded p-3 mb-3">
                        <h6 className="text-info fw-bold"><i className="fa-solid fa-building-columns me-2"></i>Datos de Transferencia:</h6>
                        <ul className="list-unstyled mb-3 ms-3 small">
                          <li><strong>Banco:</strong> Banco de Chile</li>
                          <li><strong>Tipo de Cuenta:</strong> Corriente</li>
                          <li><strong>Nº Cuenta:</strong> 987654321</li>
                          <li><strong>RUT:</strong> 22043642-k</li>
                          <li><strong>Correo:</strong> pagos@milsabores.cl</li>
                        </ul>
                        
                        <Form.Group controlId="comprobante">
                          <Form.Label className="fw-bold text-dark small">Nº de Operación / Comprobante:</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="comprobante" 
                            placeholder="Ej: 12345678" 
                            value={formData.comprobante} 
                            onChange={handleChange} 
                            isInvalid={!!errores.comprobante}
                          />
                          <Form.Control.Feedback type="invalid">{errores.comprobante}</Form.Control.Feedback>
                          <Form.Text className="text-muted">Ingresa el código de tu transferencia para validar.</Form.Text>
                        </Form.Group>
                    </div>
                )}

                <Button className="w-100 btn-principal btn-lg mt-4" type="submit">
                  Confirmar Pedido
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} lg={4}>
          <Card className="shadow-sm border-0 bg-light sticky-top" style={{ top: '100px' }}>
            <Card.Body>
              <h4 className="d-flex justify-content-between align-items-center mb-3">
                <span className="logo-text text-primary">Resumen</span>
                <span className="badge bg-primary rounded-pill">{items.length}</span>
              </h4>
              
              <ListGroup variant="flush" className="mb-3 rounded overflow-hidden">
                {items.map((item) => (
                  <ListGroup.Item key={item.idUnico} className="d-flex justify-content-between lh-sm bg-white">
                    <div>
                      <h6 className="my-0 small">{item.nombre}</h6>
                      <small className="text-muted">x{item.cantidad}</small>
                    </div>
                    <span className="text-muted small">{formatoMoneda(item.precio * item.cantidad)}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="d-flex justify-content-between mb-1">
                <span>Subtotal</span>
                <strong>{formatoMoneda(subtotal)}</strong>
              </div>
              
              {descuentoTotal > 0 && (
                <div className="d-flex justify-content-between mb-1 text-success">
                  <span>Descuentos</span>
                  <strong>- {formatoMoneda(descuentoTotal)}</strong>
                </div>
              )}

              <div className="d-flex justify-content-between mb-1 text-muted">
                  <span>Envío</span>
                  <span>Gratis</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between fs-5">
                <span className="logo-text text-dark">Total a Pagar</span>
                <strong className="text-primary">{formatoMoneda(totalPrecio)}</strong>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;