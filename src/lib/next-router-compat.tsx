'use client';

import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
	to: string;
	href?: string;
};

export function Link({ to, href, ...props }: LinkProps) {
	return <NextLink href={href ?? to} {...props} />;
}

export function useNavigate() {
	const router = useRouter();
	return (href: string) => router.push(href);
}

export function useLocation() {
	return { pathname: usePathname() };
}

export function redirect(href: string): never {
	if (typeof window !== 'undefined') window.location.assign(href);
	throw new Error(`Redirecting to ${href}`);
}

export function useSearchParams() {
	return [useNextSearchParams()] as const;
}
