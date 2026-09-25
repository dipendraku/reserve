'use client';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/data/landing';

function Stars() {
	return (
		<div className="flex gap-0.5 text-[#F5A623]">
			{Array.from({ length: 5 }, (_, index) => (
				<Star key={index} className="size-4 fill-current" />
			))}
		</div>
	);
}

export function Testimonials() {
	return (
		<section id="resources" className="overflow-hidden py-16 lg:py-24">
			<div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
				<div className="flex justify-center">
					<Stars />
				</div>
				<h2 className="mt-4 text-3xl leading-[1.2] font-semibold text-[#0B1F3A] lg:text-[2.6rem]">
					Top-rated in booking management
				</h2>
				<p className="mt-3 text-[17px] text-[#5B6B7F]">See why real users love scheduling with ReserveMe</p>
			</div>

			<div className="mt-12 flex gap-5 overflow-x-auto px-4 pb-4 lg:px-[max(1rem,calc((100vw-80rem)/2))]">
				{TESTIMONIALS.map(review => (
					<article key={review.name} className="w-[320px] shrink-0 rounded-2xl border border-[#E4ECF3] bg-white p-6 text-left shadow-[0_2px_4px_rgba(16,24,40,0.03),0_12px_32px_rgba(16,24,40,0.05)]">
						<div className="flex items-center justify-between">
							<Stars />
							<span className="text-sm text-[#5B6B7F]">{review.date}</span>
						</div>
						<h3 className="mt-4 text-[17px] font-semibold text-[#0B1F3A]">“{review.title}”</h3>
						<p className="mt-3 text-[15px] leading-6 text-[#5B6B7F]">{review.text}</p>
						<p className="mt-5 text-[15px] font-semibold text-[#0B1F3A]">{review.name}</p>
						<p className="text-sm text-[#5B6B7F]">{review.role}</p>
					</article>
				))}
			</div>
		</section>
	);
}
