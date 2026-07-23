import { useEffect, memo } from "react";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import { type ToastMessage } from "../../context/WorkspaceContext";

interface ToastCardProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

/**
 * Modern Compact Toast alert card notification (FE-13.3).
 * Sleek, single-line, lightweight layout matching company standards.
 */
export const ToastCard = memo(function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const { id, message, type } = toast;

  useEffect(() => {
    console.log(`[Toast System]: Broadcasted alert - ID: ${id}, Mode: ${type}, Content: "${message}"`);
    
    // Auto-dismiss this toast after 4 seconds
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 4000);

    // Clean up timer handle on component unmount (manual close or page shifts) to avoid memory leaks
    return () => {
      clearTimeout(timer);
    };
  }, [id, message, type, onDismiss]);

  return (
    <div
      className={`
        flex items-start justify-between gap-2.5 py-2 px-3 rounded-lg border w-72 sm:w-80
        backdrop-blur-md shadow-md transition-all duration-300 transform translate-y-0 animate-slide-in pointer-events-auto
        ${type === "success"
          ? "bg-slate-900/90 border-emerald-500/20 text-emerald-450"
          : type === "warning"
            ? "bg-slate-900/90 border-amber-500/20 text-amber-450"
            : "bg-slate-900/90 border-rose-500/20 text-rose-450"
        }
      `}
      role="alert"
    >
      <div className="flex items-start gap-2 min-w-0 flex-1">
        <div className="shrink-0 pt-0.5">
          {type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {type === "error" && <XCircle className="w-4 h-4 text-rose-450" />}
        </div>
        <p className="text-xs font-semibold text-slate-100 flex-1 font-sans leading-relaxed">
          {message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors active:scale-95 cursor-pointer pt-0.5"
        aria-label="Close Notification"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});
