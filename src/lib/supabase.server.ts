import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
	console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Server Supabase features will not work until they are configured.');
}

export const supabaseAdmin = createClient(
	supabaseUrl ?? 'https://placeholder.supabase.co',
	serviceRoleKey ?? 'placeholder-service-role-key',
	{ auth: { autoRefreshToken: false, persistSession: false } },
);

export default supabaseAdmin;
