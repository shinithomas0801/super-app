"use client";

import React from "react";
import { motion } from "motion/react";
import { scaleIn, defaultTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof typeof motion;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  as: Component = "div",
}: ScaleInProps) {
  const MotionComponent = motion[Component] as typeof motion.div;
  return (
    <MotionComponent
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...defaultTransition, delay }}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}
