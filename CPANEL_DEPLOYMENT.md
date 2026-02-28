# cPanel Deployment (Frontend + Backend)

## Local setup checklist (before deploy)
- Backend runs locally on `http://127.0.0.1:8000`.
- Frontend runs locally on `http://localhost:5173`.
- Frontend API URL points to `http://127.0.0.1:8000/api` in `.env.local`.
- Database is migrated and seeded (`php artisan migrate:fresh --seed` or `php artisan migrate --seed`).
- You can log in with a seeded account.

See full local setup guides:
- Root guide: [README.md](README.md)
- Backend API guide: [backend/README_API.md](backend/README_API.md)

## Target setup
- Frontend: `https://yourdomain.com`
- Backend API: `https://api.yourdomain.com`
- Database: MySQL (cPanel database)

## 1) Backend deployment (Laravel)
1. In cPanel, create a subdomain: `api.yourdomain.com`.
2. Set subdomain document root to your Laravel `public` folder.
   - Example: `/home/USERNAME/apps/smartexampro/backend/public`
3. Upload backend code to cPanel (Git Version Control, File Manager, or SSH).
4. Copy `backend/.env.cpanel.example` to `backend/.env` and fill real values.
5. In cPanel terminal/SSH, run inside `backend/`:
   - `composer install --no-dev --optimize-autoloader`
   - `php artisan key:generate`
   - `php artisan migrate --force`
   - `php artisan db:seed --force` (optional)
   - `php artisan storage:link`
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
6. Ensure folders are writable:
   - `storage/`
   - `bootstrap/cache/`

## 2) Frontend deployment (React/Vite)
1. In project root, copy `.env.production.example` to `.env.production`.
2. Set `VITE_API_BASE_URL=https://api.yourdomain.com/api`.
3. Build frontend locally:
   - `npm install`
   - `npm run build`
4. Upload the `dist/` content to cPanel `public_html/`.
5. Copy `cpanel/frontend.htaccess.example` into `public_html/.htaccess`.

## 3) cPanel MySQL
1. Create database, database user, and grant all privileges.
2. Put those values in backend `.env`:
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_HOST=localhost`
   - `DB_PORT=3306`

## 4) Domain + SSL
1. Enable SSL for both `yourdomain.com` and `api.yourdomain.com`.
2. Verify backend `.env`:
   - `APP_URL=https://api.yourdomain.com`
   - `CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

## 5) Post-deploy checks
- Open frontend and login.
- Confirm requests go to `https://api.yourdomain.com/api/*`.
- Test save operations for students, teachers, classes, questions, settings.
- If uploads fail, verify `FILESYSTEM_DISK=public` and run `php artisan storage:link`.

## Common errors
- 404 on API routes: subdomain docroot is not pointing to Laravel `public`.
- CORS errors: update `CORS_ALLOWED_ORIGINS` and clear config cache.
- Data not saving: wrong API URL in frontend `.env.production`.
- 500 errors: check `storage/logs/laravel.log` and file permissions.
