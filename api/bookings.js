import { query } from '../lib/db.js';
import { getAllowedOrigin, json, noContent } from '../lib/http.js';
import { normalizeBooking } from '../lib/validators.js';

export default async function handler(request) {
  const origin = getAllowedOrigin(request);

  if (request.method === 'OPTIONS') {
    return noContent(origin);
  }

  try {
    switch (request.method) {
      case 'GET':
        return await listBookings(origin);
      case 'POST':
        return await createBooking(request, origin);
      case 'PUT':
        return await updateBooking(request, origin);
      case 'DELETE':
        return await deleteBooking(request, origin);
      default:
        return json(405, { success: false, error: 'Method not allowed' }, origin);
    }
  } catch (error) {
    console.error('Unhandled API error', error);
    return json(500, { success: false, error: 'Internal server error' }, origin);
  }
}

async function listBookings(origin) {
  const result = await query(`
    select
      id,
      guest_name as "guestName",
      to_char(check_in, 'YYYY-MM-DD') as "checkIn",
      to_char(check_out, 'YYYY-MM-DD') as "checkOut",
      num_adults as "numAdults",
      num_children as "numChildren",
      deposit_paid as "depositPaid",
      notes,
      created_at as "createdAt"
    from bookings
    order by check_in asc, created_at asc
  `);

  return json(200, { success: true, bookings: result.rows }, origin);
}

async function createBooking(request, origin) {
  const body = await request.json();
  const { booking, errors } = normalizeBooking(body);

  if (errors.length > 0) {
    return json(400, { success: false, error: errors.join(', ') }, origin);
  }

  await query(
    `insert into bookings (
      id, guest_name, check_in, check_out, num_adults, num_children, deposit_paid, notes, created_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      booking.id,
      booking.guestName,
      booking.checkIn,
      booking.checkOut,
      booking.numAdults,
      booking.numChildren,
      booking.depositPaid,
      booking.notes,
      booking.createdAt
    ]
  );

  return json(201, { success: true, booking }, origin);
}

async function updateBooking(request, origin) {
  const body = await request.json();
  const { booking, errors } = normalizeBooking(body);

  if (errors.length > 0) {
    return json(400, { success: false, error: errors.join(', ') }, origin);
  }

  const result = await query(
    `update bookings
       set guest_name = $2,
           check_in = $3,
           check_out = $4,
           num_adults = $5,
           num_children = $6,
           deposit_paid = $7,
           notes = $8
     where id = $1
     returning id`,
    [
      booking.id,
      booking.guestName,
      booking.checkIn,
      booking.checkOut,
      booking.numAdults,
      booking.numChildren,
      booking.depositPaid,
      booking.notes
    ]
  );

  if (result.rowCount === 0) {
    return json(404, { success: false, error: 'Booking not found' }, origin);
  }

  return json(200, { success: true, booking }, origin);
}

async function deleteBooking(request, origin) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return json(400, { success: false, error: 'id is required' }, origin);
  }

  const result = await query('delete from bookings where id = $1 returning id', [id]);

  if (result.rowCount === 0) {
    return json(404, { success: false, error: 'Booking not found' }, origin);
  }

  return json(200, { success: true, id }, origin);
}
