import { Bento } from '@/components/home/bento';
import { CtaBand } from '@/components/home/cta-band';
import { FeaturesGrid } from '@/components/home/features-grid';
import { Hero } from '@/components/home/hero';
import { Testimonials } from '@/components/home/testimonials';
import { ValueStrip } from '@/components/home/value-strip';

export const metadata: Metadata = {
	title: 'ReserveMe — The Booking Platform That Elevates Your Earning Potential',
	description: 'Streamline online bookings, payments, and client management with the all-in-one scheduling and appointment booking software for service professionals and creators.',
};

export default function HomePage() {
	return <><Hero /><ValueStrip /><FeaturesGrid /><Bento /><Testimonials /><CtaBand /></>;
}
import type { Metadata } from 'next';
