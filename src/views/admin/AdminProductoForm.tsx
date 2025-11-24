import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductoByCodigo, saveProducto, getProductos } from '../../services/PasteleriaService';
import type { IProducto } from '../../services/PasteleriaService';

function AdminProductoForm() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const esEdicion = !!codigo;

  const [formData, setFormData] = useState<IProducto>({
    codigo: '',
    nombre: '',
    categoria: '',
    precio: 0,
    descripcion: '',
    imagenes: ['', '', '', ''] 
  });

  // Ruta base constante
  const RUTA_BASE = '/assets/img/productos/';

  useEffect(() => {
    if (esEdicion && codigo) {
      getProductoByCodigo(codigo)
        .then(prod => {
          const imgs = [...prod.imagenes];
          while (imgs.length < 4) imgs.push('');
          setFormData({ ...prod, imagenes: imgs });
        })
        .catch(() => navigate('/admin/productos'));
    }
  }, [codigo, esEdicion, navigate]);

  const generarCodigoSiguiente = async (categoria: string) => {
    const prefijo = obtenerPrefijo(categoria);
    const todos = await getProductos();
    const codigosExistentes = todos
      .filter(p => p.codigo.startsWith(prefijo))
      .map(p => parseInt(p.codigo.replace(prefijo, ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    let siguienteNum = 1;
    if (codigosExistentes.length > 0) {
      siguienteNum = codigosExistentes[codigosExistentes.length - 1] + 1;
    }
    return `${prefijo}${siguienteNum.toString().padStart(3, '0')}`;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!esEdicion && name === 'categoria') {
      const nuevoCodigo = await generarCodigoSiguiente(value);
      setFormData(prev => ({ ...prev, [name]: value, codigo: nuevoCodigo }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'precio' ? parseInt(value) : value }));
    }
  };

  // --- MANEJO INTELIGENTE DE IMÁGENES ---
  
  // 1. Al escribir: Tomamos el nombre y le pegamos la ruta antes de guardar en estado
  const handleImagenNameChange = (index: number, nombreArchivo: string) => {
    const nuevasImagenes = [...formData.imagenes];
    // Si el usuario borra todo, dejamos vacío. Si escribe, agregamos la ruta.
    nuevasImagenes[index] = nombreArchivo.trim() ? `${RUTA_BASE}${nombreArchivo}` : '';
    setFormData(prev => ({ ...prev, imagenes: nuevasImagenes }));
  };

  // 2. Al leer: Le quitamos la ruta para mostrar solo el nombre en el input
  const getNombreArchivo = (urlCompleta: string) => {
    return urlCompleta.replace(RUTA_BASE, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!esEdicion) {
      const todos = await getProductos();
      if (todos.some(p => p.codigo === formData.codigo)) {
        alert('El código ya existe. Recalculando...');
        const nuevoCodigo = await generarCodigoSiguiente(formData.categoria);
        setFormData(prev => ({...prev, codigo: nuevoCodigo}));
        return;
      }
    }
    const productoAGuardar = {
      ...formData,
      imagenes: formData.imagenes.filter(img => img.trim() !== '')
    };
    await saveProducto(productoAGuardar);
    navigate('/admin/productos');
  };

  const obtenerPrefijo = (categoria: string) => {
    switch (categoria) {
      case 'Tortas Cuadradas': return 'TC';
      case 'Tortas Circulares': return 'TT'; 
      case 'Postres Individuales': return 'PI';
      case 'Productos Sin Azúcar': return 'PSA';
      case 'Pastelería Tradicional': return 'PT';
      case 'Productos Sin Gluten': return 'PG';
      case 'Productos Vegana': return 'PV';
      case 'Tortas Especiales': return 'TE';
      default: return 'PROD';
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '900px' }}>
        <Card.Header className="bg-white py-3">
          <h4 className="mb-0 logo-text text-primary">
            {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="categoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select 
                    name="categoria" 
                    value={formData.categoria} 
                    onChange={handleChange} 
                    required
                    disabled={esEdicion} 
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Tortas Cuadradas">Tortas Cuadradas</option>
                    <option value="Tortas Circulares">Tortas Circulares</option>
                    <option value="Postres Individuales">Postres Individuales</option>
                    <option value="Productos Sin Azúcar">Productos Sin Azúcar</option>
                    <option value="Pastelería Tradicional">Pastelería Tradicional</option>
                    <option value="Productos Sin Gluten">Productos Sin Gluten</option>
                    <option value="Productos Vegana">Productos Vegana</option>
                    <option value="Tortas Especiales">Tortas Especiales</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="codigo">
                  <Form.Label>Código (Automático)</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="codigo" 
                    value={formData.codigo} 
                    readOnly 
                    className="bg-light fw-bold text-primary"
                  />
                </Form.Group>
              </Col>
              
              <Col md={8}>
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="precio">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control type="number" name="precio" value={formData.precio} onChange={handleChange} min="0" required />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="descripcion">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} />
                </Form.Group>
              </Col>

              {/* --- SECCIÓN DE IMÁGENES (NUEVA VERSIÓN) --- */}
              <Col md={12}>
                <h5 className="mt-3 mb-3 text-muted small text-uppercase fw-bold">Galería de Imágenes</h5>
                <p className="small text-muted mb-3">
                  Ingresa solo el nombre del archivo. La ruta <strong>{RUTA_BASE}</strong> se agrega automáticamente.
                </p>
                <Row className="g-3">
                  {[0, 1, 2, 3].map((index) => (
                    <Col md={6} key={index}>
                      <Form.Group>
                         <Form.Label className="small text-muted">Imagen {index + 1}</Form.Label>
                         
                         {/* INPUT GROUP: Muestra la ruta fija y deja escribir el nombre */}
                         <InputGroup>
                           <InputGroup.Text className="bg-light text-muted small">
                             .../productos/
                           </InputGroup.Text>
                           <Form.Control 
                             type="text"
                             placeholder="ej: torta-chocolate.png"
                             // Mostramos SOLO el nombre del archivo
                             value={getNombreArchivo(formData.imagenes[index])}
                             // Al cambiar, reconstruimos la ruta completa
                             onChange={(e) => handleImagenNameChange(index, e.target.value)}
                           />
                         </InputGroup>

                         {/* PREVIEW */}
                         {formData.imagenes[index] && (
                           <div className="mt-2 p-2 border rounded bg-light text-center">
                             <img 
                               src={formData.imagenes[index]} 
                               alt="Preview" 
                               style={{ height: '80px', borderRadius: '4px', objectFit: 'contain' }} 
                               onError={(e) => e.currentTarget.style.display = 'none'} 
                             />
                           </div>
                         )}
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Col>

            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
              <Link to="/admin/productos" className="btn btn-secondary">Cancelar</Link>
              <Button type="submit" variant="success">
                <i className="fa-solid fa-save me-2"></i> Guardar Producto
              </Button>
            </div>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminProductoForm;