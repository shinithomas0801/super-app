import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders input with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message when error is provided", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("shows hint when hint is provided and no error", () => {
    render(<Input label="Name" hint="Optional" />);
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });
});
