import { useState, useEffect } from 'react';
// 1. AHORA TODAS ESTAS IMPORTACIONES SE USARÁN
import { Container, Row, Col, Image, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { IconoFacebook, IconoInstagram, IconoWhatsapp } from '../components/Iconos';
import { useParams, Link } from 'react-router-dom';
import { getProductoByCodigo } from '../services/PasteleriaService';
import type { IProducto } from '../services/PasteleriaService';
import { useCarrito } from '../hooks/useCarrito';

function Producto() {

  const { codigo } = useParams(); 
  const { agregarAlCarrito } = useCarrito();

  const [producto, setProducto] = useState<IProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  
  useEffect(() => {
    if (!codigo) {
      setError("No se ha especificado un código de producto.");
      setLoading(false);
      return;
    }
    const cargarProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const productoEncontrado = await getProductoByCodigo(codigo);
        setProducto(productoEncontrado);
        setImagenPrincipal(productoEncontrado.imagenes[0]); 
      } catch (err) {
        setError("Producto no encontrado.");
      } finally {
        setLoading(false);
      }
    };
    cargarProducto();
  }, [codigo]); 
  
  const handleThumbnailClick = (urlImagen: string) => {
    setImagenPrincipal(urlImagen);
  };

  const handleAddToCart = (event: React.FormEvent) => {
    event.preventDefault(); 
    if (!producto) return;
    agregarAlCarrito(producto, cantidad, mensaje);
    alert(`¡${cantidad} x ${producto.nombre} añadido(s) al carrito!`);
    setCantidad(1);
    setMensaje('');
  };

  const handleShare = (red: 'fb' | 'tw' | 'wa') => {
    const url = window.location.href; // La URL actual del producto
    const text = encodeURIComponent(`¡Mira esta deliciosa ${producto?.nombre} de Pastelería Mil Sabores!`);
    
    let shareUrl = '';

    if (red === 'fb') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (red === 'tw') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (red === 'wa') {
      shareUrl = `https://api.whatsapp.com/send?text=${text} ${url}`;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  // 2. AQUÍ VA EL BLOQUE DE CARGA
  // Si 'loading' es true, muestra esto y NADA MÁS.
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-2 logo-text fs-4">Cargando producto...</p>
      </Container>
    );
  }

  // 3. AQUÍ VA EL BLOQUE DE ERROR
  // Si 'loading' es false Y hay un error, muestra esto y NADA MÁS.
  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <Link to="/tienda" className="btn btn-primary btn-principal">Volver a la Tienda</Link>
      </Container>
    );
  }
  
  const botonesSociales = [
    { id: 'fb', Icon: IconoFacebook, label: 'Facebook' },
    { id: 'tw', Icon: IconoInstagram, label: 'Instagram' },
    { id: 'wa', Icon: IconoWhatsapp, label: 'WhatsApp' }
  ] as const;

  
  // 4. EL RETURN PRINCIPAL
  return (
    <Container className="py-5">
      {producto && ( // <-- Nos aseguramos que producto no sea null
        <Row>
          <Col md={6}>
            <div className="product-gallery">
              <div className="gallery-main-image">
                <Image src={imagenPrincipal} alt={producto.nombre} fluid />
              </div>
              <div className="gallery-thumbnails">
                {producto.imagenes.map((imgUrl: string, index: number) => (
                  <Image 
                    key={index}
                    src={imgUrl} 
                    alt={`Thumbnail ${index + 1}`} 
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
                    // 1. LÍMITE ESTRICTO: No deja escribir más de 50
                    maxLength={50} 
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                  {/* 2. CONTADOR VISUAL: Le avisa al usuario cuánto le queda */}
                  <Form.Text className="text-muted text-end d-block">
                    {mensaje.length}/50 caracteres
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="product-quantity">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={cantidad}
                    min="1"
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
                       key={id}
                       onClick={() => handleShare(id)} 
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
      )}
    </Container>
  );
}

export default Producto;