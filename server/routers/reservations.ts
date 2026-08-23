import { TRPCError } from "@trpc/server";
import { reservationSchema } from "@shared/jac-forms";
import { isReservationWindowValid } from "../domain/reservations";
import { createFacilityReservation, getCommunitySnapshot, hasReservationConflict } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const reservationsRouter = router({
  snapshot: protectedProcedure.query(() => getCommunitySnapshot()),
  validateAvailability: protectedProcedure.input(reservationSchema).query(async ({ input }) => ({
    available: isReservationWindowValid(input.startsAt, input.endsAt) && !(await hasReservationConflict(input.startsAt, input.endsAt)),
  })),
  create: protectedProcedure.input(reservationSchema).mutation(async ({ ctx, input }) => {
    if (!isReservationWindowValid(input.startsAt, input.endsAt)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "La hora final debe ser posterior a la inicial." });
    }
    if (await hasReservationConflict(input.startsAt, input.endsAt)) {
      throw new TRPCError({ code: "CONFLICT", message: "Existe una reserva aprobada en el horario seleccionado." });
    }
    await createFacilityReservation({ ...input, requestedByUserId: ctx.user.id });
    return { success: true };
  }),
});
