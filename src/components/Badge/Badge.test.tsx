import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders with variant", () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
