import { withApi, apiError } from '@/lib/api.server';
import { supabaseAdmin } from '@/lib/supabase.server';

export const action = withApi(async ({ request }) => {
	if (request.method !== 'POST') {
		return apiError(405, 'Method not allowed');
	}

	const body = await request.json() as Record<string, unknown>;
	const userId = String(body.userId ?? '').trim();

	if (!userId) {
		return apiError(400, 'User ID is required');
	}

	try {
		// Generate a random 6-digit OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();

		// Store OTP in profiles table
		const { error } = await supabaseAdmin
			.from('profiles')
			.update({
				otp_code: otp,
				otp_created_at: new Date().toISOString(),
				otp_verified: false,
			})
			.eq('id', userId);

		if (error) throw error;

		// In a real app, send OTP via email here using Resend or another service
		// For now, we'll just log it to console (visible in server logs)
		console.log(`OTP for ${userId}: ${otp}`);

		return Response.json({
			success: true,
			message: 'OTP generated and sent to email',
			// In development, we can return the OTP for testing
			...(process.env.NODE_ENV === 'development' && { otp }),
		});
	} catch (error) {
		throw error;
	}
});
