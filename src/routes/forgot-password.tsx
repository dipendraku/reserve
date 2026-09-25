'use client';
import { type FormEvent, useState } from 'react';
import { Link } from '@/lib/next-router-compat';
import { Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';


export default function ForgotPasswordPage() {
	const { resetPassword } = useAuth();
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputClass = 'h-12 w-full rounded-xl border border-[#D1D6D9] bg-white px-4 text-[15px] text-[#0B1F3A] outline-none transition-colors placeholder:text-[#9AA7B5] focus:border-[#0E63B0] focus:ring-2 focus:ring-[#0E63B0]/20';

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			await resetPassword(email);
			setSent(true);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : 'Could not send the reset email. Try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-[70dvh] items-center justify-center bg-sky-50 px-4 py-16">
			<div className="w-full max-w-md rounded-3xl border border-[#E4ECF3] bg-white p-8 shadow-[0_2px_4px_rgba(16,24,40,0.03),0_12px_32px_rgba(16,24,40,0.06)]">
				<img src="/logo.png" alt="ReserveMe" className="h-10 w-auto object-contain" />
				{sent ? (
					<div className="pt-8 text-center"><MailCheck className="mx-auto size-12 text-[#0E63B0]" /><h1 className="mt-5 text-2xl font-semibold text-[#0B1F3A]">Check your inbox</h1><p className="mt-3 text-[15px] leading-6 text-[#5B6B7F]">If an account exists for {email}, we sent a secure link to reset your password.</p><Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#0E63B0] px-5 font-semibold text-white hover:bg-[#0d5a9e]">Back to login</Link></div>
				) : (
					<><h1 className="mt-7 text-2xl font-semibold text-[#0B1F3A]">Forgot your password?</h1><p className="mt-2 text-[15px] leading-6 text-[#5B6B7F]">Enter your account email and we will send you a secure reset link.</p><form onSubmit={submit} className="mt-6 space-y-4"><div><label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Email</label><input id="reset-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@studio.com" autoComplete="email" className={inputClass} /></div>{error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}<button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E63B0] font-semibold text-white hover:bg-[#0d5a9e] disabled:opacity-60">{isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}Send reset link</button></form><p className="mt-6 text-center text-[15px] text-[#5B6B7F]"><Link to="/login" className="font-semibold text-[#0E63B0] hover:underline">Back to login</Link></p></>
				)}
			</div>
		</div>
	);
}
