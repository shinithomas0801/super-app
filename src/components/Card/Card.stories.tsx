import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  component: Card,
  title: "Components/Card",
  argTypes: {
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: "Card content goes here.",
  },
};

export const WithTitle: Story = {
  args: {
    title: "Card title",
    children: "Card body content. You can put any content inside.",
  },
};

export const PaddingVariants: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Card title="Small padding" padding="sm">
        Content with small padding.
      </Card>
      <Card title="Medium padding" padding="md">
        Content with default (medium) padding.
      </Card>
      <Card title="Large padding" padding="lg">
        Content with large padding.
      </Card>
    </div>
  ),
};

export const NoPadding: Story = {
  args: {
    title: "No padding",
    padding: "none",
    children: (
      <div className="p-4 bg-gray-50">
        Custom padded content inside.
      </div>
    ),
  },
};
