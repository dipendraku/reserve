'use client';
import { useState, useEffect } from 'react';
import { Upload, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { AuthUser } from '@/lib/require-auth';

type ProfileData = {
	name: string;
	business_name: string;
	phone: string;
	address: string;
	latitude: number | null;
	longitude: number | null;
	business_image_filename: string;
	business_document_filename: string;
};

export function ProfileTab({ user }: { user: AuthUser }) {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [uploadingDoc, setUploadingDoc] = useState(false);
	const [gettingLocation, setGettingLocation] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		loadProfile();
	}, [user.id]);

	const loadProfile = async () => {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('name, business_name, phone, address, latitude, longitude, business_image_filename, business_document_filename')
				.eq('id', user.id)
				.single();

			if (error) throw error;
			setProfile(data);
		} catch (err) {
			console.error('Failed to load profile:', err);
			setErrorMessage('Failed to load profile');
		} finally {
			setIsLoading(false);
		}
	};

	const handleProfileChange = (field: keyof ProfileData, value: unknown) => {
		setProfile(prev => (prev ? { ...prev, [field]: value } : prev));
	};

	const handleGetLocation = async () => {
		setGettingLocation(true);
		setErrorMessage(null);

		if (!navigator.geolocation) {
			setErrorMessage('Geolocation is not supported by your browser');
			setGettingLocation(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setProfile(prev => (prev ? { ...prev, latitude, longitude } : prev));
				setSuccessMessage(`Location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
				setTimeout(() => setSuccessMessage(null), 3000);
				setGettingLocation(false);
			},
			(error) => {
				setErrorMessage(`Failed to get location: ${error.message}`);
				setGettingLocation(false);
			},
		);
	};

	const handleSaveProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;

		setIsSaving(true);
		setErrorMessage(null);

		try {
			const { error } = await supabase
				.from('profiles')
				.update({
					name: profile.name,
					business_name: profile.business_name,
					phone: profile.phone,
					address: profile.address,
					latitude: profile.latitude,
					longitude: profile.longitude,
				})
				.eq('id', user.id);

			if (error) throw error;
			setSuccessMessage('Profile updated successfully!');
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : 'Failed to save profile');
		} finally {
			setIsSaving(false);
		}
	};

	const handleFileUpload = async (file: File, fileType: 'image' | 'document') => {
		if (fileType === 'image') setUploadingImage(true);
		else setUploadingDoc(true);

		try {
			const token = localStorage.getItem('supabase.auth.token');
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', fileType);

			const response = await fetch('/api/upload', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Upload failed');
			}

			const data = await response.json();
			const columnName = fileType === 'image' ? 'business_image_filename' : 'business_document_filename';
			handleProfileChange(columnName, data.filename);
			setSuccessMessage(`${fileType === 'image' ? 'Image' : 'Document'} uploaded successfully!`);
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			if (fileType === 'image') setUploadingImage(false);
			else setUploadingDoc(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-6 animate-spin text-[#0E63B0]" />
			</div>
		);
	}

	if (!profile) {
		return <div className="text-center text-[#5B6B7F]">Failed to load profile</div>;
	}

	const businessImageUrl = profile.business_image_filename
		? `/uploads/${profile.business_name?.replace(/\s+/g, '_').toLowerCase() ?? 'unknown'}/${profile.business_image_filename}`
		: null;

	const businessDocUrl = profile.business_document_filename
		? `/uploads/${profile.business_name?.replace(/\s+/g, '_').toLowerCase() ?? 'unknown'}/${profile.business_document_filename}`
		: null;

	return (
		<div className="space-y-6">
			{successMessage && (
				<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
					<CheckCircle2 className="size-4 flex-shrink-0" />
					{successMessage}
				</div>
			)}

			{errorMessage && (
				<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					<span>⚠️</span>
					{errorMessage}
				</div>
			)}

			<form onSubmit={handleSaveProfile} className="space-y-4 rounded-lg border border-[#E4ECF3] bg-white p-6">
				<h2 className="text-lg font-semibold text-[#0B1F3A]">Business Information</h2>

				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Name</label>
						<input
							type="text"
							value={profile.name}
							onChange={(e) => handleProfileChange('name', e.target.value)}
							className="mt-1 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2 text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Business Name</label>
						<input
							type="text"
							value={profile.business_name}
							onChange={(e) => handleProfileChange('business_name', e.target.value)}
							className="mt-1 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2 text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Phone</label>
						<input
							type="tel"
							value={profile.phone}
							onChange={(e) => handleProfileChange('phone', e.target.value)}
							className="mt-1 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2 text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Address</label>
						<input
							type="text"
							value={profile.address}
							onChange={(e) => handleProfileChange('address', e.target.value)}
							className="mt-1 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2 text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Latitude</label>
						<input
							type="number"
							step="0.00000001"
							value={profile.latitude || ''}
							onChange={(e) => handleProfileChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
							className="mt-1 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2 text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
							placeholder="e.g., 40.7128"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-[#0B1F3A]">Longitude</label>
						<input
							type="number"
							step="0.00000001"
							value={profile.longitude || ''}
							onChange={(e) => handleProfileChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
							className="mt-1 w-full rounded-lg border border-[#D1D6D9] bg-white px-4 py-2 text-[#0B1F3A] focus:border-[#0E63B0] focus:outline-none focus:ring-1 focus:ring-[#0E63B0]"
							placeholder="e.g., -74.0060"
						/>
					</div>
				</div>

				<div className="flex flex-wrap gap-3">
					<button
						type="submit"
						disabled={isSaving}
						className="flex items-center gap-2 rounded-lg bg-[#0E63B0] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#0A4A8A] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSaving ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							'Save Profile'
						)}
					</button>

					<button
						type="button"
						onClick={handleGetLocation}
						disabled={gettingLocation}
						className="flex items-center gap-2 rounded-lg border border-[#0E63B0] bg-white px-6 py-2 font-semibold text-[#0E63B0] transition-colors hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{gettingLocation ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Getting Location...
							</>
						) : (
							<>
								<MapPin className="size-4" />
								Get Current Location
							</>
						)}
					</button>
				</div>
			</form>

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="rounded-lg border border-[#E4ECF3] bg-white p-6">
					<h3 className="mb-4 font-semibold text-[#0B1F3A]">Business Image</h3>

					{businessImageUrl && (
						<div className="mb-4 rounded-lg border border-[#D1D6D9] p-3">
							<img src={businessImageUrl} alt="Business" className="mb-3 w-full rounded h-32 object-cover" />
							<p className="text-xs text-[#5B6B7F]">Current: {profile.business_image_filename}</p>
						</div>
					)}

					<label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D1D6D9] bg-sky-50 p-6 transition-colors hover:border-[#0E63B0]">
						<Upload className="size-5 text-[#0E63B0]" />
						<span className="font-medium text-[#0B1F3A]">
							{uploadingImage ? 'Uploading...' : 'Upload Image'}
						</span>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleFileUpload(file, 'image');
							}}
							disabled={uploadingImage}
							className="hidden"
						/>
					</label>
				</div>

				<div className="rounded-lg border border-[#E4ECF3] bg-white p-6">
					<h3 className="mb-4 font-semibold text-[#0B1F3A]">Business Document</h3>

					{businessDocUrl && (
						<div className="mb-4 rounded-lg border border-[#D1D6D9] p-3 bg-sky-50">
							<p className="text-sm font-medium text-[#0B1F3A]">📄 {profile.business_document_filename}</p>
							<a
								href={businessDocUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-2 text-xs text-[#0E63B0] hover:underline"
							>
								View Document
							</a>
						</div>
					)}

					<label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D1D6D9] bg-sky-50 p-6 transition-colors hover:border-[#0E63B0]">
						<Upload className="size-5 text-[#0E63B0]" />
						<span className="font-medium text-[#0B1F3A]">
							{uploadingDoc ? 'Uploading...' : 'Upload Document'}
						</span>
						<input
							type="file"
							accept=".pdf,.doc,.docx,.xls,.xlsx"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleFileUpload(file, 'document');
							}}
							disabled={uploadingDoc}
							className="hidden"
						/>
					</label>
				</div>
			</div>
		</div>
	);
}
