import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

// 1. Definimos los tipos de notificación (incluyendo 'light' y 'warning')
type NotificationType = 'success' | 'danger' | 'warning' | 'info' | 'light';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('success');

  const showNotification = (msg: string, type: NotificationType = 'success') => {
    setMessage(msg);
    setType(type);
    setShow(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Contenedor visual fijo en la esquina superior derecha */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
        <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg={type}>
          <Toast.Header closeButton>
            <strong className="me-auto">
              {type === 'success' ? '¡Éxito!' : 
               type === 'danger' ? 'Error' : 
               type === 'warning' ? 'Atención' : 'Aviso'}
            </strong>
          </Toast.Header>
          
          {/* Texto oscuro para fondos claros, blanco para los demás */}
          <Toast.Body className={(type === 'light' || type === 'warning') ? 'text-dark' : 'text-white'}>
            {message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

    </NotificationContext.Provider>
  );
};

// Hook para usarlo en cualquier componente
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification debe usarse dentro de NotificationProvider');
  return context;
};