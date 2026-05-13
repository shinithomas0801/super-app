import { describe, it, expect } from "vitest";
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  slideInLeft,
  slideInRight,
  defaultTransition,
} from "./variants";

describe("animation variants", () => {
  it("defaultTransition has duration and ease", () => {
    expect(defaultTransition.duration).toBe(0.3);
    expect(defaultTransition.ease).toHaveLength(4);
  });

  it("fadeIn has hidden, visible, exit", () => {
    expect(fadeIn.hidden).toEqual({ opacity: 0 });
    expect(fadeIn.visible).toEqual({ opacity: 1 });
    expect(fadeIn.exit).toEqual({ opacity: 0 });
  });

  it("fadeInUp has y and opacity", () => {
    expect(fadeInUp.hidden).toEqual({ opacity: 0, y: 16 });
    expect(fadeInUp.visible).toEqual({ opacity: 1, y: 0 });
    expect(fadeInUp.exit).toEqual({ opacity: 0, y: -8 });
  });

  it("scaleIn has scale and opacity", () => {
    expect(scaleIn.hidden).toMatchObject({ opacity: 0, scale: 0.96 });
    expect(scaleIn.visible).toMatchObject({ opacity: 1, scale: 1 });
  });

  it("staggerContainer has transition with staggerChildren", () => {
    expect(staggerContainer.visible).toMatchObject({
      opacity: 1,
      transition: expect.objectContaining({
        staggerChildren: 0.08,
        delayChildren: 0.05,
      }),
    });
  });

  it("staggerItem has hidden, visible, exit", () => {
    expect(staggerItem.hidden).toMatchObject({ opacity: 0, y: 12 });
    expect(staggerItem.visible).toMatchObject({ opacity: 1, y: 0 });
  });

  it("slideInLeft has x and opacity", () => {
    expect(slideInLeft.hidden).toEqual({ opacity: 0, x: -24 });
    expect(slideInLeft.visible).toEqual({ opacity: 1, x: 0 });
  });

  it("slideInRight has x and opacity", () => {
    expect(slideInRight.hidden).toEqual({ opacity: 0, x: 24 });
    expect(slideInRight.visible).toEqual({ opacity: 1, x: 0 });
  });
});
