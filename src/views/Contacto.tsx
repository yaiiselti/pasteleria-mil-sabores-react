import { Container, Form, Button } from 'react-bootstrap';

function Contacto() {
  return (
    <Container className="py-5">
      
      {/* Reutilizamos el .content-container de index.css
        para envolver el mapa y la info de la tienda.
      */}
      <div className="content-container">
        
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Nuestra Ubicación</h2>
        
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3193.30335492087!2d-73.0533306847087!3d-36.8354349799411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9669c5e538f45a7d%3A0x6a053f3f98a23d8b!2sO'Higgins%20550%2C%20Concepci%C3%B3n%2C%20B%C3%ADo%20B%C3%ADo!5e0!3m2!1ses-419!2scl!4v1730877990000!5m2!1ses-419!2scl" 
            width="600" 
            height="450" 
            style={{ border: 0 }} // En React, 'style' es un objeto
            allowFullScreen={true} // (true en lugar de "")
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>

      <div className="content-container" style={{ marginTop: '30px', marginBottom: '30px', textAlign: 'center' }}>
        <h2>Visítanos</h2>
        <p>
          <strong>Dirección:</strong> O'Higgins 550, Concepción, Bío Bío<br />
          <strong>Teléfono:</strong> +56 41 212 3456
        </p>
      </div>

      {/* Migramos el formulario usando componentes de React-Bootstrap
        y reutilizando .form-container de index.css
      */}
      <div className="form-container">
        <h2 className="text-center">Formulario de Contacto</h2>
        <p className="text-center">Envíanos tus dudas o sugerencias.</p>
        
        <Form>
          {/* Grupo: Nombre */}
          <Form.Group className="mb-3" controlId="contact-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Tu nombre completo" 
              required 
            />
            {/* El div de error está listo para la Fase 4 */}
            <div className="error-message"></div>
          </Form.Group>

          {/* Grupo: Correo */}
          <Form.Group className="mb-3" controlId="contact-email">
            <Form.Label>Correo</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Tu correo (@gmail.com, @duoc.cl...)" 
              required 
            />
            <div className="error-message"></div>
          </Form.Group>

          {/* Grupo: Comentario */}
          <Form.Group className="mb-3" controlId="contact-comentario">
            <Form.Label>Comentario</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={6} 
              placeholder="Escribe tu mensaje aquí... (Max 500 caracteres)" 
              required 
            />
            <div className="error-message"></div>
          </Form.Group>
          
          {/* Reutilizamos nuestras clases de botón 
            en el componente <Button> de Bootstrap
          */}
          <Button variant="primary" type="submit" className="btn-principal w-100">
            Enviar Mensaje
          </Button>
        </Form>
      </div>

    </Container>
  );
}

export default Contacto;