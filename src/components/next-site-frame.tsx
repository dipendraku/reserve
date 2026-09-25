'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export function NextSiteFrame({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	if (pathname === '/admin' || pathname === '/myadmin') return <AdminShell>{children}</AdminShell>;

	return (
		<div className="flex min-h-dvh flex-col bg-white text-[#0B1F3A]">
			<SiteHeader />
			<main className="flex-1">{children}</main>
			<SiteFooter />
		</div>
	);
}
