import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function BlogArticulo1() {
  return (
    <Container className="py-5">
      {/* Reutilizamos el .content-container que ya está en index.css */}
      <div className="content-container">
        
        <h2>Caso Curioso #1</h2>
        
        {/* Usamos 'img-fluid' de Bootstrap para que la imagen sea responsiva */}
        <img 
          src="/assets/img/record-guinness.png" 
          alt="Caso curioso 1" 
          className="img-fluid rounded mb-3" 
        />

        <p>En 1995, la repostería chilena vivió un hito inolvidable, y Pastelería Mil Sabores estuvo en el centro de la acción. Nos unimos a un consorcio de las pastelerías más importantes del país para batir el récord Guinness de la torta más grande del mundo.</p>
        <p>El desafío fue monumental: una estructura de varias toneladas que requirió meses de planificación. Nuestro aporte fue una sección completa de tres pisos de nuestro clásico bizcocho de vainilla y manjar, decorada a mano por nuestros maestros pasteleros.</p>
        <p>Este evento no solo puso a Chile en el mapa mundial de la repostería, sino que forjó lazos de camaradería y nos enseñó que no hay límite para la creatividad cuando se trabaja en equipo. Esa misma pasión por la innovación y la calidad es la que traemos hoy a nuestra tienda online.</p>
        
        <hr className="content-divider" />

        {/* Reutilizamos las clases de botón que ya están en index.css */}
        <Link to="/blog" className="btn btn-outline-primary btn-secundario">
          Volver al Blog
        </Link>
        
      </div>
    </Container>
  );
}

export default BlogArticulo1;