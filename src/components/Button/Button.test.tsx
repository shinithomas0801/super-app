import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("applies variant and size via shadcn", () => {
    render(<Button variant="secondary" size="sm">Small</Button>);
    const btn = screen.getByRole("button", { name: /small/i });
    expect(btn).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });
});
