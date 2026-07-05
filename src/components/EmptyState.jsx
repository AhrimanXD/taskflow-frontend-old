function EmptyState({ title, description, action }) {
  return (
    <div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
