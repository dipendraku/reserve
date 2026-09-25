'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordFieldProps = {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	autoComplete?: string;
};

export function PasswordField({ id, label, value, onChange, placeholder = 'At least 8 characters', autoComplete = 'current-password' }: PasswordFieldProps) {
	const [visible, setVisible] = useState(false);
	const inputClass = 'h-12 w-full rounded-xl border border-[#D1D6D9] bg-white px-4 pr-12 text-[15px] text-[#0B1F3A] outline-none transition-colors placeholder:text-[#9AA7B5] focus:border-[#0E63B0] focus:ring-2 focus:ring-[#0E63B0]/20';

	return (
		<div>
			<label htmlFor={id} className="mb-2 block text-sm font-medium text-[#0B1F3A]">{label}</label>
			<div className="relative">
				<input id={id} type={visible ? 'text' : 'password'} required minLength={8} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} className={inputClass} />
				<button type="button" onClick={() => setVisible(previous => !previous)} className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#5B6B7F] hover:bg-sky-50 hover:text-[#0E63B0]" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
					{visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
				</button>
			</div>
		</div>
	);
}
