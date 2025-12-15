
import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Image, Form, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../context/AuthContext';
import ModalConfirmacion from '../components/ModalConfirmacion';
import type { IItemCarrito } from '../context/CarritoContext';
import { useNotification } from '../context/NotificationContext';
import { getProductos } from '../services/PasteleriaService';

// --- COMPONENTE AUXILIAR FINAL (Con Alertas Inteligentes) ---
const InputCantidadCarrito = ({ item, max, onUpdate }: { item: any, max: number, onUpdate: (id: number, val: any) => void }) => {
  const [valorLocal, setValorLocal] = useState<string | number>(item.cantidad);
  
  // Usamos el hook para poder lanzar las alertas desde aquí
  const { showNotification } = useNotification(); 

  useEffect(() => {
    // Sincronización obediente
    if (item.cantidad !== Number(valorLocal)) {
       if (valorLocal === '') return;
       if (valorLocal === 0 || valorLocal === '0') return;
       setValorLocal(item.cantidad);
    }
  }, [item.cantidad]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (val === '') {
      setValorLocal('');
      return; 
    }

    const numero = parseInt(val);
    if (isNaN(numero)) return;

    // --- AQUÍ ESTÁN LOS DOS ANUNCIOS ---

    // CASO 1: Intenta superar 1000 en UN solo producto
    if (numero > 1000) {
        showNotification("Límite individual: Máximo 1000 unidades por producto ye en total.", "warning");
        return; // Bloqueamos la tecla
    }

    // CASO 2: El número es válido (ej: 200), pero choca con el espacio disponible del carrito
    // (Ej: Tienes 900 de otro, te quedan 100 de espacio, e intentas poner 200)
    if (numero > max) {
        showNotification(`Límite total alcanzado. Solo tenes espacio para ${max} unidades más.`, "warning");
        return; // Bloqueamos la tecla
    }

    // Si pasa ambas aduanas, actualizamos
    setValorLocal(numero);
    onUpdate(item.idUnico, { target: { value: numero.toString() } });
  };

  const handleBlur = () => {
    setValorLocal(item.cantidad);
    if (item.cantidad !== Number(valorLocal)) {
        onUpdate(item.idUnico, { target: { value: item.cantidad.toString() } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    if (["-", "+", "e", "."].includes(e.key)) e.preventDefault();
  };

  return (
    <Form.Control
      type="number"
      className="input-quantity text-center"
      value={valorLocal}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      min="0"
    />
  );
};




function Carrito() {
  // MODIFICADO: Límite Técnico Nivel 3
  const MAX_CANTIDAD = 1000;

  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const {
    items,
    eliminarDelCarrito,
    actualizarCantidad,
    actualizarMensaje,
    totalItems,
    totalPrecio
  } = useCarrito();

  const [modalShow, setModalShow] = useState(false);
  const [itemParaEliminar, setItemParaEliminar] = useState<IItemCarrito | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [itemAEditar, setItemAEditar] = useState<IItemCarrito | null>(null);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState('');


  useEffect(() => {
  const validarExistencia = async () => {
    // 1. Evitamos correr si el carrito está vacío
    if (items.length === 0) return;

    try {
      // 2. Pedimos la lista fresca de productos a la base de datos (Backend)
      const productosReales = await getProductos();
      
      const nombresProductosEliminados: string[] = [];

      // 3. Revisamos cada item que tiene el usuario en su carrito local
      items.forEach(itemLocal => {
        // Buscamos si existe en la BD y si está ACTIVO
        const existeYActivo = productosReales.find(
          p => p.codigo === itemLocal.codigo && p.activo === true
        );
        
        if (!existeYActivo) {
          // 4. Si el producto ya no existe, lo borramos y guardamos el nombre para el aviso
          eliminarDelCarrito(itemLocal.idUnico);
          nombresProductosEliminados.push(itemLocal.nombre);
        }
      });

      // 5. Si borramos algo, le avisamos al usuario
      if (nombresProductosEliminados.length > 0) {
        showNotification(
          `Atención: ${nombresProductosEliminados.join(", ")} ya no está disponible y fue removido de tu carrito.`, 
          'warning'
        );
      }

    } catch (error) {
      console.error("Error al validar el stock en Carrito.tsx:", error);
      showNotification("Error de conexión al validar productos. Intenta nuevamente.", 'danger');
    }
  };
  validarExistencia();}, [items.length]);

  const formatoMoneda = (valor: number | string) => {
    const numero = Number(valor);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(numero);
  };

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

  // ESTA ES LA FUNCIÓN QUE FALTABA
  const handleCancelarEliminacion = () => {
    // Si hay un item seleccionado (el que estaba en 0), lo forzamos a 1
    if (itemParaEliminar) {
      actualizarCantidad(itemParaEliminar.idUnico, 1);
    }
    // Usamos TU función existente para cerrar el modal y limpiar el estado
    handleCloseModal();
  };

  const handleActualizarCantidad = (idUnico: number, e: any) => {
    const val = parseInt(e.target.value);
    if (isNaN(val)) return;

    // Si recibimos un 0 del hijo:
    if (val === 0) {
      const item = items.find(i => i.idUnico === idUnico);
      if (item) {
        handleShowModal(item); // Abrimos modal
      }
      // IMPORTANTE: NO llamamos a actualizarCantidad(0) en el context
      // Dejamos que el modal decida si borra o restaura a 1
      return;
    }

    // 2. LÓGICA MAYORISTA -> Aviso y Tope
    if (val > MAX_CANTIDAD) {
      showNotification(`El límite es de ${MAX_CANTIDAD} unidades.`, 'warning');
      actualizarCantidad(idUnico, MAX_CANTIDAD);
      return;
    }

    // 3. ACTUALIZACIÓN NORMAL
    actualizarCantidad(idUnico, val);
  };

 

  // Detectar Nivel 2 (Mayorista) para Alerta Global
  const hayItemsMayoristas = items.reduce((acc, item) => acc + item.cantidad, 0) > 50;


  

  return (
    <Container className="py-5">
      <h2 className="text-center logo-text mb-4">Mi carrito de compras</h2>

      {/* Alerta de Invitado (Existente) */}
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

      {/* Alerta Nivel 2 (Mayorista) */}
      {hayItemsMayoristas && items.length > 0 && (
        <Alert variant="info" className="mb-4 shadow-sm border-info">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-boxes-stacked fa-2x me-3 text-info"></i>
            <div>
              <strong>Pedido Voluminoso Detectado</strong>
              <p className="mb-0 small">
                Tu pedido supera las 50 unidades. Quedará en estado <strong>"Por Confirmar Stock"</strong> para revisión prioritaria.
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
                      {(() => {
                        // Cantidad que ocupan los OTROS productos
                        const otrosItems = items.reduce((acc, i) => i.idUnico !== item.idUnico ? acc + i.cantidad : acc, 0);
                        // Lo máximo que puede tener este item para que el total sea 1000
                        const maximoDisponible = 1000 - otrosItems;

                        return (
                          <InputCantidadCarrito 
                            item={item} 
                            max={maximoDisponible} // <--- Pasamos el límite inteligente
                            onUpdate={handleActualizarCantidad}
                          />
                          
                        );
                      })()}
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
              {/* ... Resumen del pedido se mantiene INTACTO ... */}
              <h3 className="text-center">Resumen del Pedido</h3>
              <hr />

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

      {/* ... Modales se mantienen INTACTOS ... */}
      <ModalConfirmacion
        show={modalShow}
        titulo="Confirmar Eliminación"
        onCancelar={handleCancelarEliminacion} // <--- AQUÍ USAMOS LA NUEVA
        onConfirmar={handleConfirmarEliminar}
      >
        <p>¿Estás seguro de que quieres eliminar <strong>{itemParaEliminar?.nombre}</strong> del carrito?</p>
      </ModalConfirmacion>

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