import { query } from '../lib/db.js';
import { getAllowedOrigin, sendJson, sendNoContent, readJsonBody } from '../lib/http.js';
import { normalizeBooking } from '../lib/validators.js';

export default async function handler(req, res) {
  const origin = getAllowedOrigin(req);

  if (req.method === 'OPTIONS') {
    return sendNoContent(res, origin);
  }

  try {
    switch (req.method) {
      case 'GET':
        return await listBookings(res, origin);

      case 'POST':
        return await createBooking(req, res, origin);

      case 'PUT':
        return await updateBooking(req, res, origin);

      case 'DELETE':
        return await deleteBooking(req, res, origin);

      default:
        return sendJson(res, 405, { success: false, error: 'Method not allowed' }, origin);
    }
  } catch (error) {
    console.error('Unhandled API error', error);
    return sendJson(res, 500, { success: false, error: error.message || 'Internal server error' }, origin);
  }
}

async function listBookings(res, origin) {
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

  return sendJson(res, 200, { success: true, bookings: result.rows }, origin);
}

async function createBooking(req, res, origin) {
  const body = await readJsonBody(req);
  const payload = body.booking ?? body;
  const { booking, errors } = normalizeBooking(payload);

  if (errors.length > 0) {
    return sendJson(res, 400, { success: false, error: errors.join(', ') }, origin);
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

  return sendJson(res, 201, { success: true, booking }, origin);
}

async function updateBooking(req, res, origin) {
  const body = await readJsonBody(req);
  const payload = body.booking ?? body;
  const { booking, errors } = normalizeBooking(payload);

  if (errors.length > 0) {
    return sendJson(res, 400, { success: false, error: errors.join(', ') }, origin);
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
    return sendJson(res, 404, { success: false, error: 'Booking not found' }, origin);
  }

  return sendJson(res, 200, { success: true, booking }, origin);
}

async function deleteBooking(req, res, origin) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const url = new URL(req.url, `${protocol}://${host}`);
  const id = url.searchParams.get('id');

  if (!id) {
    return sendJson(res, 400, { success: false, error: 'id is required' }, origin);
  }

  const result = await query('delete from bookings where id = $1 returning id', [id]);

  if (result.rowCount === 0) {
    return sendJson(res, 404, { success: false, error: 'Booking not found' }, origin);
  }

  return sendJson(res, 200, { success: true, id }, origin);
}
