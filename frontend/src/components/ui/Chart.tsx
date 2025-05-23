import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { cn } from "@/utils/cn";

const chartVariants = cva("", {
  variants: {
    variant: {
      default: "bg-card",
      transparent: "bg-transparent",
    },
    size: {
      default: "h-80",
      sm: "h-60",
      lg: "h-96",
      xl: "h-[32rem]",
      auto: "h-auto",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  title?: string;
  description?: React.ReactNode;
  loading?: boolean;
  data?: unknown;
  renderChart: (
    containerRef: React.RefObject<HTMLDivElement>
  ) => React.ReactNode;
}

export function Chart({
  className,
  variant,
  size,
  title,
  description,
  loading,
  data,
  renderChart,
  ...props
}: ChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <Card className={className} {...props}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          "p-0 overflow-hidden relative",
          loading && "min-h-[150px] flex items-center justify-center",
          chartVariants({ variant, size })
        )}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-r-primary" />
          </div>
        ) : !data ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">
              No data available
            </span>
          </div>
        ) : (
          <div ref={containerRef} className="h-full w-full">
            {renderChart(containerRef)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
