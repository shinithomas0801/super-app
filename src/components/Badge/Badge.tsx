"use client";

import React from "react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "success" | "warning" | "error" | "info";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<BadgeVariant, "default" | "secondary" | "destructive" | "outline"> = {
  neutral: "secondary",
  success: "default",
  warning: "outline",
  error: "destructive",
  info: "default",
};

const customVariantClass: Partial<Record<BadgeVariant, string>> = {
  success: "border-transparent bg-green-500/15 text-green-700 dark:text-green-400",
  warning: "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  info: "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <ShadcnBadge
      variant={variantMap[variant]}
      className={cn(customVariantClass[variant], className)}
    >
      {children}
    </ShadcnBadge>
  );
}
