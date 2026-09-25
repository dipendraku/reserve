'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Phone, Loader2, Search, Navigation, List, Map as MapIcon } from 'lucide-react';
import supabase from '@/lib/supabase';
import { FindProMap } from '@/components/find-pro-map';
import { BusinessProfileModal } from '@/components/business-profile-modal';


export type ProviderService = {
	id: string;
	name: string;
	description: string;
	category: string;
	duration_min: number;
	price_cents: number;
};

export type Provider = {
	id: string;
	name: string;
	business_name: string;
	phone: string;
	address: string;
	latitude: number | null;
	longitude: number | null;
	business_image_filename: string;
	services: ProviderService[];
	distance?: number;
};

const DEFAULT_CENTER = { lat: 37.7749, lon: -122.4194 }; // San Francisco fallback

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = 3959; // Earth radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return Math.round((R * c + Number.EPSILON) * 10) / 10;
};

export default function FindProPage() {
	const [providers, setProviders] = useState<Provider[]>([]);
	const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
	const [searchQuery, setSearchQuery] = useState('');
	const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
	const [gettingLocation, setGettingLocation] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [radius, setRadius] = useState(25); // miles
	const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
	const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
	const [focusProviderId, setFocusProviderId] = useState<string | null>(null);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const searchBoxRef = useRef<HTMLDivElement | null>(null);

	const loadProviders = async () => {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select(`
					id,
					name,
					business_name,
					phone,
					address,
					latitude,
					longitude,
					business_image_filename,
					services:services(id, name, description, category, duration_min, price_cents, active)
				`)
				.eq('role', 'provider')
				.not('latitude', 'is', null)
				.not('longitude', 'is', null);

			if (error) throw error;

			const providersData = (data ?? []).map(item => ({
				id: item.id,
				name: item.name,
				business_name: item.business_name,
				phone: item.phone || '',
				address: item.address || '',
				latitude: item.latitude,
				longitude: item.longitude,
				business_image_filename: item.business_image_filename || '',
				services: (Array.isArray(item.services) ? item.services : []).filter((s: { active?: boolean }) => s.active !== false),
			}));

			setProviders(providersData);
			setFilteredProviders(providersData);
		} catch (err) {
			const supabaseError = err && typeof err === 'object'
				? err as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown }
				: undefined;
			console.error('Failed to load providers:', {
				message: String(supabaseError?.message ?? err ?? 'Unknown error'),
				code: supabaseError?.code,
				details: supabaseError?.details,
				hint: supabaseError?.hint,
			});
			setLoadError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadProviders();
	}, []);

	const handleGetLocation = () => {
		setGettingLocation(true);
		setLocationError(null);

		if (!navigator.geolocation) {
			setLocationError('Geolocation is not supported by your browser');
			setGettingLocation(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setUserLocation({ lat: latitude, lon: longitude });
				setGettingLocation(false);
			},
			(error) => {
				setLocationError(`Failed to get location: ${error.message}`);
				setGettingLocation(false);
			},
		);
	};

	// Automatically request location on first load so the map centers on the customer right away
	useEffect(() => {
		handleGetLocation();
	}, []);

	useEffect(() => {
		let filtered = providers;

		// Search matches business name, owner name, address, or a service they offer
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				provider =>
					provider.name.toLowerCase().includes(query) ||
					provider.business_name.toLowerCase().includes(query) ||
					provider.address.toLowerCase().includes(query) ||
					provider.services.some(s => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)),
			);
		}

		// Add distances and filter by radius when we know the customer's location
		if (userLocation) {
			filtered = filtered
				.map(provider => ({
					...provider,
					distance: calculateDistance(userLocation.lat, userLocation.lon, provider.latitude || 0, provider.longitude || 0),
				}))
				.filter(provider => provider.distance! <= radius)
				.sort((a, b) => (a.distance || 0) - (b.distance || 0));
		}

		setFilteredProviders(filtered);
	}, [searchQuery, providers, userLocation, radius]);

	// Close the suggestions dropdown when clicking outside the search box
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	type Suggestion = { key: string; type: 'business' | 'service'; label: string; sublabel: string; provider: Provider };

	const suggestions = useMemo<Suggestion[]>(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return [];

		const results: Suggestion[] = [];

		for (const provider of providers) {
			const businessLabel = provider.business_name || provider.name;
			if (businessLabel.toLowerCase().includes(query) || provider.address.toLowerCase().includes(query)) {
				results.push({
					key: `business-${provider.id}`,
					type: 'business',
					label: businessLabel,
					sublabel: provider.address || 'Business',
					provider,
				});
			}

			for (const service of provider.services) {
				if (service.name.toLowerCase().includes(query) || service.category.toLowerCase().includes(query)) {
					results.push({
						key: `service-${service.id}`,
						type: 'service',
						label: service.name,
						sublabel: `at ${businessLabel}`,
						provider,
					});
				}
			}
		}

		return results.slice(0, 8);
	}, [searchQuery, providers]);

	const handleSelectSuggestion = (suggestion: Suggestion) => {
		setSearchQuery(suggestion.label);
		setShowSuggestions(false);
		setViewMode('map');
		setFocusProviderId(suggestion.provider.id);
	};

	const mapCenter = userLocation ?? DEFAULT_CENTER;

	return (
		<div className="bg-sky-50 py-6 lg:py-10">
			<div className="mx-auto max-w-7xl px-4 lg:px-6">
				{/* Top search bar */}
				<div className="mb-4">
					<h1 className="text-3xl font-semibold text-[#0B1F3A]">Find a Pro</h1>
					<p className="mt-2 text-[#5B6B7F]">Discover businesses near you and book instantly.</p>
				</div>

				<div className="mb-4 flex flex-wrap gap-3">
					<div ref={searchBoxRef} className="relative flex-1 min-w-[250px]">
						<Search className="absolute left-3 top-3 size-5 text-[#A1ACB6]" />
						<input
							type="text"
							placeholder="Search by service or business name..."
							value={searchQuery}
							onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
							onFocus={() => setShowSuggestions(true)}
							className="w-full rounded-lg border border-[#D1D6D9] bg-white pl-10 pr-4 py-2.5 text-[#0B1F3A] placeholder:text-[#A1ACB6] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
						/>

						{showSuggestions && suggestions.length > 0 && (
							<div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-[#E4ECF3] bg-white shadow-lg">
								{suggestions.map(suggestion => (
									<button
										key={suggestion.key}
										type="button"
										onClick={() => handleSelectSuggestion(suggestion)}
										className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-sky-50"
									>
										{suggestion.type === 'business' ? (
											<MapPin className="size-4 shrink-0 text-[#0E63B0]" />
										) : (
											<Search className="size-4 shrink-0 text-[#0E63B0]" />
										)}
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium text-[#0B1F3A]">{suggestion.label}</span>
											<span className="block truncate text-xs text-[#5B6B7F]">{suggestion.sublabel}</span>
										</span>
									</button>
								))}
							</div>
						)}
					</div>

					<button
						onClick={handleGetLocation}
						disabled={gettingLocation}
						className="flex items-center gap-2 rounded-lg border border-[#0E63B0] bg-white px-4 py-2.5 font-semibold text-[#0E63B0] transition-colors hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{gettingLocation ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Locating...
							</>
						) : (
							<>
								<Navigation className="size-4" />
								Get Current Location
							</>
						)}
					</button>

					<select
						value={radius}
						onChange={(e) => setRadius(Number(e.target.value))}
						className="rounded-lg border border-[#D1D6D9] bg-white px-3 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none"
					>
						<option value={5}>Within 5 miles</option>
						<option value={10}>Within 10 miles</option>
						<option value={25}>Within 25 miles</option>
						<option value={50}>Within 50 miles</option>
						<option value={100}>Within 100 miles</option>
					</select>

					<div className="flex gap-1 rounded-lg border border-[#D1D6D9] bg-white p-1">
						<button
							onClick={() => setViewMode('map')}
							className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-medium transition-colors ${
								viewMode === 'map' ? 'bg-[#0E63B0] text-white' : 'text-[#5B6B7F] hover:text-[#0B1F3A]'
							}`}
						>
							<MapIcon className="size-4" />
							Map
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-medium transition-colors ${
								viewMode === 'list' ? 'bg-[#0E63B0] text-white' : 'text-[#5B6B7F] hover:text-[#0B1F3A]'
							}`}
						>
							<List className="size-4" />
							List
						</button>
					</div>
				</div>

				{locationError && (
					<div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
						{locationError} — showing all businesses instead.
					</div>
				)}

				{loadError && (
					<div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
						Business listings could not be loaded. Check the browser console for the Supabase error details.
					</div>
				)}

				{userLocation && (
					<div className="mb-4 rounded-lg border border-[#E4ECF3] bg-white p-3 text-sm text-[#5B6B7F]">
						<span className="font-semibold text-[#0B1F3A]">Your location:</span> {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)} — showing businesses within {radius} miles
					</div>
				)}

				{isLoading ? (
					<div className="flex h-[60vh] items-center justify-center">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="size-6 animate-spin text-[#0E63B0]" />
							<p className="text-[#5B6B7F]">Loading businesses...</p>
						</div>
					</div>
				) : viewMode === 'map' ? (
					<div className="grid gap-4 lg:grid-cols-[1fr_360px]">
						<div className="h-[60vh] min-h-[420px] overflow-hidden rounded-lg border border-[#E4ECF3] bg-white">
							<FindProMap
								providers={filteredProviders}
								center={mapCenter}
								userLocation={userLocation}
								focusProviderId={focusProviderId}
								onSelectService={(provider, serviceId) => {
									setSelectedProvider(provider);
									setSelectedServiceId(serviceId ?? null);
								}}
							/>
						</div>

						<div className="max-h-[60vh] min-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-[#E4ECF3] bg-white p-3">
							{filteredProviders.length === 0 ? (
								<div className="p-4 text-center text-sm text-[#5B6B7F]">
									No businesses found{userLocation ? ` within ${radius} miles` : ''}. Try a different search or radius.
								</div>
							) : (
								filteredProviders.map(provider => (
									<div key={provider.id} className="rounded-lg border border-[#E4ECF3] p-3 hover:shadow-sm transition-shadow">
										<div className="flex items-start justify-between gap-2">
											<div>
												<h3 className="font-semibold text-[#0B1F3A]">{provider.business_name || provider.name}</h3>
												{provider.address && <p className="text-xs text-[#5B6B7F]">{provider.address}</p>}
											</div>
											{provider.distance !== undefined && (
												<span className="whitespace-nowrap text-xs font-medium text-[#5B6B7F]">{provider.distance} mi</span>
											)}
										</div>
										<button
											type="button"
											onClick={() => { setSelectedProvider(provider); setSelectedServiceId(null); }}
											className="mt-2 inline-flex rounded-lg bg-[#0E63B0] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0A4A8A]"
										>
											View Services
										</button>
									</div>
								))
							)}
						</div>
					</div>
				) : filteredProviders.length === 0 ? (
					<div className="rounded-lg border border-[#E4ECF3] bg-white p-8 text-center">
						<MapPin className="mx-auto mb-3 size-8 text-[#A1ACB6]" />
						<p className="text-[#5B6B7F]">
							No businesses found{userLocation ? ` within ${radius} miles of your location` : ''}. Try a different search.
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						{filteredProviders.map(provider => (
							<div key={provider.id} className="rounded-lg border border-[#E4ECF3] bg-white p-5 hover:shadow-md transition-shadow">
								<div className="flex flex-col gap-3">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="text-lg font-semibold text-[#0B1F3A]">{provider.business_name || provider.name}</h3>
											<p className="text-sm text-[#5B6B7F]">{provider.name}</p>
										</div>
										<div className="flex flex-col items-end gap-1">
											<span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0E63B0]">
												{provider.services.length} service{provider.services.length !== 1 ? 's' : ''}
											</span>
											{provider.distance !== undefined && (
												<span className="text-xs font-medium text-[#5B6B7F]">{provider.distance} miles away</span>
											)}
										</div>
									</div>

									<div className="space-y-1.5 text-sm">
										{provider.address && (
											<div className="flex items-center gap-2 text-[#5B6B7F]">
												<MapPin className="size-4 flex-shrink-0" />
												<span>{provider.address}</span>
											</div>
										)}
										{provider.phone && (
											<div className="flex items-center gap-2 text-[#5B6B7F]">
												<Phone className="size-4 flex-shrink-0" />
												<a href={`tel:${provider.phone}`} className="hover:text-[#0E63B0]">
													{provider.phone}
												</a>
											</div>
										)}
									</div>
									<button
										type="button"
										onClick={() => { setSelectedProvider(provider); setSelectedServiceId(null); }}
										className="mt-2 inline-flex w-fit rounded-lg bg-[#0E63B0] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0A4A8A]"
									>
										View Services
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{selectedProvider && (
				<BusinessProfileModal
					provider={selectedProvider}
					initialServiceId={selectedServiceId}
					onClose={() => { setSelectedProvider(null); setSelectedServiceId(null); }}
				/>
			)}
		</div>
	);
}

