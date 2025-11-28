import { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';
// Importamos el servicio para guardar de verdad
import { saveMensaje } from '../services/ContactoService';

function Contacto() {
  const { showNotification } = useNotification();

  // 1. Estado del Formulario (Incluye confirmEmail)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    confirmEmail: '', // Campo de validación local
    comentario: ''
  });

  // 2. Estado de Carga
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDACIONES ---
    
    // 1. Campos vacíos
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.confirmEmail.trim() || !formData.comentario.trim()) {
      showNotification('Por favor completa todos los campos.', 'warning');
      return;
    }

    // 2. Formato de Email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('El formato del correo no es válido.', 'warning');
      return;
    }

    // 3. Coincidencia de Correos (La validación "Seria")
    if (formData.email.toLowerCase() !== formData.confirmEmail.toLowerCase()) {
        showNotification('❌ Los correos electrónicos no coinciden.', 'danger');
        return;
    }

    // --- ENVÍO AL SERVICIO ---
    setEnviando(true); // Bloqueamos botón

    try {
        // Guardamos usando el servicio (excluyendo confirmEmail que no sirve en la BD)
        await saveMensaje({
            nombre: formData.nombre,
            email: formData.email,
            comentario: formData.comentario
        });

        // Éxito
        showNotification('¡Mensaje recibido! Nos pondremos en contacto contigo.', 'success');
        setFormData({ nombre: '', email: '', confirmEmail: '', comentario: '' }); // Limpiar formulario

    } catch (error) {
        showNotification('Error al enviar el mensaje. Intenta nuevamente.', 'danger');
    } finally {
        setEnviando(false); // Desbloqueamos botón
    }
  };

  return (
    <Container className="py-5">
      
      {/* --- SECCIÓN MAPA E INFORMACIÓN (MANTENIDA COMO ESTABA) --- */}
      <div className="content-container mb-5">
        <h2 className="text-center logo-text mb-4">Nuestra Ubicación</h2>
        <div className="map-container mb-4 shadow-sm border">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3193.587458360668!2d-73.05083568469655!3d-36.82794657994326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9669b5d2d1e4d6ad%3A0x69c7c0d7e1e0e5a!2sAv.%20O'Higgins%20550%2C%20Concepci%C3%B3n%2C%20B%C3%ADo%20B%C3%ADo!5e0!3m2!1ses!2scl!4v1620000000000!5m2!1ses!2scl" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de Ubicación"
          ></iframe>
        </div>
        
        <div className="text-center">
          <h4 className="logo-text text-primary mb-3">Visítanos</h4>
          <p className="mb-1">
            <i className="fa-solid fa-location-dot me-2 text-danger"></i>
            <strong>Dirección:</strong> O'Higgins 550, Concepción, Bío Bío
          </p>
          <p>
            <i className="fa-solid fa-phone me-2 text-success"></i>
            <strong>Teléfono:</strong> +56 41 212 3456
          </p>
          <p className="text-muted small mt-2">
            <i className="fa-regular fa-clock me-2"></i>
            Lunes a Sábado: 09:00 - 20:00 hrs.
          </p>
        </div>
      </div>

      {/* --- FORMULARIO PROFESIONAL --- */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0">
            <Card.Body className="p-5">
              <h2 className="text-center logo-text mb-2">Contáctanos</h2>
              <p className="text-center text-muted mb-4">Déjanos tus datos correctamente para poder responderte.</p>
              
              <Form onSubmit={handleSubmit} autoComplete="off">
                <Form.Group className="mb-3" controlId="nombre">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Tu nombre" 
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={enviando}
                  />
                </Form.Group>

                {/* Fila de Correos con Doble Validación */}
                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="ejemplo@correo.com" 
                            value={formData.email}
                            onChange={handleChange}
                            disabled={enviando}
                        />
                        </Form.Group>
                    </Col>
                    
                    <Col md={12}>
                        <Form.Group className="mb-3" controlId="confirmEmail">
                        <Form.Label>Confirmar Correo</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Repite tu correo" 
                            value={formData.confirmEmail}
                            onChange={handleChange}
                            disabled={enviando}
                            // BLOQUEO DE PEGAR (Seguridad)
                            onPaste={(e) => {
                                e.preventDefault();
                                showNotification('Por seguridad, escribe el correo manualmente.', 'info');
                            }}
                            className={
                                formData.confirmEmail && formData.email !== formData.confirmEmail 
                                ? "border-danger" 
                                : ""
                            }
                        />
                        {formData.confirmEmail && formData.email !== formData.confirmEmail && (
                            <Form.Text className="text-danger small">Los correos no coinciden.</Form.Text>
                        )}
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-4" controlId="comentario">
                  <Form.Label>Mensaje</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5} 
                    placeholder="Escribe tu mensaje aquí..." 
                    value={formData.comentario}
                    onChange={handleChange}
                    disabled={enviando}
                  />
                </Form.Group>
                
                <Button 
                    variant="primary" 
                    type="submit" 
                    className="btn-principal w-100 btn-lg"
                    disabled={enviando}
                >
                  {enviando ? (
                    <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Enviando...
                    </>
                  ) : (
                    <>Enviar Mensaje <i className="fa-solid fa-paper-plane ms-2"></i></>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
}

export default Contacto;