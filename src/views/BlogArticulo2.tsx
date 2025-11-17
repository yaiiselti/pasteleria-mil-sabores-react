import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function BlogArticulo2() {
  return (
    <Container className="py-5">
      <div className="content-container">
        
        <h2>Caso Curioso #2</h2>
        
        <img 
          src="/assets/img/estudiantes-pastel-vegano.webp" 
          alt="Caso curioso 2" 
          className="img-fluid rounded mb-3"
        />

        <p>La innovación es uno de nuestros pilares. Por eso, nos hemos asociado con talentosos estudiantes de gastronomía de Duoc UC para explorar un nuevo y delicioso territorio: la repostería vegana.</p>
        <p>El desafío era claro: ¿Cómo crear tortas y pasteles sin huevo, leche ni mantequilla que mantengan el sabor y la textura que nuestros clientes han amado por 50 años? El resultado ha sido sorprendente.</p>
        <p>Usando ingredientes como aquafaba, leches vegetales y aceites de alta calidad, el equipo ha desarrollado una línea de productos veganos, como nuestra nueva "Torta Vegana de Chocolate", que es indistinguible de la original. Estamos orgullosos de apoyar a los nuevos talentos y de ofrecer opciones deliciosas para todos.</p>
        
        <hr className="content-divider" />

        <Link to="/blog" className="btn btn-outline-primary btn-secundario">
          Volver al Blog
        </Link>
        
      </div>
    </Container>
  );
}

export default BlogArticulo2;