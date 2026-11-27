// @vitest-environment jsdom
import { fireEvent, render, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
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
});
