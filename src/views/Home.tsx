
// 1. Importamos los componentes de React-Bootstrap que usaremos
import { Container, Row, Col, Card } from 'react-bootstrap';
// Importamos 'Link' para que los botones sean enlaces de navegación
import { Link } from 'react-router-dom';

function Home() {
  
  // (En la Fase 2, leeremos esto desde nuestro "Servicio",
  // pero por ahora, usamos los datos estáticos de nuestro index.html)
  const productosDestacados = [
    { codigo: "TC001", nombre: "Torta Cuadrada de Chocolate", precio: "45.000", imagen: "../assets/img/productos/torta-chocolate-1.png" },
    { codigo: "TC002", nombre: "Torta Cuadrada de Frutas", precio: "50.000", imagen: "../assets/img/productos/torta-frutas-1.png" },
    { codigo: "TT001", nombre: "Torta Circular de Vainilla", precio: "40.000", imagen: "../assets/img/productos/torta-vainilla-1.png" },
    { codigo: "TT002", nombre: "Torta Circular de Manjar", precio: "42.000", imagen: "../assets/img/productos/torta-manjar-1.png" },
    { codigo: "PI001", nombre: "Mousse de Chocolate", precio: "5.000", imagen: "../assets/img/productos/mousse-chocolate-1.png" },
    { codigo: "PI002", nombre: "Tiramisú Clásico", precio: "5.500", imagen: "../assets/img/productos/tiramisu-1.png" },
    { codigo: "PG001", nombre: "Brownie Sin Gluten", precio: "4.000", imagen: "../assets/img/productos/brownie-sg-1.png" },
    { codigo: "PV001", nombre: "Torta Vegana de Chocolate", precio: "50.000", imagen: "../assets/img/productos/torta-vegana-1.png" },
  ];

  return (
    // Usamos <main> y <Container> de Bootstrap para el contenido
    <main>
      <Container>

        {/* --- 1. HERO BANNER --- */}
        {/* (Usamos las clases de Bootstrap "text-center", "py-5" = padding y) */}
        <section className="hero-banner text-center py-5">
          <h2>Bienvenido a la Tradición</h2>
          <p>50 años horneando momentos inolvidables.</p>
          {/* Usamos el componente <Link> con las CLASES de Bootstrap */}
          <Link to="/tienda" className="btn btn-primary btn-principal">
            Ver Productos
          </Link>
        </section>

        {/* --- 2. PRODUCTOS DESTACADOS --- */}
        <section className="featured-products py-5">
          <h3 className="text-center mb-4">Productos Destacados</h3>
          
          {/* Usamos <Row> y <Col> para la cuadrícula de 3 (lg={4} significa 4/12) */}
          <Row xs={1} md={2} lg={3} className="g-4">
            {productosDestacados.map((producto) => (
              <Col key={producto.codigo}>
                {/* Usamos el componente <Card> de Bootstrap */}
                <Card className="product-card h-100">
                  <Card.Img 
                    variant="top" 
                    src={producto.imagen} 
                    className="product-card-img" // (Usaremos esta clase para el 'object-fit')
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      <Link to={`/producto/${producto.codigo}`} className="card-stretched-link">
                        {producto.nombre}
                      </Link>
                    </Card.Title>
                    <Card.Text>${producto.precio}</Card.Text>
                    <Link
                      to={`/producto/${producto.codigo}`} 
                      className="btn btn-outline-primary btn-secundario mt-auto"
                    >
                      Ver detalle
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* --- 3. MISIÓN Y VISIÓN --- */}
        <section className="mission-vision py-5">
          <Row className="g-4">
            {/* Usamos <Col> para dividir 50/50 */}
            <Col md={6}>
              <div className="mission-box p-4">
                <h3>Nuestra Misión</h3>
                <p>Ofrecer una experiencia dulce y memorable a nuestros clientes, proporcionando tortas y productos de repostería de alta calidad para todas las ocasiones, mientras celebramos nuestras raíces históricas y fomentamos la creatividad en la repostería.</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mission-box p-4">
                <h3>Nuestra Visión</h3>
                <p>Convertirnos en la tienda online líder de productos de repostería en Chile, conocida por nuestra innovación, calidad y el impacto positivo en la comunidad, especialmente en la formación de nuevos talentos en gastronomía.</p>
              </div>
            </Col>
          </Row>
        </section>

      </Container>
    </main>
  );
}

export default Home;