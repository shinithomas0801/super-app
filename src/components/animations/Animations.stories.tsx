import type { Meta, StoryObj } from "@storybook/react";
import { FadeIn } from "./FadeIn";
import { FadeInUp } from "./FadeInUp";
import { ScaleIn } from "./ScaleIn";
import { StaggerChildren, StaggerItem } from "./StaggerChildren";

const meta: Meta = {
  title: "Components/Animations",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const FadeInDemo: Story = {
  render: () => (
    <FadeIn className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      Fade-in content
    </FadeIn>
  ),
};

export const FadeInUpDemo: Story = {
  render: () => (
    <FadeInUp className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      Fade-in-up content (e.g. card)
    </FadeInUp>
  ),
};

export const ScaleInDemo: Story = {
  render: () => (
    <ScaleIn className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      Scale-in content (e.g. popover)
    </ScaleIn>
  ),
};

export const StaggerList: Story = {
  render: () => (
    <StaggerChildren className="flex flex-col gap-2">
      <StaggerItem className="rounded border border-gray-200 bg-gray-50 px-3 py-2">
        Item 1
      </StaggerItem>
      <StaggerItem className="rounded border border-gray-200 bg-gray-50 px-3 py-2">
        Item 2
      </StaggerItem>
      <StaggerItem className="rounded border border-gray-200 bg-gray-50 px-3 py-2">
        Item 3
      </StaggerItem>
    </StaggerChildren>
  ),
};

export const AllAnimations: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">FadeIn</p>
        <FadeIn className="rounded bg-gray-100 p-3">Fade in only</FadeIn>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">FadeInUp</p>
        <FadeInUp className="rounded bg-gray-100 p-3">
          Fade in + move up
        </FadeInUp>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">ScaleIn</p>
        <ScaleIn className="rounded bg-gray-100 p-3">Scale in</ScaleIn>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-500">
          StaggerChildren + StaggerItem
        </p>
        <StaggerChildren>
          <StaggerItem className="rounded bg-gray-100 p-2">
            Stagger 1
          </StaggerItem>
          <StaggerItem className="rounded bg-gray-100 p-2">
            Stagger 2
          </StaggerItem>
          <StaggerItem className="rounded bg-gray-100 p-2">
            Stagger 3
          </StaggerItem>
        </StaggerChildren>
      </div>
    </div>
  ),
};
