// Componente de Estrellas SVG (No requiere librerías externas)

interface StarProps {
  filled: boolean;
  onClick?: () => void;
}

// Dibujo de la estrella
const StarIcon = ({ filled, onClick }: StarProps) => (
  <svg
    onClick={onClick}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    // Relleno amarillo si está llena, transparente si no
    fill={filled ? "#ffc107" : "none"} 
    // Borde amarillo si está llena, gris si está vacía
    stroke={filled ? "#ffc107" : "#adb5bd"} 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: onClick ? 'pointer' : 'default', marginRight: 2 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface RatingProps {
  calificacion: number;
  onRate?: (rating: number) => void;
  max?: number;
}

export const StarRating = ({ calificacion, onRate, max = 5 }: RatingProps) => {
  return (
    <div className="d-inline-flex align-items-center">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        // Una estrella está llena si su valor es menor o igual a la calificación actual
        const isFilled = starValue <= calificacion;
        
        return (
          <StarIcon 
            key={index} 
            filled={isFilled} 
            onClick={onRate ? () => onRate(starValue) : undefined} 
          />
        );
      })}
      {/* Si es interactivo, mostramos el número al lado */}
      {onRate && <span className="ms-2 text-muted small">({calificacion}/5)</span>}
    </div>
  );
};