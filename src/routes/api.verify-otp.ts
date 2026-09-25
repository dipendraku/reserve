import { withApi, apiError } from '@/lib/api.server';
import { supabaseAdmin } from '@/lib/supabase.server';

export const action = withApi(async ({ request }) => {
	if (request.method !== 'POST') {
		return apiError(405, 'Method not allowed');
	}

	const body = await request.json() as Record<string, unknown>;
	const email = String(body.email ?? '').trim().toLowerCase();
	const otp = String(body.otp ?? '').trim();

	if (!email || !otp) {
		return apiError(400, 'Email and OTP are required');
	}

	try {
		// Get user by email
		const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
		if (userError) throw userError;

		const user = users.find(u => u.email === email);
		if (!user) {
			return apiError(404, 'User not found');
		}

		// Verify OTP using the database function
		const { data, error } = await supabaseAdmin.rpc('verify_otp', {
			user_id: user.id,
			otp_input: otp,
		});

		if (error) throw error;

		if (!data) {
			return apiError(400, 'Invalid or expired OTP');
		}

		return Response.json({ success: true, message: 'Email verified successfully' });
	} catch (error) {
		throw error;
	}
});
