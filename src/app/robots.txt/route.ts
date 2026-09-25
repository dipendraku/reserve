import { loader } from '@/routes/robots.txt';
export const GET = (request: Request) => loader({ request } as never);
