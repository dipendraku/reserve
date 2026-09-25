'use client';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { PasswordField } from '@/components/password-field';
import { useAuth } from '@/hooks/use-auth';
import supabase from '@/lib/supabase';


export default function ResetPasswordPage() {
	const { updatePassword } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [confirmation, setConfirmation] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [updated, setUpdated] = useState(false);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => setIsReady(Boolean(data.session)));
	}, []);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		if (password !== confirmation) {
			setError('Passwords do not match.');
			return;
		}
		setIsSubmitting(true);
		try {
			await updatePassword(password);
			setUpdated(true);
			setTimeout(() => navigate('/login'), 1800);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : 'Could not update your password. Try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-[70dvh] items-center justify-center bg-sky-50 px-4 py-16">
			<div className="w-full max-w-md rounded-3xl border border-[#E4ECF3] bg-white p-8 shadow-[0_2px_4px_rgba(16,24,40,0.03),0_12px_32px_rgba(16,24,40,0.06)]"><img src="/logo.png" alt="ReserveMe" className="h-10 w-auto object-contain" />{updated ? <div className="pt-8 text-center"><CheckCircle2 className="mx-auto size-12 text-[#0E63B0]" /><h1 className="mt-5 text-2xl font-semibold text-[#0B1F3A]">Password updated</h1><p className="mt-3 text-[15px] text-[#5B6B7F]">Your password is ready. Taking you to login.</p></div> : !isReady ? <div className="pt-8 text-center"><h1 className="text-2xl font-semibold text-[#0B1F3A]">Reset link expired</h1><p className="mt-3 text-[15px] leading-6 text-[#5B6B7F]">Request a new password reset link to continue.</p><Link to="/forgot-password" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#0E63B0] px-5 font-semibold text-white hover:bg-[#0d5a9e]">Request new link</Link></div> : <><h1 className="mt-7 text-2xl font-semibold text-[#0B1F3A]">Choose a new password</h1><p className="mt-2 text-[15px] leading-6 text-[#5B6B7F]">Use at least 8 characters for your new ReserveMe password.</p><form onSubmit={submit} className="mt-6 space-y-4"><PasswordField id="new-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" /><PasswordField id="confirm-password" label="Confirm password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />{error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}<button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E63B0] font-semibold text-white hover:bg-[#0d5a9e] disabled:opacity-60">{isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}Update password</button></form></>}</div>
		</div>
	);
}
