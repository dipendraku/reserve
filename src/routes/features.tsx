'use client';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link } from '@/lib/next-router-compat';
import { PRODUCT_FEATURES } from '@/data/product-pages';


export default function FeaturesPage() {
	return (
		<div className="bg-white">
			<section className="overflow-hidden bg-[#0A1B36] px-4 py-20 text-white lg:px-6 lg:py-28">
				<div className="mx-auto max-w-7xl">
					<div className="max-w-3xl">
						<div className="flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-[#38C3FF] uppercase"><Sparkles className="size-4" /> Built for service businesses</div>
						<h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Everything your next booking needs.</h1>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">ReserveMe brings your services, schedule, clients, payments, and customer communication into one calm business cockpit.</p>
					</div>
					<div className="mt-12 grid gap-3 sm:grid-cols-3">
						{['Publish in minutes', 'Book around your hours', 'Know what is next'].map(item => <div key={item} className="border-l-2 border-[#38C3FF] pl-4 text-[15px] text-white/80">{item}</div>)}
					</div>
				</div>
			</section>

			<section className="bg-sky-50 px-4 py-16 lg:px-6 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="max-w-2xl"><p className="text-sm font-semibold tracking-[0.16em] text-[#0E63B0] uppercase">One connected toolkit</p><h2 className="mt-3 text-3xl font-semibold text-[#0B1F3A] lg:text-4xl">Less admin. More time doing the work.</h2></div>
					<div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
						{PRODUCT_FEATURES.map(feature => <article key={feature.title} className="rounded-2xl border border-[#E4ECF3] bg-white p-6 shadow-[0_8px_24px_rgba(16,24,40,0.04)]"><span className="flex size-11 items-center justify-center rounded-xl bg-[#0E63B0] text-white"><feature.icon className="size-5" /></span><h3 className="mt-5 text-lg font-semibold text-[#0B1F3A]">{feature.title}</h3><p className="mt-3 text-[15px] leading-6 text-[#5B6B7F]">{feature.text}</p></article>)}
					</div>
					<div className="mt-12 flex flex-wrap gap-4"><Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0E63B0] px-6 font-semibold text-white hover:bg-[#0d5a9e]">Start for free <ArrowRight className="size-4" /></Link><Link to="/pricing" className="inline-flex h-12 items-center rounded-xl border border-[#D1D6D9] bg-white px-6 font-semibold text-[#0B1F3A] hover:bg-sky-50">See pricing</Link></div>
				</div>
			</section>

			<section className="px-4 py-16 lg:px-6 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-semibold tracking-[0.16em] text-[#0E63B0] uppercase">Made to scale with you</p><h2 className="mt-3 text-3xl font-semibold text-[#0B1F3A] lg:text-4xl">A professional experience for every client.</h2></div><ul className="grid gap-4 sm:grid-cols-2">{['One link for every channel', 'Live availability customers can trust', 'Estimated queue time at booking', 'A clear record of every appointment', 'Provider and admin workspaces', 'Email and SMS-ready confirmations'].map(item => <li key={item} className="flex items-start gap-3 border-b border-[#E4ECF3] pb-4 text-[15px] text-[#5B6B7F]"><Check className="mt-0.5 size-5 shrink-0 text-[#0E63B0]" />{item}</li>)}</ul></div></section>
		</div>
	);
}
