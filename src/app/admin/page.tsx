'use client';
import { useEffect, useState } from 'react';
import Page from '@/routes/admin';
import { requireAuth, type AuthUser } from '@/lib/require-auth';
export default function AdminRoute() {
	const [user, setUser] = useState<AuthUser | null>(null);
	useEffect(() => { requireAuth('/myadmin').then((value) => value.role === 'admin' ? setUser(value) : window.location.assign('/')).catch(() => undefined); }, []);
	return user ? <Page /> : <div className="min-h-[60dvh] bg-sky-50" />;
}
