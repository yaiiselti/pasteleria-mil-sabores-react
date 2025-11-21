

import { Container, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Blog() {
  return (
    <Container className="py-5">
      {/* Reutilizamos la fuente .logo-text de index.css */}
      <h2 className="text-center mb-4 logo-text">Noticias Importantes</h2>

      {/* Artículo 1 (usando Card horizontal de Bootstrap) */}
      <Card className="blog-post-summary mb-4">
        <Row className="g-0">
          <Col md={4}>
            {/* Usamos la imagen de "record-guinness.png" que 
              estaba en tu carpeta de la Parte 1.
              Debes moverla a 'public/assets/img/'
            */}
            <Card.Img src="/assets/img/record-guinness.png" className="blog-post-image" />
          </Col>
          <Col md={8}>
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title>Caso Curioso #1</Card.Title>
              <Card.Text>
                Descubre el secreto detrás de nuestro récord Guinness de 1995 y cómo cambió la repostería en Chile...
              </Card.Text>
              
              {/* Este enlace (botón) irá al final gracias a "mt-auto" */}
              <Link 
                to="../assets/record-guinness" 
                className="btn btn-outline-primary btn-secundario mt-auto"
                style={{ width: '150px' }} // Mantenemos el ancho del botón
              >
                Ver Caso
              </Link>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Artículo 2 */}
      <Card className="blog-post-summary mb-4">
        <Row className="g-0">
          <Col md={4}>
            {/* Usamos la imagen "estudiantes-pastel-vegano.webp" de la Parte 1.
              Debes moverla a 'public/assets/img/'
            */}
            <Card.Img src="/assets/img/estudiantes-pastel-vegano.webp" className="blog-post-image" />
          </Col>
          <Col md={8}>
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title>Caso Curioso #2</Card.Title>
              <Card.Text>
                Estudiantes de Duoc UC innovan con recetas veganas que mantienen todo el sabor de la tradición...
              </Card.Text>
              <Link 
                to="/blog-articulo-2" 
                className="btn btn-outline-primary btn-secundario mt-auto"
                style={{ width: '150px' }}
              >
                Ver Caso
              </Link>
            </Card.Body>
          </Col>
        </Row>
      </Card>

    </Container>
  );
}

export default Blog;