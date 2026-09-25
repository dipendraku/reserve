import { action } from '@/routes/api.book';
export const POST = (request: Request) => action({ request } as never);
