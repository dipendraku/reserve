'use client';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldCheck, QrCode, Star, Users, CalendarCheck, Building2, Search, RefreshCw, Bell, TrendingUp, CircleAlert, Plus, Pencil, Check, X } from 'lucide-react';
import { requireAuth } from '@/lib/require-auth';
import supabase from '@/lib/supabase';



export function HydrateFallback() {
	return <div className="min-h-[60dvh] bg-sky-50" />;
}

type Profile = {
	id: string;
	name: string;
	business_name: string;
	phone: string;
	address: string;
	role: 'client' | 'provider' | 'admin';
	created_at: string;
};

type Service = {
	id: string;
	name: string;
	description: string;
	category: string;
	price_cents: number;
	duration_min: number;
	active: boolean;
	owner: string;
	owner_profile?: { business_name: string } | { business_name: string }[] | null;
};

type Appointment = {
	id: string;
	date: string;
	time: string;
	status: 'confirmed' | 'completed' | 'cancelled';
	payment: string;
	price_cents: number;
	owner: string;
	service: string;
	service_ref?: { name: string } | { name: string }[] | null;
	client_ref?: { name: string; email: string; phone: string } | { name: string; email: string; phone: string }[] | null;
	owner_profile?: { business_name: string } | { business_name: string }[] | null;
};

type Review = {
	id: string;
	owner: string;
	rating: number;
	comment: string;
	reply: string;
	customer_name: string;
	created_at: string;
	owner_profile?: { business_name: string } | { business_name: string }[] | null;
	service_ref?: { name: string } | { name: string }[] | null;
};

type Notification = {
	id: string;
	channel: 'email' | 'sms';
	status: string;
	recipient: string;
	created_at: string;
	appointment_ref?: { date: string; time: string } | { date: string; time: string }[] | null;
};

const first = <T,>(value: T | T[] | null | undefined): T | undefined => Array.isArray(value) ? value[0] : value ?? undefined;
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const TABS = ['Overview', 'Customers', 'Bookings', 'Businesses', 'Reviews', 'Notifications'] as const;
type Tab = typeof TABS[number];

