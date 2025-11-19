import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';


// Separamos la importación de la función (valor) y la interfaz (tipo)
import { getProductos } from '../services/PasteleriaService';
import type { IProducto } from '../services/PasteleriaService';

function Home() {
  
  const [productosDestacados, setProductosDestacados] = useState<IProducto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDestacados = async () => {
      try {
        setLoading(true);
        const todosLosProductos = await getProductos();
        setProductosDestacados(todosLosProductos.slice(0, 8)); // Tomamos los primeros 8
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDestacados();
  }, []);

  return (
    <main>
      <Container>

        {/* --- 1. HERO BANNER (Sin cambios) --- */}
        <section className="hero-banner text-center py-5">
          <h2>Bienvenido a la Tradición</h2>
          <p>50 años horneando momentos inolvidables.</p>
          <Link to="/tienda" className="btn btn-primary btn-principal">
            Ver Productos
          </Link>
        </section>

        {/* --- 2. PRODUCTOS DESTACADOS --- */}
        <section className="featured-products py-5">
          <h3 className="text-center mb-4 logo-text">Productos Destacados</h3>
          
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="secondary" />
            </div>
          ) : (
            // He cambiado lg={3} a lg={4} para que quepan 4 productos, como en la Parte 1
            <Row xs={1} md={2} lg={4} className="g-4"> 
              {productosDestacados.map((producto) => (
                <Col key={producto.codigo}>
                  <Card className="product-card h-100">
                    {/* 2. CORRECCIÓN de "imagen" vs "imagenes" */}
                    <Card.Img 
                      variant="top" 
                      src={producto.imagenes[0]} // Usamos la primera imagen del arreglo
                      className="product-card-img"
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>
                        <Link to={`/producto/${producto.codigo}`} className="card-stretched-link">
                          {producto.nombre}
                        </Link>
                      </Card.Title>
                      <Card.Text>${producto.precio.toLocaleString('es-CL')}</Card.Text>
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
          )}
        </section>

        {/* --- 3. MISIÓN Y VISIÓN (Sin cambios) --- */}
        <section className="mission-vision py-5">
          <Row className="g-4">
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