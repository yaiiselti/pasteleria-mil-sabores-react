import { useState } from 'react';
import { Container, Row, Col, Button, Image, Form, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
// 1. Importamos Auth para saber si es invitado
import { useAuth } from '../context/AuthContext';
import ModalConfirmacion from '../components/ModalConfirmacion';
import type { IItemCarrito } from '../context/CarritoContext';

function Carrito() {
  const MAX_CANTIDAD = 20; // Mismo límite
  
  // 2. Consumimos AuthContext
  const { isAuthenticated } = useAuth();

  const { 
    items, 
    eliminarDelCarrito, 
    actualizarCantidad,
    actualizarMensaje,
    totalItems, 
    totalPrecio 
  } = useCarrito();

  // Estados Modales
  const [modalShow, setModalShow] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState<IItemCarrito | null>(null);
  
  // Estados Edición Mensaje
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemAEditar, setItemAEditar] = useState<IItemCarrito | null>(null);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState('');

  // --- FUNCIÓN DE FORMATEO DE MONEDA ---
  const formatoMoneda = (valor: number | string) => {
    const numero = Number(valor);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(numero);
  };

  // --- MANEJADORES ELIMINAR ---
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

  // --- MANEJADORES EDITAR ---
  const abrirModalEditar = (item: IItemCarrito) => {
    setItemAEditar(item);
    setNuevoMensajeTexto(item.mensaje);
    setShowEditModal(true);
  };

  const guardarMensaje = () => {
    if (itemAEditar) {
      actualizarMensaje(itemAEditar.idUnico, nuevoMensajeTexto);
    }
    setShowEditModal(false);
    setItemAEditar(null);
  };

  const handleActualizarCantidad = (idUnico: number, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);

    // Protección contra valores no numéricos
    if (isNaN(val)) return; 

    // Lógica de Límite
    if (val < 1) val = 1; // Nunca permitimos 0 escribiendo
    if (val > MAX_CANTIDAD) {
        val = MAX_CANTIDAD;
        // Opcional: Podrías mostrar una notificación aquí, pero puede ser molesto en el carrito
    }

    actualizarCantidad(idUnico, val);
  };
  

  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Mi carrito de compras</h2>

      {/* 3. AVISO DE INVITADO */}
      {!isAuthenticated && items.length > 0 && (
        <Alert variant="warning" className="mb-4 border-warning shadow-sm">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-triangle-exclamation fa-2x me-3 text-warning"></i>
            <div>
              <strong>Estás comprando como invitado.</strong>
              <p className="mb-0 small">
                Tu carrito es temporal. <Link to="/login" className="alert-link">Inicia Sesión</Link> para guardarlo permanentemente.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {items.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4 display-1 text-muted"><i className="fa-solid fa-cart-shopping"></i></div>
          <h3>Tu carrito está vacío</h3>
          <p className="text-muted">Agrega algunas dulzuras</p>
          <Link to="/tienda" className="btn btn-primary btn-principal btn-lg mt-3">
            Ir a la Tienda
          </Link>
        </div>
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
                      
                      <div className="d-flex align-items-center mt-1">
                        {/* 4. VISUALIZACIÓN PROTEGIDA (Truncate) */}
                        <div 
                          className="text-muted small me-2 text-truncate carrito-mensaje-preview" 
                          title={item.mensaje || "Sin mensaje personalizado"}
                          style={{ maxWidth: '200px', cursor: 'help' }}
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

                      <span className="fw-bold d-md-none mt-2 d-block text-secondary">
                        {formatoMoneda(item.precio)} c/u
                      </span>
                    </Col>

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
                        min="1"
                        max={MAX_CANTIDAD}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActualizarCantidad(item.idUnico, e)}
                        onKeyDown={(e) => {
                            // Bloqueamos caracteres inválidos en el teclado
                            if (["-", "+", "e", "."].includes(e.key)) e.preventDefault();
                        }}
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
              
              {/* 5. RESUMEN DETALLADO (Lista de productos) */}
              <div className="mb-3">
                <h6 className="text-uppercase text-muted small fw-bold mb-2">Detalle:</h6>
                <ul className="list-unstyled small text-secondary mb-0">
                  {items.map((item) => (
                    <li key={item.idUnico} className="d-flex justify-content-between mb-1">
                      <span className="text-truncate" style={{ maxWidth: '180px' }}>
                        {item.cantidad}x {item.nombre}
                      </span>
                      <span className="text-muted">{formatoMoneda(item.precio * item.cantidad)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Subtotal ({totalItems} productos):</span>
                <span className="fw-bold">{formatoMoneda(totalPrecio)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fs-4 mb-3">
                <span className="logo-text">Total:</span>
                <span className="fw-bold text-primary">{formatoMoneda(totalPrecio)}</span>
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
        <p>¿Estás seguro de que quieres eliminar <strong>{itemParaEliminar?.nombre}</strong> del carrito?</p>
      </ModalConfirmacion>

      {/* 6. MODAL DE EDICIÓN CON LÍMITE */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="logo-text text-primary">Editar Mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Personaliza tu pedido:</Form.Label>
            <Form.Control 
              type="text" 
              value={nuevoMensajeTexto}
              onChange={(e) => setNuevoMensajeTexto(e.target.value)}
              placeholder="Ej: Feliz Cumpleaños Mamá"
              maxLength={50}
              autoFocus
            />
            <Form.Text className="text-muted text-end d-block">
                {nuevoMensajeTexto.length}/50 caracteres
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} className="btn-secundario">
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarMensaje} className="btn-principal">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default Carrito;