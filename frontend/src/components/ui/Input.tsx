import React, { InputHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        ghost:
          "border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, helperText, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          className={inputVariants({ variant, size, error, className })}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p
            className={`text-xs ${
              error ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
