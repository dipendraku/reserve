'use client';
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from '@/lib/next-router-compat';
import { ArrowLeft, ArrowRight, ArrowUpRight, PlayCircle } from 'lucide-react';

const SLIDES = [
	{
		image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85',
		name: 'Maya Chen',
		role: 'Creative consultant',
		category: 'Consulting',
		caption: 'Turn your expertise into an easy next step.',
	},
	{
		image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85',
		name: 'Ari Wellness',
		role: 'Wellness studio',
		category: 'Wellness',
		caption: 'Give every client a calmer way to book.',
	},
	{
		image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85',
		name: 'Northstar Collective',
		role: 'Service team',
		category: 'Business services',
		caption: 'Keep your team moving from one clear cockpit.',
	},
] as const;

export function Hero() {
	const navigate = useNavigate();
	const [handle, setHandle] = useState('');
	const [activeSlide, setActiveSlide] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => setActiveSlide(previous => (previous + 1) % SLIDES.length), 5500);
		return () => window.clearInterval(timer);
	}, []);

	const claim = (event: FormEvent) => {
		event.preventDefault();
		navigate(handle.trim() ? `/signup?page=${encodeURIComponent(handle.trim())}` : '/signup');
	};

	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-[#0A1B36] via-[#0E3A6E] to-[#1E7CC4]">
			<div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-14 pb-16 lg:grid-cols-2 lg:gap-10 lg:px-6 lg:pt-20 lg:pb-0">
				<div>
					<h1 className="text-4xl leading-[1.15] font-semibold text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.12]">
						The Booking Platform <br className="hidden lg:block" />
						That Elevates <span className="text-[#38C3FF]">your earning potential</span>
					</h1>
					<p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
						Streamline online bookings, payments, and client management with the all-in-one scheduling and appointment booking software.
					</p>

					<form onSubmit={claim} className="mt-8 flex h-14 w-full max-w-md items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] py-1.5 pr-2 pl-4 backdrop-blur-xl transition-colors focus-within:border-white/40 hover:border-white/30">
						<img src="/logo.png" alt="" className="size-7 shrink-0 rounded-md object-cover" />
						<span className="text-[15px] whitespace-nowrap text-white/70">reserveme.org/</span>
						<input
							value={handle}
							onChange={event => setHandle(event.target.value)}
							placeholder="yourname"
							className="h-full w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/50"
							autoComplete="off"
							spellCheck={false}
						/>
						<button type="submit" className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white pr-1.5 pl-5 text-[15px] font-bold text-[#0E63B0] transition-transform active:scale-[0.98]">
							Start Free
							<span className="flex size-8 items-center justify-center rounded-full bg-[#38C3FF] text-white">
								<ArrowUpRight className="size-4" />
							</span>
						</button>
					</form>

					<div className="mt-7">
						<a href="#features" className="inline-flex items-center gap-1.5 text-[17px] text-white underline underline-offset-4 hover:text-[#38C3FF]">
							Watch demo
							<PlayCircle className="size-5" />
						</a>
					</div>
				</div>

				<div className="relative self-end">
					<div className="relative aspect-[0.94] overflow-hidden rounded-[2rem] border border-white/20 bg-[#12345D] shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
						{SLIDES.map((slide, index) => <img key={slide.image} src={slide.image} alt={`${slide.name}, ${slide.role}`} className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`} />)}
						<div className="absolute inset-0 bg-gradient-to-t from-[#06152B]/90 via-[#06152B]/10 to-transparent" />
						<div className="absolute inset-x-5 top-5 flex items-center justify-between"><span className="rounded-full border border-white/20 bg-[#06152B]/30 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-white uppercase backdrop-blur">ReserveMe live</span><div className="flex gap-1.5">{SLIDES.map((slide, index) => <button key={slide.name} type="button" onClick={() => setActiveSlide(index)} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-[#38C3FF]' : 'w-2 bg-white/50'}`} aria-label={`Show slide ${index + 1}`} />)}</div></div>
						<div className="absolute inset-x-5 bottom-5 text-white"><p className="text-2xl font-semibold sm:text-3xl">{SLIDES[activeSlide].caption}</p><div className="mt-4 flex items-end justify-between gap-4"><span><span className="block text-[15px] font-semibold">{SLIDES[activeSlide].name}</span><span className="text-sm text-white/65">{SLIDES[activeSlide].role} · {SLIDES[activeSlide].category}</span></span><div className="flex gap-2"><button type="button" onClick={() => setActiveSlide(previous => (previous - 1 + SLIDES.length) % SLIDES.length)} className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/15 hover:bg-white/15" aria-label="Previous slide"><ArrowLeft className="size-4" /></button><button type="button" onClick={() => setActiveSlide(previous => (previous + 1) % SLIDES.length)} className="flex size-10 items-center justify-center rounded-full bg-white text-[#0E63B0] hover:bg-[#38C3FF] hover:text-white" aria-label="Next slide"><ArrowRight className="size-4" /></button></div></div></div>
					</div>
				</div>
			</div>
		</section>
	);
}
