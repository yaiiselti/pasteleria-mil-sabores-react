

import { BrowserRouter, Routes, Route } from 'react-router-dom';


import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import Nosotros from './views/Nosotros'; 
import Blog from './views/BLog';
import BlogArticulo1 from './views/BlogArticulo1';
import BlogArticulo2 from './views/BlogArticulo2';
import Contacto from './views/Contacto';
import Login from './views/Login';
import Registro from './views/Registro';
import Tienda from './views/Tienda';
import Producto from './views/Producto';
function App() {

  return (
    <BrowserRouter>
      
      <Header />

      {/* Usamos <main> de HTML5 y 'py-5' (padding) de Bootstrap
        para dar espacio al contenido que cambia.
      */}
      <main className="py-5">
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/nosotros" element={ <Nosotros /> } />
          <Route path="/blog" element={ <Blog /> } />
          <Route path="/blog-articulo-1" element={ <BlogArticulo1 /> } />
          <Route path="/blog-articulo-2" element={ <BlogArticulo2 /> } />
          <Route path="/contacto" element={ <Contacto /> } />
          <Route path="/login" element={ <Login /> } />
          <Route path="/registro" element={ <Registro /> } />
          <Route path="/tienda" element={ <Tienda /> } />
          <Route path="/producto/:codigo" element={ <Producto /> } />
        </Routes>
      </main>

      <Footer /> 
      
    </BrowserRouter>
  )
}

export default App