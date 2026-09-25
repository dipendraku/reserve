'use client';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/next-router-compat';
import { CalendarCheck, CheckCircle2, Clock, Loader2, Scissors } from 'lucide-react';
import supabase from '@/lib/supabase';


type Service = {
	id: string;
	owner: string;
	name: string;
	description: string;
	category: string;
	durationMin: number;
	priceCents: number;
	ownerName?: string;
};

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const first = <T,>(value: T | T[] | null): T | undefined => Array.isArray(value) ? value[0] : value ?? undefined;

const todayKey = () => {
	const now = new Date();

	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function BookPage() {
	const [searchParams] = useSearchParams();
	const preselectedServiceId = searchParams.get('service');
	const preselectedProviderId = searchParams.get('provider');
	const [services, setServices] = useState<Service[]>([]);
	const [loadError, setLoadError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [service, setService] = useState<Service | null>(null);
	const [date, setDate] = useState(todayKey());
	const [taken, setTaken] = useState<string[]>([]);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [time, setTime] = useState<string | null>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [notes, setNotes] = useState('');
	const [payment, setPayment] = useState('card_upfront');
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [confirmed, setConfirmed] = useState<{ appointmentId: string; service: string; date: string; time: string; priceCents: number; estimatedQueueMinutes: number } | null>(null);

	useEffect(() => {
		Promise.resolve(
			supabase
				.from('services')
				.select('id, owner, name, description, category, duration_min, price_cents, owner_profile:profiles(business_name, name)')
				.eq('active', true)
				.order('price_cents')
				.then(({ data, error }) => {
					if (error) throw error;
					setServices((data ?? []).map(item => ({
						id: item.id,
						owner: item.owner,
						name: item.name,
						description: item.description,
						category: item.category,
						durationMin: item.duration_min,
						priceCents: item.price_cents,
						ownerName: first(item.owner_profile as unknown as { business_name?: string } | { business_name?: string }[])?.business_name,
					})));
				}),
		)
			.catch(() => setLoadError(true))
			.finally(() => setIsLoading(false));
	}, []);

	// Auto-select the service passed via ?service= (e.g. from the Find Pro map/profile modal)
	useEffect(() => {
		if (!preselectedServiceId || services.length === 0) return;
		const match = services.find(item => item.id === preselectedServiceId);
		if (match) setService(match);
	}, [preselectedServiceId, services]);

	// Narrow the list to one business when arriving via a QR code or provider link (?provider=)
	const visibleServices = useMemo(
		() => preselectedProviderId ? services.filter(item => item.owner === preselectedProviderId) : services,
		[services, preselectedProviderId],
	);

	useEffect(() => {
		if (!service || !date) return;

		setSlotsLoading(true);
		setTime(null);
		fetch(`/api/availability?serviceId=${service.id}&date=${date}`)
			.then(response => response.json())
			.then((data: { taken?: string[]; slots?: string[] }) => { setTaken(data.taken ?? []); setAvailableSlots(data.slots ?? []); })
			.catch(() => { setTaken([]); setAvailableSlots([]); })
			.finally(() => setSlotsLoading(false));
	}, [service, date]);

	const slots = useMemo(() => {
		const now = new Date();
		const isToday = date === todayKey();

		return availableSlots.filter((slot) => {
			if (!isToday) return true;

			return Number(slot.slice(0, 2)) > now.getHours();
		});
	}, [availableSlots, date]);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!service || !time) return;

		setSubmitError(null);
		setIsSubmitting(true);

		try {
			const response = await fetch('/api/book', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ serviceId: service.id, date, time, name, email, phone, notes, payment }),
			});
			const data = await response.json();

			if (!response.ok) {
				setSubmitError(data.error ?? 'Could not complete the booking. Try again.');

				if (response.status === 409) {
					fetch(`/api/availability?serviceId=${service.id}&date=${date}`)
						.then(r => r.json())
						.then((d: { taken?: string[]; slots?: string[] }) => { setTaken(d.taken ?? []); setAvailableSlots(d.slots ?? []); setTime(null); });
				}

				return;
			}

			setConfirmed(data);
		} catch {
			setSubmitError('Network error — please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const inputClass = 'h-12 w-full rounded-xl border border-[#D1D6D9] bg-white px-4 text-[15px] outline-none transition-colors placeholder:text-[#9AA7B5] focus:border-[#0E63B0] focus:ring-2 focus:ring-[#0E63B0]/20';

	if (confirmed) {
		return (
			<div className="flex min-h-[70dvh] items-center justify-center bg-sky-50 px-4 py-16">
				<div className="w-full max-w-md rounded-3xl border border-[#E4ECF3] bg-white p-8 text-center shadow-[0_12px_32px_rgba(16,24,40,0.06)]">
					<CheckCircle2 className="mx-auto size-14 text-[#0E63B0]" />
					<h1 className="mt-4 text-2xl font-semibold text-[#0B1F3A]">You are booked!</h1>
					<p className="mt-3 text-[15px] leading-6 text-[#5B6B7F]">
						{confirmed.service} on <strong className="text-[#0B1F3A]">{confirmed.date}</strong> at{' '}
						<strong className="text-[#0B1F3A]">{confirmed.time}</strong> — {money(confirmed.priceCents)}.
						Estimated queue time: {confirmed.estimatedQueueMinutes} minutes. A confirmation is on its way to your inbox.
					</p>

					<p className="mt-4 text-sm text-[#5B6B7F]">After your appointment, the business will mark it complete and you can share feedback.</p>
					<a href={`/review?booking=${confirmed.appointmentId}`} className="mt-2 inline-block text-sm font-semibold text-[#0E63B0] hover:underline">Open your review link</a>

					<button
						type="button"
						onClick={() => { setConfirmed(null); setService(null); setTime(null); }}
						className="mt-6 h-12 w-full rounded-xl bg-[#0E63B0] font-semibold text-white transition-colors hover:bg-[#0d5a9e]"
					>
						Book another appointment
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-sky-50 py-14 lg:py-20">
			<div className="mx-auto max-w-6xl px-4 lg:px-6">
				<h1 className="text-center text-3xl font-semibold text-[#0B1F3A] lg:text-[2.6rem]">Find a Pro &amp; book instantly</h1>
				<p className="mx-auto mt-3 max-w-xl text-center text-[17px] text-[#5B6B7F]">
					Pick a service, choose a time, and you are in. Pay securely upfront or at your visit.
				</p>

				{isLoading ? (
					<div className="mt-16 flex justify-center"><Loader2 className="size-8 animate-spin text-[#0E63B0]" /></div>
				) : loadError ? (
					<p className="mt-16 text-center text-[#5B6B7F]">Could not load services right now — please refresh.</p>
				) : (
					<div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
						<div className="space-y-4">
							{visibleServices.map(item => (
								<button
									key={item.id}
									type="button"
									onClick={() => setService(item)}
									className={`w-full rounded-2xl border bg-white p-5 text-left transition-all active:scale-[0.99] ${service?.id === item.id ? 'border-[#0E63B0] ring-2 ring-[#0E63B0]/20' : 'border-[#E4ECF3] hover:border-[#0E63B0]/50'}`}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-3">
											<span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(193_100%_42%)] text-white">
												<Scissors className="size-5" />
											</span>
											<div>
												<p className="text-[17px] font-semibold text-[#0B1F3A]">{item.name}</p>
														<p className="mt-0.5 text-sm text-[#5B6B7F]">{item.ownerName ?? 'Independent Pro'} · {item.category}</p>
												<p className="mt-1.5 line-clamp-2 text-[14px] leading-5 text-[#5B6B7F]">{item.description}</p>
											</div>
										</div>
										<div className="shrink-0 text-right">
											<p className="text-[17px] font-semibold text-[#0B1F3A]">{money(item.priceCents)}</p>
											<p className="mt-0.5 flex items-center justify-end gap-1 text-sm text-[#5B6B7F]">
												<Clock className="size-3.5" />{item.durationMin} min
											</p>
										</div>
									</div>
								</button>
							))}
						</div>

						<div className="h-fit rounded-3xl border border-[#E4ECF3] bg-white p-6 shadow-[0_12px_32px_rgba(16,24,40,0.05)] lg:sticky lg:top-24">
							{!service ? (
								<div className="flex flex-col items-center py-14 text-center">
									<CalendarCheck className="size-10 text-[#9AA7B5]" />
									<p className="mt-4 text-[15px] text-[#5B6B7F]">Select a service to see available times.</p>
								</div>
							) : (
								<form onSubmit={submit} className="space-y-5">
									<div>
										<p className="text-lg font-semibold text-[#0B1F3A]">{service.name}</p>
										<p className="text-sm text-[#5B6B7F]">{money(service.priceCents)} · {service.durationMin} min</p>
									</div>

									<div>
										<label htmlFor="book-date" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Date</label>
										<input id="book-date" type="date" required min={todayKey()} value={date} onChange={event => setDate(event.target.value)} className={inputClass} />
									</div>

									<div>
										<p className="mb-2 text-sm font-medium text-[#0B1F3A]">Time</p>
										{slotsLoading ? (
											<div className="flex justify-center py-4"><Loader2 className="size-6 animate-spin text-[#0E63B0]" /></div>
										) : slots.length === 0 ? (
											<p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-[#5B6B7F]">No times left on this day — try another date.</p>
										) : (
											<div className="grid grid-cols-3 gap-2">
												{slots.map((slot) => {
													const isTaken = taken.includes(slot);

													return (
														<button
															key={slot}
															type="button"
															disabled={isTaken}
															onClick={() => setTime(slot)}
															className={`h-11 rounded-xl border text-sm font-medium transition-colors ${isTaken ? 'cursor-not-allowed border-[#E4ECF3] bg-sky-50 text-[#9AA7B5] line-through' : time === slot ? 'border-[#0E63B0] bg-[#0E63B0] text-white' : 'border-[#D1D6D9] hover:border-[#0E63B0]'}`}
														>
															{slot}
														</button>
													);
												})}
											</div>
										)}
									</div>

									{time ? (
										<>
											<div className="grid gap-4 sm:grid-cols-2">
												<div>
													<label htmlFor="book-name" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Name</label>
													<input id="book-name" required value={name} onChange={event => setName(event.target.value)} placeholder="Your name" className={inputClass} />
												</div>
												<div>
													<label htmlFor="book-phone" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Phone</label>
													<input id="book-phone" value={phone} onChange={event => setPhone(event.target.value)} placeholder="Optional" className={inputClass} />
												</div>
											</div>
											<div>
												<label htmlFor="book-email" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Email</label>
												<input id="book-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@email.com" className={inputClass} />
											</div>
											<div>
												<label htmlFor="book-notes" className="mb-2 block text-sm font-medium text-[#0B1F3A]">Notes for your pro</label>
												<textarea id="book-notes" rows={2} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Anything we should know?" className="w-full rounded-xl border border-[#D1D6D9] px-4 py-3 text-[15px] outline-none focus:border-[#0E63B0] focus:ring-2 focus:ring-[#0E63B0]/20" />
											</div>
											<div>
												<p className="mb-2 text-sm font-medium text-[#0B1F3A]">Payment</p>
												<div className="grid grid-cols-3 gap-2">
													{[
														{ value: 'card_upfront', label: 'Card now' },
														{ value: 'cash', label: 'Cash' },
														{ value: 'app', label: 'App pay' },
													].map(option => (
														<button
															key={option.value}
															type="button"
															onClick={() => setPayment(option.value)}
															className={`h-11 rounded-xl border text-sm font-medium transition-colors ${payment === option.value ? 'border-[#0E63B0] bg-[#0E63B0]/5 text-[#0E63B0]' : 'border-[#D1D6D9] text-[#5B6B7F] hover:border-[#0E63B0]'}`}
														>
															{option.label}
														</button>
													))}
												</div>
											</div>

											{submitError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}

											<button
												type="submit"
												disabled={isSubmitting}
												className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E63B0] font-semibold text-white transition-colors hover:bg-[#0d5a9e] disabled:opacity-60"
											>
												{isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
												Confirm booking — {money(service.priceCents)}
											</button>
										</>
									) : null}
								</form>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
