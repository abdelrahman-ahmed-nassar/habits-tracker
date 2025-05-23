import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        default: "h-4",
        sm: "h-2",
        lg: "h-6",
      },
      variant: {
        default: "",
        success: "",
        warning: "",
        destructive: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

const progressIndicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  indicatorVariant?: VariantProps<typeof progressIndicatorVariants>["variant"];
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, variant, indicatorVariant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={progressVariants({ size, variant, className })}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={progressIndicatorVariants({
        variant: indicatorVariant || variant,
      })}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
