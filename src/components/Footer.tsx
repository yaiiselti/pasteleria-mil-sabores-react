

import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    // Usamos el color de fondo de nuestro 'style.css' de la Parte 1
    // con una clase de CSS de Bootstrap para el padding (py-4)
    <footer className="main-footer py-4">
      <Container>
        <Row className="align-items-center">
          
          {/* Columna 1: Copyright (alineado a la izquierda) */}
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <p className="footer-copy mb-0">
              &copy; 2025 Pastelería Mil Sabores. Todos los derechos reservados.
            </p>
          </Col>

          {/* Columna 2: Redes Sociales (alineado a la derecha) */}
          <Col md={6} className="text-center text-md-end footer-social">
            <a href="https://www.facebook.com" target="_blank" className="me-3">
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a href="https://www.instagram.com" target="_blank" className="me-3">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.twitter.com" target="_blank">
              <i className="fa-brands fa-twitter"></i>
            </a>
          </Col>

        </Row>
      </Container>
    </footer>
  );
}

export default Footer;