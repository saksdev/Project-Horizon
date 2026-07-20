import React, { memo } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className = "",
        variant = "primary",
        isLoading = false,
        leftIcon,
        rightIcon,
        disabled,
        children,
        type = "button",
        ...props
      },
      ref
    ) => {
      const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed select-none active:scale-95";

      const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:shadow-blue-500/10 shadow-blue-500/5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:scale-100",
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 disabled:bg-slate-50 disabled:text-slate-300 disabled:scale-100",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:shadow-red-500/10 shadow-red-500/5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:scale-100",
        outline: "border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-300 disabled:scale-100",
        ghost: "hover:bg-slate-50 text-slate-600 hover:text-slate-800 disabled:bg-transparent disabled:text-slate-300 disabled:scale-100",
      };

      const isBtnDisabled = disabled || isLoading;

      return (
        <button
          ref={ref}
          type={type}
          disabled={isBtnDisabled}
          className={`${baseStyles} ${variants[variant]} ${className}`}
          {...props}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
          {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </button>
      );
    }
  )
);

Button.displayName = "Button";
