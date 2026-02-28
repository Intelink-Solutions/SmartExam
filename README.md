1. Configure Apache virtual host for Laravel API using [backend/xampp-vhost.example.conf](backend/xampp-vhost.example.conf).
2. Add hosts entry: `127.0.0.1 smartexampro-api.local`.
3. In [backend/.env](backend/.env), set:
	- `APP_URL=http://smartexampro-api.local`
4. In frontend root, copy [\.env.local.example](.env.local.example) to `.env.local`.
5. Start backend (from `backend/`):
	- `php artisan migrate --seed`
6. Start frontend (from project root):
	- `npm run dev`

If forms appear not to save, verify frontend is calling the same API host shown above and check request/response in browser Network tab.

## cPanel Deployment (Frontend + Backend)

For production hosting on cPanel:

1. Backend (Laravel API) should run on a subdomain (example `api.yourdomain.com`) with document root set to `backend/public`.
2. Frontend (Vite build) should be uploaded from `dist/` to `public_html/`.
3. Configure production env files:
	- Frontend: copy [/.env.production.example](.env.production.example) to `.env.production` and set `VITE_API_BASE_URL`.
	- Backend: copy [backend/.env.cpanel.example](backend/.env.cpanel.example) to `backend/.env` and set DB/domain values.
4. Apply SPA rewrite rules using [cpanel/frontend.htaccess.example](cpanel/frontend.htaccess.example) in `public_html/.htaccess`.

Full guide: [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)
