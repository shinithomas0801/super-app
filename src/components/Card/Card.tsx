"use client";

import React from "react";
import {
  Card as ShadcnCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClass = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  title,
  children,
  className,
  padding = "md",
}: CardProps) {
  return (
    <ShadcnCard className={cn(className)}>
      {title && (
        <CardHeader className={padding === "none" ? "p-0" : paddingClass[padding]}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        title ? "pt-0" : "",
        padding === "none" ? "p-0" : paddingClass[padding]
      )}>
        {children}
      </CardContent>
    </ShadcnCard>
  );
}
