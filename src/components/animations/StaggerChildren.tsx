"use client";

import React from "react";
import { motion } from "motion/react";
import {
  staggerContainer,
  staggerItem,
  defaultTransition,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before first child starts (seconds) */
  delayChildren?: number;
  /** Delay between each child (seconds) */
  staggerDelay?: number;
  as?: keyof typeof motion;
}

export function StaggerChildren({
  children,
  className,
  delayChildren = 0.05,
  staggerDelay = 0.08,
  as: Component = "div",
}: StaggerChildrenProps) {
  const MotionComponent = motion[Component] as typeof motion.div;
  const containerVariants = {
    ...staggerContainer,
    visible: {
      ...staggerContainer.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={defaultTransition}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}

/** Wraps a single item to animate as part of a StaggerChildren parent */
export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof motion;
}

export function StaggerItem({
  children,
  className,
  as: Component = "div",
}: StaggerItemProps) {
  const MotionComponent = motion[Component] as typeof motion.div;
  return (
    <MotionComponent variants={staggerItem} className={cn(className)}>
      {children}
    </MotionComponent>
  );
}
