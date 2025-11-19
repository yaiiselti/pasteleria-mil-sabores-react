import { useState } from 'react';
import { Container, Row, Col, Button, Image, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import ModalConfirmacion from '../components/ModalConfirmacion';
import type { IItemCarrito } from '../context/CarritoContext';

function Carrito() {
  
  // 1. Consumimos el "cerebro" del carrito
  const { 
    items, 
    eliminarDelCarrito, 
    actualizarCantidad, 
    totalItems, 
    totalPrecio 
  } = useCarrito();

  // 2. Estado para nuestro modal personalizado (Regla 5)
  const [modalShow, setModalShow] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState<IItemCarrito | null>(null);

  // 3. Funciones para manejar el modal
  const handleShowModal = (item: IItemCarrito) => {
    setItemParaEliminar(item);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setItemParaEliminar(null);
  };

  const handleConfirmarEliminar = () => {
    if (itemParaEliminar) {
      eliminarDelCarrito(itemParaEliminar.idUnico);
    }
    handleCloseModal();
  };

  // 4. Handler para cambiar la cantidad
  const handleActualizarCantidad = (idUnico: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaCantidad = parseInt(e.target.value);
    if (nuevaCantidad >= 0) {
      actualizarCantidad(idUnico, nuevaCantidad);
    }
  };


  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Mi carrito de compras</h2>

      {/* Si el carrito está vacío */}
      {items.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>Tu carrito está vacío</Alert.Heading>
          <p>No has añadido ningún producto todavía.</p>
          <hr />
          <Link to="/tienda" className="btn btn-primary btn-principal">
            Ir a la Tienda
          </Link>
        </Alert>
      ) : (
        
        // Si el carrito TIENE productos
        // Usamos la grilla de Bootstrap para el layout (Regla 2: Responsivo)
        <Row className="g-4">
          
          {/* Columna de Items (Izquierda) */}
          <Col md={12} lg={8}>
            <section className="d-flex flex-column gap-3">
              {items.map((item) => (
                // Reutilizamos el .product-card como base para el item
                <div key={item.idUnico} className="product-card p-3">
                  <Row className="align-items-center">
                    
                    {/* Imagen */}
                    <Col xs={3} md={2}>
                      <Image src={item.imagenes[0]} alt={item.nombre} fluid rounded />
                    </Col>

                    {/* Detalles */}
                    <Col xs={9} md={4}>
                      <h5 className="mb-1">{item.nombre}</h5>
                      <p className="text-muted small mb-1">
                        Mensaje: {item.mensaje || "Ninguno"}
                      </p>
                      <span className="fw-bold d-md-none">
                        ${item.precio.toLocaleString('es-CL')} c/u
                      </span>
                    </Col>

                    {/* Precio (solo en escritorio) */}
                    <Col md={2} className="d-none d-md-block text-center">
                      <span className="fw-bold">${item.precio.toLocaleString('es-CL')}</span>
                    </Col>

                    {/* Cantidad */}
                    <Col xs={8} md={2} className="mt-2 mt-md-0">
                      <Form.Control
                        type="number"
                        className="input-quantity"
                        value={item.cantidad}
                        min="0" // Permitimos 0 para eliminar
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActualizarCantidad(item.idUnico, e)}
                      />
                    </Col>
                    
                    {/* Botón Eliminar */}
                    <Col xs={4} md={2} className="mt-2 mt-md-0 text-end">
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="btn-admin-eliminar" // Reutilizamos el estilo rojo
                        onClick={() => handleShowModal(item)} // Abre el modal (Regla 5)
                      >
                        Eliminar
                      </Button>
                    </Col>

                  </Row>
                </div>
              ))}
            </section>
          </Col>

          {/* Columna de Resumen (Derecha) */}
          <Col md={12} lg={4}>
            {/* Reutilizamos el .cart-summary de la Parte 1 */}
            <aside className="cart-summary p-3">
              <h3 className="text-center">Resumen del Pedido</h3>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Subtotal ({totalItems} productos):</span>
                <span className="fw-bold">${totalPrecio.toLocaleString('es-CL')}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Envío:</span>
                <span className="fw-bold">Gratis</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-4 mb-3">
                <span className="logo-text">Total:</span>
                <span className="fw-bold">${totalPrecio.toLocaleString('es-CL')}</span>
              </div>
              
              <Link to="/checkout" className="btn btn-primary btn-principal w-100">
                Continuar al Pago
              </Link>
            </aside>
          </Col>
        </Row>
      )}

      {/* 5. NUESTRO MODAL PERSONALIZADO (Regla 5) */}
      <ModalConfirmacion
        show={modalShow}
        titulo="Confirmar Eliminación"
        onCancelar={handleCloseModal}
        onConfirmar={handleConfirmarEliminar}
      >
        <p>
          ¿Estás seguro de que quieres eliminar <strong>{itemParaEliminar?.nombre}</strong> del carrito?
        </p>
      </ModalConfirmacion>

    </Container>
  );
}

export default Carrito;