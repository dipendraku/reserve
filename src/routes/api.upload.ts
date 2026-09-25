import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabase.server';
import { withApi, apiError } from '@/lib/api.server';

export const action = withApi(async ({ request }) => {
	if (request.method !== 'POST') {
		return apiError(405, 'Method not allowed');
	}

	// Get the JWT token from Authorization header
	const authHeader = request.headers.get('authorization') || '';
	const token = authHeader.replace('Bearer ', '');

	if (!token) {
		return apiError(401, 'Missing authentication token');
	}

	// Verify the token and get the user
	const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
	if (authError || !user) {
		return apiError(401, 'Invalid authentication token');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const fileType = formData.get('type') as 'image' | 'document' | 'avatar';

		if (!file || !fileType) {
			return apiError(400, 'Missing file or type');
		}

		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('business_name')
			.eq('id', user.id)
			.single();

		if (!profile) {
			return apiError(404, 'Profile not found');
		}

		const businessFolder = join(
			process.cwd(),
			'public',
			'uploads',
			(profile.business_name?.replace(/\s+/g, '_') || user.id).toLowerCase(),
		);
		await mkdir(businessFolder, { recursive: true });

		const ext = file.name.split('.').pop() || 'bin';
		const filename = `${fileType}_${Date.now()}.${ext}`;
		const filepath = join(businessFolder, filename);
		const buffer = await file.arrayBuffer();
		await writeFile(filepath, Buffer.from(buffer));

		const columnName = fileType === 'image' ? 'business_image_filename' : fileType === 'avatar' ? 'avatar_filename' : 'business_document_filename';
		await supabaseAdmin.from('profiles').update({ [columnName]: filename }).eq('id', user.id);

		const folderSlug = (profile.business_name?.replace(/\s+/g, '_') || user.id).toLowerCase();
		return Response.json({ success: true, filename, url: `/uploads/${folderSlug}/${filename}` });
	} catch (error) {
		throw error;
	}
});
