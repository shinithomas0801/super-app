import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with accessibility attributes", () => {
    render(<Spinner />);
    const el = screen.getByRole("status", { name: /loading/i });
    expect(el).toBeInTheDocument();
  });

  it("accepts size prop", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
