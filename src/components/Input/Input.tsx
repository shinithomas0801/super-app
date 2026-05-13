"use client";

import React from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\s/g, "-").toLowerCase()}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <ShadcnInput
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...props}
      />
      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          id={inputId ? `${inputId}-hint` : undefined}
          className="text-sm text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
