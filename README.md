# ReserveMe Next.js

This is a standalone Next.js App Router copy of the ReserveMe web app. The existing React Router app remains in `apps/web` alongside this directory.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in the values for Supabase, Google Maps, email, SMS, and the public site URL.
2. Install and build from this directory:

   ```sh
   npm install
   npm run build
   npm start
   ```

The app uses Next.js Route Handlers for `/api/*` endpoints and serves the site with the Next.js Node server.

## Hostinger Node.js Web App

- Project root: `apps/web/next-app`
- Node.js: 22.x or 24.x (Next.js 16 requires Node.js 20.9 or newer)
- Build command: `npm run build`
- Start command: `npm start`
- Output directory: leave blank

Set the environment variables from `.env.example` in Hostinger's app settings. Do not put the service role key in a `NEXT_PUBLIC_` variable.
