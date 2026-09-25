'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import type { Provider } from '@/routes/find-pro';

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

type FindProMapProps = {
	providers: Provider[];
	center: { lat: number; lon: number };
	userLocation: { lat: number; lon: number } | null;
	focusProviderId?: string | null;
	onSelectService: (provider: Provider, serviceId?: string) => void;
};

const containerStyle = { width: '100%', height: '100%' };

const mapOptions: google.maps.MapOptions = {
	disableDefaultUI: false,
	clickableIcons: false,
	streetViewControl: false,
	mapTypeControl: false,
	fullscreenControl: true,
};

export function FindProMap({ providers, center, userLocation, focusProviderId, onSelectService }: FindProMapProps) {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
	const { isLoaded, loadError } = useJsApiLoader({
		id: 'reserveme-google-maps',
		googleMapsApiKey: apiKey,
	});

	const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);

	const markers = useMemo(
		() => providers.filter(p => p.latitude !== null && p.longitude !== null),
		[providers],
	);

	const onMapLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map;
		if (markers.length === 0) return;
		const bounds = new google.maps.LatLngBounds();
		markers.forEach(p => bounds.extend({ lat: p.latitude as number, lng: p.longitude as number }));
		if (userLocation) bounds.extend({ lat: userLocation.lat, lng: userLocation.lon });
		map.fitBounds(bounds, 64);
	}, [markers, userLocation]);

	// Pan/zoom to the business chosen from the search dropdown and pop open its card
	useEffect(() => {
		if (!focusProviderId || !mapRef.current) return;
		const provider = markers.find(p => p.id === focusProviderId);
		if (!provider) return;
		mapRef.current.panTo({ lat: provider.latitude as number, lng: provider.longitude as number });
		mapRef.current.setZoom(15);
		setActiveProviderId(provider.id);
	}, [focusProviderId, markers]);

	if (!apiKey) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 p-8 text-center">
				<MapPin className="size-8 text-[#A1ACB6]" />
				<p className="font-medium text-[#0B1F3A]">Google Maps API key not configured</p>
				<p className="max-w-sm text-sm text-[#5B6B7F]">
					Add a free key from Google Cloud Console to <code className="rounded bg-white px-1 py-0.5">VITE_GOOGLE_MAPS_API_KEY</code> in your .env file to enable the map.
				</p>
			</div>
		);
	}

	if (loadError) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 p-8 text-center text-sm text-red-600">
				Failed to load Google Maps. Please check your API key and network connection.
			</div>
		);
	}

	if (!isLoaded) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 p-8 text-sm text-[#5B6B7F]">
				Loading map...
			</div>
		);
	}

	return (
		<GoogleMap
			mapContainerStyle={containerStyle}
			center={{ lat: center.lat, lng: center.lon }}
			zoom={11}
			options={mapOptions}
			onLoad={onMapLoad}
		>
			{userLocation && (
				<MarkerF
					position={{ lat: userLocation.lat, lng: userLocation.lon }}
					icon={{
						path: google.maps.SymbolPath.CIRCLE,
						scale: 8,
						fillColor: '#0E63B0',
						fillOpacity: 1,
						strokeColor: '#ffffff',
						strokeWeight: 2,
					}}
					title="Your location"
				/>
			)}

			{markers.map(provider => (
				<MarkerF
					key={provider.id}
					position={{ lat: provider.latitude as number, lng: provider.longitude as number }}
					title={provider.business_name || provider.name}
					onClick={() => setActiveProviderId(provider.id)}
				>
					{activeProviderId === provider.id && (
						<InfoWindowF onCloseClick={() => setActiveProviderId(null)}>
							{/* Business card: flags the business + services available at this pin */}
							<div className="w-56 space-y-2 text-sm">
								<div>
									<p className="font-semibold text-[#0B1F3A]">{provider.business_name || provider.name}</p>
									{provider.address && <p className="text-xs text-[#5B6B7F]">{provider.address}</p>}
									{provider.distance !== undefined && (
										<p className="text-xs text-[#5B6B7F]">{provider.distance} miles away</p>
									)}
								</div>

								{provider.services.length === 0 ? (
									<p className="text-xs text-[#5B6B7F]">No services listed yet.</p>
								) : (
									<div className="max-h-40 space-y-1 overflow-y-auto">
										{provider.services.map(service => (
											<button
												key={service.id}
												type="button"
												onClick={() => onSelectService(provider, service.id)}
												className="flex w-full items-center justify-between gap-2 rounded border border-[#E4ECF3] px-2 py-1 text-left text-xs hover:border-[#0E63B0] hover:bg-sky-50"
											>
												<span className="truncate text-[#0B1F3A]">{service.name}</span>
												<span className="shrink-0 font-semibold text-[#0E63B0]">{money(service.price_cents)}</span>
											</button>
										))}
									</div>
								)}

								<button
									type="button"
									onClick={() => onSelectService(provider)}
									className="w-full rounded bg-[#0E63B0] px-2 py-1.5 text-xs font-semibold text-white hover:bg-[#0A4A8A]"
								>
									View Full Profile
								</button>
							</div>
						</InfoWindowF>
					)}
				</MarkerF>
			))}
		</GoogleMap>
	);
}
