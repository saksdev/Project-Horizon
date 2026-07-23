import React, { memo } from "react";

export interface WorkspaceCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const WorkspaceCard = memo(function WorkspaceCard({
  title,
  description,
  icon,
  headerAction,
  footer,
  className = "",
  children,
}: WorkspaceCardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
      <div>
        {(title || icon || headerAction) && (
          <div className="flex items-center justify-between mb-4 select-none">
            <div className="flex items-center gap-2 text-brand-header font-bold text-sm">
              {icon && <span className="shrink-0">{icon}</span>}
              {title && <span>{title}</span>}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}

        {children && <div className="space-y-3">{children}</div>}
      </div>

      {(footer || description) && (
        <div className="flex flex-col gap-2">
          {description && <p className="text-[10px] text-brand-text leading-normal">{description}</p>}
          {footer && <div className="pt-2 border-t border-slate-50">{footer}</div>}
        </div>
      )}
    </div>
  );
});

WorkspaceCard.displayName = "WorkspaceCard";
