'use client';
import { useState } from 'react';
import { Link } from '@/lib/next-router-compat';
import { Sparkles } from 'lucide-react';
import { AppointmentsTab, ClientsTab, InboxTab, ServicesTab } from '@/components/dashboard/manage';
import { ProfileTab } from '@/components/dashboard/profile';
import { ReviewsTab } from '@/components/dashboard/reviews';
import { Overview } from '@/components/dashboard/overview';
import { requireAuth } from '@/lib/require-auth';



export function HydrateFallback() {
	return <div className="min-h-[60dvh] bg-sky-50" />;
}

const TABS = ['Overview', 'Appointments', 'Clients', 'Inbox', 'Services', 'Reviews', 'Profile'] as const;

export default function Dashboard({ loaderData }: { loaderData: { user: import('@/lib/require-auth').AuthUser } }) {
	const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
	const business = loaderData.user.businessName || loaderData.user.name || 'your business';

	return (
		<div className="bg-sky-50 py-10 lg:py-14">
			<div className="mx-auto max-w-7xl px-4 lg:px-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-semibold text-[#0B1F3A]">Your Business Cockpit</h1>
						<p className="mt-1 text-[15px] text-[#5B6B7F]">
							{business} · one dashboard, complete visibility.
						</p>
					</div>
					<Link to="/ava" className="flex h-11 items-center gap-2 rounded-xl bg-[#0A1B36] px-5 font-semibold text-white transition-colors hover:bg-[#12294d]">
						<Sparkles className="size-4 text-[#38C3FF]" />
						Ask AVA
					</Link>
				</div>

				<div className="mt-8 flex flex-wrap gap-2">
					{TABS.map(item => (
						<button
							key={item}
							type="button"
							onClick={() => setTab(item)}
							className={`h-10 rounded-full px-5 text-[15px] font-medium transition-colors ${tab === item ? 'bg-[#0E63B0] text-white' : 'border border-[#D1D6D9] bg-white text-[#5B6B7F] hover:border-[#0E63B0]'}`}
						>
							{item}
						</button>
					))}
				</div>

				<div className="mt-6">
					{tab === 'Overview' ? <Overview /> : null}
					{tab === 'Appointments' ? <AppointmentsTab /> : null}
					{tab === 'Clients' ? <ClientsTab /> : null}
					{tab === 'Inbox' ? <InboxTab /> : null}
					{tab === 'Services' ? <ServicesTab /> : null}
					{tab === 'Reviews' ? <ReviewsTab user={loaderData.user} /> : null}
					{tab === 'Profile' ? <ProfileTab user={loaderData.user} /> : null}
				</div>
			</div>
		</div>
	);
}
