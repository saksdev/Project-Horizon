import React, { memo } from "react";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const InputField = memo(
  React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ className = "", label, error, leftIcon, id, type = "text", ...props }, ref) => {
      return (
        <div className="w-full space-y-1.5">
          {label && (
            <label
              htmlFor={id}
              className="block text-xs font-bold text-brand-text uppercase tracking-wider select-none"
            >
              {label}
            </label>
          )}

          <div className="relative rounded-xl shadow-sm">
            {leftIcon && (
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {leftIcon}
              </div>
            )}
            
            <input
              ref={ref}
              id={id}
              type={type}
              className={`w-full text-sm rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${
                leftIcon ? "pl-10" : "px-3.5"
              } py-2.5 ${
                error
                  ? "border border-red-300 focus:ring-red-500/25 focus:border-red-500 bg-red-50/10"
                  : "border border-slate-200 focus:ring-blue-500/25 focus:border-blue-500 bg-white"
              } ${className}`}
              {...props}
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-semibold leading-none mt-1 animate-slide-in">
              {error}
            </p>
          )}
        </div>
      );
    }
  )
);

InputField.displayName = "InputField";
