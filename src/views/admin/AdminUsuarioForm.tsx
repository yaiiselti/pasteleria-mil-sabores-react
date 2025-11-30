import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getUsuarioByRun, saveUsuario, getUsuarios } from '../../services/AdminService';
import type { IUsuario } from '../../services/AdminService';
import { REGIONES_CHILE } from '../../Data/regiones';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

function AdminUsuarioForm() {
  const { run } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, logout } = useAuth();
  
  const esEdicion = !!run;
  const SUPER_ADMIN_RUN = '11223344-5'; 

  // --- ESTADOS ---
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [bloqueoSeguridad, setBloqueoSeguridad] = useState(false);

  const [formData, setFormData] = useState<IUsuario>({
    run: '', 
    nombre: '', 
    apellidos: '', 
    email: '',
    password: '', 
    tipo: 'Cliente',
    region: '', 
    comuna: '', 
    direccion: '', 
    fechaNacimiento: '', 
    codigoPromo: '',     
    pin: undefined
  });

  const esPerfilSuperAdmin = formData.run === SUPER_ADMIN_RUN;

  // --- HERRAMIENTAS DE VALIDACIÓN ---

  const formatearRun = (run: string) => {
    let valor = run.replace(/[^0-9kK]/g, '');
    if (valor.length > 1) {
        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1);
        const cuerpoF = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `${cuerpoF}-${dv}`;
    }
    return valor;
  };

  const validarRunDetallado = (run: string): string | null => {
    if (!run) return 'El RUN es obligatorio.';
    const cleanRun = run.replace(/[^0-9kK]/g, '').toLowerCase();
    
    if (cleanRun.length < 8) return 'El RUN es muy corto.';
    
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
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) return 'Formato de correo inválido.';
    return null;
  };

  // --- CARGA INICIAL ---

  useEffect(() => {
    if (esEdicion && run) {
      if (run === SUPER_ADMIN_RUN && user?.run !== SUPER_ADMIN_RUN) {
          setBloqueoSeguridad(true);
          showNotification('⛔ ACCESO DENEGADO: Solo el Super Admin puede editar sus propios datos.', 'danger');
          setTimeout(() => navigate('/admin/usuarios'), 2000);
          return;
      }

      getUsuarioByRun(run).then((u) => {
        if (!u) { navigate('/admin/usuarios'); return; }
        setFormData({
            ...u,
            password: '', // Ocultamos hash
            fechaNacimiento: u.fechaNacimiento || '',
            codigoPromo: u.codigoPromo || '',
            direccion: u.direccion || ''
        });
      }).catch(() => navigate('/admin/usuarios'));
    }
  }, [run, esEdicion, navigate, user]);

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'region') return { ...prev, region: value, comuna: '' };
      return { ...prev, [name]: value };
    });
  };

  const handleRunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const raw = val.replace(/[^0-9kK]/g, '');       
    const valVisual = val.replace(/[^0-9kK\.-]/g, ''); 

    if (raw.length <= 9) {
        setFormData(prev => ({ ...prev, run: valVisual }));
    }
  };

  const handleRunBlur = () => {
      const runFormateado = formatearRun(formData.run);
      setFormData(prev => ({ ...prev, run: runFormateado }));
      
      const error = validarRunDetallado(runFormateado);
      if(error) showNotification(error, 'warning'); 
  };

  const handleResetPin = () => {
    if (window.confirm("¿Estás seguro de resetear el PIN?")) {
        setFormData(prev => ({ ...prev, pin: undefined }));
        showNotification('PIN reseteado. Guarda los cambios.', 'info');
    }
  };

  // --- GUARDADO ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueoSeguridad) return;
    
    // 1. CAMPOS OBLIGATORIOS BÁSICOS
    if (!formData.nombre.trim()) { showNotification('Falta el Nombre.', 'danger'); return; }
    if (!formData.apellidos.trim()) { showNotification('Faltan los Apellidos.', 'danger'); return; }
    if (!formData.direccion?.trim()) { showNotification('La Dirección es obligatoria.', 'danger'); return; }
    if (!formData.fechaNacimiento) { showNotification('La Fecha de Nacimiento es obligatoria.', 'danger'); return; }
    if (!formData.region) { showNotification('Selecciona una Región.', 'danger'); return; }
    if (!formData.comuna) { showNotification('Selecciona una Comuna.', 'danger'); return; }

    // 2. VALIDACIÓN DE CONTRASEÑA (LA CORRECCIÓN CRÍTICA)
    if (!esEdicion && !formData.password) {
        showNotification('La contraseña es obligatoria para usuarios nuevos.', 'danger'); 
        return;
    }
    // Si hay contraseña (ya sea nuevo o edición), validamos largo
    if (formData.password && formData.password.length < 4) {
        showNotification('La contraseña es muy corta (mínimo 4 caracteres).', 'danger');
        return;
    }

    // 3. VALIDACIONES DE FORMATO
    const errorRun = validarRunDetallado(formData.run);
    if (errorRun) { showNotification(errorRun, 'danger'); return; }

    const errorEmail = validarEmailDetallado(formData.email);
    if (errorEmail) { showNotification(errorEmail, 'danger'); return; }

    // 4. DUPLICADOS
    const usuariosDB = await getUsuarios();
    const runLimpio = formData.run.replace(/[^0-9kK]/g, '').toLowerCase();

    if (!esEdicion && usuariosDB.some(u => u.run.replace(/[^0-9kK]/g, '').toLowerCase() === runLimpio)) {
        showNotification('El RUN ya está registrado.', 'danger'); return;
    }
    
    const emailDuplicado = usuariosDB.some(u => 
        u.email.toLowerCase() === formData.email.toLowerCase().trim() && 
        u.run.replace(/[^0-9kK]/g, '').toLowerCase() !== runLimpio
    );
    
    if (emailDuplicado) {
        showNotification('El correo ya está ocupado.', 'danger'); return;
    }

    // 5. GUARDAR
    await saveUsuario({ ...formData, run: formatearRun(formData.run) });

    // Auto-Degradación
    if (user && formData.run === user.run && formData.tipo === 'Cliente') {
        logout();
        navigate('/login');
        showNotification('Rol de Admin revocado. Sesión cerrada.', 'warning');
        return;
    }

    showNotification('Usuario guardado exitosamente.', 'success');
    navigate('/admin/usuarios');
  };

  const comunasDisponibles = REGIONES_CHILE.find(r => r.region === formData.region)?.comunas || [];

  if (bloqueoSeguridad) {
      return (
          <div className="d-flex justify-content-center py-5">
              <Alert variant="danger" className="text-center p-5 shadow">
                  <i className="fa-solid fa-lock fa-3x mb-3"></i>
                  <h4>Acceso Restringido</h4>
                  <p>No tienes permisos para modificar al Administrador Principal.</p>
                  <Link to="/admin/usuarios" className="btn btn-outline-danger mt-3">Volver</Link>
              </Alert>
          </div>
      );
  }

  return (
    <div className="d-flex justify-content-center">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '900px' }}>
        <Card.Header className="bg-white py-3">
            <h4 className="mb-0 logo-text text-success">{esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
        </Card.Header>
        <Card.Body className="p-4">
          
          {esPerfilSuperAdmin && (
            <Alert variant="info" className="d-flex align-items-center mb-4 border-info bg-opacity-10">
                <i className="fa-solid fa-user-shield me-3 fa-2x text-info"></i>
                <div>
                    <strong>Super Administrador</strong>
                    <div className="small">Datos críticos protegidos.</div>
                </div>
            </Alert>
          )}

          <Form onSubmit={handleSubmit} autoComplete="off">
            <Row className="g-3">
              
              <Col md={12}><h6 className="text-muted border-bottom pb-2 mb-3">Identificación</h6></Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>RUN <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                        type="text" 
                        name="run" 
                        value={formData.run} 
                        onChange={handleRunChange} 
                        onBlur={handleRunBlur}
                        disabled={esEdicion} 
                        required 
                        placeholder="Ej: 12.345.678-K"
                    />
                    <Form.Text className="text-muted small">Sin puntos ni guión (automático).</Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rol de Acceso <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="tipo" 
                    value={formData.tipo} 
                    onChange={handleChange} 
                    disabled={esPerfilSuperAdmin} 
                    className={esPerfilSuperAdmin ? 'bg-light fw-bold text-muted' : ''}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {esEdicion && formData.tipo === 'Administrador' && (
                  <Col md={12}>
                    <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <strong><i className="fa-solid fa-key me-2"></i>PIN de Seguridad</strong>
                            <div className="text-muted small">
                                {formData.pin ? "PIN Activo." : "Sin PIN configurado."}
                            </div>
                        </div>
                        {formData.pin && (
                            <Button variant="outline-danger" size="sm" onClick={handleResetPin}>
                                <i className="fa-solid fa-rotate-right me-1"></i> Resetear
                            </Button>
                        )}
                    </div>
                  </Col>
              )}

              <Col md={12} className="mt-4"><h6 className="text-muted border-bottom pb-2 mb-3">Datos Personales</h6></Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                    <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                    <Form.Label>Apellidos <span className="text-danger">*</span></Form.Label>
                    <Form.Control name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={6}>
                 <Form.Group>
                    <Form.Label>Fecha Nacimiento <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                 </Form.Group>
              </Col>
              <Col md={6}>
                 <Form.Group>
                    <Form.Label>Código Promo</Form.Label>
                    <Form.Control type="text" name="codigoPromo" value={formData.codigoPromo} onChange={handleChange} placeholder="Opcional" />
                 </Form.Group>
              </Col>

              <Col md={12} className="mt-4"><h6 className="text-muted border-bottom pb-2 mb-3">Contacto y Dirección</h6></Col>

              <Col md={12}>
                <Form.Group>
                    <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="nombre@ejemplo.com" />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                    <Form.Label>Dirección <span className="text-danger">*</span></Form.Label>
                    <Form.Control name="direccion" value={formData.direccion} onChange={handleChange} required placeholder="Calle, Número, Depto" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Región <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="region" value={formData.region} onChange={handleChange} required>
                    <option value="">Selecciona...</option>
                    {REGIONES_CHILE.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Comuna <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="comuna" value={formData.comuna} onChange={handleChange} disabled={!formData.region} required>
                    <option value="">Selecciona...</option>
                    {comunasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12} className="mt-4"><h6 className="text-muted border-bottom pb-2 mb-3">Seguridad</h6></Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>Contraseña { !esEdicion && <span className="text-danger">*</span> }</Form.Label>
                    <InputGroup>
                        <Form.Control 
                            type={mostrarPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange}
                            placeholder={esEdicion ? "(Dejar en blanco para no cambiar)" : "Crear contraseña"}
                            autoComplete="new-password"
                        />
                        <Button variant="outline-secondary" onClick={() => setMostrarPassword(!mostrarPassword)}>
                            <i className={mostrarPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </Button>
                    </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-5 border-top pt-3">
              <Link to="/admin/usuarios" className="btn btn-secondary px-4">Cancelar</Link>
              <Button type="submit" variant="success" className="px-4">
                <i className="fa-solid fa-save me-2"></i> Guardar Usuario
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminUsuarioForm;