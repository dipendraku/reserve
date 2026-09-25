'use client';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarCheck, DollarSign, Star, Users } from 'lucide-react';
import supabase from '@/lib/supabase';

export type AppointmentRow = {
	id: string;
	date: string;
	time: string;
	status: string;
	payment: string;
	priceCents: number;
	notes?: string;
	expand?: {
		service?: { name: string };
		client?: { id: string; name: string; email: string };
	};
};

export type FeedbackRow = {
	id: string;
	rating: number;
	comment: string;
	expand?: { client?: { name: string }; service?: { name: string } };
};

const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const first = <T,>(value: T | T[] | null): T | undefined => Array.isArray(value) ? value[0] : value ?? undefined;

export function Overview() {
	const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
	const [reviews, setReviews] = useState<FeedbackRow[]>([]);
	const [clientCount, setClientCount] = useState(0);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		Promise.all([
			supabase.from('appointments').select('id,date,time,status,payment,price_cents, service:services(name), client:clients(id,name,email)').order('date', { ascending: false }).order('time', { ascending: false }),
			supabase.from('feedback').select('id,rating,comment, client:clients(name), service:services(name)').order('created_at', { ascending: false }),
			supabase.from('clients').select('id', { count: 'exact', head: true }),
		]).then(([appointmentsResult, reviewsResult, clientsResult]) => {
			if (!appointmentsResult.error) {
				setAppointments((appointmentsResult.data ?? []).map(item => ({
					id: item.id,
					date: item.date,
					time: String(item.time).slice(0, 5),
					status: item.status,
					payment: item.payment,
					priceCents: item.price_cents,
					expand: { service: first(item.service), client: first(item.client) },
				})));
			}
			if (!reviewsResult.error) setReviews((reviewsResult.data ?? []).map(item => ({
				id: item.id,
				rating: item.rating,
				comment: item.comment,
				expand: { client: first(item.client), service: first(item.service) },
			})));
			setClientCount(clientsResult.count ?? 0);
		}).catch(() => {});
	}, []);

	const stats = useMemo(() => {
		const live = appointments.filter(a => a.status !== 'cancelled');
		const revenue = live.filter(a => a.payment !== 'unpaid').reduce((sum, a) => sum + a.priceCents, 0);
		const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

		const byDay = new Map<string, number>();
		live.forEach((a) => {
			if (a.payment === 'unpaid') return;
			byDay.set(a.date, (byDay.get(a.date) ?? 0) + a.priceCents / 100);
		});
		const revenueSeries = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date: date.slice(5), total: Math.round(total) }));

		const byService = new Map<string, number>();
		live.forEach((a) => {
			const name = a.expand?.service?.name ?? 'Service';
			byService.set(name, (byService.get(name) ?? 0) + 1);
		});
		const serviceSeries = [...byService.entries()].map(([name, count]) => ({ name: name.length > 16 ? `${name.slice(0, 15)}…` : name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

		return { revenue, bookings: live.length, avgRating, revenueSeries, serviceSeries };
	}, [appointments, reviews]);

	const cards = [
		{ icon: DollarSign, label: 'Revenue tracked', value: money(stats.revenue) },
		{ icon: CalendarCheck, label: 'Bookings', value: String(stats.bookings) },
		{ icon: Star, label: 'Avg. rating', value: stats.avgRating ? stats.avgRating.toFixed(1) : '—' },
		{ icon: Users, label: 'Clients', value: String(clientCount) },
	];

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{cards.map(card => (
					<div key={card.label} className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<div className="flex items-center gap-2 text-[#5B6B7F]">
							<card.icon className="size-4" />
							<span className="text-sm">{card.label}</span>
						</div>
						<p className="mt-2 text-2xl font-semibold text-[#0B1F3A]">{card.value}</p>
					</div>
				))}
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
					<p className="font-semibold text-[#0B1F3A]">Revenue over time</p>
					<div className="mt-4 h-56">
						{mounted && stats.revenueSeries.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={stats.revenueSeries}>
									<CartesianGrid strokeDasharray="3 3" stroke="#E4ECF3" />
									<XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9AA7B5" />
									<YAxis tick={{ fontSize: 11 }} stroke="#9AA7B5" />
									<Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
									<Area type="monotone" dataKey="total" stroke="#0E63B0" fill="#0E63B0" fillOpacity={0.12} strokeWidth={2} />
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<p className="flex h-full items-center justify-center text-sm text-[#9AA7B5]">No revenue yet — share your booking link to get started.</p>
						)}
					</div>
				</div>

				<div className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
					<p className="font-semibold text-[#0B1F3A]">Popular services</p>
					<div className="mt-4 h-56">
						{mounted && stats.serviceSeries.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={stats.serviceSeries} layout="vertical">
									<CartesianGrid strokeDasharray="3 3" stroke="#E4ECF3" />
									<XAxis type="number" tick={{ fontSize: 11 }} stroke="#9AA7B5" allowDecimals={false} />
									<YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} stroke="#9AA7B5" />
									<Tooltip />
									<Bar dataKey="count" fill="#38C3FF" radius={[0, 6, 6, 0]} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<p className="flex h-full items-center justify-center text-sm text-[#9AA7B5]">No bookings yet.</p>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
				<p className="font-semibold text-[#0B1F3A]">Latest client feedback</p>
				<ul className="mt-4 divide-y divide-[#E4ECF3]">
					{reviews.slice(0, 5).map(review => (
						<li key={review.id} className="flex items-start justify-between gap-4 py-3">
							<div>
								<p className="text-[15px] text-[#0B1F3A]">“{review.comment}”</p>
								<p className="mt-1 text-sm text-[#5B6B7F]">{review.expand?.client?.name ?? 'Client'} · {review.expand?.service?.name ?? 'Service'}</p>
							</div>
							<span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-600">
								<Star className="size-3.5 fill-current" />{review.rating}
							</span>
						</li>
					))}
					{reviews.length === 0 ? <li className="py-6 text-center text-sm text-[#9AA7B5]">No feedback yet.</li> : null}
				</ul>
			</div>
		</div>
	);
}
