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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div role="alertdialog" aria-label={title} className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-muted text-foreground font-medium py-2 px-4 rounded hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 bg-error text-white font-medium py-2 px-4 rounded hover:opacity-90 transition-opacity"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
