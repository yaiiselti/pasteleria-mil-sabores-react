import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { saveUsuario } from '../services/AdminService';
import type { IUsuario } from '../services/AdminService';
import { REGIONES_CHILE } from '../Data/regiones';
import { getUsuarios } from '../services/AdminService'; //

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

  // Modificar handleChange igual que en Admin (limpiar comuna al cambiar región)
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
  // Calcular comunas disponibles
  const comunasDisponibles = REGIONES_CHILE.find(r => r.region === formData.region)?.comunas || [];


  const validarYRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores: any = {};
    let esValido = true;

    // 1. Validaciones de Formato (Básicas)
    if (!formData.run.trim()) { nuevosErrores.run = 'El RUN es obligatorio'; esValido = false; }
    if (!formData.nombre.trim()) { nuevosErrores.nombre = 'El nombre es obligatorio'; esValido = false; }
    if (!formData.apellidos.trim()) { nuevosErrores.apellidos = 'El apellido es obligatorio'; esValido = false; }
    if (!formData.email.includes('@')) { nuevosErrores.email = 'Correo inválido'; esValido = false; }
    if (formData.password.length < 4) { nuevosErrores.password = 'Mínimo 4 caracteres'; esValido = false; }
    if (formData.password !== formData.confirmPassword) { nuevosErrores.confirmPassword = 'No coinciden'; esValido = false; }
    if (!formData.fechaNacimiento) { nuevosErrores.fechaNacimiento = 'Fecha requerida'; esValido = false; }

    // Si falla algo básico, mostramos errores y cortamos aquí para no llamar a la BD
    if (!esValido) {
      setErrores(nuevosErrores);
      return;
    }

    // 2. Validaciones de Negocio (Async - Verificar duplicados)
    try {
      const usuariosExistentes = await getUsuarios();
      
      // Revisar si el RUN ya existe
      const runExiste = usuariosExistentes.some(u => u.run.toLowerCase() === formData.run.toLowerCase().trim());
      if (runExiste) {
        setErrores({ ...nuevosErrores, run: 'Este RUN ya está registrado.' });
        return; // Cortamos
      }

      // Revisar si el Email ya existe
      const emailExiste = usuariosExistentes.some(u => u.email.toLowerCase() === formData.email.toLowerCase().trim());
      if (emailExiste) {
        setErrores({ ...nuevosErrores, email: 'Este correo ya está registrado.' });
        return; // Cortamos
      }

      // --- SI LLEGAMOS AQUÍ, TODO ESTÁ CORRECTO ---
      let mensaje = "¡Registro exitoso! ";
      
      // Lógica de Edad para descuento
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

      // Lógica de Cupón
      if (formData.codigoPromo.trim().toUpperCase() === 'FELICES50') {
        localStorage.setItem('descuentoCodigo', 'true');
        mensaje += "✅ Código 'FELICES50' aplicado.";
      } else {
        localStorage.removeItem('descuentoCodigo');
      }

      // 3. Guardar Usuario en "Base de Datos"
      const nuevoUsuario: IUsuario = {
        run: formData.run,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        tipo: 'Cliente',
        region: formData.region,
        comuna: formData.comuna,
        fechaNacimiento: formData.fechaNacimiento,
        codigoPromo: formData.codigoPromo.trim().toUpperCase()
      };
      
      await saveUsuario(nuevoUsuario);

      // 4. Mostrar Éxito y Redirigir
      setAvisoExito(mensaje); // Muestra el Alert verde
      setTimeout(() => navigate('/login'), 3000); // Redirige tras 3 segundos

    } catch (error) {
      console.error("Error en registro:", error);
      // Opcional: mostrar un error genérico en la UI
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
                    <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Apellidos</Form.Label>
                    <Form.Control name="apellidos" onChange={handleChange} isInvalid={!!errores.apellidos} />
                    <Form.Control.Feedback type="invalid">{errores.apellidos}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" onChange={handleChange} isInvalid={!!errores.email} />
                    <Form.Control.Feedback type="invalid">{errores.email}</Form.Control.Feedback>
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" name="password" onChange={handleChange} isInvalid={!!errores.password} />
                        <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirmar</Form.Label>
                        <Form.Control type="password" name="confirmPassword" onChange={handleChange} isInvalid={!!errores.confirmPassword} />
                        <Form.Control.Feedback type="invalid">{errores.confirmPassword}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Región</Form.Label>
                        <Form.Select
                          name="region"
                          value={formData.region}
                          onChange={handleChange}
                        >
                          <option value="">Selecciona...</option>
                          {REGIONES_CHILE.map((reg) => (
                            <option key={reg.region} value={reg.region}>{reg.region}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Comuna</Form.Label>
                        <Form.Select
                          name="comuna"
                          value={formData.comuna}
                          onChange={handleChange}
                          disabled={!formData.region}
                        >
                          <option value="">Selecciona...</option>
                          {comunasDisponibles.map((com) => (
                            <option key={com} value={com}>{com}</option>
                          ))}
                        </Form.Select>
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