# SmartExam

SmartExam is a school CBT and results platform with:
- Frontend: React + Vite
- Backend API: Laravel

## Local Development

### 1) Frontend setup
From project root:
- `npm install`
- Copy `.env.local.example` to `.env.local`
- In `.env.local`, set:
	- `VITE_API_BASE_URL=http://127.0.0.1:8000/api`

### 2) Backend setup
From `backend/`:
- `composer install`
- Copy `.env.example` to `.env` (if not already present)
- `php artisan key:generate`

### 3) Database setup (recommended local default)
If your PHP environment does not have `pdo_mysql` enabled, use SQLite:
- In `backend/.env` set:
	- `DB_CONNECTION=sqlite`
	- `DB_DATABASE=database/database.sqlite`
- Ensure DB file exists:
	- `backend/database/database.sqlite`
- Then run:
	- `php artisan migrate:fresh --seed`

If MySQL is available, configure your MySQL values in `backend/.env` and run:
- `php artisan migrate --seed`

### 4) Run the app
- Backend API: `php artisan serve --host=127.0.0.1 --port=8000`
- Frontend: `npm run dev`

Frontend URL:
- `http://localhost:5173`

Backend URL:
- `http://127.0.0.1:8000`

## Seeded Login Accounts

After `php artisan migrate:fresh --seed` (or `migrate --seed`):
- `superadmin@smartexampro.local` / `password123`
- `admin@smartexampro.local` / `password123`
- `teacher@smartexampro.local` / `password123`
- `student@smartexampro.local` / `password123`

## Troubleshooting Login

- Ensure backend is running on `http://127.0.0.1:8000`
- Ensure frontend `VITE_API_BASE_URL` points to `http://127.0.0.1:8000/api`
- Rerun seeders: `php artisan migrate:fresh --seed`
- If DB driver errors appear (`could not find driver`), switch to SQLite as shown above

## cPanel Deployment (Frontend + Backend)

For production hosting on cPanel:

1. Backend (Laravel API) should run on a subdomain (example `api.yourdomain.com`) with document root set to `backend/public`.
2. Frontend (Vite build) should be uploaded from `dist/` to `public_html/`.
3. Configure production env files:
	 - Frontend: copy `.env.production.example` to `.env.production` and set `VITE_API_BASE_URL`.
	 - Backend: copy `backend/.env.cpanel.example` to `backend/.env` and set DB/domain values.
4. Apply SPA rewrite rules using `cpanel/frontend.htaccess.example` in `public_html/.htaccess`.

Full guide: [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)
