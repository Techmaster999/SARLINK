// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import TeamSelectionField from "./TeamSelectionField";

function FormHarness({ onSubmit }) {
  const methods = useForm({ defaultValues: { team: "" } });

  return (
    <FormProvider {...methods}>
      <form aria-label="Team assignment" onSubmit={methods.handleSubmit(onSubmit)}>
        <TeamSelectionField />
        <button type="submit">Next</button>
      </form>
    </FormProvider>
  );
}

describe("TeamSelectionField", () => {
  afterEach(cleanup); // vitest globals are off, so testing-library doesn't auto-cleanup

  it("selects and submits the chosen team", async () => {
    const onSubmit = vi.fn();
    const { getByLabelText, getByRole } = render(<FormHarness onSubmit={onSubmit} />);

    const k9Option = getByLabelText("K9");
    expect(k9Option.type).toBe("radio");

    fireEvent.click(k9Option);
    expect(k9Option.checked).toBe(true);

    fireEvent.submit(getByRole("form", { name: "Team assignment" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ team: "k9" }, expect.anything());
    });
  });

  it("requires a team before submitting", async () => {
    const onSubmit = vi.fn();
    const { container, findByRole } = render(<FormHarness onSubmit={onSubmit} />);

    fireEvent.submit(container.querySelector("form"));

    expect((await findByRole("alert")).textContent).toBe("Choose a team.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears the error after a valid team is selected (DT-185)", async () => {
    const onSubmit = vi.fn();
    const { container, getByLabelText, findByRole, queryByRole } = render(
      <FormHarness onSubmit={onSubmit} />,
    );

    fireEvent.submit(container.querySelector("form"));
    expect((await findByRole("alert")).textContent).toBe("Choose a team.");

    fireEvent.click(getByLabelText("K9"));
    await waitFor(() => expect(queryByRole("alert")).toBeNull());

    fireEvent.submit(container.querySelector("form"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ team: "k9" }, expect.anything());
    });
  });

  it("lets the volunteer select only one team (DT-186)", () => {
    const { getByLabelText } = render(<FormHarness onSubmit={() => {}} />);

    const k9Option = getByLabelText("K9");
    const gs1Option = getByLabelText("Ground Searcher 1");

    fireEvent.click(k9Option);
    expect(k9Option.checked).toBe(true);

    fireEvent.click(gs1Option);
    expect(gs1Option.checked).toBe(true);
    expect(k9Option.checked).toBe(false);
  });

  it("replaces the previous selection when a new team is picked (DT-186)", async () => {
    const onSubmit = vi.fn();
    const { getByLabelText, getByRole } = render(<FormHarness onSubmit={onSubmit} />);

    fireEvent.click(getByLabelText("Ground Searcher 1"));
    fireEvent.click(getByLabelText("K9"));
    fireEvent.submit(getByRole("form", { name: "Team assignment" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ team: "k9" }, expect.anything());
    });
  });
});