export default function AdminPage() {
	const [tab, setTab] = useState<Tab>('Overview');
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const [qrProviderId, setQrProviderId] = useState<string | null>(null);
	const [newService, setNewService] = useState({ owner: '', name: '', description: '', category: 'Other', duration: '30', price: '' });
	const [addingService, setAddingService] = useState(false);
	const [editingService, setEditingService] = useState<string | null>(null);
	const [serviceEdit, setServiceEdit] = useState({ name: '', category: '', duration: '', price: '' });
	const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
	const [customerEdit, setCustomerEdit] = useState({ name: '', phone: '', address: '' });

	const loadAll = async (quiet = false) => {
		if (quiet) setRefreshing(true);
		else setLoading(true);
		setLoadError(null);
		const [profilesRes, servicesRes, appointmentsRes, reviewsRes, notificationsRes] = await Promise.all([
			supabase.from('profiles').select('id,name,business_name,phone,address,role,created_at').order('created_at', { ascending: false }),
			supabase.from('services').select('id,name,description,category,price_cents,duration_min,active,owner, owner_profile:profiles(business_name)').order('created_at', { ascending: false }),
			supabase.from('appointments').select('id,date,time,status,payment,price_cents,owner,service, service_ref:services(name), client_ref:clients(name,email,phone), owner_profile:profiles(business_name)').order('date', { ascending: false }).order('time', { ascending: false }),
			supabase.from('feedback').select('id,owner,rating,comment,reply,customer_name,created_at, owner_profile:profiles(business_name), service_ref:services(name)').order('created_at', { ascending: false }),
			supabase.from('notifications').select('id,channel,status,recipient,created_at,appointment_ref:appointments(date,time)').order('created_at', { ascending: false }).limit(100),
		]);

		const failed = [profilesRes, servicesRes, appointmentsRes, reviewsRes, notificationsRes].find(result => result.error);
		if (failed?.error) setLoadError(failed.error.message);
		setProfiles((profilesRes.data ?? []) as Profile[]);
		setServices((servicesRes.data ?? []) as unknown as Service[]);
		setAppointments((appointmentsRes.data ?? []) as unknown as Appointment[]);
		setReviews((reviewsRes.data ?? []) as unknown as Review[]);
		setNotifications((notificationsRes.data ?? []) as unknown as Notification[]);
		setLoading(false);
		setRefreshing(false);
	};

	useEffect(() => { loadAll(); }, []);

	const customers = useMemo(() => profiles.filter(p => p.role === 'client'), [profiles]);
	const businesses = useMemo(() => profiles.filter(p => p.role === 'provider'), [profiles]);
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const matches = (...values: (string | null | undefined)[]) => !normalizedQuery || values.some(value => value?.toLocaleLowerCase().includes(normalizedQuery));
	const visibleCustomers = customers.filter(c => matches(c.name, c.phone, c.address));
	const visibleBusinesses = businesses.filter(b => matches(b.name, b.business_name, b.phone, b.address));
	const visibleAppointments = appointments.filter(a => {
		const client = first(a.client_ref);
		const service = first(a.service_ref);
		const owner = first(a.owner_profile);
		return matches(client?.name, client?.email, client?.phone, service?.name, owner?.business_name, a.date, a.status);
	});
	const visibleReviews = reviews.filter(r => matches(r.customer_name, r.comment, first(r.owner_profile)?.business_name, first(r.service_ref)?.name));
	const visibleServices = services.filter(s => matches(s.name, s.category, first(s.owner_profile)?.business_name));
	const visibleNotifications = notifications.filter(n => matches(n.channel, n.status, n.recipient));
	const activeAppointments = appointments.filter(a => a.status === 'confirmed');
	const completedAppointments = appointments.filter(a => a.status === 'completed');
	const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
	const revenueCents = completedAppointments.reduce((total, item) => total + item.price_cents, 0);
	const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
	const failedNotifications = notifications.filter(item => item.status === 'failed').length;
	const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() - (6 - index));
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		return { key, label: date.toLocaleDateString(undefined, { weekday: 'short' }), count: appointments.filter(item => item.date === key && item.status !== 'cancelled').length };
	});
	const maxBookings = Math.max(1, ...lastSevenDays.map(day => day.count));

	const toggleService = async (service: Service) => {
		const { error } = await supabase.from('services').update({ active: !service.active }).eq('id', service.id);
		if (!error) setServices(previous => previous.map(item => item.id === service.id ? { ...item, active: !service.active } : item));
		else setLoadError(error.message);
	};

	const updateBusiness = async (id: string, patch: Partial<Profile>) => {
		const { error } = await supabase.from('profiles').update(patch).eq('id', id);
		if (!error) setProfiles(previous => previous.map(p => p.id === id ? { ...p, ...patch } : p));
		else setLoadError(error.message);
	};

	const rescheduleAppointment = async (id: string, date: string, time: string) => {
		const { error } = await supabase.from('appointments').update({ date, time }).eq('id', id);
		if (!error) setAppointments(previous => previous.map(a => a.id === id ? { ...a, date, time } : a));
		else setLoadError(error.message);
	};

	const cancelAppointment = async (id: string) => {
		const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
		if (!error) setAppointments(previous => previous.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
		else setLoadError(error.message);
	};

	const saveCustomer = async (id: string) => {
		await updateBusiness(id, customerEdit);
		setEditingCustomer(null);
	};

	const createService = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setAddingService(true);
		const { error } = await supabase.from('services').insert({
			owner: newService.owner,
			name: newService.name.trim(),
			description: newService.description.trim(),
			category: newService.category.trim() || 'Other',
			duration_min: Number(newService.duration),
			price_cents: Math.round(Number(newService.price) * 100),
		});
		setAddingService(false);
		if (error) {
			setLoadError(error.message);
			return;
		}
		setNewService({ owner: '', name: '', description: '', category: 'Other', duration: '30', price: '' });
		await loadAll(true);
	};

	const saveService = async (serviceId: string) => {
		const patch = { name: serviceEdit.name.trim(), category: serviceEdit.category.trim() || 'Other', duration_min: Number(serviceEdit.duration), price_cents: Math.round(Number(serviceEdit.price) * 100) };
		const { error } = await supabase.from('services').update(patch).eq('id', serviceId);
		if (error) {
			setLoadError(error.message);
			return;
		}
		setServices(previous => previous.map(service => service.id === serviceId ? { ...service, ...patch } : service));
		setEditingService(null);
	};

	const updateAppointmentField = async (id: string, field: 'payment' | 'status', value: string) => {
		const { error } = await supabase.from('appointments').update({ [field]: value }).eq('id', id);
		if (error) {
			setLoadError(error.message);
			return;
		}
		setAppointments(previous => previous.map(appointment => appointment.id === id ? { ...appointment, [field]: value } : appointment));
	};

	const reassignAppointment = async (appointmentId: string, newServiceId: string) => {
		const newService = services.find(s => s.id === newServiceId);
		if (!newService) return;
		const { error } = await supabase
			.from('appointments')
			.update({ service: newService.id, owner: newService.owner, price_cents: newService.price_cents })
			.eq('id', appointmentId);
		if (!error) {
			const ownerProfile = first(newService.owner_profile);
			setAppointments(previous => previous.map(a => a.id === appointmentId
				? { ...a, service: newService.id, owner: newService.owner, price_cents: newService.price_cents, service_ref: { name: newService.name }, owner_profile: { business_name: ownerProfile?.business_name ?? '' } }
				: a));
		}
	};

	const saveReply = async (id: string, reply: string) => {
		const { error } = await supabase.from('feedback').update({ reply, replied_at: new Date().toISOString() }).eq('id', id);
		if (!error) setReviews(previous => previous.map(r => r.id === id ? { ...r, reply } : r));
		else setLoadError(error.message);
	};

	if (loading) return <div className="flex min-h-[60dvh] items-center justify-center bg-sky-50"><Loader2 className="size-8 animate-spin text-[#0E63B0]" /></div>;

	return (
		<div className="bg-sky-50 py-10 lg:py-14">
			<div className="mx-auto max-w-7xl space-y-6 px-4 lg:px-6">
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-xl bg-[#0A1B36] text-white"><ShieldCheck className="size-5" /></div>
					<div><h1 className="text-3xl font-semibold text-[#0B1F3A]">Admin dashboard</h1><p className="text-[15px] text-[#5B6B7F]">Full platform control — customers, bookings, businesses, and reviews.</p></div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<MetricCard label="Customers" value={customers.length.toLocaleString()} detail="Registered client accounts" icon={<Users className="size-5" />} />
					<MetricCard label="Businesses" value={businesses.length.toLocaleString()} detail={`${services.filter(service => service.active).length} active services`} icon={<Building2 className="size-5" />} />
					<MetricCard label="Confirmed bookings" value={activeAppointments.length.toLocaleString()} detail={`${cancelledAppointments.length} cancelled total`} icon={<CalendarCheck className="size-5" />} />
					<MetricCard label="Completed value" value={money(revenueCents)} detail={`${completedAppointments.length} completed bookings`} icon={<TrendingUp className="size-5" />} />
				</div>

				<div className="flex flex-col gap-3 rounded-2xl border border-[#E4ECF3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
					<label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[#D1D6D9] px-3 sm:max-w-xl">
						<Search className="size-4 shrink-0 text-[#8A98A8]" />
						<input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${tab.toLowerCase()}...`} className="w-full bg-transparent text-sm outline-none placeholder:text-[#9AA7B5]" />
					</label>
					<div className="flex items-center gap-3 text-sm text-[#5B6B7F]">
						<span>{tab === 'Overview' ? `${profiles.length} accounts · ${appointments.length} bookings` : `Search results update as you type`}</span>
						<button type="button" onClick={() => loadAll(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D1D6D9] px-3 font-medium text-[#0B1F3A] hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</button>
					</div>
				</div>
				{loadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><CircleAlert className="mt-0.5 size-4 shrink-0" /><span>Could not complete that admin data operation: {loadError}</span><button className="ml-auto font-semibold" onClick={() => setLoadError(null)}>Dismiss</button></div>}

				<div className="flex flex-wrap gap-1 rounded-lg border border-[#D1D6D9] bg-white p-1 w-fit">
					{TABS.map(t => (
						<button
							key={t}
							type="button"
							onClick={() => setTab(t)}
							className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition-colors ${tab === t ? 'bg-[#0E63B0] text-white' : 'text-[#5B6B7F] hover:text-[#0B1F3A]'}`}
						>
							{t === 'Customers' && <Users className="size-3.5" />}
							{t === 'Bookings' && <CalendarCheck className="size-3.5" />}
							{t === 'Businesses' && <Building2 className="size-3.5" />}
							{t === 'Reviews' && <Star className="size-3.5" />}
							{t === 'Notifications' && <Bell className="size-3.5" />}
							{t}
						</button>
					))}
				</div>

				{tab === 'Overview' && (
					<div className="space-y-6">
						<div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
						<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
							<div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#0B1F3A]">Booking activity</h2><p className="mt-1 text-sm text-[#5B6B7F]">Confirmed and completed bookings over the last seven days</p></div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-[#0E63B0]">{lastSevenDays.reduce((sum, day) => sum + day.count, 0)} bookings</span></div>
							<div className="mt-6 flex h-40 items-end justify-between gap-2" aria-label="Bookings over the last seven days">
								{lastSevenDays.map(day => <div key={day.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-medium text-[#5B6B7F]">{day.count || ''}</span><div className="w-full max-w-12 rounded-t-md bg-[#0E63B0]" style={{ height: `${Math.max(8, (day.count / maxBookings) * 100)}%` }} /><span className="text-xs text-[#7B8998]">{day.label}</span></div>)}
							</div>
						</section>
						<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
							<h2 className="font-semibold text-[#0B1F3A]">Platform snapshot</h2>
							<div className="mt-4 grid grid-cols-2 gap-3">
								<MiniMetric label="Avg. rating" value={averageRating ? `${averageRating.toFixed(1)} / 5` : '—'} />
								<MiniMetric label="Reviews" value={reviews.length.toLocaleString()} />
								<MiniMetric label="Disabled services" value={services.filter(service => !service.active).length.toLocaleString()} />
								<MiniMetric label="Failed notifications" value={failedNotifications.toLocaleString()} alert={failedNotifications > 0} />
							</div>
							<button type="button" onClick={() => setTab('Notifications')} className="mt-4 text-sm font-semibold text-[#0E63B0] hover:underline">Review notification delivery →</button>
						</section>
						</div>
						<div className="grid gap-6 lg:grid-cols-2">
						<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
							<div className="flex items-center justify-between"><h2 className="font-semibold text-[#0B1F3A]">Recent accounts</h2><span className="text-xs text-[#7B8998]">{profiles.length} total</span></div>
							<ul className="mt-4 divide-y divide-[#E4ECF3]">
								{profiles.slice(0, 8).map(profile => (
									<li key={profile.id} className="flex items-center justify-between gap-4 py-3">
										<div><p className="font-medium text-[#0B1F3A]">{profile.name || 'Unnamed account'}</p><p className="text-sm text-[#5B6B7F]">{profile.business_name || 'No business name'}</p></div>
										<span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold uppercase text-[#0E63B0]">{profile.role}</span>
									</li>
								))}
							</ul>
						</section>
						<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
							<h2 className="font-semibold text-[#0B1F3A]">Service moderation</h2>
							<ul className="mt-4 divide-y divide-[#E4ECF3]">
								{visibleServices.slice(0, 8).map(service => {
									const owner = first(service.owner_profile);
									return (
										<li key={service.id} className="flex items-center justify-between gap-4 py-3">
											<div><p className="font-medium text-[#0B1F3A]">{service.name}</p><p className="text-sm text-[#5B6B7F]">{owner?.business_name || 'Provider'} · {service.category} · {money(service.price_cents)}</p></div>
											<button type="button" onClick={() => toggleService(service)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${service.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{service.active ? 'Active' : 'Disabled'}</button>
										</li>
									);
								})}
							</ul>
						</section>
						</div>
					</div>
				)}

				{tab === 'Customers' && (
					<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<h2 className="font-semibold text-[#0B1F3A]">Customers</h2>
						<div className="mt-4 overflow-x-auto">
							<table className="w-full text-sm">
								<thead><tr className="text-left text-[#5B6B7F]"><th className="pb-2">Name</th><th className="pb-2">Phone</th><th className="pb-2">Address</th><th className="pb-2">Joined</th><th className="pb-2">Actions</th></tr></thead>
								<tbody className="divide-y divide-[#E4ECF3]">
									{visibleCustomers.map(c => (
										<tr key={c.id}>
											<td className="py-2.5 font-medium text-[#0B1F3A]">{editingCustomer === c.id ? <input value={customerEdit.name} onChange={event => setCustomerEdit(value => ({ ...value, name: event.target.value }))} className="w-full rounded border px-2 py-1" /> : c.name || 'Unnamed'}</td>
											<td className="py-2.5 text-[#5B6B7F]">{editingCustomer === c.id ? <input value={customerEdit.phone} onChange={event => setCustomerEdit(value => ({ ...value, phone: event.target.value }))} className="w-full rounded border px-2 py-1" /> : c.phone || '—'}</td>
											<td className="py-2.5 text-[#5B6B7F]">{editingCustomer === c.id ? <input value={customerEdit.address} onChange={event => setCustomerEdit(value => ({ ...value, address: event.target.value }))} className="w-full rounded border px-2 py-1" /> : c.address || '—'}</td>
											<td className="py-2.5 text-[#5B6B7F]">{new Date(c.created_at).toLocaleDateString()}</td>
											<td className="py-2.5">{editingCustomer === c.id ? <button type="button" onClick={() => saveCustomer(c.id)} className="text-xs font-semibold text-[#0E63B0]">Save</button> : <button type="button" onClick={() => { setEditingCustomer(c.id); setCustomerEdit({ name: c.name, phone: c.phone, address: c.address }); }} className="text-xs font-semibold text-[#0E63B0]">Edit</button>}</td>
										</tr>
									))}
									{visibleCustomers.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-[#5B6B7F]">No customers match this search.</td></tr>}
								</tbody>
							</table>
						</div>
					</section>
				)}

				{tab === 'Bookings' && (
					<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<h2 className="font-semibold text-[#0B1F3A]">Bookings</h2>
						<div className="mt-4 space-y-3">
									{visibleAppointments.map(a => {
								const svc = first(a.service_ref);
								const client = first(a.client_ref);
								const owner = first(a.owner_profile);
								return (
									<div key={a.id} className="rounded-lg border border-[#E4ECF3] p-4">
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div>
												<p className="font-semibold text-[#0B1F3A]">{svc?.name ?? 'Service'} — {owner?.business_name ?? 'Business'}</p>
												<p className="text-sm text-[#5B6B7F]">{client?.name} · {client?.email} · {client?.phone}</p>
												<p className="text-sm text-[#5B6B7F]">{money(a.price_cents)} · {a.payment}</p>
											</div>
											<span className={`rounded-full px-3 py-1 text-xs font-semibold ${a.status === 'cancelled' ? 'bg-red-50 text-red-700' : a.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-[#0E63B0]'}`}>{a.status}</span>
										</div>

										<div className="mt-3 flex flex-wrap items-center gap-2">
											<input
												type="date"
												defaultValue={a.date}
												onBlur={(e) => e.target.value !== a.date && rescheduleAppointment(a.id, e.target.value, a.time)}
												className="rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm"
											/>
											<input
												type="time"
												defaultValue={a.time?.slice(0, 5)}
												onBlur={(e) => e.target.value !== a.time?.slice(0, 5) && rescheduleAppointment(a.id, a.date, e.target.value)}
												className="rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm"
											/>

											<select
												defaultValue=""
												onChange={(e) => { if (e.target.value) { reassignAppointment(a.id, e.target.value); e.target.value = ''; } }}
												className="rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm"
											>
												<option value="">Reassign to business…</option>
												{services.filter(s => s.active).map(s => {
													const o = first(s.owner_profile);
													return <option key={s.id} value={s.id}>{o?.business_name ?? 'Business'} — {s.name}</option>;
												})}
											</select>
											<label className="flex items-center gap-2 text-xs font-medium text-[#5B6B7F]">Status
												<select value={a.status} onChange={event => updateAppointmentField(a.id, 'status', event.target.value)} className="rounded-lg border border-[#D1D6D9] px-2.5 py-1.5 text-sm text-[#0B1F3A]"><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
											</label>
											<label className="flex items-center gap-2 text-xs font-medium text-[#5B6B7F]">Payment
												<select value={a.payment} onChange={event => updateAppointmentField(a.id, 'payment', event.target.value)} className="rounded-lg border border-[#D1D6D9] px-2.5 py-1.5 text-sm text-[#0B1F3A]"><option value="card_upfront">Card upfront</option><option value="cash">Cash</option><option value="app">App pay</option><option value="unpaid">Unpaid</option></select>
												</label>

											{a.status !== 'cancelled' && (
												<button type="button" onClick={() => cancelAppointment(a.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100">Cancel</button>
											)}
										</div>
									</div>
								);
							})}
							{visibleAppointments.length === 0 && <p className="py-6 text-center text-[#5B6B7F]">No bookings match this search.</p>}
						</div>
					</section>
				)}

				{tab === 'Businesses' && (
					<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold text-[#0B1F3A]">Business profiles and services</h2><p className="mt-1 text-sm text-[#5B6B7F]">Manage public business details, service availability, prices, and booking links.</p></div><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0E63B0]">{businesses.length} providers · {services.length} services</span></div>
						<form onSubmit={createService} className="mt-5 rounded-xl border border-[#DCE6EF] bg-slate-50 p-4">
							<div className="mb-3 flex items-center gap-2 font-semibold text-[#0B1F3A]"><Plus className="size-4 text-[#0E63B0]" />Add a service to a business</div>
							<div className="grid gap-3 md:grid-cols-3">
								<select required value={newService.owner} onChange={event => setNewService(value => ({ ...value, owner: event.target.value }))} className="h-10 rounded-lg border border-[#D1D6D9] bg-white px-3 text-sm"><option value="">Choose business…</option>{businesses.map(provider => <option key={provider.id} value={provider.id}>{provider.business_name || provider.name || 'Unnamed business'}</option>)}</select>
								<input required value={newService.name} onChange={event => setNewService(value => ({ ...value, name: event.target.value }))} placeholder="Service name" className="h-10 rounded-lg border border-[#D1D6D9] bg-white px-3 text-sm" />
								<input value={newService.category} onChange={event => setNewService(value => ({ ...value, category: event.target.value }))} placeholder="Category" className="h-10 rounded-lg border border-[#D1D6D9] bg-white px-3 text-sm" />
								<input type="number" min="5" max="480" required value={newService.duration} onChange={event => setNewService(value => ({ ...value, duration: event.target.value }))} placeholder="Duration (min)" className="h-10 rounded-lg border border-[#D1D6D9] bg-white px-3 text-sm" />
								<input type="number" min="0" step="0.01" required value={newService.price} onChange={event => setNewService(value => ({ ...value, price: event.target.value }))} placeholder="Price" className="h-10 rounded-lg border border-[#D1D6D9] bg-white px-3 text-sm" />
								<input value={newService.description} onChange={event => setNewService(value => ({ ...value, description: event.target.value }))} placeholder="Short description" className="h-10 rounded-lg border border-[#D1D6D9] bg-white px-3 text-sm" />
							</div>
							<button disabled={addingService || businesses.length === 0} className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0E63B0] px-4 text-sm font-semibold text-white hover:bg-[#0A4A8A] disabled:opacity-50">{addingService ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}Create service</button>
						</form>
						<div className="mt-4 space-y-3">
								{visibleBusinesses.map(b => (
								<div key={b.id} className="rounded-lg border border-[#E4ECF3] p-4">
									<div className="grid gap-3 sm:grid-cols-3">
										<input defaultValue={b.business_name} onBlur={(e) => e.target.value !== b.business_name && updateBusiness(b.id, { business_name: e.target.value })} placeholder="Business name" className="rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm" />
										<input defaultValue={b.phone} onBlur={(e) => e.target.value !== b.phone && updateBusiness(b.id, { phone: e.target.value })} placeholder="Phone" className="rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm" />
										<input defaultValue={b.address} onBlur={(e) => e.target.value !== b.address && updateBusiness(b.id, { address: e.target.value })} placeholder="Address" className="rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm" />
									</div>

									<div className="mt-3 space-y-2">
										{services.filter(s => s.owner === b.id).map(s => (
											<div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
												{editingService === s.id ? <div className="grid flex-1 gap-2 sm:grid-cols-4"><input aria-label="Service name" value={serviceEdit.name} onChange={event => setServiceEdit(value => ({ ...value, name: event.target.value }))} className="rounded-md border px-2 py-1 text-sm" /><input aria-label="Service category" value={serviceEdit.category} onChange={event => setServiceEdit(value => ({ ...value, category: event.target.value }))} className="rounded-md border px-2 py-1 text-sm" /><input aria-label="Duration in minutes" type="number" min="5" max="480" value={serviceEdit.duration} onChange={event => setServiceEdit(value => ({ ...value, duration: event.target.value }))} className="rounded-md border px-2 py-1 text-sm" /><input aria-label="Price" type="number" min="0" step="0.01" value={serviceEdit.price} onChange={event => setServiceEdit(value => ({ ...value, price: event.target.value }))} className="rounded-md border px-2 py-1 text-sm" /></div> : <div><span className="font-medium text-[#0B1F3A]">{s.name}</span><span className="ml-2 text-xs text-[#5B6B7F]">{s.category} · {s.duration_min} min · {money(s.price_cents)}</span></div>}
												<div className="flex items-center gap-2"><button type="button" onClick={() => toggleService(s)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{s.active ? 'Active' : 'Disabled'}</button>{editingService === s.id ? <><button type="button" onClick={() => saveService(s.id)} aria-label="Save service" className="rounded-md bg-[#0E63B0] p-1.5 text-white"><Check className="size-4" /></button><button type="button" onClick={() => setEditingService(null)} aria-label="Cancel service edit" className="rounded-md border p-1.5"><X className="size-4" /></button></> : <button type="button" onClick={() => { setEditingService(s.id); setServiceEdit({ name: s.name, category: s.category, duration: String(s.duration_min), price: (s.price_cents / 100).toFixed(2) }); }} aria-label={`Edit ${s.name}`} className="rounded-md border p-1.5 text-[#0E63B0]"><Pencil className="size-4" /></button>}</div>
											</div>
										))}
									</div>
										<button type="button" onClick={() => setQrProviderId(prev => prev === b.id ? null : b.id)} className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0E63B0]">
											<QrCode className="size-3.5" /> {qrProviderId === b.id ? 'Hide QR' : 'Generate QR'}
										</button>

									{qrProviderId === b.id && (
										<div className="mt-3 flex items-center gap-4 rounded-lg bg-sky-50 p-4">
											<img
												alt={`QR code for ${b.business_name}`}
												src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/book?provider=${b.id}`)}`}
												className="size-[140px] rounded bg-white p-2"
											/>
											<div className="text-sm text-[#5B6B7F]">
												<p className="font-medium text-[#0B1F3A]">Scan to book instantly</p>
												<p className="mt-1 break-all">{`${window.location.origin}/book?provider=${b.id}`}</p>
												<p className="mt-2 text-xs">Print this at the business location for walk-in customers.</p>
											</div>
										</div>
									)}
								</div>
							))}
							{visibleBusinesses.length === 0 && <p className="py-6 text-center text-[#5B6B7F]">No businesses match this search.</p>}
						</div>
					</section>
				)}

				{tab === 'Reviews' && (
					<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<h2 className="font-semibold text-[#0B1F3A]">Reviews &amp; feedback</h2>
						<div className="mt-4 space-y-3">
							{visibleReviews.map(r => {
								const owner = first(r.owner_profile);
								const svc = first(r.service_ref);
								return (
									<div key={r.id} className="rounded-lg border border-[#E4ECF3] p-4">
										<div className="flex items-center justify-between">
											<p className="font-medium text-[#0B1F3A]">{owner?.business_name ?? 'Business'} · {svc?.name ?? 'Service'}</p>
											<div className="flex items-center gap-0.5 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-4 ${i < r.rating ? 'fill-amber-500' : 'fill-none'}`} />)}</div>
										</div>
										<p className="mt-1 text-sm text-[#5B6B7F]">{r.customer_name} — {r.comment}</p>
										<ReplyBox initial={r.reply} onSave={(reply) => saveReply(r.id, reply)} />
									</div>
								);
							})}
							{visibleReviews.length === 0 && <p className="py-6 text-center text-[#5B6B7F]">No reviews match this search.</p>}
						</div>
					</section>
				)}

				{tab === 'Notifications' && (
					<section className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
						<div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-[#0B1F3A]">Notification delivery</h2><p className="mt-1 text-sm text-[#5B6B7F]">Most recent 100 email and SMS booking confirmation attempts.</p></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">{failedNotifications} failed in recent activity</span></div>
						<div className="mt-4 overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead><tr className="border-b border-[#E4ECF3] text-xs uppercase tracking-wide text-[#7B8998]"><th className="pb-3">Channel</th><th className="pb-3">Recipient</th><th className="pb-3">Booking</th><th className="pb-3">Attempted</th><th className="pb-3">Status</th></tr></thead>
								<tbody className="divide-y divide-[#E4ECF3]">
									{visibleNotifications.map(item => { const booking = first(item.appointment_ref); return <tr key={item.id}><td className="py-3 font-medium uppercase text-[#0B1F3A]">{item.channel}</td><td className="py-3 text-[#5B6B7F]">{item.recipient}</td><td className="py-3 text-[#5B6B7F]">{booking ? `${booking.date} · ${booking.time.slice(0, 5)}` : 'Booking unavailable'}</td><td className="py-3 text-[#5B6B7F]">{new Date(item.created_at).toLocaleString()}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : item.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></td></tr>; })}
									{visibleNotifications.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-[#5B6B7F]">No notification attempts match this search.</td></tr>}
								</tbody>
							</table>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
	return <div className="rounded-2xl border border-[#E4ECF3] bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#5B6B7F]">{label}</p><span className="text-[#0E63B0]">{icon}</span></div><p className="mt-2 text-2xl font-semibold text-[#0B1F3A]">{value}</p><p className="mt-1 text-xs text-[#7B8998]">{detail}</p></div>;
}

function MiniMetric({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
	return <div className={`rounded-xl p-3 ${alert ? 'bg-red-50' : 'bg-slate-50'}`}><p className="text-xs text-[#7B8998]">{label}</p><p className={`mt-1 text-lg font-semibold ${alert ? 'text-red-700' : 'text-[#0B1F3A]'}`}>{value}</p></div>;
}

function ReplyBox({ initial, onSave }: { initial: string; onSave: (reply: string) => void }) {
	const [value, setValue] = useState(initial);
	return (
		<div className="mt-2 flex items-center gap-2">
			<input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Reply as the business…" className="flex-1 rounded-lg border border-[#D1D6D9] px-3 py-1.5 text-sm" />
			<button type="button" onClick={() => onSave(value)} className="rounded-lg bg-[#0E63B0] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0A4A8A]">Save</button>
		</div>
	);
}
