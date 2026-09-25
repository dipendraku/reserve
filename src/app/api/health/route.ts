import { loader } from '@/routes/api.health';
export const GET = (request: Request) => loader({ request } as never);
