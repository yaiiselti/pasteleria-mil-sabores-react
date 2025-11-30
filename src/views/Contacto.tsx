import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';
// Importamos el hook de autenticación para obtener los datos del usuario
import { useAuth } from '../context/AuthContext';
import { saveMensaje } from '../services/ContactoService';

function Contacto() {
  const { showNotification } = useNotification();
  const { user } = useAuth(); // <--- ACCESO AL USUARIO LOGUEADO

  // 1. Estado del Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    confirmEmail: '', 
    comentario: ''
  });

  const [enviando, setEnviando] = useState(false);

  // --- EFECTO MAGICO: AUTO-RELLENAR ---
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Unimos nombre y apellido para el campo "Nombre Completo"
        nombre: `${user.nombre} ${user.apellidos}`.trim(),
        email: user.email,
        confirmEmail: user.email // Auto-confirmamos para ahorrarle tiempo
      }));
    }
  }, [user]); // Se ejecuta cuando carga el usuario

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validaciones
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.confirmEmail.trim() || !formData.comentario.trim()) {
      showNotification('Por favor completa todos los campos.', 'warning');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('El formato del correo no es válido.', 'warning');
      return;
    }

    if (formData.email.toLowerCase() !== formData.confirmEmail.toLowerCase()) {
        showNotification('❌ Los correos electrónicos no coinciden.', 'danger');
        return;
    }

    setEnviando(true);

    try {
        await saveMensaje({
            nombre: formData.nombre,
            email: formData.email,
            comentario: formData.comentario
        });

        showNotification('¡Mensaje recibido! Nos pondremos en contacto contigo.', 'success');
        
        // UX MEJORADA:
        // Si el usuario está logueado, mantenemos sus datos y solo borramos el mensaje.
        // Si es un visitante, limpiamos todo el formulario.
        if (user) {
            setFormData(prev => ({ ...prev, comentario: '' }));
        } else {
            setFormData({ nombre: '', email: '', confirmEmail: '', comentario: '' });
        }

    } catch (error) {
        showNotification('Error al enviar el mensaje. Intenta nuevamente.', 'danger');
    } finally {
        setEnviando(false);
    }
  };

  return (
    <Container className="py-5">
      
      {/* --- SECCIÓN MAPA E INFORMACIÓN --- */}
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

      {/* --- FORMULARIO CON AUTO-FILL --- */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0">
            <Card.Body className="p-5">
              <h2 className="text-center logo-text mb-2">Contáctanos</h2>
              <p className="text-center text-muted mb-4">
                  {user ? `Hola ${user.nombre}, envíanos tus comentarios.` : "Déjanos tus datos correctamente para poder responderte."}
              </p>
              
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
                            onPaste={(e) => {
                                e.preventDefault();
                                showNotification('Por seguridad, escribe el correo manualmente.', 'info');
                            }}
                            className={
                                formData.confirmEmail && formData.email.toLowerCase() !== formData.confirmEmail.toLowerCase()
                                ? "border-danger" 
                                : ""
                            }
                        />
                        {formData.confirmEmail && formData.email.toLowerCase() !== formData.confirmEmail.toLowerCase() && (
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
                    maxLength={250}
                  />
                  <Form.Text className="text-muted text-end d-block">
                      {formData.comentario.length}/250 caracteres
                    </Form.Text>
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