'use client';
import { Link } from '@/lib/next-router-compat';
import { ArrowRight } from 'lucide-react';
import { BENTO_CARDS } from '@/data/landing';

export function Bento() {
	return (
		<section id="industries" className="px-4 py-16 lg:px-6 lg:py-24">
			<div className="mx-auto max-w-7xl">
				<h2 className="mb-14 text-center text-3xl leading-[1.2] font-semibold text-[#0B1F3A] lg:text-[2.6rem]">
					All-in-one Solution <br /> for Your Service Business
				</h2>

				<div className="grid auto-rows-[300px] grid-cols-1 gap-4 md:auto-rows-[320px] xl:grid-cols-6">
					{BENTO_CARDS.map(card => (
						<Link key={card.title} to="/signup" className={`group/card relative row-span-2 block overflow-hidden rounded-3xl ${card.span}`}>
							<img src={card.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
							<div className="absolute inset-x-0 bottom-0 z-10">
								<div className="h-24 w-full" style={{ backgroundImage: `linear-gradient(transparent, ${card.tint})` }} />
								<div className="px-7 pt-3 pb-7" style={{ backgroundColor: card.tint }}>
									<h3 className={`text-[30px] leading-tight font-semibold tracking-[-0.01em] ${card.dark ? 'text-[#0B1F3A]' : 'text-white'}`}>
										{card.title}
									</h3>
									<p className={`mt-2 max-w-md text-[18px] leading-snug ${card.dark ? 'text-[#5B6B7F]' : 'text-white/60'}`}>
										{card.text}
									</p>
									<div className="pt-4 pb-1">
										<span className={`inline-flex items-center gap-1.5 text-[16px] font-semibold ${card.dark ? 'text-[#0B1F3A]' : 'text-white/80 group-hover/card:text-white'}`}>
											Start Free
											<ArrowRight className="size-5 transition-transform duration-300 group-hover/card:translate-x-1" />
										</span>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
