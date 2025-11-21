import { useState } from 'react';
// Agregamos 'Modal' a las importaciones de Bootstrap
import { Container, Row, Col, Button, Image, Form, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import ModalConfirmacion from '../components/ModalConfirmacion';
import type { IItemCarrito } from '../context/CarritoContext';

function Carrito() {
  
  const { 
    items, 
    eliminarDelCarrito, 
    actualizarCantidad,
    actualizarMensaje, // <--- 1. IMPORTAMOS LA NUEVA FUNCIÓN
    totalItems, 
    totalPrecio 
  } = useCarrito();

  // Estados para el modal de eliminar (Tus estados originales)
  const [modalShow, setModalShow] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState<IItemCarrito | null>(null);

  // 2. NUEVOS ESTADOS PARA EDITAR MENSAJE
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemAEditar, setItemAEditar] = useState<IItemCarrito | null>(null);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState('');

  // --- 1. FUNCIÓN DE FORMATEO (LA SOLUCIÓN) ---
  // Esta función se asegura de que SIEMPRE salga el signo $ y los puntos
  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  };

  // --- Manejadores Eliminar (Tus originales) ---
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

  // --- 3. NUEVOS MANEJADORES PARA EDITAR ---
  const abrirModalEditar = (item: IItemCarrito) => {
    setItemAEditar(item);
    setNuevoMensajeTexto(item.mensaje); // Cargamos el mensaje actual
    setShowEditModal(true);
  };

  const guardarMensaje = () => {
    if (itemAEditar) {
      actualizarMensaje(itemAEditar.idUnico, nuevoMensajeTexto);
    }
    setShowEditModal(false);
    setItemAEditar(null);
  };

  // Manejador cantidad (Tu original)
  const handleActualizarCantidad = (idUnico: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaCantidad = parseInt(e.target.value);
    if (nuevaCantidad >= 0) {
      actualizarCantidad(idUnico, nuevaCantidad);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Mi carrito de compras</h2>

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
        
        <Row className="g-4">
          
          <Col md={12} lg={8}>
            <section className="d-flex flex-column gap-3">
              {items.map((item) => (
                <div key={item.idUnico} className="product-card p-3">
                  <Row className="align-items-center">
                    
                    <Col xs={3} md={2}>
                      <Image src={item.imagenes[0]} alt={item.nombre} fluid rounded />
                    </Col>

                    <Col xs={9} md={4}>
                      <h5 className="mb-1">{item.nombre}</h5>
                    
                      {/* --- MEJORA VISUAL (USANDO CSS) --- */}
                      <div className="d-flex align-items-center mt-1">
                        
                        {/* 1. APLICAMOS LA CLASE CSS AQUÍ */}
                        <div 
                          className="text-muted small me-2 text-truncate carrito-mensaje-preview" 
                          title={item.mensaje || "Sin mensaje personalizado"}
                        >
                          {item.mensaje ? (
                            <span>Mensaje: <strong>"{item.mensaje}"</strong></span>
                          ) : (
                            <span className="fst-italic">Sin mensaje personalizado</span>
                          )}
                        </div>
                        
                        <Button 
                          variant="light"
                          size="sm" 
                          className="border-0 px-2 py-0 text-primary"
                          onClick={() => abrirModalEditar(item)}
                          title="Editar mensaje"
                          style={{ fontSize: '0.8rem' }}
                        >
                          <i className="fa-solid fa-pen me-1"></i> Editar
                        </Button>
                      </div>
                      {/* ----------------------------- */}

                      <span className="fw-bold d-md-none mt-2 d-block text-secondary">
                        {formatoMoneda(item.precio)} c/u
                      </span>
                    </Col>

                    {/* 3. USAMOS LA FUNCIÓN AQUÍ (Versión Escritorio) */}
                    <Col md={2} className="d-none d-md-block text-center">
                      <span className="fw-bold text-muted">
                        {formatoMoneda(item.precio)}
                      </span>
                    </Col>

                    <Col xs={8} md={2} className="mt-2 mt-md-0">
                      <Form.Control
                        type="number"
                        className="input-quantity"
                        value={item.cantidad}
                        min="0" 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActualizarCantidad(item.idUnico, e)}
                      />
                    </Col>
                    
                    <Col xs={4} md={2} className="mt-2 mt-md-0 text-end">
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="btn-admin-eliminar" 
                        onClick={() => handleShowModal(item)} 
                      >
                        Eliminar
                      </Button>
                    </Col>

                  </Row>
                </div>
              ))}
            </section>
          </Col>

          <Col md={12} lg={4}>
            <aside className="cart-summary p-3">
              <h3 className="text-center">Resumen del Pedido</h3>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Subtotal ({totalItems} productos):</span>
                <span className="fw-bold">{formatoMoneda(totalPrecio)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Envío:</span>
                <span className="fw-bold">Gratis</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-4 mb-3">
                <span className="logo-text">Total:</span>
                <span className="fw-bold">{formatoMoneda(totalPrecio)}</span>
              </div>
              
              <Link to="/checkout" className="btn btn-primary btn-principal w-100">
                Continuar al Pago
              </Link>
            </aside>
          </Col>
        </Row>
      )}

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

      {/* 5. NUEVO MODAL DE EDICIÓN (Minimalista) */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold text-primary">Editar Mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* ... dentro del Modal.Body ... */}
          <Form.Group>
            <Form.Label>Personaliza tu pedido:</Form.Label>
            <Form.Control 
              type="text" 
              value={nuevoMensajeTexto} 
              // 2. LÍMITE ESTRICTO TAMBIÉN AQUÍ
              maxLength={50}
              onChange={(e) => setNuevoMensajeTexto(e.target.value)}
              placeholder="Ej: Feliz Cumpleaños Mamá"
              autoFocus
            />
             <Form.Text className="text-muted">
               {nuevoMensajeTexto.length}/50 caracteres
             </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={guardarMensaje} className="btn-principal">
              Guardar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default Carrito;