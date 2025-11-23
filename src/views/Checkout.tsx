import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';
import { useCarrito } from '../hooks/useCarrito';
import { useNavigate } from 'react-router-dom'; // Para redirigir al éxito

function Checkout() {
  
  // 1. Consumimos el contexto del carrito
  const { items, totalPrecio, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();

  // 2. Estado para los campos del formulario
  const [formData, setFormData] = useState({
    email: '',
    direccion: '',
    fecha: '',
    tarjeta: ''
  });

  // 3. Estado para los errores de validación (Cero Alertas Nativas)
  const [errores, setErrores] = useState({
    email: '',
    direccion: '',
    fecha: '',
    tarjeta: ''
  });

  // Maneja el cambio en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiamos el error cuando el usuario escribe
    setErrores(prev => ({ ...prev, [name]: '' }));
  };

  // 4. Lógica de Validación (Migrada de validaciones.js)
  const validarFormulario = () => {
    let esValido = true;
    const nuevosErrores = { email: '', direccion: '', fecha: '', tarjeta: '' };

    // Validar Email
    if (!formData.email || !formData.email.includes('@')) {
      nuevosErrores.email = 'Se requiere un correo válido (@).';
      esValido = false;
    }

    // Validar Dirección
    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria.';
      esValido = false;
    }

    // Validar Fecha
    if (!formData.fecha) {
      nuevosErrores.fecha = 'Selecciona una fecha de entrega.';
      esValido = false;
    }

    // Validar Tarjeta (Simulación: debe tener 16 números)
    const tarjetaLimpia = formData.tarjeta.replace(/\s/g, '');
    if (!/^\d{16}$/.test(tarjetaLimpia)) {
      nuevosErrores.tarjeta = 'La tarjeta debe tener 16 dígitos numéricos.';
      esValido = false;
    }

    setErrores(nuevosErrores);
    return esValido;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      // 1. CREAR LA ORDEN
      const nuevaOrden = {
        id: Math.floor(Math.random() * 1000000), // ID aleatorio
        fecha: new Date().toLocaleDateString(),
        cliente: formData,
        productos: items, // Guardamos los items del carrito
        total: totalPrecio
      };

      // 2. GUARDAR EN LOCALSTORAGE (CRÍTICO)
      // Usamos JSON.stringify para que sea texto
      try {
        localStorage.setItem('ultimaOrden', JSON.stringify(nuevaOrden));
        
        // Guardar también en el historial (opcional, para el perfil)
        const historial = JSON.parse(localStorage.getItem('historialPedidos') || '[]');
        historial.push(nuevaOrden);
        localStorage.setItem('historialPedidos', JSON.stringify(historial));

      } catch (error) {
        console.error("Error al guardar orden:", error);
        return; // Si falla el guardado, no seguimos
      }

      // 3. VACIAR EL CARRITO
      vaciarCarrito();

      // 4. REDIRIGIR (Solo después de asegurar el guardado)
      // Usamos replace: true para que no pueda volver atrás al checkout con el botón 'atrás'
      navigate('/confirmacion', { replace: true });
    }
  };

  // Si no hay items, no debería estar aquí
  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h3>No hay productos para pagar.</h3>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="logo-text text-center mb-4">Finalizar Compra</h2>

      <Row className="g-5">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <Col md={7} lg={8}>
          <h4 className="mb-3">Datos de Envío y Pago</h4>
          <Form onSubmit={handleSubmit} className="form-container p-4">
            
            {/* Email */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                placeholder="tu@ejemplo.com" 
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errores.email} // Bootstrap marca rojo si es true
              />
              <Form.Control.Feedback type="invalid">
                {errores.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Dirección */}
            <Form.Group className="mb-3" controlId="direccion">
              <Form.Label>Dirección de Envío</Form.Label>
              <Form.Control 
                type="text" 
                name="direccion"
                placeholder="Av. Siempre Viva 123" 
                value={formData.direccion}
                onChange={handleChange}
                isInvalid={!!errores.direccion}
              />
              <Form.Control.Feedback type="invalid">
                {errores.direccion}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Fecha */}
            <Form.Group className="mb-3" controlId="fecha">
              <Form.Label>Fecha de Entrega</Form.Label>
              <Form.Control 
                type="date" 
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                isInvalid={!!errores.fecha}
              />
              <Form.Control.Feedback type="invalid">
                {errores.fecha}
              </Form.Control.Feedback>
            </Form.Group>

            <hr className="my-4" />

            <h4 className="mb-3">Pago</h4>
            
            {/* Tarjeta */}
            <Form.Group className="mb-3" controlId="tarjeta">
              <Form.Label>Número de Tarjeta (Simulado)</Form.Label>
              <Form.Control 
                type="text" 
                name="tarjeta"
                placeholder="0000 0000 0000 0000" 
                value={formData.tarjeta}
                onChange={handleChange}
                isInvalid={!!errores.tarjeta}
              />
              <Form.Control.Feedback type="invalid">
                {errores.tarjeta}
              </Form.Control.Feedback>
            </Form.Group>

            <Button className="w-100 btn-principal btn-lg" type="submit">
              Confirmar Pedido
            </Button>
          </Form>
        </Col>

        {/* --- COLUMNA DERECHA: RESUMEN --- */}
        <Col md={5} lg={4}>
          <Card className="cart-summary">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <span className="logo-text text-primary">Tu Carrito</span>
                <span className="badge bg-primary rounded-pill">{items.length}</span>
              </Card.Title>
              
              <ListGroup variant="flush" className="mb-3">
                {items.map((item) => (
                  <ListGroup.Item key={item.idUnico} className="d-flex justify-content-between lh-sm">
                    <div>
                      <h6 className="my-0">{item.nombre}</h6>
                      <small className="text-muted">Cant: {item.cantidad}</small>
                    </div>
                    <span className="text-muted">${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
                  </ListGroup.Item>
                ))}
                
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Total (CLP)</span>
                  <strong>${totalPrecio.toLocaleString('es-CL')}</strong>
                </ListGroup.Item>
              </ListGroup>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;