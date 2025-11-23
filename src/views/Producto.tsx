import { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Form, Button, Spinner, Alert, Card, ListGroup } from 'react-bootstrap';
import { IconoFacebook, IconoInstagram, IconoWhatsapp } from '../components/Iconos';
import { useParams, Link } from 'react-router-dom';

// 1. AGREGAMOS getProductos A LA IMPORTACIÓN
import { getProductoByCodigo, getResenasPorProducto, saveResena, getProductos } from '../services/PasteleriaService';
import type { IProducto, IResena } from '../services/PasteleriaService';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../context/AuthContext'; 
import { useNotification } from '../context/NotificationContext'; 
import { StarRating } from '../components/StarRating'; 

function Producto() {

  const { codigo } = useParams(); 
  const { agregarAlCarrito } = useCarrito();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [producto, setProducto] = useState<IProducto | null>(null);
  const [resenas, setResenas] = useState<IResena[]>([]); 
  // 2. NUEVO ESTADO: Para guardar los productos recomendados
  const [relacionados, setRelacionados] = useState<IProducto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  
  useEffect(() => {
    if (!codigo) {
      setError("No se ha especificado un código de producto.");
      setLoading(false);
      return;
    }

    // Resetear estados al cambiar de producto (por si navegas desde recomendaciones)
    setCantidad(1);
    setMensaje('');
    setNuevoComentario('');
    window.scrollTo(0, 0); // Subir al inicio

    const cargarTodo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 3. MODIFICADO: Cargamos también TODOS los productos para filtrar recomendaciones
        const [prod, reviews, todosLosProductos] = await Promise.all([
          getProductoByCodigo(codigo),
          getResenasPorProducto(codigo),
          getProductos()
        ]);
        
        setProducto(prod);
        setImagenPrincipal(prod.imagenes[0]);
        setResenas(reviews); 

        // 4. LÓGICA DE RECOMENDACIÓN
        // Buscamos productos de la MISMA categoría, pero que NO sean el producto actual
        const sugerencias = todosLosProductos
          .filter(p => p.categoria === prod.categoria && p.codigo !== prod.codigo)
          .slice(0, 3); // Tomamos solo 3 para mostrar

        setRelacionados(sugerencias);

      } catch (err) {
        setError("Producto no encontrado.");
      } finally {
        setLoading(false);
      }
    };
    cargarTodo();
  }, [codigo]); 
  
  const handleThumbnailClick = (urlImagen: string) => {
    setImagenPrincipal(urlImagen);
  };

  const handleAddToCart = (event: React.FormEvent) => {
    event.preventDefault(); 
    if (!producto) return;
    agregarAlCarrito(producto, cantidad, mensaje);
    showNotification(`¡${cantidad} x ${producto.nombre} añadido(s)!`, 'success');
    setCantidad(1);
    setMensaje('');
  };

  const handleShare = (red: 'fb' | 'tw' | 'wa') => {
    const url = window.location.href;
    const text = encodeURIComponent(`¡Mira esta deliciosa ${producto?.nombre} de Pastelería Mil Sabores!`);
    let shareUrl = '';

    if (red === 'fb') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    else if (red === 'tw') shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    else if (red === 'wa') shareUrl = `https://api.whatsapp.com/send?text=${text} ${url}`;

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmitResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto || !user) return;

    if (nuevoComentario.trim().length < 5) {
      showNotification('El comentario es muy corto.', 'warning');
      return;
    }

    const nueva: Omit<IResena, 'id'> = {
      codigoProducto: producto.codigo,
      emailUsuario: user.email,
      nombreUsuario: user.nombre,
      calificacion: nuevaCalificacion,
      comentario: nuevoComentario,
      fecha: new Date().toLocaleDateString()
    };

    await saveResena(nueva);
    
    const reviewsActualizadas = await getResenasPorProducto(producto.codigo);
    setResenas(reviewsActualizadas);
    
    setNuevoComentario('');
    setNuevaCalificacion(5);
    showNotification('¡Gracias por tu opinión!', 'success');
  };
  
  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><p className="mt-2">Cargando...</p></Container>;
  if (error) return <Container className="py-5 text-center"><Alert variant="danger">{error}</Alert><Link to="/tienda" className="btn btn-primary">Volver a la Tienda</Link></Container>;
  
  const botonesSociales = [
    { id: 'fb', Icon: IconoFacebook, label: 'Facebook' },
    { id: 'tw', Icon: IconoInstagram, label: 'Instagram' },
    { id: 'wa', Icon: IconoWhatsapp, label: 'WhatsApp' }
  ] as const;

  return (
    <Container className="py-5">
      {producto && (
        <>
          {/* --- DETALLE PRODUCTO (INTACTO) --- */}
          <Row className="mb-5">
            <Col md={6}>
              <div className="product-gallery">
                <div className="gallery-main-image">
                  <Image src={imagenPrincipal} alt={producto.nombre} fluid />
                </div>
                <div className="gallery-thumbnails">
                  {producto.imagenes.map((imgUrl: string, index: number) => (
                    <Image 
                      key={index} src={imgUrl} alt={`Thumbnail ${index + 1}`} 
                      className={`thumbnail ${imagenPrincipal === imgUrl ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(imgUrl)}
                    />
                  ))}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="product-info">
                <h2 className="product-title">{producto.nombre}</h2>
                <span className="product-price">${producto.precio.toLocaleString('es-CL')}</span>
                <p className="product-description">{producto.descripcion}</p>

                <Form onSubmit={handleAddToCart}>
                  <Form.Group className="mb-3" controlId="product-custom-msg">
                    <Form.Label>Mensaje Personalizado (Opcional)</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ej: ¡Feliz Cumpleaños! (Máx 50 letras)" 
                      value={mensaje}
                      maxLength={50} 
                      onChange={(e) => setMensaje(e.target.value)}
                    />
                    <Form.Text className="text-muted text-end d-block">
                      {mensaje.length}/50 caracteres
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="product-quantity">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control 
                      type="number" value={cantidad} min="1"
                      onChange={(e) => setCantidad(parseInt(e.target.value))}
                      className="input-quantity"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="btn-principal w-100">
                    Añadir al carrito
                  </Button>
                </Form>

                <div className="product-share mt-4 pt-3 border-top">
                   <h5 className="share-title mb-3">Compartir este producto:</h5>
                   <div className="share-icons d-flex gap-3">
                     {botonesSociales.map(({ id, Icon, label }) => (
                       <button 
                         key={id} onClick={() => handleShare(id)} 
                         className="btn border-0 p-0 share-link"
                         title={`Compartir en ${label}`}
                       >
                         <Icon size={32} color="#666769ff" />
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* --- OPINIONES (INTACTO) --- */}
          <Row className="mb-5">
            <Col md={12}>
              <h3 className="logo-text mb-4 border-bottom pb-2">Opiniones de Clientes</h3>
            </Col>
            <Col md={7}>
              {resenas.length === 0 ? (
                <Alert variant="light" className="text-center text-muted py-4">
                  <p className="mb-0">Aún no hay opiniones. ¡Sé el primero en comentar!</p>
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {resenas.map((resena) => (
                    <ListGroup.Item key={resena.id} className="bg-transparent border-0 border-bottom py-3 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">{resena.nombreUsuario}</h6>
                          <div className="mb-2">
                            <StarRating calificacion={resena.calificacion} />
                          </div>
                        </div>
                        <small className="text-muted">{resena.fecha}</small>
                      </div>
                      <p className="mb-0 text-secondary">{resena.comentario}</p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>
            <Col md={5} className="mt-4 mt-md-0">
              <Card className="shadow-sm border-0 bg-light">
                <Card.Body className="p-4">
                  <h5 className="mb-3 fw-bold">Deja tu opinión</h5>
                  {isAuthenticated ? (
                    <Form onSubmit={handleSubmitResena}>
                      <Form.Group className="mb-3">
                        <Form.Label>Calificación:</Form.Label>
                        <div className="mb-2">
                          <StarRating calificacion={nuevaCalificacion} onRate={(n) => setNuevaCalificacion(n)} />
                        </div>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tu comentario:</Form.Label>
                        <Form.Control 
                          as="textarea" rows={3} value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          placeholder="Cuéntanos qué te pareció..."
                          maxLength={200} required
                        />
                        <Form.Text className="text-muted text-end d-block">
                          {nuevoComentario.length}/200 caracteres
                        </Form.Text>
                      </Form.Group>
                      <Button type="submit" className="btn-principal w-100">Publicar Opinión</Button>
                    </Form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-3 text-muted">Debes iniciar sesión para opinar.</p>
                      <Link to="/login" className="btn btn-outline-primary w-100">Ir al Login</Link>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {relacionados.length > 0 && (
            <Row className="mt-5">
              <Col md={12}>
                <h4 
                  className="logo-text mb-4 pb-2" 
                  style={{ borderBottom: '2px solid var(--color-acento-choco)' }}
                >
                  También te podría gustar
                </h4>
              </Col>
              
              {relacionados.map((item) => (
                <Col key={item.codigo} md={3} xs={6} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm product-card bg-white overflow-hidden">
                    
                    {/* Contenedor de imagen con efecto Zoom suave */}
                    <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                      <Card.Img 
                        variant="top" 
                        src={item.imagenes[0]} 
                        className="h-100 w-100 object-fit-cover"
                        style={{ transition: 'transform 0.3s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                    
                    <Card.Body className="d-flex flex-column text-center p-3">
                      <Card.Title 
                        className="fs-6 mb-1 text-truncate" 
                        style={{ color: 'var(--color-texto-principal)', fontFamily: 'var(--fuente-principal)' }}
                        title={item.nombre}
                      >
                        {item.nombre}
                      </Card.Title>
                      
                      <Card.Text 
                        className="fw-bold fs-6 mb-2" 
                        style={{ color: 'var(--color-acento-choco)' }}
                      >
                        ${item.precio.toLocaleString('es-CL')}
                      </Card.Text>
                      
                      <Link 
                        to={`/producto/${item.codigo}`} 
                        className="btn btn-principal btn-sm mt-auto stretched-link rounded-pill px-3"
                      >
                        Ver Detalle
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

        </>
      )}
    </Container>
  );
}

export default Producto;