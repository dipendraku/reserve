import { supabaseAdmin } from '@/lib/supabase.server';

type BookingNotification = {
	appointmentId: string;
	service: string;
	date: string;
	time: string;
	name: string;
	email: string;
	phone: string;
	queueMinutes: number;
};

const bookingMessage = (booking: BookingNotification) =>
	`Your ReserveMe booking for ${booking.service} is confirmed for ${booking.date} at ${booking.time}. Estimated queue time: ${booking.queueMinutes} minutes.`;

const recordNotification = async (booking: BookingNotification, channel: 'email' | 'sms', recipient: string, status: string, providerId?: string, error?: string) => {
	await supabaseAdmin.from('notifications').insert({
		appointment: booking.appointmentId,
		channel,
		recipient,
		status,
		provider_id: providerId ?? null,
		error: error ?? null,
	});
};

const sendEmail = async (booking: BookingNotification) => {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.RESEND_FROM_EMAIL;
	if (!apiKey || !from) return;

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from,
			to: [booking.email],
			subject: `Booking confirmed: ${booking.service}`,
			text: `Hi ${booking.name},\n\n${bookingMessage(booking)}\n\nAfter your appointment is completed, you can leave a review here: ${(process.env.PUBLIC_SITE_URL || 'https://reserveme.org').replace(/\/$/, '')}/review?booking=${encodeURIComponent(booking.appointmentId)}\n\nThank you for using ReserveMe.`,
		}),
	});
	if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
	const result = await response.json() as { id?: string };
	await recordNotification(booking, 'email', booking.email, 'sent', result.id);
};

const sendSms = async (booking: BookingNotification) => {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const from = process.env.TWILIO_FROM_NUMBER;
	if (!accountSid || !authToken || !from || !booking.phone) return;

	const params = new URLSearchParams({ From: from, To: booking.phone, Body: bookingMessage(booking) });
	const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params,
	});
	if (!response.ok) throw new Error(`SMS provider returned ${response.status}`);
	const result = await response.json() as { sid?: string };
	await recordNotification(booking, 'sms', booking.phone, 'sent', result.sid);
};

export async function sendBookingNotifications(booking: BookingNotification) {
	await Promise.allSettled([
		sendEmail(booking).catch(async error => recordNotification(booking, 'email', booking.email, 'failed', undefined, error instanceof Error ? error.message : String(error))),
		sendSms(booking).catch(async error => booking.phone && recordNotification(booking, 'sms', booking.phone, 'failed', undefined, error instanceof Error ? error.message : String(error))),
	]);
}
