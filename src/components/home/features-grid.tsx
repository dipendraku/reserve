'use client';
import { Link } from '@/lib/next-router-compat';
import { ArrowRight, BarChart3, Bell, Calendar, CreditCard, PlayCircle, Star, Users } from 'lucide-react';
import { FEATURES } from '@/data/landing';

const ICONS: Record<string, typeof Star> = {
	star: Star,
	bell: Bell,
	users: Users,
	chart: BarChart3,
	card: CreditCard,
	calendar: Calendar,
};

export function FeaturesGrid() {
	return (
		<section id="features" className="bg-sky-50 py-16 lg:py-24">
			<div className="mx-auto max-w-7xl px-4 lg:px-6">
				<h2 className="mx-auto max-w-3xl text-center text-3xl leading-[1.2] font-semibold text-[#0B1F3A] lg:text-[2.6rem]">
					Everything You Need to Run &amp; Grow Your Business
				</h2>
				<p className="mx-auto mt-5 max-w-2xl text-center text-[18px] leading-relaxed text-black/80">
					Powerful features designed specifically for online and in-person service professionals and creators to operate and grow your business successfully.
				</p>

				<div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{FEATURES.map((feature) => {
						const Icon = ICONS[feature.icon] ?? Star;

						return (
							<div key={feature.title} className="rounded-2xl border border-[#E4ECF3] bg-white p-6 shadow-[0_2px_4px_rgba(16,24,40,0.03),0_12px_32px_rgba(16,24,40,0.05)]">
								<div className="flex items-center gap-3">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(193_100%_42%)] text-white shadow-sm">
										<Icon className="size-5" />
									</span>
									<h3 className="text-xl font-semibold text-[#0B1F3A]">{feature.title}</h3>
								</div>
								<p className="mt-4 text-[15px] leading-6 text-[#5B6B7F]">{feature.text}</p>
							</div>
						);
					})}
				</div>

				<div className="mt-12 grid justify-center gap-4 md:flex md:flex-wrap">
					<a href="#industries" className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E4ECF3] bg-white px-7 font-semibold text-[#0B1F3A] transition-colors hover:bg-sky-50">
						<PlayCircle className="size-5" />
						Watch video
					</a>
					<Link to="/signup" className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E63B0] px-7 font-semibold text-white transition-colors hover:bg-[#0d5a9e]">
						View All Features
						<ArrowRight className="size-5" />
					</Link>
				</div>
			</div>
		</section>
	);
}
