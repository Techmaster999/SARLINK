/* 
DT-173 Implement the arrival-time input from the Figma mockup
client/src/components/checkin/ArrivalTimeField.test.jsx
*/ 

// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import ArrivalTimeField from "./ArrivalTimeField";

function FormHarness({ onSubmit }) {
  const methods = useForm({ defaultValues: { arrivalTime: "" } });

  return (
    <FormProvider {...methods}>
      <form aria-label="Check-in" onSubmit={methods.handleSubmit(onSubmit)}>
        <ArrivalTimeField />
      </form>
    </FormProvider>
  );
}

describe("ArrivalTimeField", () => {
  it("keeps the selected time visible and submits it", async () => {
    const onSubmit = vi.fn();
    render(<FormHarness onSubmit={onSubmit} />);

    const input = screen.getByLabelText("Arrival time");
    fireEvent.change(input, { target: { value: "14:30" } });

    expect(input.value).toBe("14:30");

    fireEvent.submit(screen.getByRole("form", { name: "Check-in" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(onSubmit.mock.calls[0][0]).toEqual({ arrivalTime: "14:30" });
  });
});