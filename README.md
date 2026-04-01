# Backend minimal per prenotazioni su Vercel

Questo progetto espone un backend molto semplice per salvare prenotazioni in modo persistente.

## Stack
- Vercel Functions (Node.js)
- Postgres compatibile con Vercel Marketplace (Neon, Supabase, Aurora Postgres, ecc.)

## Endpoint
- `GET /api/health`
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings`
- `DELETE /api/bookings?id=<bookingId>`

## 1. Crea il database
Su Vercel aggiungi una integrazione Postgres dal Marketplace. Vercel supporta integrazioni Postgres esterne tramite Marketplace e inietta le credenziali come environment variables nel progetto. citeturn277905search0turn277905search4turn277905search8

In alternativa usa un database Postgres esterno e imposta manualmente `DATABASE_URL`.

Esegui poi `schema.sql` sul database.

## 2. Environment variables
Imposta queste variabili in Vercel:
- `DATABASE_URL`
- `ALLOWED_ORIGIN` = URL del tuo frontend, per esempio `https://tuodominio.it`

Le environment variables su Vercel si configurano a livello di progetto o ambiente e vengono lette durante l'esecuzione delle Functions. citeturn907104search11turn277905search8

## 3. Deploy
```bash
npm install
vercel
```

Su Vercel le funzioni Node.js possono essere create mettendo file `.js` dentro la cartella `api/`. Le versioni Node.js supportate attuali includono 24.x come default. citeturn907104search6turn907104search2

## 4. Come collegare il tuo frontend
Nel tuo HTML usa un backend base URL tipo:

```js
const API_BASE_URL = 'https://tuo-progetto.vercel.app/api';
```

### Caricare prenotazioni
```js
async function loadBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Errore caricamento');
  return result.bookings;
}
```

### Creare prenotazione
```js
async function createBooking(booking) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Errore salvataggio');
  return result.booking;
}
```

### Aggiornare prenotazione
```js
async function updateBooking(booking) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Errore aggiornamento');
  return result.booking;
}
```

### Eliminare prenotazione
```js
async function deleteBooking(id) {
  const response = await fetch(`${API_BASE_URL}/bookings?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Errore eliminazione');
}
```

## Formato JSON booking
```json
{
  "id": "optional-string-or-uuid",
  "guestName": "Mario Rossi",
  "checkIn": "2026-07-10",
  "checkOut": "2026-07-15",
  "numAdults": 2,
  "numChildren": 1,
  "depositPaid": true,
  "notes": "Arrivo tardi",
  "createdAt": "2026-04-01T12:00:00.000Z"
}
```

## Nota importante
Questo backend è volutamente minimal:
- niente login
- niente autorizzazione
- niente rate limiting
- niente audit log

Per una prima versione va bene, ma se il link API diventa pubblico chiunque dal frontend consentito può creare, modificare o cancellare prenotazioni.
