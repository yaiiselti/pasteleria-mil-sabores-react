import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, ListGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// 1. Importamos las FUNCIONES (valores) que vamos a usar
import { getProductos, getCategorias } from '../services/PasteleriaService';
import type { IProducto } from '../services/PasteleriaService';
function Tienda() {
  
  // --- LÓGICA DE REACT (reemplaza nuestro main.js) ---
  
  // 2. Estados para manejar los datos, filtros y carga
  const [productosDB, setProductosDB] = useState<IProducto[]>([]); // "Base de datos" maestra
  const [categorias, setCategorias] = useState<string[]>([]); // Lista de categorías para el filtro
  const [productosFiltrados, setProductosFiltrados] = useState<IProducto[]>([]); // Productos que se muestran
  
  const [filtroBusqueda, setFiltroBusqueda] = useState(''); // El texto en la barra de búsqueda
  const [filtroCategoria, setFiltroCategoria] = useState('todos'); // La categoría seleccionada
  const [loading, setLoading] = useState(true); // Estado de carga

  // 3. Efecto para CARGAR DATOS (se ejecuta 1 vez al montar)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Llamamos a las funciones asíncronas del servicio
        const [productosData, categoriasData] = await Promise.all([
          getProductos(),
          getCategorias()
        ]);
        
        setProductosDB(productosData);
        setProductosFiltrados(productosData); // Al inicio, mostramos todos
        setCategorias(categoriasData);

      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []); // El array vacío [] asegura que solo se ejecute 1 vez

  // 4. Efecto para APLICAR FILTROS
  // (Se ejecuta CADA VEZ que los filtros o la DB cambian)
  useEffect(() => {
    
    let productosFiltradosTemp = productosDB;

    // A. Filtramos por Categoría
    if (filtroCategoria !== 'todos') {
      productosFiltradosTemp = productosFiltradosTemp.filter(
        producto => producto.categoria === filtroCategoria
      );
    }

    // B. Filtramos por Búsqueda (sobre la lista ya filtrada)
    if (filtroBusqueda !== '') {
      productosFiltradosTemp = productosFiltradosTemp.filter(
        producto => producto.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      );
    }

    // C. Actualizamos el estado, lo que "repinta" la lista
    setProductosFiltrados(productosFiltradosTemp);

  }, [filtroBusqueda, filtroCategoria, productosDB]); // Dependencias


  // --- VISTA (JSX) ---
  return (
    <Container className="py-5">
      {/* Mantenemos tu clase .logo-text del CSS original */}
      <h2 className="text-center logo-text mb-4">Todos Nuestros Productos</h2>

      <Row>
        
        {/* --- COLUMNA DE FILTROS (Izquierda) --- */}
        <Col md={3}>
          {/* Mantenemos tu clase .store-filters */}
          <div className="store-filters">
            {/* Filtro de Búsqueda */}
            <Form.Group className="mb-4">
              <Form.Label className="filter-title">Búsqueda</Form.Label>
              <Form.Control 
                type="search" 
                placeholder="Buscar producto..." 
                className="filter-search"
                onChange={ (e) => setFiltroBusqueda(e.target.value) }
              />
            </Form.Group>

            {/* Filtro de Categorías */}
            <Form.Group>
              <Form.Label className="filter-title">Categoría</Form.Label>
              {/* Usamos un Spinner de Bootstrap si está cargando */}
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
                  
                  {/* Mapeamos las categorías desde el ESTADO */}
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
          </div>
        </Col>

        {/* --- COLUMNA DE PRODUCTOS (Derecha) --- */}
        <Col md={9}>
          {loading ? (
            // Mostramos un spinner grande mientras cargan los productos
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {/* Mapeamos los productos del ESTADO 'productosFiltrados' */}
              {productosFiltrados.map((producto) => (
                <Col key={producto.codigo}>
                  {/* Mantenemos tus clases .product-card y .product-card-img */}
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
                      {/* Mantenemos tu clase .btn-secundario */}
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