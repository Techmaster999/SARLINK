/* DT-175: Automatically attach the volunteer's name and SAR badge number */
// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckIn from "../../../app/src/pages/CheckIn";
import {
  attachVolunteerIdentityToCheckIn,
  getCurrentVolunteerIdentity,
} from "../../services/authService";
import { createCheckIn } from "../../../../server/src/controllers/checkInController";

describe("DT-175: Volunteer Identity Attachment", () => {
  const authenticatedVolunteer = {
    volunteerId: 42,
    name: "SAR. Marcus Greene",
    badgeNumber: "SAR-204",
  };

  it("extracts the current volunteer's name and SAR badge number via getCurrentVolunteerIdentity()", async () => {
    const identity = await getCurrentVolunteerIdentity({
      session: { user: authenticatedVolunteer },
    });

    expect(identity).toEqual({
      volunteerId: 42,
      name: "SAR. Marcus Greene",
      volunteerName: "SAR. Marcus Greene",
      badgeNumber: "SAR-204",
      sarBadgeNumber: "SAR-204",
    });
  });

  it("automatically includes the volunteer's name and SAR badge number in the check-in submission", async () => {
    const onSubmitCheckIn = vi.fn();
    render(
      <CheckIn
        currentVolunteer={authenticatedVolunteer}
        onSubmitCheckIn={onSubmitCheckIn}
      />
    );

    expect(screen.getByTestId("volunteer-identity-name").textContent).toBe(
      "SAR. Marcus Greene"
    );
    expect(screen.getByTestId("volunteer-identity-badge").textContent).toBe(
      "SAR-204"
    );

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    // Select team on Step 2
    fireEvent.click(screen.getByLabelText("K9"));
    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    // Submit on Step 3
    fireEvent.click(screen.getByRole("button", { name: "Review my details" }));

    await waitFor(() => {
      expect(onSubmitCheckIn).toHaveBeenCalledTimes(1);
    });

    const submitted = onSubmitCheckIn.mock.calls[0][0];
    expect(submitted.name).toBe("SAR. Marcus Greene");
    expect(submitted.volunteerName).toBe("SAR. Marcus Greene");
    expect(submitted.badgeNumber).toBe("SAR-204");
    expect(submitted.sarBadgeNumber).toBe("SAR-204");
    expect(submitted.volunteerId).toBe(42);
    expect(submitted.team).toBe("k9");
  });

  it("prevents a volunteer from submitting a check-in for another volunteer", async () => {
    expect(() =>
      attachVolunteerIdentityToCheckIn(
        { name: "Another Volunteer", badgeNumber: "SAR-999" },
        authenticatedVolunteer
      )
    ).toThrow("Volunteers cannot submit a check-in for another volunteer.");

    const req = {
      session: { user: authenticatedVolunteer },
      body: {
        incidentId: 1,
        name: "Another Volunteer",
        badgeNumber: "SAR-999",
      },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await createCheckIn(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].status).toBe(403);
  });

  it("prevents an unauthenticated user from submitting a check-in", async () => {
    const onSubmitCheckIn = vi.fn();
    render(
      <CheckIn currentVolunteer={null} onSubmitCheckIn={onSubmitCheckIn} />
    );

    expect(screen.getByRole("alert").textContent).toMatch(/not signed in/i);

    const req = { session: {}, body: { incidentId: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await createCheckIn(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].status).toBe(401);
  });

  it("saves the volunteer identity information with the check-in record on the server", async () => {
    const mockDb = {
      query: vi.fn().mockResolvedValue({
        rows: [
          {
            id: 10,
            volunteer_id: 42,
            incident_id: 1,
            volunteer_name: "SAR. Marcus Greene",
            sar_badge_number: "SAR-204",
            arrival_time: "2026-11-27T14:30:00.000Z",
            checkout_time: null,
            team_id: null,
            checked_in_at: new Date("2026-11-27T14:00:00.000Z"),
            team_assigned_at: null,
            submitted_at: null,
          },
        ],
      }),
    };

    const req = {
      session: { user: authenticatedVolunteer },
      body: { incidentId: 1, arrivalTime: "2026-11-27T14:30:00.000Z" },
      app: { locals: { db: mockDb } },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await createCheckIn(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        volunteerId: 42,
        name: "SAR. Marcus Greene",
        volunteerName: "SAR. Marcus Greene",
        badgeNumber: "SAR-204",
        sarBadgeNumber: "SAR-204",
      })
    );
  });
});
