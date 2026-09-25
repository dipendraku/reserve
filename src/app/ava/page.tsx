'use client';
import { useEffect, useState } from 'react';
import Page from '@/routes/ava';
import { requireAuth, type AuthUser } from '@/lib/require-auth';
export default function AvaRoute() {
	const [user, setUser] = useState<AuthUser | null>(null);
	useEffect(() => { requireAuth().then(setUser).catch(() => undefined); }, []);
	return user ? <Page /> : <div className="min-h-[60dvh] bg-sky-50" />;
}
