'use client';
import { useEffect, useState } from 'react';
import Page from '@/routes/dashboard';
import { requireAuth, type AuthUser } from '@/lib/require-auth';
export default function DashboardRoute() {
	const [user, setUser] = useState<AuthUser | null>(null);
	useEffect(() => { requireAuth().then(setUser).catch(() => undefined); }, []);
	return user ? <Page loaderData={{ user }} /> : <div className="min-h-[60dvh] bg-sky-50" />;
}
