import { useState, useEffect } from 'react';
// 1. Importamos Pagination
import { Container, Row, Col, Card, Form, ListGroup, Spinner, Accordion, Pagination } from 'react-bootstrap';
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

  // --- 2. ESTADOS PARA LA PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 6; // Puedes cambiar este número (ej: 9, 12)

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
    let temp = productosDB;

    if (filtroCategoria !== 'todos') {
      temp = temp.filter(p => p.categoria === filtroCategoria);
    }

    if (filtroBusqueda !== '') {
      temp = temp.filter(p => p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()));
    }

    setProductosFiltrados(temp);
    setPaginaActual(1); // Volver a la página 1 si se aplica un filtro
  }, [filtroBusqueda, filtroCategoria, productosDB]);

  // --- 3. CÁLCULO DE PAGINACIÓN ---
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  // Obtenemos solo los productos de la página actual
  const productosVisibles = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);
  
  // Calculamos el total de páginas
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  // --- COMPONENTES JSX (Tu estructura actual) ---
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
        
        {/* COLUMNA FILTROS (Tu diseño responsivo) */}
        <Col md={3} className="mb-4 mb-md-0">
          <div className="d-md-none">
            <div className="mb-3">{buscadorJSX}</div>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Filtrar por Categoría</Accordion.Header>
                <Accordion.Body>{categoriasJSX}</Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          <div className="d-none d-md-block store-filters">
            {buscadorJSX}
            {categoriasJSX}
          </div>
        </Col>

        {/* COLUMNA PRODUCTOS */}
        <Col md={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* 4. MOSTRAMOS LOS PRODUCTOS "PAGINADOS" */}
              <Row xs={1} md={2} lg={3} className="g-4">
                {productosVisibles.map((producto) => (
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
              
              {/* Si no hay productos */}
              {productosVisibles.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <p>No se encontraron productos con esos filtros.</p>
                </div>
              )}

              {/* 5. BARRA DE PAGINACIÓN (Solo si hay más de 1 página) */}
              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <Pagination>
                    <Pagination.Prev 
                      onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                      disabled={paginaActual === 1}
                    />
                    
                    {/* Generamos los números de página dinámicamente */}
                    {[...Array(totalPaginas)].map((_, idx) => (
                      <Pagination.Item 
                        key={idx + 1} 
                        active={idx + 1 === paginaActual}
                        onClick={() => setPaginaActual(idx + 1)}
                      >
                        {idx + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next 
                      onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaActual === totalPaginas}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>

      </Row>
    </Container>
  );
}

export default Tienda;