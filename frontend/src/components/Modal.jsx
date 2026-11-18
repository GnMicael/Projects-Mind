import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-line bg-surface p-5 sm:rounded-lg">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-muted hover:text-ink"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}
