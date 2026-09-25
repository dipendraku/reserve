'use client';
import { useEffect, useState } from 'react';
import { Clock, MapPin, Phone, Star, X } from 'lucide-react';
import type { Provider } from '@/routes/find-pro';
import supabase from '@/lib/supabase';

type BusinessProfileModalProps = {
	provider: Provider;
	initialServiceId?: string | null;
	onClose: () => void;
};

type Review = { id: string; service: string | null; rating: number; comment: string; reply: string; customer_name: string; created_at: string };

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function BusinessProfileModal({ provider, initialServiceId, onClose }: BusinessProfileModalProps) {
	const businessImageUrl = provider.business_image_filename
		? `/uploads/${(provider.business_name || 'unknown').replace(/\s+/g, '_').toLowerCase()}/${provider.business_image_filename}`
		: null;

	const [reviews, setReviews] = useState<Review[]>([]);

	useEffect(() => {
		supabase
			.from('feedback')
			.select('id, service, rating, comment, reply, customer_name, created_at')
			.eq('owner', provider.id)
			.order('created_at', { ascending: false })
			.then(({ data }) => setReviews((data ?? []) as Review[]));
	}, [provider.id]);

	const averageRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
			<div
				className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="relative">
					{businessImageUrl ? (
						<img src={businessImageUrl} alt={provider.business_name} className="h-48 w-full object-cover" />
					) : (
						<div className="flex h-32 w-full items-center justify-center bg-sky-50">
							<MapPin className="size-10 text-[#A1ACB6]" />
						</div>
					)}
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-[#0B1F3A] shadow hover:bg-white"
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="p-6">
					<h2 className="text-xl font-semibold text-[#0B1F3A]">{provider.business_name || provider.name}</h2>

					{averageRating !== null && (
						<div className="mt-1 flex items-center gap-1.5 text-sm">
							<div className="flex items-center gap-0.5 text-amber-500">
								{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-4 ${i < Math.round(averageRating) ? 'fill-amber-500' : 'fill-none'}`} />)}
							</div>
							<span className="text-[#5B6B7F]">{averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
						</div>
					)}

					<div className="mt-2 space-y-1.5 text-sm text-[#5B6B7F]">
						{provider.address && (
							<div className="flex items-center gap-2">
								<MapPin className="size-4 flex-shrink-0" />
								<span>{provider.address}</span>
							</div>
						)}
						{provider.phone && (
							<div className="flex items-center gap-2">
								<Phone className="size-4 flex-shrink-0" />
								<a href={`tel:${provider.phone}`} className="hover:text-[#0E63B0]">{provider.phone}</a>
							</div>
						)}
						{provider.distance !== undefined && <p>{provider.distance} miles away</p>}
					</div>

					<h3 className="mt-5 mb-2 font-semibold text-[#0B1F3A]">Services</h3>

					{provider.services.length === 0 ? (
						<p className="text-sm text-[#5B6B7F]">This business hasn't listed any services yet.</p>
					) : (
						<div className="space-y-2">
							{provider.services.map(service => (
								<ServiceCard
									key={service.id}
									service={service}
									initialServiceId={initialServiceId}
									reviews={reviews.filter(review => review.service === service.id)}
								/>
							))}
						</div>
					)}

					{reviews.length > 0 && (
						<>
							<h3 className="mt-5 mb-2 font-semibold text-[#0B1F3A]">Reviews</h3>
							<div className="space-y-3">
								{reviews.map(review => (
									<div key={review.id} className="rounded-lg border border-[#E4ECF3] p-3">
										<div className="flex items-center justify-between">
											<p className="text-sm font-medium text-[#0B1F3A]">{review.customer_name || 'Anonymous'}</p>
											<div className="flex items-center gap-0.5 text-amber-500">
												{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-amber-500' : 'fill-none'}`} />)}
											</div>
										</div>
										{review.comment && <p className="mt-1 text-sm text-[#5B6B7F]">{review.comment}</p>}
										{review.reply && (
											<p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-[#0B1F3A]"><span className="font-semibold">Business reply:</span> {review.reply}</p>
										)}
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function ServiceCard({ service, initialServiceId, reviews }: {
	service: Provider['services'][number];
	initialServiceId?: string | null;
	reviews: Review[];
}) {
	const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;
	return (
		<div className={`rounded-lg border p-3 ${service.id === initialServiceId ? 'border-[#0E63B0] ring-2 ring-[#0E63B0]/20' : 'border-[#E4ECF3]'}`}>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-medium text-[#0B1F3A]">{service.name}</p>
					{service.description && <p className="mt-0.5 text-xs text-[#5B6B7F]">{service.description}</p>}
					<p className="mt-1 flex items-center gap-1 text-xs text-[#5B6B7F]"><Clock className="size-3.5" />{service.duration_min} min</p>
					{average !== null && <p className="mt-2 flex items-center gap-1 text-xs text-[#5B6B7F]"><Star className="size-3.5 fill-amber-500 text-amber-500" />{average.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? '' : 's'}</p>}
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2"><span className="font-semibold text-[#0B1F3A]">{money(service.price_cents)}</span><a href={`/book?service=${service.id}`} className="rounded-lg bg-[#0E63B0] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0A4A8A]">Book Now</a></div>
			</div>
			{reviews.length > 0 && <div className="mt-3 space-y-2 border-t border-[#E4ECF3] pt-3">{reviews.slice(0, 3).map(review => <div key={review.id} className="text-xs"><p className="font-medium text-[#0B1F3A]">{review.customer_name || 'Customer'} · {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>{review.comment && <p className="mt-0.5 text-[#5B6B7F]">{review.comment}</p>}{review.reply && <p className="mt-1 text-[#0E63B0]">Business reply: {review.reply}</p>}</div>)}</div>}
		</div>
	);
}
