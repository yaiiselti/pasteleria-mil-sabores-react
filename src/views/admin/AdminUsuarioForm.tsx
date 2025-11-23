import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
// Asegúrate de que esta ruta sea correcta según tu estructura
import { getUsuarioByRun, saveUsuario } from '../../services/PasteleriaService';
import type { IUsuario } from '../../services/PasteleriaService';

function AdminUsuarioForm() {
  const { run } = useParams();
  const navigate = useNavigate();
  const esEdicion = !!run;

  const [formData, setFormData] = useState<IUsuario>({
    run: '',
    nombre: '',
    apellidos: '',
    email: '',
    tipo: 'Cliente',
    region: '',
    comuna: ''
  });

  useEffect(() => {
    if (esEdicion && run) {
      getUsuarioByRun(run).then(setFormData).catch(() => navigate('/admin/usuarios'));
    }
  }, [run, esEdicion, navigate]);

  // --- AQUÍ ESTÁ EL ARREGLO ---
  // Agregamos HTMLTextAreaElement para que <Form.Control> no se queje
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // -----------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUsuario(formData);
    navigate('/admin/usuarios');
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '800px' }}>
        <Card.Header className="bg-white py-3">
          <h4 className="mb-0 logo-text text-success">
            {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="run">
                  <Form.Label>Run</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="run" 
                    value={formData.run} 
                    onChange={handleChange} // ¡Ahora funcionará!
                    disabled={esEdicion}
                    required
                    placeholder="12345678-K"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="tipo">
                  <Form.Label>Tipo de Usuario</Form.Label>
                  <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="apellidos">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="email">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control 
                    type="text" // Tipo texto para que el admin la vea y edite fácil
                    name="password" 
                    value={formData.password || ''} 
                    onChange={handleChange} 
                    placeholder="Asignar nueva clave"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="region">
                  <Form.Label>Región</Form.Label>
                  <Form.Control type="text" name="region" value={formData.region} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="comuna">
                  <Form.Label>Comuna</Form.Label>
                  <Form.Control type="text" name="comuna" value={formData.comuna} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Link to="/admin/usuarios" className="btn btn-secondary">Cancelar</Link>
              <Button type="submit" variant="success">
                <i className="fa-solid fa-save me-2"></i> Guardar Usuario
              </Button>
            </div>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminUsuarioForm;