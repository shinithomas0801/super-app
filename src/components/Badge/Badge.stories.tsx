import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: "Components/Badge",
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "success", "warning", "error", "info"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: {
    children: "Neutral",
    variant: "neutral",
  },
};

export const Success: Story = {
  args: {
    children: "Active",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Pending",
    variant: "warning",
  },
};

export const Error: Story = {
  args: {
    children: "Failed",
    variant: "error",
  },
};

export const Info: Story = {
  args: {
    children: "Draft",
    variant: "info",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};
