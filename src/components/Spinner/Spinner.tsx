"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-2",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block rounded-full border-2 border-muted border-t-primary animate-spin",
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
