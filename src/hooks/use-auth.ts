import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';

/**
 * Session state for the signed-in Supabase user: user, isAuthed, isLoading,
 * login, signup, logout. No provider to mount — every caller reads the same
 * `pb.authStore`.
 *
 * The JWT is persisted in localStorage, which the server cannot read, so the
 * session is filled in after hydration. Render on `isLoading` (a spinner, a
 * skeleton) instead of the signed-out state, or a signed-in visitor sees a
 * "Sign in" button flash on every page load.
 */
export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setUser(data.session?.user ?? null);
			setIsLoading(false);
		});

		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => listener.subscription.unsubscribe();
	}, []);

	return useMemo(
		() => ({
			user,
			isAuthed: Boolean(user),
			isLoading,
			login: (email: string, password: string) =>
				supabase.auth.signInWithPassword({ email, password }).then(result => {
				if (result.error) throw result.error;
				return result;
			}),
			loginGoogle: () => supabase.auth.signInWithOAuth({
				provider: 'google',
				options: { redirectTo: `${window.location.origin}/login` },
			}).then(result => {
				if (result.error) throw result.error;
				return result;
			}),
			resetPassword: (email: string) => supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			}).then(result => {
				if (result.error) throw result.error;
				return result;
			}),
			updatePassword: (password: string) => supabase.auth.updateUser({ password }).then(result => {
				if (result.error) throw result.error;
				return result;
			}),
			signup: async (
				email: string,
				password: string,
				extraFields: Record<string, unknown> = {},
			) => {
				return supabase.auth.signUp({
					email,
					password,
					options: { data: extraFields },
				}).then(result => {
					if (result.error) throw result.error;
					return result;
				});
			},
			logout: () => supabase.auth.signOut(),
		}),
		[user, isLoading],
	);
}

export default useAuth;
