import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
// Importamos funciones del AdminService
import { getUsuarioByRun, setUsuarioPin } from '../services/AdminService';

function Login() {
  const navigate = useNavigate();
  const { login, logout } = useAuth(); // Necesitamos 'user' para saber el RUN al configurar PIN
  const { showNotification } = useNotification(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ESTADOS DEL SISTEMA DE SEGURIDAD
  // 'none': Sin modal
  // 'verify': Pedir PIN existente
  // 'setup': Crear nuevo PIN
  const [securityMode, setSecurityMode] = useState<'none' | 'verify' | 'setup'>('none');
  
  const [inputPin, setInputPin] = useState('');
  const [confirmPin, setConfirmPin] = useState(''); // Para cuando crea el PIN
  const [tempUserRun, setTempUserRun] = useState(''); // Guardamos temporalmente quién intenta entrar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!email || !password) {
      showNotification('Por favor completa todos los campos.', 'warning');
      return;
    }

    const resultado = await login(email, password);

    if (resultado.success) {
      if (resultado.rol === 'Administrador') {
        // --- LÓGICA DE DETECCIÓN DE PIN ---
        // Buscamos al usuario en la BD para ver si tiene PIN configurado
        // (Nota: login ya seteó el usuario en AuthContext, pero necesitamos el dato fresco del PIN)
        try {
            // --- CORRECCIÓN CRÍTICA ---
            // Usamos 'resultado.run' que viene directo del login
            if (!resultado.run) throw new Error("No se pudo identificar al usuario");

            // Buscamos al usuario real usando ese RUN seguro
            const usuarioReal = await getUsuarioByRun(resultado.run);
            
            // Guardamos el RUN temporalmente para validarlo después
            setTempUserRun(usuarioReal.run);

            if (usuarioReal.pin) {
                setSecurityMode('verify'); // Tiene PIN -> Verificar
            } else {
                setSecurityMode('setup');  // No tiene PIN -> Crear
            }

        } catch (error) {
            console.error(error);
            logout(); // Si falla, cerramos la sesión por seguridad
            showNotification('Error de seguridad al validar perfil.', 'danger');
        }

      } else {
        showNotification(resultado.message, 'success');
        navigate('/tienda');
      }
    } else {
      showNotification(resultado.message, 'danger');
    }
  };

  // 1. VERIFICAR PIN EXISTENTE
  const handleVerifyPin = async () => {
    // Obtenemos el usuario real otra vez para comparar
    const usuarioReal = await getUsuarioByRun(tempUserRun);
    
    if (usuarioReal.pin === inputPin) {
        setSecurityMode('none');
        showNotification('Acceso Administrativo Concedido 🔓', 'success');
        navigate('/admin');
    } else {
        showNotification('PIN incorrecto.', 'danger');
        setInputPin(''); // Limpiar para reintentar
    }
  };

  // 2. CREAR NUEVO PIN
  const handleSetupPin = async () => {
    if (inputPin.length < 4) {
        showNotification('El PIN debe tener al menos 4 dígitos', 'warning');
        return;
    }
    if (inputPin !== confirmPin) {
        showNotification('Los PIN no coinciden', 'warning');
        return;
    }

    // Guardamos el nuevo PIN
    await setUsuarioPin(tempUserRun, inputPin);
    
    showNotification('¡PIN Configurado con éxito! Bienvenido.', 'success');
    setSecurityMode('none');
    navigate('/admin');
  };

  const handleCancel = () => {
    setSecurityMode('none');
    logout();
    setInputPin('');
    setConfirmPin('');
    showNotification('Acceso cancelado.', 'info');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow border-0 rounded-3">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="logo-text text-primary">Iniciar Sesión</h2>
                <p className="text-muted">Ingresa a tu cuenta.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3"controlId="login-email">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control type="email" placeholder="admin@duoc.cl" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 btn-principal mb-3">Ingresar</Button>
              </Form>

              <div className="text-center mt-4">
                <span className="text-muted">¿No tienes cuenta? </span>
                <Link to="/registro" className="fw-bold text-decoration-none">Regístrate aquí</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- MODAL DE VERIFICACIÓN (Ya tienes PIN) --- */}
      <Modal show={securityMode === 'verify'} onHide={handleCancel} backdrop="static" centered>
        <Modal.Header className="bg-primary text-white">
          <Modal.Title><i className="fa-solid fa-lock me-2"></i>Seguridad de Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <p className="fw-bold mb-3">Ingresa tu PIN de seguridad personal</p>
          <Form.Control 
            type="password" 
            placeholder="****" 
            className="text-center fs-3 letter-spacing-2" 
            maxLength={6}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value)}
            autoFocus
          />
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
          <Button variant="primary" onClick={handleVerifyPin}>Verificar</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL DE CONFIGURACIÓN (Nuevo Admin) --- */}
      <Modal show={securityMode === 'setup'} onHide={handleCancel} backdrop="static" centered>
        <Modal.Header className="bg-success text-white">
          <Modal.Title><i className="fa-solid fa-user-shield me-2"></i>Activar Cuenta Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="info" className="small">
            <i className="fa-solid fa-circle-info me-2"></i>
            Como es tu primera vez ingresando como Administrador, debes configurar un <strong>PIN Personal</strong>. Lo usarás en tus próximos ingresos.
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>Crea un PIN (4-6 dígitos)</Form.Label>
            <Form.Control 
                type="password" 
                placeholder="****" 
                className="text-center fs-4"
                maxLength={6}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Confirma tu PIN</Form.Label>
            <Form.Control 
                type="password" 
                placeholder="****" 
                className="text-center fs-4"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
          <Button variant="success" onClick={handleSetupPin}>Guardar y Entrar</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default Login;