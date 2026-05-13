"use client";

import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantMap: Record<ButtonVariant, "default" | "secondary" | "outline" | "ghost" | "destructive"> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "destructive",
};

const sizeMap: Record<ButtonSize, "default" | "sm" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      className={cn(fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
}
