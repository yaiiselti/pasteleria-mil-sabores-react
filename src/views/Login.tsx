import { Container, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Para el enlace de "Registrar"

function Login() {
  return (
    <Container className="py-5">
      
      {/* ¡REUTILIZAMOS EL CSS!
        Usamos .form-container de index.css que ya tiene el fondo blanco,
        sombra y bordes redondeados. ¡Cero redundancia!
      */}
      <div className="form-container">
        
        <h2 className="text-center">Iniciar Sesión</h2>
        <p className="text-center">Ingresa a tu cuenta para ver tus pedidos.</p>

        {/* Migramos a componentes <Form> de React-Bootstrap
          (como en tus apuntes 2.1.3)
        */}
        <Form id="login-form">
          
          {/* Grupo: Correo */}
          <Form.Group className="mb-3" controlId="login-email">
            <Form.Label>Correo</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Ej: tu@gmail.com" 
              required 
            />
            {/* Div de error listo para la Fase 4 */}
            <div className="error-message"></div>
          </Form.Group>
          
          {/* Grupo: Contraseña */}
          <Form.Group className="mb-3" controlId="login-password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Tu contraseña" 
              required 
            />
            <div className="error-message"></div>
          </Form.Group>
          
          {/* Botón de Envío */}
          {/* Reutilizamos la clase .btn-principal de index.css
            para que el botón de Bootstrap tome nuestros colores.
          */}
          <Button variant="primary" type="submit" className="btn-principal w-100">
            Iniciar Sesión
          </Button>

        </Form>

        {/* Reutilizamos .form-switch de index.css */}
        <p className="form-switch text-center mt-3">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>.
        </p>

      </div>
    </Container>
  );
}

export default Login;