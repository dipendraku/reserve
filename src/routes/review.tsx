'use client';
import { useSearchParams } from '@/lib/next-router-compat';
import { ReviewForm } from '@/components/review-form';


export default function ReviewPage() {
	const [params] = useSearchParams();
	const appointmentId = params.get('booking') ?? '';
	return (
		<div className="bg-sky-50 px-4 py-14">
			<div className="mx-auto max-w-xl rounded-2xl border border-[#E4ECF3] bg-white p-6 sm:p-8">
				<p className="text-sm font-semibold uppercase tracking-wide text-[#0E63B0]">ReserveMe feedback</p>
				<h1 className="mt-2 text-2xl font-semibold text-[#0B1F3A]">Share your service experience</h1>
				<p className="mt-2 text-sm text-[#5B6B7F]">Reviews become available after the business marks your booking complete. Each booking can be reviewed once.</p>
				{appointmentId ? <ReviewForm appointmentId={appointmentId} /> : <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">This review link is missing its booking reference. Open the link from your booking confirmation.</p>}
			</div>
		</div>
	);
}
