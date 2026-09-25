import { loader } from '@/routes/api.availability';
export const GET = (request: Request) => loader({ request } as never);
