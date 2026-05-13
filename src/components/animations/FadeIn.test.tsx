import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeIn } from "./FadeIn";

describe("FadeIn", () => {
  it("renders children", () => {
    render(<FadeIn>Hello</FadeIn>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<FadeIn className="my-class">Content</FadeIn>);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass("my-class");
  });

  it("renders as span when as=span", () => {
    render(<FadeIn as="span">Span content</FadeIn>);
    expect(screen.getByText("Span content").tagName).toBe("SPAN");
  });
});
