import { apiError, readJsonBody, withApi } from '@/lib/api.server';
import { supabaseAdmin } from '@/lib/supabase.server';

/**
 * Public review submission for a completed booking. Runs server-side so we
 * can validate the appointment exists before writing feedback — anonymous
 * clients never get direct insert access to the feedback table.
 */
export const action = withApi(async ({ request }) => {
	if (request.method !== 'POST') {
		return apiError(405, 'Method not allowed');
	}

	const body = (await readJsonBody(request)) as Record<string, unknown>;
	const appointmentId = String(body.appointmentId ?? '');
	if (body.intent === 'check') {
		if (!/^[0-9a-f-]{36}$/i.test(appointmentId)) return apiError(422, 'A valid appointmentId is required');
		const { data: appointment, error: checkError } = await supabaseAdmin
			.from('appointments')
			.select('id')
			.eq('id', appointmentId)
			.eq('status', 'completed')
			.maybeSingle();
		if (checkError) throw checkError;
		if (!appointment) return Response.json({ eligible: false });
		const { data: existing, error: existingError } = await supabaseAdmin.from('feedback').select('id').eq('booking', appointmentId).maybeSingle();
		if (existingError) throw existingError;
		return Response.json({ eligible: !existing });
	}
	const rating = Number(body.rating ?? 0);
	const comment = String(body.comment ?? '').trim();

	if (!/^[0-9a-f-]{36}$/i.test(appointmentId)) return apiError(422, 'A valid appointmentId is required');
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) return apiError(422, 'Rating must be between 1 and 5');

	const { data: appointment, error: appointmentError } = await supabaseAdmin
		.from('appointments')
		.select('id, owner, service, client_ref:clients(name, email)')
		.eq('id', appointmentId)
		.eq('status', 'completed')
		.maybeSingle();

	if (appointmentError) throw appointmentError;
	if (!appointment) return apiError(404, 'A completed booking is required to leave a review');

	const client = Array.isArray(appointment.client_ref) ? appointment.client_ref[0] : appointment.client_ref;

	const { error } = await supabaseAdmin.from('feedback').insert({
		owner: appointment.owner,
		service: appointment.service,
		booking: appointment.id,
		rating,
		comment,
		customer_name: client?.name ?? '',
		customer_email: client?.email ?? '',
	});

	if (error) {
		if (error.message.toLowerCase().includes('duplicate') || error.message.toLowerCase().includes('unique')) {
			return apiError(409, 'You already reviewed this booking');
		}
		throw error;
	}

	return Response.json({ ok: true });
});
