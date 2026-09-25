import { apiError, readJsonBody, withApi } from '@/lib/api.server';
import { sendBookingNotifications } from '@/lib/notifications.server';
import { supabaseAdmin } from '@/lib/supabase.server';

const PAYMENT_METHODS = new Set(['card_upfront', 'cash', 'app']);
const EMAIL_PATTERN = /^[^\s@"]+@[^\s@"]+\.[^\s@"]+$/;

/**
 * Public booking endpoint. Runs server-side because one booking is a small
 * orchestration: resolve the service, reject double-booked slots, find-or-create
 * the client profile, then write the appointment with its payment tracking.
 */
export const action = withApi(async ({ request }) => {
	if (request.method !== 'POST') {
		return apiError(405, 'Method not allowed');
	}

	const body = (await readJsonBody(request)) as Record<string, unknown>;
	const serviceId = String(body.serviceId ?? '');
	const date = String(body.date ?? '');
	const time = String(body.time ?? '');
	const name = String(body.name ?? '').trim();
	const email = String(body.email ?? '').trim().toLowerCase();
	const phone = String(body.phone ?? '').trim();
	const notes = String(body.notes ?? '').trim();
	const payment = String(body.payment ?? 'unpaid');

	if (!/^[0-9a-f-]{36}$/i.test(serviceId)) return apiError(422, 'Choose a service');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return apiError(422, 'Pick a date');
	if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return apiError(422, 'Pick a time slot');
	if (name.length < 2) return apiError(422, 'Your name is required');
	if (!EMAIL_PATTERN.test(email)) return apiError(422, 'A valid email is required');
	if (!PAYMENT_METHODS.has(payment)) return apiError(422, 'Choose how you will pay');

	const { data, error } = await supabaseAdmin.rpc('create_booking', {
		p_service: serviceId,
		p_date: date,
		p_time: time,
		p_name: name,
		p_email: email,
		p_phone: phone,
		p_notes: notes,
		p_payment: payment,
	});

	if (error) {
		if (error.message.toLowerCase().includes('taken')) return apiError(409, error.message);
		if (error.message.toLowerCase().includes('available')) return apiError(422, error.message);
		throw error;
	}

	const booking = (Array.isArray(data) ? data[0] : data) as {
		appointment_id: string;
		service_name: string;
		price_cents: number;
		queue_minutes: number;
	};

	await sendBookingNotifications({
		appointmentId: booking.appointment_id,
		service: booking.service_name,
		date,
		time,
		name,
		email,
		phone,
		queueMinutes: booking.queue_minutes,
	});

	return Response.json({
		ok: true,
		appointmentId: booking.appointment_id,
		service: booking.service_name,
		date,
		time,
		priceCents: booking.price_cents,
		estimatedQueueMinutes: booking.queue_minutes,
	});
});
