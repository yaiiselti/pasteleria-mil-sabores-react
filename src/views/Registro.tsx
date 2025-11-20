import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { saveUsuario } from '../services/PasteleriaService';
import type{ IUsuario } from '../services/PasteleriaService';

function Registro() {
  const navigate = useNavigate();

  // Estados del formulario
  const [formData, setFormData] = useState({
    run: '', nombre: '', apellidos: '', email: '',
    password: '', confirmPassword: '', fechaNacimiento: '',
    codigoPromo: '', direccion: '', region: '', comuna: ''
  });

  const [errores, setErrores] = useState<any>({});
  
  // --- CAMBIO: Estado para tu aviso personalizado ---
  const [avisoExito, setAvisoExito] = useState<string | null>(null); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrores((prev: any) => ({ ...prev, [name]: '' }));
  };

  const validarYRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores: any = {};
    let esValido = true;

    // Validaciones básicas
    if (!formData.run.trim()) { nuevosErrores.run = 'El RUN es obligatorio'; esValido = false; }
    if (!formData.nombre.trim()) { nuevosErrores.nombre = 'El nombre es obligatorio'; esValido = false; }
    if (!formData.email.includes('@')) { nuevosErrores.email = 'Correo inválido'; esValido = false; }
    if (formData.password.length < 4) { nuevosErrores.password = 'Mínimo 4 caracteres'; esValido = false; }
    if (formData.password !== formData.confirmPassword) { nuevosErrores.confirmPassword = 'No coinciden'; esValido = false; }
    if (!formData.fechaNacimiento) { nuevosErrores.fechaNacimiento = 'Fecha requerida'; esValido = false; }

    setErrores(nuevosErrores);

    if (esValido) {
      try {
        // Lógica de Negocio
        let mensaje = "¡Registro exitoso! ";
        const hoy = new Date();
        const cumple = new Date(formData.fechaNacimiento);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m = hoy.getMonth() - cumple.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;

        if (edad >= 50) {
          localStorage.setItem('descuentoEdad', 'true');
          mensaje += "✅ Tienes 50% dcto por edad. ";
        } else {
          localStorage.removeItem('descuentoEdad');
        }

        if (formData.codigoPromo.trim().toUpperCase() === 'FELICES50') {
          localStorage.setItem('descuentoCodigo', 'true');
          mensaje += "✅ Código 'FELICES50' aplicado.";
        } else {
          localStorage.removeItem('descuentoCodigo');
        }

        // Guardar
        const nuevoUsuario: IUsuario = {
          run: formData.run,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          tipo: 'Cliente',
          region: formData.region,
          comuna: formData.comuna
        };
        await saveUsuario(nuevoUsuario);

        // --- AQUÍ ESTÁ TU AVISO VISIBLE ---
        setAvisoExito(mensaje); // Muestra el Alert verde
        
        // Esperamos un poco más (3 segundos) para que alcancen a leer
        setTimeout(() => navigate('/login'), 3000);

      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0 rounded-3">
            <Card.Body className="p-5">
              <h2 className="text-center logo-text mb-4">Crea tu Cuenta</h2>

              {/* --- ESTE ES EL AVISO QUE QUERÍAS --- */}
              {avisoExito && (
                <Alert variant="success" className="text-center border-0 bg-success text-white shadow-sm">
                  <h4 className="alert-heading"><i className="fa-solid fa-circle-check me-2"></i>¡Listo!</h4>
                  <p className="mb-0 fs-5">{avisoExito}</p>
                  <hr />
                  <small>Redirigiendo al login...</small>
                </Alert>
              )}
              {/* ----------------------------------- */}

              {/* Ocultamos el formulario si ya fue exitoso para que se vea limpio */}
              {!avisoExito && (
                <Form onSubmit={validarYRegistrar}>
                  {/* ... (Mismos campos de siempre: RUN, Nombre, etc.) ... */}
                  {/* (Copia aquí los mismos Inputs del código anterior para ahorrar espacio) */}
                   <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>RUN</Form.Label>
                        <Form.Control name="run" onChange={handleChange} isInvalid={!!errores.run} placeholder="12345678-K" />
                        <Form.Control.Feedback type="invalid">{errores.run}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Fecha de Nacimiento</Form.Label>
                        <Form.Control type="date" name="fechaNacimiento" onChange={handleChange} isInvalid={!!errores.fechaNacimiento} />
                        <Form.Control.Feedback type="invalid">{errores.fechaNacimiento}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control name="nombre" onChange={handleChange} isInvalid={!!errores.nombre} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" onChange={handleChange} isInvalid={!!errores.email} />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" name="password" onChange={handleChange} isInvalid={!!errores.password} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Confirmar</Form.Label>
                        <Form.Control type="password" name="confirmPassword" onChange={handleChange} isInvalid={!!errores.confirmPassword} />
                        </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Código Promo</Form.Label>
                    <Form.Control name="codigoPromo" placeholder="Opcional" onChange={handleChange} />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 btn-principal btn-lg">
                    Registrarse
                  </Button>
                </Form>
              )}

              <div className="text-center mt-3">
                <span className="text-muted">¿Ya tienes cuenta? </span>
                <Link to="/login" className="fw-bold text-decoration-none">Inicia Sesión</Link>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Registro;