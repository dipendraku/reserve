'use client';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

type Availability = 'checking' | 'ready' | 'pending' | 'submitted' | 'error';

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [status, setStatus] = useState<Availability>('checking');

	useEffect(() => {
		let active = true;
		fetch('/api/review', {
			method: 'POST', headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ appointmentId, intent: 'check' }),
		}).then(async response => {
			const result = await response.json();
			if (active) setStatus(response.ok && result.eligible ? 'ready' : response.ok ? 'pending' : 'error');
		}).catch(() => { if (active) setStatus('error'); });
		return () => { active = false; };
	}, [appointmentId]);

	const submit = async () => {
		setStatus('checking');
		try {
			const response = await fetch('/api/review', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ appointmentId, rating, comment }),
			});
			setStatus(response.ok ? 'submitted' : 'error');
		} catch {
			setStatus('error');
		}
	};

	if (status === 'checking') return <p className="mt-3 text-sm text-[#5B6B7F]">Checking whether your appointment is ready for a review…</p>;
	if (status === 'pending') return <p className="mt-3 rounded-lg bg-sky-50 p-3 text-sm text-[#5B6B7F]">You can leave a review once the business marks this appointment as completed.</p>;
	if (status === 'submitted') return <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Thank you. Your review is now public on this business profile.</p>;
	if (status === 'error') return <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">We could not check or submit your review. Please try again later.</p>;

	return (
		<div className="mt-4 rounded-xl border border-[#E4ECF3] p-4 text-left">
			<p className="mb-2 text-sm font-semibold text-[#0B1F3A]">Rate your completed appointment</p>
			<div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star`}><Star className={`size-6 ${value <= rating ? 'fill-amber-500 text-amber-500' : 'text-[#D1D6D9]'}`} /></button>)}</div>
			<textarea rows={3} value={comment} onChange={event => setComment(event.target.value)} placeholder="Tell others about your experience (optional)" className="mt-3 w-full rounded-lg border border-[#D1D6D9] px-3 py-2 text-sm outline-none focus:border-[#0E63B0]" />
			<button type="button" onClick={submit} className="mt-3 rounded-lg bg-[#0E63B0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A4A8A]">Submit review</button>
		</div>
	);
}
