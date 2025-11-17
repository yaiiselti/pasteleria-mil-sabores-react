import { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Form, Button } from 'react-bootstrap';
// useParams nos deja leer la URL (ej. /producto/TC001)
import { useParams, Link } from 'react-router-dom';



function Producto() {

  // --- LÓGICA DE REACT ---

  // 1. Obtenemos el parámetro "codigo" de la URL
  const { codigo } = useParams(); 
  
  // 2. Estados
  // (Guardamos el producto encontrado)
  const [producto, setProducto] = useState(null); 
  // (Guardamos la URL de la imagen principal que se está viendo)
  const [imagenPrincipal, setImagenPrincipal] = useState('');
  // (Guardamos los datos del formulario)
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  
  // 3. Efecto (Se ejecuta 1 vez cuando la página carga)
  useEffect(() => {
    // Buscamos el producto en la DB usando el código de la URL
    const productoEncontrado = productosDB.find(p => p.codigo === codigo);
    
    if (productoEncontrado) {
      setProducto(productoEncontrado);
      // Ponemos la primera imagen de la galería como la principal
      setImagenPrincipal(productoEncontrado.imagenes[0]); 
    }
    // Si no lo encuentra, 'producto' se queda en null
    
  }, [codigo]); // Se re-ejecuta si el 'codigo' de la URL cambia

  
  // --- Funciones Handler ---

  // Se ejecuta cuando el usuario hace clic en una miniatura
  const handleThumbnailClick = (urlImagen) => {
    setImagenPrincipal(urlImagen);
  };

  // Se ejecuta cuando el usuario presiona "Añadir al carrito"
  const handleAddToCart = (event) => {
    event.preventDefault(); // Previene que el formulario recargue la pág
    
    // (En la Fase 3, esto llamará al Contexto del Carrito)
    console.log("AÑADIR AL CARRITO (Fase 3):");
    console.log("Codigo:", producto.codigo);
    console.log("Cantidad:", cantidad);
    console.log("Mensaje:", mensaje);

    alert("¡Producto añadido! (Simulación Fase 1)");
  };
  
  // --- VISTA (JSX) ---

  // Si el producto aún no se carga o no se encuentra
  if (!producto) {
    return (
      <Container className="py-5 text-center">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe.</p>
        <Link to="/tienda" className="btn btn-primary btn-principal">Volver a la Tienda</Link>
      </Container>
    );
  }
  
  // Si el producto SÍ se encontró
  return (
    <Container className="py-5">
      <Row>
        
        {/* --- COLUMNA DE GALERÍA (Izquierda) --- */}
        <Col md={6}>
          {/* Reutilizamos el CSS de la Parte 1 */}
          <div className="product-gallery">
            <div className="gallery-main-image">
              <Image src={imagenPrincipal} alt={producto.nombre} fluid />
            </div>
            <div className="gallery-thumbnails">
              {/* Mapeamos las imágenes de la galería */}
              {producto.imagenes.map((imgUrl, index) => (
                <Image 
                  key={index}
                  src={imgUrl} 
                  alt={`Thumbnail ${index + 1}`} 
                  className={`thumbnail ${imagenPrincipal === imgUrl ? 'active' : ''}`}
                  // Conectamos el clic al handler
                  onClick={() => handleThumbnailClick(imgUrl)}
                />
              ))}
            </div>
          </div>
        </Col>

        {/* --- COLUMNA DE INFO (Derecha) --- */}
        <Col md={6}>
          <div className="product-info">
            <h2 className="product-title">{producto.nombre}</h2>
            <span className="product-price">${producto.precio.toLocaleString('es-CL')}</span>
            <p className="product-description">{producto.descripcion}</p>

            {/* Formulario de Añadir al Carrito */}
            <Form onSubmit={handleAddToCart}>
              
              {/* Mensaje Personalizado (Req. Forma C) */}
              <Form.Group className="mb-3" controlId="product-custom-msg">
                <Form.Label>Mensaje Personalizado (Opcional)</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ej: ¡Feliz Cumpleaños!" 
                  value={mensaje}
                  // Conectamos el input al estado
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </Form.Group>

              {/* Cantidad */}
              <Form.Group className="mb-3" controlId="product-quantity">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control 
                  type="number" 
                  value={cantidad}
                  min="1"
                  // Conectamos el input al estado
                  onChange={(e) => setCantidad(parseInt(e.target.value))}
                  className="input-quantity"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="btn-principal w-100">
                Añadir al carrito
              </Button>
            </Form>

            {/* Botones de Compartir (Req. Forma C) */}
            <div className="product-share">
              <h4 className="share-title">Compartir este producto:</h4>
              <div className="share-icons">
                <a href="#" className="share-link"><i className="fa-brands fa-facebook"></i></a>
                <a href="#" className="share-link"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="share-link"><i className="fa-brands fa-whatsapp"></i></a>
              </div>
            </div>

          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Producto;