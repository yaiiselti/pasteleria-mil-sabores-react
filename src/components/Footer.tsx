import { Container } from 'react-bootstrap';
import { IconoFacebook, IconoInstagram, IconoWhatsapp } from './Iconos';

function Footer() {
  return (
    <footer className="main-footer text-white py-4 mt-auto">
      <Container className="footer-layout d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="footer-copy mb-3 mb-md-0 text-center text-md-start">
          <p className="mb-0">&copy; 2025 Pastelería Mil Sabores. Todos los derechos reservados por yaii selti.</p>
        </div>
        <div className="footer-social d-flex gap-3">
          <a href="https://www.facebook.com" target="_blank" className="text-white"><IconoFacebook /></a>
          <a href="https://www.instagram.com" target="_blank" className="text-white"><IconoInstagram /></a>
          <a href="https://Whatsapp.com" target="_blank" className="text-white"><IconoWhatsapp/></a>
        </div>
      </Container>
    </footer>
  );
}
export default Footer;