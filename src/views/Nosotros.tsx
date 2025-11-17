import { Container } from 'react-bootstrap';

function Nosotros() {
  return (
    // Usamos <Container> de Bootstrap para el contenido
    <Container className="py-5">
      
      {/* ¡REUTILIZAMOS EL CSS!
        Usamos la clase .content-container que definiremos
        en 'src/index.css'. ¡Cero redundancia!
      */}
      <div className="content-container">
        
        <h2>Nuestra Historia</h2>
        <p>Pastelería Mil Sabores celebra su 50 aniversario como un referente en la repostería chilena. Desde nuestros humildes comienzos, nos hemos dedicado a crear experiencias dulces y memorables para todas las ocasiones.</p>
        <p>Un hito en nuestra historia fue nuestra famosa participación en un récord Guinness en 1995, cuando colaboramos en la creación de la torta más grande del mundo. Hoy, buscamos renovar esa tradición con un sistema de ventas online moderno y accesible para todos nuestros clientes.</p>
        
        <hr className="content-divider" />

        <h2>Nuestra Tienda</h2>
        <p>
          Estamos orgullosos de nuestros productos. Encuéntranos en el centro de Concepción.
        </p>
        <p>
          <strong>Dirección:</strong> O'Higgins, Concepción, Bío Bío<br />
          <strong>Teléfono:</strong> 4546 4000 000
        </p>

        <hr className="content-divider" />

        <h2>El Equipo de Desarrollo</h2>
        <p>Esta plataforma de e-commerce ha sido diseñada y desarrollada por su eminencia</p>
        
      </div>
    </Container>
  );
}

export default Nosotros;