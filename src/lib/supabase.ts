import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Supabase features will not work until they are configured.');
}

export const supabase = createClient(
	supabaseUrl ?? 'https://placeholder.supabase.co',
	supabaseAnonKey ?? 'placeholder-anon-key',
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	},
);

export default supabase;
