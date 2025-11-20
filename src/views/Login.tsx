import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

// 1. Importamos nuestros Hooks personalizados (Cerebro y Avisos)
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
function Login() {
  const navigate = useNavigate();
  
  // Consumimos los contextos
  const { login } = useAuth(); 
  const { showNotification } = useNotification(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- LA LÓGICA COMPLETA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 1. Evitamos que la página se recargue

    // 2. Validaciones básicas visuales
    if (!email || !password) {
      showNotification('Por favor completa todos los campos.', 'warning');
      return;
    }

    // 3. Intentamos loguear usando el Contexto
    const resultado = await login(email, password);

    if (resultado.success) {
      // CASO ÉXITO: Mostramos Toast Verde y redirigimos
      showNotification(resultado.message, 'success');
      
      if (email === 'admin@duoc.cl') {
        navigate('/admin');
      } else {
        navigate('/tienda');
      }
    } else {
      // CASO ERROR: Mostramos Toast Rojo con el mensaje del servicio
      showNotification(resultado.message, 'danger');
    }
  };

return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow border-0 rounded-3">
            <Card.Body className="p-5">
              
              <div className="text-center mb-4">
                <h2 className="logo-text text-primary">Iniciar Sesión</h2>
                <p className="text-muted">Ingresa a tu cuenta para ver tus pedidos.</p>
              </div>

              {/* Ya no necesitamos <Alert> aquí porque usaremos los Toasts flotantes */}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="login-email">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="admin@duoc.cl" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="login-password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 btn-principal mb-3">
                  Ingresar
                </Button>
              </Form>

              <div className="text-center mt-4">
                <span className="text-muted">¿No tienes cuenta? </span>
                <Link to="/registro" className="fw-bold text-decoration-none">
                  Regístrate aquí
                </Link>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;