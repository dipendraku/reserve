'use client';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/lib/next-router-compat';
import { INDUSTRIES } from '@/data/product-pages';


export default function IndustriesPage() {
	return (
		<div className="bg-white">
			<section className="bg-[#EAF7FA] px-4 py-20 lg:px-6 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="text-sm font-semibold tracking-[0.16em] text-[#0E63B0] uppercase">For people who sell their time</p><h1 className="mt-5 text-4xl leading-tight font-semibold text-[#0B1F3A] sm:text-5xl lg:text-6xl">Your industry has its rhythm. Your booking system should too.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#5B6B7F]">From a single practitioner to a busy multi-location team, ReserveMe adapts to the way your customers discover, choose, and book your services.</p></div></div></section>
			<section className="px-4 py-16 lg:px-6 lg:py-24"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-semibold tracking-[0.16em] text-[#0E63B0] uppercase">Built around real workflows</p><h2 className="mt-3 text-3xl font-semibold text-[#0B1F3A] lg:text-4xl">A better customer journey, whatever you provide.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{INDUSTRIES.map(industry => <article key={industry.name} className="group rounded-2xl border border-[#E4ECF3] bg-white p-7 transition-transform hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)]"><span className="flex size-12 items-center justify-center rounded-xl bg-[#0A1B36] text-[#38C3FF]"><industry.icon className="size-6" /></span><h3 className="mt-6 text-xl font-semibold text-[#0B1F3A]">{industry.name}</h3><p className="mt-3 text-[15px] leading-6 text-[#5B6B7F]">{industry.text}</p><Link to="/signup" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0E63B0]">Create your page <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></article>)}</div></div></section>
			<section className="bg-[#0A1B36] px-4 py-16 text-white lg:px-6 lg:py-20"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center"><div><p className="text-sm font-semibold tracking-[0.16em] text-[#38C3FF] uppercase">One platform, many specialties</p><h2 className="mt-3 text-3xl font-semibold lg:text-4xl">Give customers the confidence to book.</h2><p className="mt-5 max-w-xl text-[17px] leading-7 text-white/70">Show the right details before the appointment: what you offer, how long it takes, what it costs, and when you are available.</p></div><ul className="grid gap-4 sm:grid-cols-2">{['Service details that answer questions', 'Availability shaped around your week', 'Queue estimates at confirmation', 'Email and SMS booking updates'].map(item => <li key={item} className="flex gap-3 text-[15px] text-white/80"><Check className="size-5 shrink-0 text-[#38C3FF]" />{item}</li>)}</ul></div></section>
		</div>
	);
}
