import { apiError, withApi } from '@/lib/api.server';
import { supabaseAdmin } from '@/lib/supabase.server';

/**
 * Public slot check for the booking page: returns only the taken start times
 * for one service on one date — never client or appointment details.
 */
export const loader = withApi(async ({ request }) => {
	const url = new URL(request.url);
	const serviceId = url.searchParams.get('serviceId') ?? '';
	const date = url.searchParams.get('date') ?? '';

	if (!/^[0-9a-f-]{36}$/i.test(serviceId)) {
		return apiError(422, 'A valid serviceId is required');
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return apiError(422, 'date must be YYYY-MM-DD');
	}

	const { data: service, error: serviceError } = await supabaseAdmin
		.from('services')
		.select('owner, duration_min')
		.eq('id', serviceId)
		.eq('active', true)
		.single();

	if (serviceError || !service) return apiError(404, 'That service is no longer available');

	const weekday = new Date(`${date}T00:00:00`).getDay();
	const { data: windows, error: windowsError } = await supabaseAdmin
		.from('availability')
		.select('start_time, end_time')
		.eq('owner', service.owner)
		.eq('weekday', weekday)
		.order('start_time');

	if (windowsError) throw windowsError;

	const { data, error } = await supabaseAdmin
		.from('appointments')
		.select('time')
		.eq('service', serviceId)
		.eq('date', date)
		.neq('status', 'cancelled');

	if (error) throw error;

	const taken = new Set(data.map(item => String(item.time).slice(0, 5)));
	const toMinutes = (value: string) => {
		const [hours, minutes] = value.split(':').map(Number);
		return hours * 60 + minutes;
	};
	const toTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
	const slots = (windows ?? []).flatMap(window => {
		const start = toMinutes(String(window.start_time));
		const end = toMinutes(String(window.end_time));
		const values: string[] = [];
		for (let cursor = start; cursor + service.duration_min <= end; cursor += service.duration_min) values.push(toTime(cursor));
		return values;
	});

	return Response.json({ taken: [...taken], slots });
});
