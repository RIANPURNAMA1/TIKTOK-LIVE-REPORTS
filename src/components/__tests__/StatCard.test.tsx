import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Eye } from "lucide-react";
import StatCard from "../StatCard";

describe("StatCard", () => {
  const defaultProps = {
    label: "Total Views",
    value: "18.8K",
    icon: Eye,
    color: "blue" as const,
  };

  it("renders label and value", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("Total Views")).toBeInTheDocument();
    expect(screen.getByText("18.8K")).toBeInTheDocument();
  });

  it("renders trend text when provided", () => {
    render(<StatCard {...defaultProps} trend="12% meningkat" trendUp />);
    expect(screen.getByText(/12% meningkat/)).toBeInTheDocument();
  });

  it("renders down trend indicator", () => {
    render(<StatCard {...defaultProps} trend="5% menurun" trendUp={false} />);
    expect(screen.getByText(/5% menurun/)).toBeInTheDocument();
  });

  it("does not render trend when not provided", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.queryByText("▲")).not.toBeInTheDocument();
    expect(screen.queryByText("▼")).not.toBeInTheDocument();
  });

  it("renders with different colors", () => {
    const { container } = render(<StatCard {...defaultProps} color="amber" />);
    const iconContainer = container.querySelector(".bg-amber-500");
    expect(iconContainer).toBeInTheDocument();
  });

  it("renders numeric value", () => {
    render(<StatCard {...defaultProps} value={245000} />);
    expect(screen.getByText("245000")).toBeInTheDocument();
  });
});
