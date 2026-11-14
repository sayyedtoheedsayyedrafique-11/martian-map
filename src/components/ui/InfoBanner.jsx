import { AlertTriangle, Info } from 'lucide-react';
import './InfoBanner.css';

function InfoBanner({ type = 'info', children }) {
  const Icon = type === 'warning' ? AlertTriangle : Info;

  return (
    <div className={`info-banner info-banner--${type}`}>
      <Icon size={16} className="info-banner__icon" />
      <p className="info-banner__text">{children}</p>
    </div>
  );
}

export default InfoBanner;
