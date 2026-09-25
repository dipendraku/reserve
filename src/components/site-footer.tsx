'use client';
import { Link } from '@/lib/next-router-compat';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

const COLUMNS = [
	{ heading: 'Product', links: ['Features', 'Pricing'] },
	{ heading: 'Marketplace', links: ['Browse services', 'Beauty', 'Fitness', 'Health & Wellness', 'Education', 'All categories'] },
	{ heading: 'Industries', links: ['All Industries', 'Beauty & Personal Care', 'Education & Tutoring', 'Fitness & Wellness'] },
	{ heading: 'Resources', links: ['Blog', 'Help Center', 'ReserveMe Experts'] },
	{ heading: 'Legal', links: ['Terms & Conditions', 'Privacy Policy', 'Cookie Policy', 'DMCA Policy'] },
];

export function SiteFooter() {
	return (
		<footer className="border-t border-[#E4ECF3] bg-white">
			<div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(5,1fr)] lg:px-6">
				<div>
					<Link to="/" className="flex items-center gap-2 text-[#0B1F3A]">
						<img src="/logo.png" alt="ReserveMe" className="h-9 w-auto object-contain" />
					</Link>
					<p className="mt-3 text-[15px] text-[#5B6B7F]">Grow your brand with ReserveMe.</p>
					<div className="mt-4 flex gap-3 text-[#5B6B7F]">
						<Instagram className="size-5" />
						<Facebook className="size-5" />
						<Linkedin className="size-5" />
						<Youtube className="size-5" />
						<Twitter className="size-5" />
					</div>
					<div className="mt-5 flex gap-2">
						<Link to="/login" className="flex h-9 items-center rounded-lg border border-[#D1D6D9] px-4 text-sm font-medium text-[#0B1F3A]">
							Log in
						</Link>
						<Link to="/signup" className="flex h-9 items-center rounded-lg bg-[#0E63B0] px-4 text-sm font-medium text-white">
							Sign Up
						</Link>
					</div>
				</div>
				{COLUMNS.map(column => (
					<div key={column.heading}>
						<p className="text-sm font-semibold text-[#0B1F3A]">{column.heading}</p>
						<ul className="mt-4 space-y-2.5">
							{column.links.map(link => (
								<li key={link}>
									<Link to="/" className="text-[15px] text-[#5B6B7F] transition-colors hover:text-[#0B1F3A]">
										{link}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="border-t border-[#E4ECF3]">
				<p className="mx-auto max-w-7xl px-4 py-5 text-sm text-[#5B6B7F] lg:px-6">© 2026 ReserveMe. All rights reserved.</p>
			</div>
		</footer>
	);
}
