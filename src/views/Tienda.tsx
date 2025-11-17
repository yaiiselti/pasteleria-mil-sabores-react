import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';




function Tienda() {
  
  // --- LÓGICA DE REACT (reemplaza nuestro main.js) ---
  
  // 1. Estados (useState)
  // (Manejan la memoria del componente)
  const [productos, setProductos] = useState(productosDB); // La lista de productos que se muestra
  const [filtroBusqueda, setFiltroBusqueda] = useState(''); // El texto en la barra de búsqueda
  const [filtroCategoria, setFiltroCategoria] = useState('todos'); // La categoría seleccionada

  // 2. Efecto (useEffect)
  // (Se ejecuta CADA VEZ que los filtros cambian)
  useEffect(() => {
    
    // Esta es la lógica de 'aplicarFiltrosYRecargar' de la Parte 1
    let productosFiltrados = productosDB;

    // A. Filtramos por Categoría
    if (filtroCategoria !== 'todos') {
      productosFiltrados = productosFiltrados.filter(
        producto => producto.categoria === filtroCategoria
      );
    }

    // B. Filtramos por Búsqueda (sobre la lista ya filtrada)
    if (filtroBusqueda !== '') {
      productosFiltrados = productosFiltrados.filter(
        producto => producto.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      );
    }

    // C. Actualizamos el estado, lo que "repinta" la lista
    setProductos(productosFiltrados);

  }, [filtroBusqueda, filtroCategoria]); // Dependencias: se re-ejecuta si esto cambia


  // --- VISTA (JSX) ---
  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Todos Nuestros Productos</h2>

      <Row>
        
        {/* --- COLUMNA DE FILTROS (Izquierda) --- */}
        <Col md={3}>
          <div className="store-filters">
            {/* Filtro de Búsqueda */}
            <Form.Group className="mb-4">
              <Form.Label className="filter-title">Búsqueda</Form.Label>
              <Form.Control 
                type="search" 
                placeholder="Buscar producto..." 
                className="filter-search"
                // Conectamos el input al estado
                onChange={ (e) => setFiltroBusqueda(e.target.value) }
              />
            </Form.Group>

            {/* Filtro de Categorías */}
            <Form.Group>
              <Form.Label className="filter-title">Categoría</Form.Label>
              <ListGroup>
                {/* Botón "Mostrar Todos" */}
                <ListGroup.Item 
                  action 
                  active={filtroCategoria === 'todos'}
                  // Conectamos el clic al estado
                  onClick={() => setFiltroCategoria('todos')}
                >
                  Mostrar Todos
                </ListGroup.Item>
                
                {/* Mapeamos las categorías de la DB */}
                {todasLasCategorias.map(categoria => (
                  <ListGroup.Item 
                    key={categoria}
                    action
                    active={filtroCategoria === categoria}
                    // Conectamos el clic al estado
                    onClick={() => setFiltroCategoria(categoria)}
                  >
                    {categoria}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form.Group>
          </div>
        </Col>

        {/* --- COLUMNA DE PRODUCTOS (Derecha) --- */}
        <Col md={9}>
          {/* ¡Reutilizamos la cuadrícula de 3 columnas de Home.tsx! */}
          <Row xs={1} md={2} lg={3} className="g-4">
            
            {/* Mapeamos los productos del ESTADO 'productos' */}
            {productos.map((producto) => (
              <Col key={producto.codigo}>
                {/* ¡REUTILIZAMOS EL CSS! (product-card) */}
                <Card className="product-card h-100">
                  <Card.Img 
                    variant="top" 
                    src={producto.imagenes[0]} // Usamos la primera imagen
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
        </Col>

      </Row>
    </Container>
  );
}

export default Tienda;