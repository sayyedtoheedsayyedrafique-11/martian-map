import Button from './Button';
import './EmptyState.css';

function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state fade-in">
      {Icon && <Icon size={48} className="empty-state__icon" />}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action && (
        <div className="empty-state__action-wrap">
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
