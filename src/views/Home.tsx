import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProductos, getCategorias } from '../services/PasteleriaService';
import type { IProducto } from '../services/PasteleriaService';

function Home() {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [destacados, setDestacados] = useState<IProducto[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const allProductos = await getProductos();
      const allCategorias = await getCategorias();
      
      setProductos(allProductos);
      setCategorias(allCategorias);

      // Filtramos productos activos para destacados
      const activos = allProductos.filter(p => p.activo !== false);
      const shuffled = [...activos].sort(() => 0.5 - Math.random());
      setDestacados(shuffled.slice(0, 4));
    };
    cargarDatos();
  }, []);

  const getImagenCategoria = (cat: string) => {
    const producto = productos.find(p => p.categoria === cat);
    return producto ? producto.imagenes[0] : '/assets/img/logo.png';
  };

  return (
    <div className="home-container">
      
      {/* 1. HERO SECTION */}
      <section 
        className="hero-section text-white d-flex align-items-center position-relative"
        style={{
            backgroundImage: `url('/assets/img/tienda-de-pasteles-vintage.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '600px'
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 overlay-warm"></div>
        
        <Container className="position-relative z-2 text-center">
            <h1 className="display-3 fw-bold mb-3 logo-text text-white">Mil Sabores, Mil Momentos</h1>
            <p className="lead fs-4 mb-4">
                Descubre la dulzura artesanal hecha con pasión y los ingredientes más frescos.
                <br className="d-none d-md-block" />¡Recién horneado para ti!
            </p>
            <div className="d-flex justify-content-center gap-3 flex-column flex-sm-row px-4">
                <Link to="/tienda" className="btn btn-warning btn-lg px-5 fw-bold rounded-pill shadow">
                    <i className="fa-solid fa-basket-shopping me-2"></i> Ver Catálogo
                </Link>
                <Link to="/contacto" className="btn btn-outline-light btn-lg px-5 fw-bold rounded-pill">
                    Ubicación
                </Link>
            </div>
        </Container>
      </section>

      {/* 2. SECCIÓN DE BENEFICIOS */}
      <section className="bg-crema py-5">
        <Container>
            <Row className="g-4 text-center">
                <Col md={4}>
                    <div className="p-3 border-0">
                        <i className="fa-solid fa-medal fa-3x text-choco mb-3"></i>
                        <h4 className="fw-bold text-choco">Calidad Premium</h4>
                        <p className="text-muted">Usamos solo ingredientes naturales y seleccionados.</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="p-3 border-0">
                        <i className="fa-solid fa-clock-rotate-left fa-3x text-choco mb-3"></i>
                        <h4 className="fw-bold text-choco">Siempre Fresco</h4>
                        <p className="text-muted">Productos elaborados diariamente.</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="p-3 border-0">
                        <i className="fa-solid fa-heart fa-3x text-choco mb-3"></i>
                        <h4 className="fw-bold text-choco">Hecho con Amor</h4>
                        <p className="text-muted">Recetas tradicionales con el toque casero que amas.</p>
                    </div>
                </Col>
            </Row>
        </Container>
      </section>

      {/* 3. EXPLORAR POR CATEGORÍAS */}
      <section className="py-5 bg-white">
        <Container>
            <div className="text-center mb-5">
                <Badge bg="secondary" className="mb-2">NUESTRAS ESPECIALIDADES</Badge>
                <h2 className="logo-text text-choco display-6">Explora por Categoría</h2>
                <p className="text-muted">Encuentra justo lo que se te antoja hoy</p>
            </div>

            <Row className="g-3 g-md-4">
                {categorias.map((cat, index) => (
                    <Col key={index} xs={6} md={4} lg={3}>
                        <Card className="h-100 border-0 shadow-sm hover-scale overflow-hidden text-white category-card">
                            <div 
                                style={{
                                    height: '200px',
                                    backgroundImage: `url(${getImagenCategoria(cat)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    transition: 'transform 0.5s ease'
                                }}
                                className="card-bg-image"
                            ></div>
                            <div className="card-img-overlay d-flex flex-column justify-content-end p-0">
                                <div className="p-2 p-md-3 w-100 text-center" style={{ background: 'linear-gradient(to top, rgba(93, 64, 55, 0.9), transparent)' }}>
                                    <h5 className="fw-bold mb-1 mb-md-2 fs-6 fs-md-5 text-truncate">{cat}</h5>
                                    <Link to={`/tienda?categoria=${encodeURIComponent(cat)}`} className="btn btn-sm btn-light rounded-pill px-3 fw-bold text-choco" style={{ fontSize: '0.75rem' }}>
                                        Ver
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
      </section>

      {/* 4. DESTACADOS (FAVORITOS DEL MAESTRO) - BOTONES ACTUALIZADOS */}
      <section className="py-5 bg-crema">
        <Container>
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="logo-text text-choco mb-0 fs-2">Favoritos</h2>
                    <p className="text-muted mb-0 small d-none d-sm-block">Lo que todos están pidiendo hoy</p>
                </div>
                <Link to="/tienda" className="btn btn-sm btn-outline-dark rounded-pill">Ver Todo <i className="fa-solid fa-arrow-right ms-1"></i></Link>
            </div>

            <Row className="g-3 g-md-4">
                {destacados.map((prod) => (
                    <Col key={prod.codigo} xs={6} lg={3}>
                        <Card className="h-100 border-0 shadow-sm product-card">
                            <div className="position-relative">
                                <Link to={`/producto/${prod.codigo}`}>
                                    <Card.Img 
                                        variant="top" 
                                        src={prod.imagenes[0]} 
                                        style={{ height: '160px', objectFit: 'cover', cursor: 'pointer' }}
                                        className="product-card-img"
                                    />
                                </Link>
                                <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-2 shadow-sm" style={{ fontSize: '0.6rem' }}>
                                    Destacado
                                </Badge>
                            </div>
                            <Card.Body className="d-flex flex-column p-2 p-md-3">
                                <Card.Title className="fs-6 fw-bold text-truncate mb-2">
                                    <Link to={`/producto/${prod.codigo}`} className="text-decoration-none text-choco stretched-link">
                                        {prod.nombre}
                                    </Link>
                                </Card.Title>
                                
                                {/* NUEVO LAYOUT: Precio y Botón en columna */}
                                <div className="mt-auto d-flex flex-column gap-2 position-relative z-2">
                                    <span className="text-choco fw-bold fs-6">
                                        ${prod.precio.toLocaleString('es-CL')}
                                    </span>
                                    
                                    {/* BOTÓN RECTANGULAR ESTILO TIENDA */}
                                    <Link
                                      to={`/producto/${prod.codigo}`} 
                                      className="btn btn-sm btn-outline-primary btn-secundario fw-bold w-100"
                                    >
                                      Ver detalle
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
      </section>

      {/* 5. SECCIÓN MISIÓN Y VISIÓN */}
      <section className="py-5 bg-white">
        <Container>
            <div className="text-center mb-5">
                <i className="fa-solid fa-wheat-awn fa-2x text-choco mb-2"></i>
                <h2 className="logo-text text-choco display-6">Nuestra Esencia</h2>
                <div className="d-flex justify-content-center">
                    <div className="bg-choco" style={{ height: '3px', width: '60px' }}></div>
                </div>
            </div>

            <Row className="g-4 align-items-stretch">
                <Col md={6}>
                    <Card className="h-100 shadow-sm border-0 border-start border-5 border-choco bg-crema">
                        <Card.Body className="p-4 p-md-5 text-center">
                            <div className="mb-4">
                                <span className="d-inline-block p-3 rounded-circle bg-white text-choco shadow-sm">
                                    <i className="fa-solid fa-bullseye fa-2x"></i>
                                </span>
                            </div>
                            <h3 className="logo-text text-choco mb-3">Nuestra Misión</h3>
                            <p className="text-muted lead fs-6">
                                "Deleitar a nuestra comunidad con pastelería artesanal de excelencia, elaborada diariamente con ingredientes frescos y naturales. Nos comprometemos a mantener las recetas tradicionales que nos caracterizan."
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="h-100 shadow-sm border-0 border-start border-5 border-rosa bg-rosa-suave">
                        <Card.Body className="p-4 p-md-5 text-center">
                            <div className="mb-4">
                                <span className="d-inline-block p-3 rounded-circle bg-white text-rosa shadow-sm">
                                    <i className="fa-solid fa-eye fa-2x"></i>
                                </span>
                            </div>
                            <h3 className="logo-text text-rosa mb-3" style={{color: 'var(--color-texto-principal)'}}>Nuestra Visión</h3>
                            <p className="text-muted lead fs-6">
                                "Ser la pastelería de referencia en la región, reconocida por la calidad inigualable de nuestros productos y la cercanía de nuestro servicio. Aspiramos a crear recuerdos dulces que perduren en el tiempo."
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
      </section>

    </div>
  );
}

export default Home;