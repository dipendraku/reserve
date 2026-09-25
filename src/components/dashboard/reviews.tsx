'use client';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { AuthUser } from '@/lib/require-auth';

type Review = {
	id: string;
	rating: number;
	comment: string;
	reply: string;
	customer_name: string;
	created_at: string;
	service_ref?: { name: string } | { name: string }[] | null;
};

const first = <T,>(value: T | T[] | null | undefined): T | undefined => Array.isArray(value) ? value[0] : value ?? undefined;

export function ReviewsTab({ user }: { user: AuthUser }) {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		supabase
			.from('feedback')
			.select('id, rating, comment, reply, customer_name, created_at, service_ref:services(name)')
			.eq('owner', user.id)
			.order('created_at', { ascending: false })
			.then(({ data }) => {
				setReviews((data ?? []) as unknown as Review[]);
				setIsLoading(false);
			});
	}, [user.id]);

	const saveReply = async (id: string, reply: string) => {
		const { error } = await supabase.from('feedback').update({ reply, replied_at: new Date().toISOString() }).eq('id', id);
		if (!error) setReviews(previous => previous.map(r => r.id === id ? { ...r, reply } : r));
	};

	if (isLoading) return <p className="text-[#5B6B7F]">Loading reviews...</p>;

	if (reviews.length === 0) {
		return <p className="rounded-2xl border border-[#E4ECF3] bg-white p-6 text-[#5B6B7F]">No reviews yet — they'll appear here after customers rate their bookings.</p>;
	}

	return (
		<div className="space-y-3">
			{reviews.map(review => {
				const svc = first(review.service_ref);
				return (
					<div key={review.id} className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<div className="flex items-center justify-between">
							<p className="font-medium text-[#0B1F3A]">{review.customer_name || 'Anonymous'} · {svc?.name ?? 'Service'}</p>
							<div className="flex items-center gap-0.5 text-amber-500">
								{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-4 ${i < review.rating ? 'fill-amber-500' : 'fill-none'}`} />)}
							</div>
						</div>
						{review.comment && <p className="mt-1 text-sm text-[#5B6B7F]">{review.comment}</p>}
						<ReplyBox initial={review.reply} onSave={(reply) => saveReply(review.id, reply)} />
					</div>
				);
			})}
		</div>
	);
}

function ReplyBox({ initial, onSave }: { initial: string; onSave: (reply: string) => void }) {
	const [value, setValue] = useState(initial);
	return (
		<div className="mt-3 flex items-center gap-2">
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Reply to this review…"
				className="flex-1 rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm outline-none focus:border-[#0E63B0]"
			/>
			<button type="button" onClick={() => onSave(value)} className="rounded-lg bg-[#0E63B0] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0A4A8A]">Save</button>
		</div>
	);
}
