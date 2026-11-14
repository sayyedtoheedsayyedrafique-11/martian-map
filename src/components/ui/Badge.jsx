import './Badge.css';

function Badge({ children, color, variant = 'default' }) {
  const style = color ? { '--badge-color': color } : {};

  return (
    <span className={`badge badge--${variant}`} style={style}>
      {children}
    </span>
  );
}

export default Badge;
