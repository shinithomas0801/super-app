"use client";

import React from "react";
import { motion } from "motion/react";
import { fadeIn, defaultTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof typeof motion;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  as: Component = "div",
}: FadeInProps) {
  const MotionComponent = motion[Component] as typeof motion.div;
  return (
    <MotionComponent
      variants={fadeIn}
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
