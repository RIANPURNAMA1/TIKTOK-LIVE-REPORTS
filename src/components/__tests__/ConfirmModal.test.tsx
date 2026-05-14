import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../ConfirmModal";

describe("ConfirmModal", () => {
  const baseProps = {
    open: true,
    title: "Hapus Data",
    message: "Apakah Anda yakin ingin menghapus data ini?",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders nothing when open is false", () => {
    const { container } = render(<ConfirmModal {...baseProps} open={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders title and message", () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByText("Hapus Data")).toBeInTheDocument();
    expect(screen.getByText("Apakah Anda yakin ingin menghapus data ini?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    render(<ConfirmModal {...baseProps} />);
    fireEvent.click(screen.getByText("Ya, Keluar"));
    expect(baseProps.onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button clicked", () => {
    render(<ConfirmModal {...baseProps} />);
    fireEvent.click(screen.getByText("Batal"));
    expect(baseProps.onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when backdrop clicked", () => {
    render(<ConfirmModal {...baseProps} />);
    const backdrop = document.querySelector(".bg-black\\/30");
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(baseProps.onCancel).toHaveBeenCalled();
    }
  });

  it("renders custom button labels", () => {
    render(
      <ConfirmModal
        {...baseProps}
        confirmLabel="Hapus"
        cancelLabel="Kembali"
      />
    );
    expect(screen.getByText("Hapus")).toBeInTheDocument();
    expect(screen.getByText("Kembali")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(<ConfirmModal {...baseProps} />);
    const closeBtn = document.querySelector("button");
    expect(closeBtn).toBeInTheDocument();
  });
});
