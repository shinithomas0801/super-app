import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaggerChildren, StaggerItem } from "./StaggerChildren";

describe("StaggerChildren", () => {
  it("renders children", () => {
    render(
      <StaggerChildren>
        <StaggerItem>One</StaggerItem>
        <StaggerItem>Two</StaggerItem>
      </StaggerChildren>
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("applies custom className to container", () => {
    const { container } = render(
      <StaggerChildren className="list">
        <StaggerItem>Item</StaggerItem>
      </StaggerChildren>
    );
    expect(container.firstElementChild).toHaveClass("list");
  });
});

describe("StaggerItem", () => {
  it("renders children", () => {
    render(<StaggerItem>Single item</StaggerItem>);
    expect(screen.getByText("Single item")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StaggerItem className="list-item">Item</StaggerItem>
    );
    expect(container.firstElementChild).toHaveClass("list-item");
  });
});
