function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function normalizeBooking(input) {
  const booking = {
    id: input.id ? String(input.id) : crypto.randomUUID(),
    guestName: String(input.guestName ?? '').trim(),
    checkIn: String(input.checkIn ?? '').trim(),
    checkOut: String(input.checkOut ?? '').trim(),
    numAdults: Number.parseInt(input.numAdults, 10),
    numChildren: Number.parseInt(input.numChildren ?? 0, 10),
    depositPaid: Boolean(input.depositPaid),
    notes: String(input.notes ?? '').trim(),
    createdAt: input.createdAt ? String(input.createdAt) : new Date().toISOString()
  };

  const errors = [];

  if (!booking.guestName) errors.push('guestName is required');
  if (!isIsoDate(booking.checkIn)) errors.push('checkIn must be YYYY-MM-DD');
  if (!isIsoDate(booking.checkOut)) errors.push('checkOut must be YYYY-MM-DD');
  if (!Number.isInteger(booking.numAdults) || booking.numAdults < 1) {
    errors.push('numAdults must be an integer >= 1');
  }
  if (!Number.isInteger(booking.numChildren) || booking.numChildren < 0) {
    errors.push('numChildren must be an integer >= 0');
  }
  if (booking.checkIn && booking.checkOut && booking.checkOut <= booking.checkIn) {
    errors.push('checkOut must be after checkIn');
  }

  return { booking, errors };
}
