import './Card.css';

function Card({ children, className = '', title, subtitle, icon: Icon, accent = false, onClick }) {
  return (
    <div
      className={`card ${accent ? 'card--accent' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {(title || Icon) && (
        <div className="card__header">
          {Icon && <Icon size={20} className="card__icon" />}
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
}

export default Card;
