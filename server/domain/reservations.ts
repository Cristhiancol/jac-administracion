export function reservationWindowsOverlap(existingStart: Date, existingEnd: Date, requestedStart: Date, requestedEnd: Date) {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

export function isReservationWindowValid(startsAt: Date, endsAt: Date) {
  return endsAt > startsAt;
}
