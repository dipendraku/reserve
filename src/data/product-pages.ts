import { BarChart3, BellRing, CalendarClock, CreditCard, HeartPulse, GraduationCap, Scissors, ShoppingBag, Sparkles, Users, Video, Waves } from 'lucide-react';

export const PRODUCT_FEATURES = [
	{ icon: CalendarClock, title: 'Flexible scheduling', text: 'Set weekly hours, service durations, buffers, and availability that matches how your business actually works.' },
	{ icon: Sparkles, title: 'A booking page that feels like you', text: 'Showcase your services, pricing, policies, and business story in one polished link customers can trust.' },
	{ icon: Users, title: 'Client relationships in one place', text: 'Keep client details, booking history, notes, and conversations organized without spreadsheet work.' },
	{ icon: BellRing, title: 'Email and SMS notifications', text: 'Send booking confirmations with estimated queue time so clients know what to expect before they arrive.' },
	{ icon: CreditCard, title: 'Simple payments', text: 'Offer upfront card payment, cash, or app payment while keeping every booking and payment status visible.' },
	{ icon: BarChart3, title: 'Business cockpit', text: 'Understand bookings, revenue, popular services, and client activity from one provider dashboard.' },
	{ icon: Video, title: 'Online or in-person', text: 'Serve customers in your studio, office, classroom, or remotely with the same dependable booking flow.' },
	{ icon: ShoppingBag, title: 'Grow from every channel', text: 'Share one ReserveMe link across social profiles, messaging apps, email signatures, and your website.' },
];

export const INDUSTRIES = [
	{ icon: Scissors, name: 'Beauty and personal care', text: 'For salons, barbers, nail artists, lash studios, estheticians, and independent beauty professionals.' },
	{ icon: HeartPulse, name: 'Health and wellness', text: 'For therapists, coaches, nutritionists, massage professionals, and wellness studios managing recurring clients.' },
	{ icon: Waves, name: 'Fitness and movement', text: 'For personal trainers, yoga teachers, dance studios, swim coaches, and fitness teams with changing schedules.' },
	{ icon: GraduationCap, name: 'Education and tutoring', text: 'For tutors, language teachers, music instructors, and education businesses booking individual sessions.' },
	{ icon: Video, name: 'Consulting and creators', text: 'For consultants, photographers, content creators, and experts turning time and knowledge into services.' },
	{ icon: ShoppingBag, name: 'Local services', text: 'For repair, home, pet, automotive, and other service businesses that need reliable appointments and customer updates.' },
];
