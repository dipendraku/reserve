'use client';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@/lib/next-router-compat';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';


export default function VerifyOtpPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const email = searchParams.get('email') || '';
	const [otp, setOtp] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isVerified, setIsVerified] = useState(false);

	useEffect(() => {
		if (!email) {
			navigate('/signup');
		}
	}, [email, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, otp }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || 'Verification failed');
				return;
			}

			setIsVerified(true);
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (err) {
			setError('Network error. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	if (isVerified) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
				<div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-8 text-center shadow-lg">
					<CheckCircle2 className="mx-auto mb-4 size-12 text-green-600" />
					<h1 className="text-2xl font-semibold text-[#0B1F3A]">Email Verified!</h1>
					<p className="mt-2 text-[#5B6B7F]">Your account is now active. Redirecting to login...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
			<div className="w-full max-w-md rounded-2xl border border-[#E4ECF3] bg-white p-8 shadow-lg">
				<div className="mb-6 text-center">
					<Mail className="mx-auto mb-4 size-12 text-[#0E63B0]" />
					<h1 className="text-2xl font-semibold text-[#0B1F3A]">Verify Your Email</h1>
					<p className="mt-2 text-sm text-[#5B6B7F]">We sent a verification code to {email}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Verification Code</label>
						<input
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Enter 6-digit code"
							maxLength={6}
							className="mt-2 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2.5 text-center text-lg font-semibold tracking-widest text-[#0B1F3A] placeholder:text-[#A1ACB6] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
							required
						/>
					</div>

					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading || otp.length !== 6}
						className="w-full rounded-lg bg-[#0E63B0] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#0A4A8A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isLoading ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Verifying...
							</>
						) : (
							'Verify Email'
						)}
					</button>
				</form>

				<p className="mt-4 text-center text-sm text-[#5B6B7F]">
					Didn't receive a code?{' '}
					<button
						onClick={() => setError('Resend feature coming soon')}
						className="font-semibold text-[#0E63B0] hover:underline"
					>
						Resend
					</button>
				</p>
			</div>
		</div>
	);
}
