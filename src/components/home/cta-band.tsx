'use client';
import { Link } from '@/lib/next-router-compat';
import { PlayCircle } from 'lucide-react';

export function CtaBand() {
	return (
		<section id="pricing" className="px-4 pb-20 lg:px-6">
			<div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-sky-50 to-[#C7DDE0] px-6 py-20 text-center">
				<h2 className="text-3xl leading-[1.2] font-semibold text-[#0B1F3A] lg:text-[2.6rem]">
					Get started with ReserveMe <br /> in minutes.
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-[17px] text-[#5B6B7F]">
					Free forever plan. No credit card required — your booking page is live before your coffee cools.
				</p>
				<div className="mt-8 flex flex-wrap justify-center gap-4">
					<Link to="/signup" className="inline-flex h-13 items-center justify-center rounded-xl bg-[#0E63B0] px-8 font-semibold text-white transition-colors hover:bg-[#0d5a9e]">
						Sign Up
					</Link>
					<Link to="/book" className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-[#E4ECF3] bg-white px-8 font-semibold text-[#0B1F3A] transition-colors hover:bg-sky-50">
						<PlayCircle className="size-5" />
						Watch video
					</Link>
				</div>
			</div>
		</section>
	);
}
