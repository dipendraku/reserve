'use client';
import { type FormEvent, useEffect, useState } from 'react';
import { Loader2, Plus, Send, Trash2 } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { AppointmentRow } from '@/components/dashboard/overview';

type ClientRow = { id: string; name: string; email: string; phone: string; notes: string; created: string };
type ServiceRow = { id: string; name: string; category: string; durationMin: number; priceCents: number };
type MessageRow = { id: string; sender: string; body: string; created: string; client: string; expand?: { client?: { name: string } } };
type ScheduleRow = { enabled: boolean; start: string; end: string };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_SCHEDULE: Record<number, ScheduleRow> = Object.fromEntries(DAYS.map((_, day) => [day, { enabled: day > 0 && day < 6, start: '09:00', end: '17:00' }])) as Record<number, ScheduleRow>;

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const first = <T,>(value: T | T[] | null): T | undefined => Array.isArray(value) ? value[0] : value ?? undefined;

const PAYMENT_LABEL: Record<string, string> = {
	card_upfront: 'Paid · card',
	cash: 'Cash',
	app: 'App pay',
	unpaid: 'Unpaid',
};

export function AppointmentsTab() {
	const [rows, setRows] = useState<AppointmentRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.resolve(supabase.from('appointments').select('id,date,time,status,payment,price_cents, service:services(name), client:clients(id,name,email)').order('date', { ascending: false }).order('time', { ascending: false }))
			.then(({ data }) => setRows((data ?? []).map(row => ({
				id: row.id, date: row.date, time: String(row.time).slice(0, 5), status: row.status, payment: row.payment, priceCents: row.price_cents,
				expand: { service: first(row.service), client: first(row.client) },
			})))).catch(() => {}).finally(() => setLoading(false));
	}, []);

	const setStatus = async (id: string, status: string) => {
		const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
		if (!error) setRows(previous => previous.map(row => (row.id === id ? { ...row, status } : row)));
	};

	if (loading) return <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#0E63B0]" /></div>;

	return (
		<div className="overflow-hidden rounded-2xl border border-[#E4ECF3] bg-white">
			<table className="w-full text-left text-[15px]">
				<thead className="border-b border-[#E4ECF3] bg-sky-50 text-sm text-[#5B6B7F]">
					<tr>
						<th className="px-5 py-3 font-medium">When</th>
						<th className="px-5 py-3 font-medium">Service</th>
						<th className="px-5 py-3 font-medium">Client</th>
						<th className="px-5 py-3 font-medium">Payment</th>
						<th className="px-5 py-3 font-medium">Status</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[#E4ECF3]">
					{rows.map(row => (
						<tr key={row.id}>
							<td className="px-5 py-3 whitespace-nowrap">{row.date} · {row.time}</td>
							<td className="px-5 py-3">{row.expand?.service?.name ?? '—'}</td>
							<td className="px-5 py-3">{row.expand?.client?.name ?? '—'}</td>
							<td className="px-5 py-3 whitespace-nowrap">{PAYMENT_LABEL[row.payment] ?? row.payment} · {money(row.priceCents)}</td>
							<td className="px-5 py-3">
								<select
									value={row.status}
									onChange={event => setStatus(row.id, event.target.value)}
									className="h-9 rounded-lg border border-[#D1D6D9] bg-white px-2 text-sm outline-none focus:border-[#0E63B0]"
								>
									<option value="confirmed">Confirmed</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
								</select>
							</td>
						</tr>
					))}
					{rows.length === 0 ? (
						<tr><td colSpan={5} className="px-5 py-10 text-center text-[#9AA7B5]">No appointments yet — share your booking link.</td></tr>
					) : null}
				</tbody>
			</table>
		</div>
	);
}

export function ClientsTab() {
	const [rows, setRows] = useState<ClientRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');

	useEffect(() => {
		Promise.resolve(supabase.from('clients').select('id,name,email,phone,notes,created_at').order('created_at', { ascending: false }))
			.then(({ data }) => setRows((data ?? []).map(row => ({ ...row, created: row.created_at })))).catch(() => {}).finally(() => setLoading(false));
	}, []);

	const filtered = rows.filter(row => row.name.toLowerCase().includes(query.toLowerCase()) || row.email.includes(query.toLowerCase()));

	if (loading) return <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#0E63B0]" /></div>;

	return (
		<div className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
			<input
				value={query}
				onChange={event => setQuery(event.target.value)}
				placeholder="Search clients…"
				className="h-11 w-full max-w-sm rounded-xl border border-[#D1D6D9] px-4 text-[15px] outline-none focus:border-[#0E63B0]"
			/>
			<ul className="mt-4 divide-y divide-[#E4ECF3]">
				{filtered.map(client => (
					<li key={client.id} className="flex items-center justify-between gap-4 py-3.5">
						<div className="flex items-center gap-3">
							<span className="flex size-10 items-center justify-center rounded-full bg-[#0E63B0]/10 font-semibold text-[#0E63B0]">
								{client.name.slice(0, 1)}
							</span>
							<div>
								<p className="font-medium text-[#0B1F3A]">{client.name}</p>
								<p className="text-sm text-[#5B6B7F]">{client.email}{client.phone ? ` · ${client.phone}` : ''}</p>
							</div>
						</div>
						<span className="text-sm text-[#9AA7B5]">Since {client.created.slice(0, 10)}</span>
					</li>
				))}
				{filtered.length === 0 ? <li className="py-10 text-center text-[#9AA7B5]">No clients found.</li> : null}
			</ul>
		</div>
	);
}

