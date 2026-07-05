// Confirm-before-destroy prompt. Rendered inline when open.
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div role="alertdialog" aria-label={title}>
      <h2>{title}</h2>
      <p>{description}</p>
      <button type="button" onClick={() => onOpenChange(false)}>
        Cancel
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirm();
          onOpenChange(false);
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

export default ConfirmDialog;
