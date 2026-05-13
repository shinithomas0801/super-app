import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeInUp } from "./FadeInUp";

describe("FadeInUp", () => {
  it("renders children", () => {
    render(<FadeInUp>Fade up content</FadeInUp>);
    expect(screen.getByText("Fade up content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<FadeInUp className="card">Card</FadeInUp>);
    expect(container.firstElementChild).toHaveClass("card");
  });
});
