import { loader } from '@/routes/sitemap.xml';
export const GET = (request: Request) => loader({ request } as never);
