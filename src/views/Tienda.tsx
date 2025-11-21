import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, ListGroup, Spinner, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProductos, getCategorias } from '../services/PasteleriaService';
import type { IProducto } from '../services/PasteleriaService';

function Tienda() {
  
  const [productosDB, setProductosDB] = useState<IProducto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<IProducto[]>([]);
  
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [productosData, categoriasData] = await Promise.all([
          getProductos(),
          getCategorias()
        ]);
        
        setProductosDB(productosData);
        setProductosFiltrados(productosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    let productosFiltradosTemp = productosDB;

    if (filtroCategoria !== 'todos') {
      productosFiltradosTemp = productosFiltradosTemp.filter(
        producto => producto.categoria === filtroCategoria
      );
    }

    if (filtroBusqueda !== '') {
      productosFiltradosTemp = productosFiltradosTemp.filter(
        producto => producto.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      );
    }

    setProductosFiltrados(productosFiltradosTemp);
  }, [filtroBusqueda, filtroCategoria, productosDB]);

  // --- 1. SEPARAMOS EL BUSCADOR ---
  const buscadorJSX = (
    <Form.Group className="mb-4">
      <Form.Label className="filter-title">Búsqueda</Form.Label>
      <Form.Control 
        type="search" 
        placeholder="Buscar producto..." 
        className="filter-search"
        onChange={ (e) => setFiltroBusqueda(e.target.value) }
      />
    </Form.Group>
  );

  // --- 2. SEPARAMOS LAS CATEGORÍAS ---
  const categoriasJSX = (
    <Form.Group>
      <Form.Label className="filter-title d-none d-md-block">Categoría</Form.Label>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : (
        <ListGroup>
          <ListGroup.Item 
            action 
            active={filtroCategoria === 'todos'}
            onClick={() => setFiltroCategoria('todos')}
          >
            Mostrar Todos
          </ListGroup.Item>
          
          {categorias.map(categoria => (
            <ListGroup.Item 
              key={categoria}
              action
              active={filtroCategoria === categoria}
              onClick={() => setFiltroCategoria(categoria)}
            >
              {categoria}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Form.Group>
  );

  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Todos Nuestros Productos</h2>

      <Row>
        
        {/* --- COLUMNA DE FILTROS --- */}
        <Col md={3} className="mb-4 mb-md-0">
          
          {/* A. VERSIÓN MÓVIL (Separada) */}
          <div className="d-md-none">
            {/* 1. Buscador SIEMPRE visible arriba */}
            <div className="mb-3">
              {buscadorJSX}
            </div>

            {/* 2. Categorías ESCONDIDAS en Acordeón abajo */}
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Filtrar por Categoría</Accordion.Header>
                <Accordion.Body>
                  {categoriasJSX}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          {/* B. VERSIÓN ESCRITORIO (Todo junto y fijo) */}
          <div className="d-none d-md-block store-filters">
            {buscadorJSX}
            {categoriasJSX}
          </div>

        </Col>

        {/* --- COLUMNA DE PRODUCTOS --- */}
        <Col md={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {productosFiltrados.map((producto) => (
                <Col key={producto.codigo}>
                  <Card className="product-card h-100">
                    <Card.Img 
                      variant="top" 
                      src={producto.imagenes[0]} 
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
        </Col>

      </Row>
    </Container>
  );
}

export default Tienda;