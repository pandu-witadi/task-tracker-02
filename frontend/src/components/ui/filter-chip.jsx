import { X } from 'lucide-react';

export function FilterChip({ label, onRemove, className = '' }) {
  return (
    <div className={`inline-flex items-center bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm ${className}`}>
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
