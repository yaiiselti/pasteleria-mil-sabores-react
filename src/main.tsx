import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importamos Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
// Importamos el Provider del Carrito
import { CarritoProvider } from './context/CarritoContext.tsx';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 3. Envolvemos <App /> con el <CarritoProvider> */}
    <CarritoProvider>
      <App />
    </CarritoProvider>
  </StrictMode>,
)