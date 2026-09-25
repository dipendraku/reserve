import type { Metadata } from 'next';
import { Suspense } from 'react';
import '../index.css';
import { NextSiteFrame } from '@/components/next-site-frame';

export const metadata: Metadata = {
	title: 'ReserveMe — Online Booking for Service Businesses',
	description: 'Manage bookings, clients, and services with ReserveMe.',
	icons: {
		icon: [{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }, { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }],
		apple: '/apple-touch-icon.png',
	},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<Suspense fallback={<div className="min-h-dvh bg-sky-50" />}>
					<NextSiteFrame><Suspense fallback={<div className="min-h-[60dvh] bg-sky-50" />}>{children}</Suspense></NextSiteFrame>
				</Suspense>
			</body>
		</html>
	);
}
