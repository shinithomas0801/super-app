import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "./ui.store";

const initialState = {
  sidebarOpen: true,
  theme: "system" as const,
};

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState(initialState);
  });

  it("has correct initial state", () => {
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    expect(useUiStore.getState().theme).toBe("system");
  });

  it("setSidebarOpen updates sidebarOpen", () => {
    useUiStore.getState().setSidebarOpen(false);
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().setSidebarOpen(true);
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it("toggleSidebar flips sidebarOpen", () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it("setTheme updates theme", () => {
    useUiStore.getState().setTheme("dark");
    expect(useUiStore.getState().theme).toBe("dark");
    useUiStore.getState().setTheme("light");
    expect(useUiStore.getState().theme).toBe("light");
  });
});
