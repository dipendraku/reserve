'use client';
import { useState } from 'react';
import { useNavigate } from '@/lib/next-router-compat';
import { Loader2, ShieldAlert } from 'lucide-react';
import supabase from '@/lib/supabase';


// Intentionally unlinked from any nav/menu — admins reach this by URL only.
export default function AdminBackdoorLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
			if (signInError) throw signInError;

			const { data: profile } = await supabase
				.from('profiles')
				.select('role')
				.eq('id', data.user.id)
				.maybeSingle();

			if (profile?.role !== 'admin') {
				await supabase.auth.signOut();
				throw new Error('This account does not have admin access.');
			}

			navigate('/admin');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Sign in failed');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-dvh items-center justify-center bg-[#0A1B36] px-4">
			<div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#10294A] p-8 shadow-2xl">
				<div className="mb-6 flex flex-col items-center gap-2 text-center">
					<div className="flex size-11 items-center justify-center rounded-xl bg-[#0E63B0] text-white"><ShieldAlert className="size-5" /></div>
					<h1 className="text-xl font-semibold text-white">Admin access</h1>
					<p className="text-sm text-white/60">Restricted area. Authorized personnel only.</p>
				</div>

				<form onSubmit={submit} className="space-y-4">
					<div>
						<label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-white/80">Email</label>
						<input
							id="admin-email"
							type="email"
							required
							autoComplete="username"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-[#0E63B0]"
						/>
					</div>
					<div>
						<label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-white/80">Password</label>
						<input
							id="admin-password"
							type="password"
							required
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-[#0E63B0]"
						/>
					</div>

					{error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

					<button
						type="submit"
						disabled={isSubmitting}
						className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0E63B0] font-semibold text-white transition-colors hover:bg-[#0d5a9e] disabled:opacity-50"
					>
						{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Sign in'}
					</button>
				</form>
			</div>
		</div>
	);
}
