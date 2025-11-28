import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getUsuarioByRun, saveUsuario, getUsuarios } from '../../services/AdminService';
import type { IUsuario } from '../../services/AdminService';
import { REGIONES_CHILE } from '../../Data/regiones';
import { useNotification } from '../../context/NotificationContext';
// Importamos useAuth para la lógica de "Auto-Degradación"
import { useAuth } from '../../context/AuthContext';

function AdminUsuarioForm() {
  const { run } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, logout } = useAuth(); 
  const esEdicion = !!run;
  const SUPER_ADMIN_RUN = '11223344-5'; 

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [formData, setFormData] = useState<IUsuario>({
    run: '',
    nombre: '',
    apellidos: '',
    email: '',
    password: '', 
    tipo: 'Cliente',
    region: '',
    comuna: '',
    fechaNacimiento: '', 
    codigoPromo: '',     
    pin: undefined
  });

  const esSuperAdmin = formData.run === SUPER_ADMIN_RUN;

  useEffect(() => {
    if (esEdicion && run) {
      getUsuarioByRun(run).then((u) => {
        setFormData({
            ...u,
            // Aseguramos que no sean undefined para los inputs
            fechaNacimiento: u.fechaNacimiento || '',
            codigoPromo: u.codigoPromo || ''
        });
      }).catch(() => navigate('/admin/usuarios'));
    }
  }, [run, esEdicion, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'region') return { ...prev, region: value, comuna: '' };
      return { ...prev, [name]: value };
    });
  };

  const handleResetPin = () => {
    if (window.confirm("¿Estás seguro de resetear el PIN de este administrador? La próxima vez que ingrese deberá crear uno nuevo.")) {
        setFormData(prev => ({ ...prev, pin: undefined }));
        showNotification('PIN reseteado. Guarda los cambios para aplicar.', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.run.trim() || !formData.email.trim() || !formData.nombre.trim()) {
      showNotification('Por favor completa los campos obligatorios (*)', 'warning');
      return;
    }

    const usuariosDB = await getUsuarios();

    // Validar Duplicados
    if (!esEdicion) {
      if (usuariosDB.some(u => u.run.toLowerCase() === formData.run.toLowerCase().trim())) {
        showNotification('El RUN ya está registrado.', 'danger'); return;
      }
    }
    if (usuariosDB.some(u => u.email.toLowerCase() === formData.email.toLowerCase().trim() && u.run !== formData.run)) {
      showNotification('El correo ya está en uso por otro usuario.', 'danger'); return;
    }

    // Guardar
    await saveUsuario(formData);

    // --- LÓGICA DE AUTO-DEGRADACIÓN ---
    // Si soy yo mismo Y me cambié a Cliente -> Logout inmediato
    if (user && formData.run === user.run && formData.tipo === 'Cliente') {
        logout();
        navigate('/login');
        showNotification('Has cambiado tu rol a Cliente. Acceso administrativo revocado.', 'warning');
        return;
    }

    showNotification('Usuario guardado con éxito.', 'success');
    navigate('/admin/usuarios');
  };

  const comunasDisponibles = REGIONES_CHILE.find(r => r.region === formData.region)?.comunas || [];

  return (
    <div className="d-flex justify-content-center">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '900px' }}>
        <Card.Header className="bg-white py-3">
            <h4 className="mb-0 logo-text text-success">{esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
        </Card.Header>
        <Card.Body className="p-4">
          
          {esSuperAdmin && (
            <Alert variant="warning" className="d-flex align-items-center">
                <i className="fa-solid fa-lock me-3 fa-2x"></i>
                <div>
                    <strong>Usuario Protegido</strong>
                    <div className="small">Estás editando al Super Administrador. El rol no puede ser modificado.</div>
                </div>
            </Alert>
          )}

          {/* Anti-Autofill: autoComplete="off" */}
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Row className="g-3">
              
              <Col md={12}><h6 className="text-muted border-bottom pb-2 mb-3">Identificación y Acceso</h6></Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>RUN <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                        type="text" 
                        name="run" 
                        value={formData.run} 
                        onChange={handleChange} 
                        disabled={esEdicion} 
                        required 
                        placeholder="12345678-K"
                    />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tipo de Usuario</Form.Label>
                  <Form.Select 
                    name="tipo" 
                    value={formData.tipo} 
                    onChange={handleChange} 
                    disabled={esSuperAdmin} 
                    style={esSuperAdmin ? {backgroundColor: '#e9ecef'} : {}}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </Form.Select>
                  {/* Advertencia visual */}
                  {user?.run === formData.run && formData.tipo === 'Cliente' && (
                     <Form.Text className="text-danger fw-bold small">
                        <i className="fa-solid fa-triangle-exclamation me-1"></i>
                        Advertencia: Perderás tu acceso al panel inmediatamente.
                     </Form.Text>
                  )}
                </Form.Group>
              </Col>

              {/* Panel de PIN (Solo visible si es Admin y estamos editando) */}
              {esEdicion && formData.tipo === 'Administrador' && (
                  <Col md={12}>
                    <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <strong><i className="fa-solid fa-shield-halved me-2"></i>Seguridad de PIN</strong>
                            <div className="text-muted small">
                                {formData.pin 
                                    ? "PIN Configurado y Activo." 
                                    : "Sin PIN configurado (se pedirá al ingresar)."}
                            </div>
                        </div>
                        {formData.pin && (
                            <Button variant="outline-danger" size="sm" onClick={handleResetPin}>
                                <i className="fa-solid fa-rotate-left me-1"></i> Resetear PIN
                            </Button>
                        )}
                    </div>
                  </Col>
              )}

              <Col md={12} className="mt-4"><h6 className="text-muted border-bottom pb-2 mb-3">Datos Personales</h6></Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                    <Form.Label>Apellidos <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={6}>
                 <Form.Group>
                    <Form.Label>Fecha de Nacimiento</Form.Label>
                    <Form.Control 
                        type="date" 
                        name="fechaNacimiento" 
                        value={formData.fechaNacimiento} 
                        onChange={handleChange} 
                    />
                    <Form.Text className="text-muted small">Necesario para descuentos (Edad de Oro).</Form.Text>
                 </Form.Group>
              </Col>

              <Col md={6}>
                 <Form.Group>
                    <Form.Label>Código Promocional</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="codigoPromo" 
                        placeholder="Ej: FELICES50"
                        value={formData.codigoPromo} 
                        onChange={handleChange} 
                    />
                 </Form.Group>
              </Col>

              <Col md={12} className="mt-4"><h6 className="text-muted border-bottom pb-2 mb-3">Cuenta y Contacto</h6></Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
                    {/* Anti-Autofill: autoComplete="off" */}
                    <Form.Control 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        autoComplete="off" 
                    />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                        {/* Anti-Autofill: autoComplete="new-password" */}
                        <Form.Control 
                            type={mostrarPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password || ''} 
                            onChange={handleChange}
                            placeholder={esEdicion ? "Dejar en blanco para no cambiar" : "Asignar contraseña"}
                            autoComplete="new-password"
                        />
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            title={mostrarPassword ? "Ocultar" : "Mostrar"}
                        >
                            <i className={mostrarPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </Button>
                    </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Región</Form.Label>
                  <Form.Select name="region" value={formData.region} onChange={handleChange}>
                    <option value="">Selecciona...</option>
                    {REGIONES_CHILE.map(r => <option key={r.region} value={r.region}>{r.region}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Comuna</Form.Label>
                  <Form.Select name="comuna" value={formData.comuna} onChange={handleChange} disabled={!formData.region}>
                    <option value="">Selecciona una comuna...</option>
                    {comunasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
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