'use client';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from '@/lib/next-router-compat';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GoogleMark } from '@/components/google-mark';
import { PasswordField } from '@/components/password-field';

const authErrorMessage = (error: unknown, isSignup: boolean) => {
	const message = error instanceof Error ? error.message.toLowerCase() : '';
	if (message.includes('invalid login credentials')) return 'The email or password is incorrect. Check both and try again.';
	if (message.includes('email not confirmed')) return 'Confirm your email address first, then try logging in again.';
	if (message.includes('already registered') || message.includes('already been registered')) return 'An account already exists with this email. Try logging in instead.';
	if (message.includes('password')) return isSignup ? 'Use a password with at least 8 characters.' : 'That password was not accepted. Check it and try again.';
	return isSignup ? 'Could not create your account. Check the details and try again.' : 'Could not log you in. Check your connection and try again.';
};

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
	const { login, loginGoogle, signup } = useAuth();
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const isSignup = mode === 'signup';

	const [name, setName] = useState('');
	const [businessName, setBusinessName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const pageHandle = params.get('page') ?? '';

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			if (isSignup) {
				const result = await signup(email, password, { name, businessName, provider: true });
				if (!result.data.user) throw new Error('Signup failed');

				// Generate and send OTP
				await fetch('/api/generate-otp', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: result.data.user.id }),
				});

				// Redirect to OTP verification page
				navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
			} else {
				await login(email, password);
				navigate('/dashboard');
			}
		} catch (error) {
			setError(authErrorMessage(error, isSignup));
		} finally {
			setIsSubmitting(false);
		}
	};

	const inputClass = 'h-12 w-full rounded-xl border border-[#D1D6D9] bg-white px-4 text-[15px] text-[#0B1F3A] outline-none transition-colors placeholder:text-[#9AA7B5] focus:border-[#0E63B0] focus:ring-2 focus:ring-[#0E63B0]/20';

	return (
		<div className="flex min-h-[70dvh] items-center justify-center bg-sky-50 px-4 py-16">
			<div className="w-full max-w-md rounded-3xl border border-[#E4ECF3] bg-white p-8 shadow-[0_2px_4px_rgba(16,24,40,0.03),0_12px_32px_rgba(16,24,40,0.06)]">
				<div className="flex items-center gap-2">
					<img src="/logo.png" alt="ReserveMe" className="h-10 w-auto object-contain" />
				</div>
				<h1 className="mt-6 text-2xl font-semibold text-[#0B1F3A]">
					{isSignup ? 'Create your free booking page' : 'Welcome back'}
				</h1>
				<p className="mt-2 text-[15px] text-[#5B6B7F]">
					{isSignup
						? pageHandle
							? `Claim reserveme.org/${pageHandle} and start taking bookings in minutes.`
							: 'Start taking bookings in minutes — no credit card required.'
						: 'Log in to your business cockpit.'}
				</p>
				{!isSignup ? (
					<button
						type="button"
						onClick={() => loginGoogle()}
						className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-[#D1D6D9] font-semibold text-[#0B1F3A] transition-colors hover:bg-sky-50"
					>
						<GoogleMark />
						<span className="ml-2">Continue with Google</span>
					</button>
				) : null}

				<form onSubmit={submit} className={`${isSignup ? 'mt-6' : 'mt-4'} space-y-4`}>
					{isSignup ? (
						<>
							<div>
								<label htmlFor="auth-name" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Your name</label>
								<input id="auth-name" required value={name} onChange={event => setName(event.target.value)} placeholder="Sofia Marek" className={inputClass} />
							</div>
							<div>
								<label htmlFor="auth-business" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Business name</label>
								<input id="auth-business" required value={businessName} onChange={event => setBusinessName(event.target.value)} placeholder="Glow Studio" className={inputClass} />
							</div>
						</>
					) : null}
					<div>
						<label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Email</label>
						<input id="auth-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@studio.com" autoComplete="email" className={inputClass} />
					</div>
					<PasswordField id="auth-password" label="Password" value={password} onChange={setPassword} autoComplete={isSignup ? 'new-password' : 'current-password'} />

					{error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E63B0] font-semibold text-white transition-colors hover:bg-[#0d5a9e] disabled:opacity-60"
					>
						{isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
						{isSignup ? 'Sign Up Free' : 'Log in'}
					</button>
				</form>
				{!isSignup ? <Link to="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-[#0E63B0] hover:underline">Forgot your password?</Link> : null}

				<p className="mt-6 text-center text-[15px] text-[#5B6B7F]">
					{isSignup ? (
						<>Already have an account? <Link to="/login" className="font-semibold text-[#0E63B0] hover:underline">Log in</Link></>
					) : (
						<>New to ReserveMe? <Link to="/signup" className="font-semibold text-[#0E63B0] hover:underline">Sign up free</Link></>
					)}
				</p>
			</div>
		</div>
	);
}
