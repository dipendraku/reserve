'use client';
import { Link, useLocation, useNavigate } from '@/lib/next-router-compat';
import { ArrowUpRight, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function AdminShell({ children }: { children: React.ReactNode }) {
	const { pathname } = useLocation();
	const { user, isLoading, logout } = useAuth();
	const navigate = useNavigate();
	const isLogin = pathname === '/myadmin';

	return (
		<div className="min-h-dvh bg-[#F3F6FA] text-[#0B1F3A]">
			<header className="border-b border-white/10 bg-[#09182E] text-white">
				<div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					<Link to={isLogin ? '/myadmin' : '/admin'} className="flex items-center gap-3">
						<span className="flex size-10 items-center justify-center rounded-xl bg-[#0E63B0]"><ShieldCheck className="size-5" /></span>
						<span><span className="block text-sm font-semibold tracking-wide">RESERVEME</span><span className="block text-xs text-white/55">ADMIN CONSOLE</span></span>
					</Link>
					<div className="flex items-center gap-3">
						{!isLogin && !isLoading && user && <span className="hidden text-sm text-white/70 sm:block">{user.email}</span>}
						{!isLogin && <Link to="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-white/80 hover:bg-white/10">Public site <ArrowUpRight className="size-4" /></Link>}
						{!isLogin && !isLoading && user && <button type="button" onClick={async () => { await logout(); navigate('/myadmin'); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-medium hover:bg-white/15"><LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span></button>}
					</div>
				</div>
			</header>
			{!isLogin && <div className="border-b border-[#E2E8F0] bg-white"><div className="mx-auto flex max-w-[1600px] items-center gap-2 px-4 py-3 text-sm sm:px-6 lg:px-8"><LayoutDashboard className="size-4 text-[#0E63B0]" /><span className="font-semibold">Platform operations</span><span className="text-[#9AA7B5]">/</span><span className="text-[#5B6B7F]">Admin dashboard</span></div></div>}
			<main className="min-h-[calc(100dvh-68px)]">{children}</main>
			<footer className="border-t border-[#E2E8F0] bg-white px-4 py-4 text-center text-xs text-[#7B8998]">ReserveMe administrative workspace · Authorized administrators only</footer>
		</div>
	);
}
