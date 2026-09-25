'use client';
import { useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { ChevronDown, LayoutDashboard, Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { INDUSTRIES } from '@/data/product-pages';

const NAV_LINKS = [
	{ label: 'Features', to: '/features' },
	{ label: 'Industries', to: '/industries' },
	{ label: 'Pricing', to: '/pricing' },
	{ label: 'Resources', to: '/#resources' },
];

export function SiteHeader() {
	const { isAuthed, isLoading, logout } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [industriesOpen, setIndustriesOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 bg-[#0A1B36] text-white">
			<div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 lg:px-6">
				<Link to="/" className="flex items-center gap-2" aria-label="ReserveMe home">
					<img src="/logo.png" alt="ReserveMe" className="h-9 w-auto object-contain" />
				</Link>

				<nav className="hidden items-center gap-7 text-[15px] text-white/80 lg:flex">
					{NAV_LINKS.slice(0, 1).map(link => <Link key={link.label} to={link.to} className="transition-colors hover:text-white">{link.label}</Link>)}
					<div className="relative"><button type="button" onClick={() => setIndustriesOpen(previous => !previous)} className="flex items-center gap-1 transition-colors hover:text-white">Industries <ChevronDown className={`size-4 transition-transform ${industriesOpen ? 'rotate-180' : ''}`} /></button>{industriesOpen ? <div className="absolute top-8 left-1/2 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#10294A] p-3 text-white shadow-2xl"><p className="px-3 pb-2 text-xs font-semibold tracking-[0.14em] text-[#38C3FF] uppercase">Built for your industry</p>{INDUSTRIES.map(industry => <Link key={industry.name} to="/industries" onClick={() => setIndustriesOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"><industry.icon className="size-4 text-[#38C3FF]" />{industry.name}</Link>)}</div> : null}</div>
					{NAV_LINKS.slice(2).map(link => <Link key={link.label} to={link.to} className="transition-colors hover:text-white">{link.label}</Link>)}
				</nav>

				<div className="ml-auto hidden items-center gap-3 lg:flex">
					<Link to="/find-pro" className="flex items-center gap-1.5 text-[15px] text-white/80 transition-colors hover:text-white">
						<Search className="size-4" />
						Find a Pro
					</Link>
					{isLoading ? (
						<div className="h-9 w-28" />
					) : isAuthed ? (
						<>
							<Link
								to="/account"
								className="flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-4 text-[15px] font-medium transition-colors hover:bg-white/15"
							>
								My Account
							</Link>
							<Link
								to="/dashboard"
								className="flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-4 text-[15px] font-medium transition-colors hover:bg-white/15"
							>
								<LayoutDashboard className="size-4" />
								Dashboard
							</Link>
							<button
								type="button"
								onClick={() => { logout(); navigate('/'); }}
								className="flex h-9 items-center rounded-lg bg-[#0E63B0] px-4 text-[15px] font-medium transition-colors hover:bg-[#0d5a9e]"
							>
								Log out
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="flex h-9 items-center rounded-lg bg-white/10 px-4 text-[15px] font-medium transition-colors hover:bg-white/15">
								Log in
							</Link>
							<Link to="/signup" className="flex h-9 items-center rounded-lg bg-[#0E63B0] px-4 text-[15px] font-medium transition-colors hover:bg-[#0d5a9e]">
								Sign Up
							</Link>
						</>
					)}
				</div>

				<button
					type="button"
					className="ml-auto flex size-10 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
					onClick={() => setOpen(previous => !previous)}
					aria-label="Toggle menu"
				>
					{open ? <X className="size-5" /> : <Menu className="size-5" />}
				</button>
			</div>

			{open ? (
				<div className="border-t border-white/10 px-4 py-4 lg:hidden">
					<nav className="flex flex-col gap-1 text-[15px]">
						{NAV_LINKS.slice(0, 1).map(link => (
							<Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10">
								{link.label}
							</Link>
						))}
						<button type="button" onClick={() => setIndustriesOpen(previous => !previous)} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-white/80 hover:bg-white/10">Industries <ChevronDown className={`size-4 ${industriesOpen ? 'rotate-180' : ''}`} /></button>
						{industriesOpen ? <div className="ml-3 border-l border-white/10 pl-3">{INDUSTRIES.map(industry => <Link key={industry.name} to="/industries" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"><industry.icon className="size-4 text-[#38C3FF]" />{industry.name}</Link>)}</div> : null}
						{NAV_LINKS.slice(2).map(link => <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10">{link.label}</Link>)}
						<Link to="/find-pro" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10">
							Find a Pro
						</Link>
						{isAuthed ? (
							<Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium hover:bg-white/10">
								Dashboard
							</Link>
						) : (
							<div className="mt-2 flex gap-2">
								<Link to="/login" onClick={() => setOpen(false)} className="flex h-11 flex-1 items-center justify-center rounded-lg bg-white/10 font-medium">
									Log in
								</Link>
								<Link to="/signup" onClick={() => setOpen(false)} className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#0E63B0] font-medium">
									Sign Up
								</Link>
							</div>
						)}
					</nav>
				</div>
			) : null}
		</header>
	);
}
