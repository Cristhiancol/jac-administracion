import { describe, expect, it } from "vitest";
import { isReservationWindowValid, reservationWindowsOverlap } from "./reservations";

describe("validación de reservas del salón comunal", () => {
  const existingStart = new Date("2026-08-24T14:00:00Z");
  const existingEnd = new Date("2026-08-24T17:00:00Z");

  it("detecta un solapamiento parcial", () => {
    expect(reservationWindowsOverlap(existingStart, existingEnd, new Date("2026-08-24T16:30:00Z"), new Date("2026-08-24T18:00:00Z"))).toBe(true);
  });

  it("admite reservas contiguas sin solaparlas", () => {
    expect(reservationWindowsOverlap(existingStart, existingEnd, new Date("2026-08-24T17:00:00Z"), new Date("2026-08-24T18:00:00Z"))).toBe(false);
  });

  it("exige que la hora final sea posterior a la inicial", () => {
    expect(isReservationWindowValid(existingStart, existingEnd)).toBe(true);
    expect(isReservationWindowValid(existingEnd, existingStart)).toBe(false);
  });
});
