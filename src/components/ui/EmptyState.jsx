import './EmptyState.css';

function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state fade-in">
      {Icon && <Icon size={48} className="empty-state__icon" />}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action && (
        <button className="empty-state__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
