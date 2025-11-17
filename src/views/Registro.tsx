import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Registro() {
  return (
    <Container className="py-5">
      
      {/* ¡REUTILIZAMOS EL CSS! */}
      <div className="form-container">
        
        <h2 className="text-center">Crea tu Cuenta</h2>
        <p className="text-center">Regístrate para acceder a descuentos y un seguimiento de tus pedidos.</p>

        {/* Migramos a componentes <Form> de React-Bootstrap */}
        <Form id="registro-form">
          
          {/* Usamos <Row> y <Col> de Bootstrap para poner campos lado a lado */}
          <Row>
            {/* Grupo: RUN */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="reg-run">
                <Form.Label>RUN</Form.Label>
                <Form.Control type="text" placeholder="Ej: 12345678K" required />
                <div id="error-run" className="error-message"></div>
              </Form.Group>
            </Col>

            {/* Grupo: Nombre */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="reg-nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" placeholder="Ej: Juan" required />
                <div id="error-nombre" className="error-message"></div>
              </Form.Group>
            </Col>
          </Row>

          {/* Grupo: Apellidos */}
          <Form.Group className="mb-3" controlId="reg-apellidos">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control type="text" placeholder="Ej: Pérez González" required />
            <div id="error-apellidos" className="error-message"></div>
          </Form.Group>
          
          {/* Grupo: Correo */}
          <Form.Group className="mb-3" controlId="reg-email">
            <Form.Label>Correo</Form.Label>
            <Form.Control type="email" placeholder="Ej: juan.perez@gmail.com" required />
            <div id="error-email" className="error-message"></div>
          </Form.Group>

          <Row>
            {/* Grupo: Contraseña */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="reg-password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control type="password" placeholder="Entre 4 y 10 caracteres" required />
                <div id="error-password" className="error-message"></div>
              </Form.Group>
            </Col>
            
            {/* Grupo: Confirmar Contraseña */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="reg-confirm-password">
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control type="password" placeholder="Vuelve a escribir tu contraseña" required />
                <div id="error-confirm-password" className="error-message"></div>
              </Form.Group>
            </Col>
          </Row>

          {/* Grupo: Fecha Nacimiento */}
          <Form.Group className="mb-3" controlId="reg-fecha-nac">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control type="date" required />
            <div id="error-fecha-nac" className="error-message"></div>
            {/* ¡REUTILIZAMOS EL DIV DE ÉXITO! */}
            <div id="success-fecha-nac" className="success-message"></div>
          </Form.Group>

          {/* Grupo: Dirección */}
          <Form.Group className="mb-3" controlId="reg-direccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control type="text" placeholder="Ej: Av. Siempre Viva 123" required />
            <div id="error-direccion" className="error-message"></div>
          </Form.Group>

          <Row>
            {/* Grupo: Región */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="reg-region">
                <Form.Label>Región</Form.Label>
                <Form.Select required>
                  <option value="">Seleccione una región...</option>
                  {/* (En la Fase 2, llenaremos esto con JS/React) */}
                </Form.Select>
                <div id="error-region" className="error-message"></div>
              </Form.Group>
            </Col>
            
            {/* Grupo: Comuna */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="reg-comuna">
                <Form.Label>Comuna</Form.Label>
                <Form.Select required>
                  <option value="">Seleccione una comuna...</option>
                  {/* (Esto se llenará dinámicamente) */}
                </Form.Select>
                <div id="error-comuna" className="error-message"></div>
              </Form.Group>
            </Col>
          </Row>

          {/* Grupo: Código Promocional */}
          <Form.Group className="mb-3" controlId="reg-promo">
            <Form.Label>Código Promocional (Opcional)</Form.Label>
            <Form.Control type="text" placeholder="Ej: FELICES50" />
            <div id="error-promo" className="error-message"></div>
          </Form.Group>
          
          {/* Botón de Envío */}
          <Button variant="primary" type="submit" className="btn-principal w-100">
            Registrar
          </Button>

        </Form>

        <p className="form-switch text-center mt-3">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>.
        </p>

      </div>
    </Container>
  );
}

export default Registro;