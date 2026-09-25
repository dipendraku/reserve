'use client';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Upload, User } from 'lucide-react';
import { requireAuth } from '@/lib/require-auth';
import supabase from '@/lib/supabase';



export function HydrateFallback() {
	return <div className="min-h-[60dvh] bg-sky-50" />;
}

type ProfileData = { name: string; phone: string; address: string; avatar_filename: string };

export default function AccountPage({ loaderData }: { loaderData: { user: import('@/lib/require-auth').AuthUser } }) {
	const user = loaderData.user;
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		supabase
			.from('profiles')
			.select('name, phone, address, avatar_filename')
			.eq('id', user.id)
			.single()
			.then(({ data }) => {
				setProfile(data as ProfileData);
				setIsLoading(false);
			});
	}, [user.id]);

	const handleChange = (field: keyof ProfileData, value: string) => {
		setProfile(prev => (prev ? { ...prev, [field]: value } : prev));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;
		setIsSaving(true);
		const { error } = await supabase
			.from('profiles')
			.update({ name: profile.name, phone: profile.phone, address: profile.address })
			.eq('id', user.id);
		setIsSaving(false);
		if (!error) {
			setSuccessMessage('Profile updated!');
			setTimeout(() => setSuccessMessage(null), 3000);
		}
	};

	const handleAvatarUpload = async (file: File) => {
		setUploadingAvatar(true);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', 'avatar');

			const response = await fetch('/api/upload', {
				method: 'POST',
				headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
				body: formData,
			});
			if (!response.ok) throw new Error('Upload failed');
			const data = await response.json();
			handleChange('avatar_filename', data.filename);
			setSuccessMessage('Photo updated!');
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch {
			// no-op — button returns to idle state, user can retry
		} finally {
			setUploadingAvatar(false);
		}
	};

	if (isLoading || !profile) {
		return <div className="flex min-h-[60dvh] items-center justify-center bg-sky-50"><Loader2 className="size-8 animate-spin text-[#0E63B0]" /></div>;
	}

	const avatarUrl = profile.avatar_filename ? `/uploads/${user.id}/${profile.avatar_filename}` : null;

	return (
		<div className="bg-sky-50 py-10 lg:py-14">
			<div className="mx-auto max-w-2xl px-4 lg:px-6">
				<h1 className="text-3xl font-semibold text-[#0B1F3A]">My Account</h1>
				<p className="mt-1 text-[15px] text-[#5B6B7F]">Update your profile, contact info, and address.</p>

				{successMessage && (
					<div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
						<CheckCircle2 className="size-4" /> {successMessage}
					</div>
				)}

				<form onSubmit={handleSave} className="mt-6 space-y-5 rounded-2xl border border-[#E4ECF3] bg-white p-6">
					<div className="flex items-center gap-4">
						{avatarUrl ? (
							<img src={avatarUrl} alt="Profile" className="size-16 rounded-full object-cover" />
						) : (
							<div className="flex size-16 items-center justify-center rounded-full bg-sky-50"><User className="size-7 text-[#A1ACB6]" /></div>
						)}
						<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#D1D6D9] px-4 py-2 text-sm font-medium text-[#0B1F3A] hover:border-[#0E63B0]">
							<Upload className="size-4" />
							{uploadingAvatar ? 'Uploading...' : 'Change photo'}
							<input
								type="file"
								accept="image/*"
								className="hidden"
								disabled={uploadingAvatar}
								onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(file); }}
							/>
						</label>
					</div>

					<div>
						<label className="mb-1.5 block text-sm font-medium text-[#0B1F3A]">Name</label>
						<input value={profile.name} onChange={(e) => handleChange('name', e.target.value)} className="h-11 w-full rounded-lg border border-[#D1D6D9] px-4 outline-none focus:border-[#0E63B0]" />
					</div>

					<div>
						<label className="mb-1.5 block text-sm font-medium text-[#0B1F3A]">Email</label>
						<input value={user.email ?? ''} disabled className="h-11 w-full rounded-lg border border-[#E4ECF3] bg-sky-50 px-4 text-[#5B6B7F]" />
					</div>

					<div>
						<label className="mb-1.5 block text-sm font-medium text-[#0B1F3A]">Contact number</label>
						<input value={profile.phone} onChange={(e) => handleChange('phone', e.target.value)} className="h-11 w-full rounded-lg border border-[#D1D6D9] px-4 outline-none focus:border-[#0E63B0]" />
					</div>

					<div>
						<label className="mb-1.5 block text-sm font-medium text-[#0B1F3A]">Address</label>
						<input value={profile.address} onChange={(e) => handleChange('address', e.target.value)} className="h-11 w-full rounded-lg border border-[#D1D6D9] px-4 outline-none focus:border-[#0E63B0]" />
					</div>

					<button type="submit" disabled={isSaving} className="h-11 w-full rounded-lg bg-[#0E63B0] font-semibold text-white transition-colors hover:bg-[#0d5a9e] disabled:opacity-60">
						{isSaving ? 'Saving...' : 'Save changes'}
					</button>
				</form>
			</div>
		</div>
	);
}