export function InboxTab() {
	const [rows, setRows] = useState<MessageRow[]>([]);
	const [clients, setClients] = useState<ClientRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [replyTo, setReplyTo] = useState('');
	const [body, setBody] = useState('');
	const [sending, setSending] = useState(false);

	const load = () => {
		Promise.all([
				Promise.resolve(supabase.from('messages').select('id,sender,body,created_at,client, client_profile:clients(name)').order('created_at')),
				Promise.resolve(supabase.from('clients').select('id,name,email,phone,notes,created_at').order('name')),
		]).then(([messagesResult, clientsResult]) => {
			setRows((messagesResult.data ?? []).map(row => ({ id: row.id, sender: row.sender, body: row.body, created: row.created_at, client: row.client, expand: { client: first(row.client_profile) } })));
			setClients((clientsResult.data ?? []).map(row => ({ ...row, created: row.created_at })));
		})
			.catch(() => {}).finally(() => setLoading(false));
	};

	useEffect(load, []);

	const send = async (event: FormEvent) => {
		event.preventDefault();
		if (!replyTo || !body.trim()) return;

		setSending(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			await supabase.from('messages').insert({ client: replyTo, owner: user.id, sender: 'pro', body: body.trim() });
			setBody('');
			load();
		} finally {
			setSending(false);
		}
	};

	if (loading) return <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#0E63B0]" /></div>;

	return (
		<div className="grid gap-4 lg:grid-cols-[1fr_320px]">
			<div className="rounded-2xl border border-[#E4ECF3] bg-white p-5">
				<ul className="space-y-4">
					{rows.map(message => (
						<li key={message.id} className={`flex ${message.sender === 'pro' ? 'justify-end' : 'justify-start'}`}>
							<div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] ${message.sender === 'pro' ? 'bg-[#0E63B0] text-white' : 'bg-sky-50 text-[#0B1F3A]'}`}>
								<p>{message.body}</p>
								<p className={`mt-1 text-xs ${message.sender === 'pro' ? 'text-white/60' : 'text-[#9AA7B5]'}`}>
									{message.expand?.client?.name ?? 'Client'} · {message.created.slice(0, 10)}
								</p>
							</div>
						</li>
					))}
					{rows.length === 0 ? <li className="py-10 text-center text-[#9AA7B5]">No messages yet.</li> : null}
				</ul>
			</div>
			<form onSubmit={send} className="h-fit rounded-2xl border border-[#E4ECF3] bg-white p-5">
				<p className="font-semibold text-[#0B1F3A]">Message a client</p>
				<select value={replyTo} onChange={event => setReplyTo(event.target.value)} required className="mt-3 h-11 w-full rounded-xl border border-[#D1D6D9] bg-white px-3 text-[15px] outline-none focus:border-[#0E63B0]">
					<option value="">Choose client…</option>
					{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
				</select>
				<textarea value={body} onChange={event => setBody(event.target.value)} rows={3} required placeholder="Write your message…" className="mt-3 w-full rounded-xl border border-[#D1D6D9] px-4 py-3 text-[15px] outline-none focus:border-[#0E63B0]" />
				<button type="submit" disabled={sending} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E63B0] font-semibold text-white hover:bg-[#0d5a9e] disabled:opacity-60">
					{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
					Send
				</button>
			</form>
		</div>
	);
}

export function ServicesTab() {
	const [rows, setRows] = useState<ServiceRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [name, setName] = useState('');
	const [category, setCategory] = useState('Beauty');
	const [duration, setDuration] = useState('60');
	const [price, setPrice] = useState('50');
	const [saving, setSaving] = useState(false);
	const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
	const [savingSchedule, setSavingSchedule] = useState(false);

	const load = () => {
		Promise.all([
			 supabase.from('services').select('id,name,category,duration_min,price_cents').order('name'),
			 supabase.from('availability').select('weekday,start_time,end_time').order('weekday').order('start_time'),
		]).then(([servicesResult, availabilityResult]) => {
			setRows((servicesResult.data ?? []).map(row => ({ id: row.id, name: row.name, category: row.category, durationMin: row.duration_min, priceCents: row.price_cents })));
			const next = { ...DEFAULT_SCHEDULE };
			for (const row of availabilityResult.data ?? []) next[row.weekday] = { enabled: true, start: String(row.start_time).slice(0, 5), end: String(row.end_time).slice(0, 5) };
			setSchedule(next);
		}).catch(() => {}).finally(() => setLoading(false));
	};

	useEffect(load, []);

	const add = async (event: FormEvent) => {
		event.preventDefault();
		setSaving(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			await supabase.from('services').insert({
				name,
				category,
				duration_min: Number(duration),
				price_cents: Math.round(Number(price) * 100),
				owner: user.id,
			});
			setName('');
			load();
		} finally {
			setSaving(false);
		}
	};

	const remove = async (id: string) => {
		const { error } = await supabase.from('services').delete().eq('id', id);
		if (!error) setRows(previous => previous.filter(row => row.id !== id));
	};

	const saveSchedule = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		setSavingSchedule(true);
		try {
			await supabase.from('availability').delete().eq('owner', user.id);
			const rowsToInsert = Object.entries(schedule).filter(([, value]) => value.enabled).map(([weekday, value]) => ({ owner: user.id, weekday: Number(weekday), start_time: value.start, end_time: value.end }));
			if (rowsToInsert.length > 0) await supabase.from('availability').insert(rowsToInsert);
		} finally {
			setSavingSchedule(false);
		}
	};

	if (loading) return <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-[#0E63B0]" /></div>;

	const inputClass = 'h-11 rounded-xl border border-[#D1D6D9] px-3 text-[15px] outline-none focus:border-[#0E63B0]';

	return (
		<div className="grid gap-4 lg:grid-cols-[1fr_320px]">
			<ul className="space-y-3">
				{rows.map(service => (
					<li key={service.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#E4ECF3] bg-white px-5 py-4">
						<div>
							<p className="font-medium text-[#0B1F3A]">{service.name}</p>
							<p className="text-sm text-[#5B6B7F]">{service.category} · {service.durationMin} min · {money(service.priceCents)}</p>
						</div>
						<button type="button" onClick={() => remove(service.id)} className="flex size-9 items-center justify-center rounded-lg text-[#9AA7B5] hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${service.name}`}>
							<Trash2 className="size-4" />
						</button>
					</li>
				))}
				{rows.length === 0 ? <li className="rounded-2xl border border-[#E4ECF3] bg-white py-10 text-center text-[#9AA7B5]">No services yet — add your first one.</li> : null}
			</ul>
			<form onSubmit={add} className="h-fit space-y-3 rounded-2xl border border-[#E4ECF3] bg-white p-5">
				<p className="font-semibold text-[#0B1F3A]">Add a service</p>
				<input value={name} onChange={event => setName(event.target.value)} required placeholder="Service name" className={`${inputClass} w-full`} />
				<select value={category} onChange={event => setCategory(event.target.value)} className={`${inputClass} w-full bg-white`}>
					{['Beauty', 'Wellness', 'Fitness', 'Education', 'Other'].map(option => <option key={option} value={option}>{option}</option>)}
				</select>
				<div className="flex gap-3">
					<input value={duration} onChange={event => setDuration(event.target.value)} required type="number" min="5" max="480" placeholder="Minutes" className={`${inputClass} w-full`} />
					<input value={price} onChange={event => setPrice(event.target.value)} required type="number" min="0" step="0.01" placeholder="Price $" className={`${inputClass} w-full`} />
				</div>
				<button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E63B0] font-semibold text-white hover:bg-[#0d5a9e] disabled:opacity-60">
					{saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
					Add service
				</button>
				<div className="border-t border-[#E4ECF3] pt-4">
					<p className="font-semibold text-[#0B1F3A]">Weekly availability</p>
					<p className="mt-1 text-xs text-[#5B6B7F]">Customers only see slots inside these windows.</p>
					<div className="mt-3 space-y-2">
						{DAYS.map((day, weekday) => (
							<div key={day} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-sm">
								<label className="flex w-24 items-center gap-2 text-[#0B1F3A]"><input type="checkbox" checked={schedule[weekday].enabled} onChange={event => setSchedule(previous => ({ ...previous, [weekday]: { ...previous[weekday], enabled: event.target.checked } }))} />{day.slice(0, 3)}</label>
								<input type="time" disabled={!schedule[weekday].enabled} value={schedule[weekday].start} onChange={event => setSchedule(previous => ({ ...previous, [weekday]: { ...previous[weekday], start: event.target.value } }))} className={inputClass} />
								<input type="time" disabled={!schedule[weekday].enabled} value={schedule[weekday].end} onChange={event => setSchedule(previous => ({ ...previous, [weekday]: { ...previous[weekday], end: event.target.value } }))} className={inputClass} />
							</div>
						))}
					</div>
					<button type="button" onClick={saveSchedule} disabled={savingSchedule} className="mt-3 h-10 w-full rounded-xl border border-[#0E63B0] font-semibold text-[#0E63B0] hover:bg-sky-50 disabled:opacity-60">
						{savingSchedule ? 'Saving…' : 'Save availability'}
					</button>
				</div>
			</form>
		</div>
	);
}
