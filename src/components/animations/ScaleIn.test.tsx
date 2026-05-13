import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScaleIn } from "./ScaleIn";

describe("ScaleIn", () => {
  it("renders children", () => {
    render(<ScaleIn>Scaled content</ScaleIn>);
    expect(screen.getByText("Scaled content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ScaleIn className="popover">Pop</ScaleIn>);
    expect(container.firstElementChild).toHaveClass("popover");
  });
});
