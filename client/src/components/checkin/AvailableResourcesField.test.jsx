// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import AvailableResourcesField from "./AvailableResourcesField";

function FormHarness({ onSubmit }) {
  const methods = useForm({
    defaultValues: {
      equipment: [],
      equipmentOther: "",
      hasVehicle: null,
      vehicleType: "",
      vehicleDescription: "",
      hasDog: null,
      dogNames: "",
      dogDisciplines: [],
    },
  });

  return (
    <FormProvider {...methods}>
      <form aria-label="Resources" onSubmit={methods.handleSubmit(onSubmit)}>
        <AvailableResourcesField />
        <button type="submit">Review my details</button>
      </form>
    </FormProvider>
  );
}

describe("AvailableResourcesField", () => {
  it("keeps independent resource selections and submits them", async () => {
    const onSubmit = vi.fn();
    render(<FormHarness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Radio" }));
    fireEvent.click(screen.getByRole("button", { name: "GPS unit" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Yes" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "ATV / UTV" }));
    fireEvent.change(screen.getByLabelText("Make, colour or plate"), {
      target: { value: "Blue ATV" },
    });

    const yesButtons = screen.getAllByRole("button", { name: "Yes" });
    fireEvent.click(yesButtons[1]);
    fireEvent.change(screen.getByLabelText("Dog name(s)"), {
      target: { value: "Koda" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Area / air scent" }));

    expect(screen.getByRole("button", { name: "Radio" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "GPS unit" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByLabelText("Make, colour or plate").value).toBe("Blue ATV");
    expect(screen.getByLabelText("Dog name(s)").value).toBe("Koda");

    fireEvent.submit(screen.getByRole("form", { name: "Resources" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          equipment: ["radio", "gps"],
          equipmentOther: "",
          hasVehicle: true,
          vehicleType: "atv",
          vehicleDescription: "Blue ATV",
          hasDog: true,
          dogNames: "Koda",
          dogDisciplines: ["area"],
        },
        expect.anything(),
      );
    });
  });
});
