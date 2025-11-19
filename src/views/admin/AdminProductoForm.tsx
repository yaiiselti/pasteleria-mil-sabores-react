import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductoByCodigo, saveProducto } from '../../services/PasteleriaService';
import type { IProducto } from '../../services/PasteleriaService';

function AdminProductoForm() {
  const { codigo } = useParams(); // Si existe, es "Editar"
  const navigate = useNavigate();
  const esEdicion = !!codigo;

  const [formData, setFormData] = useState<IProducto>({
    codigo: '',
    nombre: '',
    categoria: '',
    precio: 0,
    descripcion: '',
    imagenes: [''] // Empezamos con un campo para 1 imagen
  });

  useEffect(() => {
    if (esEdicion) {
      // Cargar datos si estamos editando
      getProductoByCodigo(codigo).then(setFormData).catch(() => navigate('/admin/productos'));
    }
  }, [codigo, esEdicion, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'precio' ? parseInt(value) : value }));
  };

  // Manejador especial para la imagen (simplificado para 1 URL por ahora)
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, imagenes: [e.target.value] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProducto(formData); // Guarda en localStorage
    navigate('/admin/productos'); // Vuelve a la lista
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '800px' }}>
        <Card.Header className="bg-white py-3">
          <h4 className="mb-0 logo-text text-primary">
            {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="codigo">
                  <Form.Label>Código</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="codigo" 
                    value={formData.codigo} 
                    onChange={handleChange}
                    disabled={esEdicion} // No se puede cambiar el ID al editar
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={8}>
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="categoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select 
                    name="categoria" 
                    value={formData.categoria} 
                    onChange={handleChange} 
                    required
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
                <Form.Group controlId="precio">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="precio" 
                    value={formData.precio} 
                    onChange={handleChange} 
                    min="0"
                    required 
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="imagen">
                  <Form.Label>URL de Imagen</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="/assets/img/..."
                    value={formData.imagenes[0]} 
                    onChange={handleImagenChange} 
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="descripcion">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="descripcion" 
                    value={formData.descripcion} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
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