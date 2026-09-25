'use client';
import { VALUE_STRIP } from '@/data/landing';

function Divider() {
	return (
		<span aria-hidden="true" className="hidden shrink-0 items-center gap-[3px] self-center md:flex">
			<span className="h-3 w-0.5 rounded-[1px] bg-[#38C3FF]" />
			<span className="h-[37px] w-0.5 rounded-[1px] bg-[#38C3FF]" />
			<span className="h-3 w-0.5 rounded-[1px] bg-[#38C3FF]" />
		</span>
	);
}

export function ValueStrip() {
	return (
		<section className="px-4 py-12 lg:px-6 lg:py-16">
			<div className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-center md:justify-center md:gap-6 lg:gap-12">
				{VALUE_STRIP.map((item, index) => (
					<div key={item.title} className="contents">
						{index > 0 ? <Divider /> : null}
						<div className="flex flex-1 flex-col items-center text-center">
							<p className="text-lg font-semibold text-[#0B1F3A] lg:text-2xl">{item.title}</p>
							<span className="mt-2.5 h-0.5 w-8 rounded-full bg-[#38C3FF] md:hidden" />
							<p className="mt-2.5 text-sm text-[#5B6B7F] lg:mt-1 lg:text-base">{item.sub}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
