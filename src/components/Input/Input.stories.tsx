import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  component: Input,
  title: "Components/Input",
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
  },
};

export const WithHint: Story = {
  args: {
    label: "Username",
    placeholder: "johndoe",
    hint: "Letters and numbers only.",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    error: "Please enter a valid email address.",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled field",
    placeholder: "Cannot edit",
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    label: "Name",
    defaultValue: "Jane Doe",
  },
};
