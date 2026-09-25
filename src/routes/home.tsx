'use client';
import { Bento } from '@/components/home/bento';
import { CtaBand } from '@/components/home/cta-band';
import { FeaturesGrid } from '@/components/home/features-grid';
import { Hero } from '@/components/home/hero';
import { Testimonials } from '@/components/home/testimonials';
import { ValueStrip } from '@/components/home/value-strip';


export default function HomePage() {
	return (
		<>
			<Hero />
			<ValueStrip />
			<FeaturesGrid />
			<Bento />
			<Testimonials />
			<CtaBand />
		</>
	);
}
