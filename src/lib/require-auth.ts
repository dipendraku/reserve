import { redirect } from '@/lib/next-router-compat';
import supabase from '@/lib/supabase';

export type AuthUser = {
	id: string;
	email?: string;
	name: string;
	businessName: string;
	phone: string;
	role: 'client' | 'provider' | 'admin';
};

/**
 * Guard a protected route. The session lives in localStorage, so this belongs
 * in `clientLoader` — a server `loader` cannot see it. That is by design, not
 * a limitation: published sites edge-cache every server GET response (HTML,
 * `.data`) by URL for ALL visitors, so server-rendered output must never
 * depend on who is asking. Never move auth to cookies or a server
 * loader/middleware — the first user's page would be cached and served to
 * everyone. Put the guard on a layout route to cover a whole section at once:
 *
 *   export const clientLoader = () => ({ user: requireAuth() });
 *   clientLoader.hydrate = true as const;
 *   export function HydrateFallback() { return <div />; }
 *
 * `hydrate` is what makes the check run on a hard page load, and
 * `HydrateFallback` keeps the protected UI from rendering for a frame before
 * the redirect.
 */
export async function requireAuth(redirectTo = '/login'): Promise<AuthUser> {
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) throw redirect(redirectTo);

	const { data: profile } = await supabase
		.from('profiles')
		.select('name, business_name, phone, role')
		.eq('id', user.id)
		.maybeSingle();

	return {
		id: user.id,
		email: user.email,
		name: profile?.name ?? user.user_metadata.name ?? '',
		businessName: profile?.business_name ?? user.user_metadata.businessName ?? '',
		phone: profile?.phone ?? '',
		role: profile?.role ?? 'client',
	};
}

export default requireAuth;
