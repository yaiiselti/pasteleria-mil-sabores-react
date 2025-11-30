import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { saveUsuario, getUsuarios } from '../services/AdminService';
import type { IUsuario } from '../services/AdminService';
import { REGIONES_CHILE } from '../Data/regiones';

function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    run: '', nombre: '', apellidos: '', email: '',
    password: '', confirmPassword: '', fechaNacimiento: '',
    codigoPromo: '', direccion: '', region: '', comuna: ''
  });

  const [errores, setErrores] = useState<any>({});
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  // --- HERRAMIENTAS DE RUN ---
  
  const formatearRun = (run: string) => {
    let valor = run.replace(/[^0-9kK]/g, '');
    if (valor.length > 1) {
        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1);
        const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `${cuerpoFormateado}-${dv}`;
    }
    return valor;
  };

  const validarRunDetallado = (run: string): string | null => {
    if (!run) return 'El RUN es obligatorio.';
    const cleanRun = run.replace(/[^0-9kK]/g, '').toLowerCase();
    
    if (cleanRun.length < 8) return 'El RUN es muy corto.'; // Mínimo 1.234.567-K
    
    const cuerpo = cleanRun.slice(0, -1);
    const dvUsuario = cleanRun.slice(-1);
    
    let suma = 0, multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
        const index = multiplo * parseInt(cleanRun.charAt(cleanRun.length - 1 - i));
        suma += index;
        if (multiplo < 7) multiplo += 1; else multiplo = 2;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = (dvEsperado === 11) ? '0' : ((dvEsperado === 10) ? 'k' : dvEsperado.toString());

    if (dvCalculado !== dvUsuario) return 'El dígito verificador es incorrecto.';
    return null;
  };

  const validarEmailDetallado = (email: string): string | null => {
    if (!email) return 'El correo es obligatorio.';
    if (!email.includes('@')) return 'Al correo le falta el "@".';
    
    const partes = email.split('@');
    if (partes[1] && !partes[1].includes('.')) return 'Falta el dominio (ej: .com, .cl).';
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) return 'El formato del correo contiene caracteres inválidos.';
    
    return null;
  };

  // ---------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'region') return { ...prev, region: value, comuna: '' };
      return { ...prev, [name]: value };
    });
    setErrores((prev: any) => ({ ...prev, [name]: '' }));
  };

  const handleRunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // 1. Limpieza interna (Solo números y K)
    const raw = val.replace(/[^0-9kK]/g, '');
    
    // 2. Limpieza visual (Permitimos ver puntos y guiones mientras edita)
    const valVisual = val.replace(/[^0-9kK\.-]/g, '');

    // 3. Límite Lógico: Máximo 9 caracteres reales (8 números + 1 DV)
    // Esto evita que se pase de largo y arregla el borrado.
    if (raw.length <= 9) {
        setFormData(prev => ({ ...prev, run: valVisual }));
        if (errores.run) setErrores((prev: any) => ({ ...prev, run: '' }));
    }
  };

  const handleRunBlur = () => {
      // Al salir de la casilla, lo dejamos bonito (12.345.678-K)
      setFormData(prev => ({ ...prev, run: formatearRun(prev.run) }));
      
      // Y validamos de inmediato para avisar al usuario
      const errorRun = validarRunDetallado(formData.run);
      if (errorRun) setErrores((prev: any) => ({ ...prev, run: errorRun }));
  };

  const comunasDisponibles = REGIONES_CHILE.find(r => r.region === formData.region)?.comunas || [];

  const validarYRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores: any = {};
    let esValido = true;

    // 1. Validaciones Específicas
    const errorRun = validarRunDetallado(formData.run);
    if (errorRun) { nuevosErrores.run = errorRun; esValido = false; }

    const errorEmail = validarEmailDetallado(formData.email);
    if (errorEmail) { nuevosErrores.email = errorEmail; esValido = false; }

    if (!formData.nombre.trim()) { nuevosErrores.nombre = 'Ingresa tu nombre.'; esValido = false; }
    if (!formData.apellidos.trim()) { nuevosErrores.apellidos = 'Ingresa tus apellidos.'; esValido = false; }
    if (!formData.direccion.trim()) { nuevosErrores.direccion = 'La dirección es obligatoria.'; esValido = false; }
    if (!formData.fechaNacimiento) { nuevosErrores.fechaNacimiento = 'Fecha requerida.'; esValido = false; }
    
    if (formData.password.length < 4) { 
        nuevosErrores.password = 'La contraseña es muy corta (mínimo 4).'; esValido = false; 
    }
    if (formData.password !== formData.confirmPassword) { 
        nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.'; esValido = false; 
    }

    if (!esValido) {
      setErrores(nuevosErrores);
      return;
    }

    // 2. Validaciones de Servidor (Duplicados)
    try {
      const usuariosExistentes = await getUsuarios();
      const runLimpio = formData.run.replace(/[^0-9kK]/g, '').toLowerCase(); // Usamos el limpio para comparar

      const runExiste = usuariosExistentes.some(u => u.run.replace(/[^0-9kK]/g, '').toLowerCase() === runLimpio);
      if (runExiste) {
        setErrores({ ...nuevosErrores, run: 'Este RUN ya está registrado en el sistema.' });
        return; 
      }

      const emailExiste = usuariosExistentes.some(u => u.email.toLowerCase() === formData.email.toLowerCase().trim());
      if (emailExiste) {
        setErrores({ ...nuevosErrores, email: 'Este correo ya tiene una cuenta asociada.' });
        return;
      }

      // --- TODO OK ---
      let mensaje = "¡Registro exitoso! ";
      
      // Lógica de edad y cupón...
      const hoy = new Date();
      const cumple = new Date(formData.fechaNacimiento);
      let edad = hoy.getFullYear() - cumple.getFullYear();
      if (hoy < new Date(hoy.getFullYear(), cumple.getMonth(), cumple.getDate())) edad--;

      if (edad >= 50) {
        localStorage.setItem('descuentoEdad', 'true');
        mensaje += "✅ 50% dcto (Edad de Oro). ";
      } else { localStorage.removeItem('descuentoEdad'); }

      if (formData.codigoPromo.trim().toUpperCase() === 'FELICES50') {
        localStorage.setItem('descuentoCodigo', 'true');
        mensaje += "✅ Código aplicado.";
      } else { localStorage.removeItem('descuentoCodigo'); }

      // Guardar con formato limpio estandarizado
      await saveUsuario({
        run: formatearRun(formData.run), // Guardamos siempre bonito: 12.345.678-K
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        tipo: 'Cliente',
        region: formData.region,
        comuna: formData.comuna,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        codigoPromo: formData.codigoPromo.trim().toUpperCase()
      });

      setAvisoExito(mensaje);
      setTimeout(() => navigate('/login'), 3000);

    } catch (error) {
      setErrores({ ...nuevosErrores, server: 'Error de conexión.' });
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0 rounded-3">
            <Card.Body className="p-5">
              <h2 className="text-center logo-text mb-4">Crea tu Cuenta</h2>

              {avisoExito && (
                <Alert variant="success" className="text-center border-0 bg-success text-white shadow-sm">
                  <h4 className="alert-heading"><i className="fa-solid fa-circle-check me-2"></i>¡Bienvenido!</h4>
                  <p className="mb-0 fs-5">{avisoExito}</p>
                  <hr />
                  <small>Redirigiendo al login...</small>
                </Alert>
              )}

              {!avisoExito && (
                <Form onSubmit={validarYRegistrar} autoComplete="off">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>RUN <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            name="run" 
                            value={formData.run}
                            onChange={handleRunChange} 
                            onBlur={handleRunBlur} // <--- Magia aquí
                            isInvalid={!!errores.run} 
                            placeholder="Ej: 12345678-K" 

                        />
                        <Form.Control.Feedback type="invalid">{errores.run}</Form.Control.Feedback>
                        {/* Mensaje de ayuda si no hay error */}
                        {!errores.run && <Form.Text className="text-muted small">Escribe solo números y K.</Form.Text>}
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

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control name="nombre" placeholder="Tu nombre" onChange={handleChange} isInvalid={!!errores.nombre} />
                        <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control name="apellidos" placeholder="Tus apellidos" onChange={handleChange} isInvalid={!!errores.apellidos} />
                        <Form.Control.Feedback type="invalid">{errores.apellidos}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" placeholder="nombre@ejemplo.com" onChange={handleChange} isInvalid={!!errores.email} />
                    <Form.Control.Feedback type="invalid">{errores.email}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control name="direccion" placeholder="Calle, Número, Depto" onChange={handleChange} isInvalid={!!errores.direccion} />
                    <Form.Control.Feedback type="invalid">{errores.direccion}</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" name="password" placeholder="Mínimo 4 caracteres" onChange={handleChange} isInvalid={!!errores.password} />
                        <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirmar</Form.Label>
                        <Form.Control type="password" name="confirmPassword" placeholder="Repetir clave" onChange={handleChange} isInvalid={!!errores.confirmPassword} />
                        <Form.Control.Feedback type="invalid">{errores.confirmPassword}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
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
                      <Form.Group className="mb-3">
                        <Form.Label>Comuna</Form.Label>
                        <Form.Select name="comuna" value={formData.comuna} onChange={handleChange} disabled={!formData.region}>
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
                    <Form.Control name="codigoPromo" placeholder="Ej: FELICES50" onChange={handleChange} />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 btn-principal btn-lg mt-3">
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