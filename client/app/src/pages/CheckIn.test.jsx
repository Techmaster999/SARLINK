// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CheckIn from "./CheckIn";

describe("CheckIn wizard (DT-185)", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("blocks submit without a team and returns to the team step", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    render(<CheckIn />);

    fireEvent.click(screen.getByRole("button", { name: "Next" })); // step 1 -> 2
    fireEvent.click(screen.getByRole("button", { name: "Next" })); // step 2 -> 3
    fireEvent.click(screen.getByRole("button", { name: "Review my details" }));

    // The team field is unmounted on step 3, so the wizard must bounce back
    // and show the error instead of accepting the check-in.
    expect(await screen.findByText("STEP 2 OF 3")).toBeDefined();
    expect(screen.getByRole("alert").textContent).toBe("Choose a team.");
    expect(infoSpy).not.toHaveBeenCalledWith("Check-in details:", expect.anything());
  });

  it("submits the check-in with exactly one team assignment", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    render(<CheckIn />);

    fireEvent.click(screen.getByRole("button", { name: "Next" })); // step 1 -> 2
    fireEvent.click(screen.getByLabelText("K9"));
    fireEvent.click(screen.getByRole("button", { name: "Next" })); // step 2 -> 3
    fireEvent.click(screen.getByRole("button", { name: "Review my details" }));

    await waitFor(() => {
      expect(infoSpy).toHaveBeenCalledWith(
        "Check-in details:",
        expect.objectContaining({ team: "k9" }),
      );
    });
  });
});
