# Smart Exam Pro Backend (Laravel API)

## Stack
- Laravel 12 API
- MySQL
- Sanctum token auth
- Role middleware (`check.role`)
- Service layer + Form Requests

## Quick Start
1. Install PHP 8.2+ and Composer.
2. In `backend/` run:
   - `composer install`
   - `copy .env.example .env`
   - `php artisan key:generate`
   - `php artisan migrate --seed`
   - `php artisan serve`
3. API base URL: `http://127.0.0.1:8000/api`

## XAMPP Localhost Setup (Windows)
1. Install XAMPP and ensure Apache is running.
2. Enable PHP extensions in XAMPP `php.ini`:
  - `openssl`
  - `pdo_sqlite`
  - `sqlite3`
  - `fileinfo`
  - `curl`
  - `zip`
3. Add the provided vhost config from [backend/xampp-vhost.example.conf](xampp-vhost.example.conf) into:
  - `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
4. Add hosts entries:
  - `127.0.0.1 smartexampro-api.local`
5. Restart Apache from XAMPP Control Panel.
6. Update backend `.env`:
  - `APP_URL=http://smartexampro-api.local`
7. Run backend setup once:
  - `php artisan key:generate`
  - `php artisan migrate --seed`
  - `php artisan storage:link`
8. API base URL becomes:
  - `http://smartexampro-api.local/api`

## Seeded Test Accounts
- `superadmin@smartexampro.local` / `password123`
- `admin@smartexampro.local` / `password123`
- `teacher@smartexampro.local` / `password123`
- `student@smartexampro.local` / `password123`

## Auth
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/logout` (Bearer token)

## Main Endpoints
- Students: `/api/students`
- Teachers: `/api/teachers`
- Classes: `/api/classes`
- Subjects: `/api/subjects`
- Questions: `/api/questions`
- Exams: `/api/exams`
- Start exam: `POST /api/exams/start`
- Submit exam: `POST /api/exams/submit`
- Generate results: `POST /api/results/generate`
- Class results: `GET /api/results/class/{id}`
- Reports:
  - `GET /api/reports/top-students`
  - `GET /api/reports/failed`
  - `GET /api/reports/performance`

## Security/Logic Highlights
- Password hashing via Laravel `Hash`
- Single active exam session enforcement
- Exam retake prevention after submission
- Active exam edit/delete lock
- Objective auto-marking, essay pending review
- Result generation in DB transaction with tie-aware ranking
- SQLite foreign keys enabled in provider boot

## Frontend Integration
- Point frontend API client to `http://127.0.0.1:8000/api`
- Send `Authorization: Bearer <token>` after login
- Use multipart for student photo upload and CSV import

## Troubleshooting (Data Not Saving)
- Backend not running / Apache not serving Laravel `public` folder.
- Frontend API URL points to wrong host or port.
- Logged into wrong role page (student login only allows student role).
- Saving to one SQLite file while app reads another file path.
- Validation error from API (check Network tab response body).

## cPanel Production Setup
1. Create subdomain (example: `api.yourdomain.com`) in cPanel.
2. Set subdomain document root to `backend/public`.
3. Copy [backend/.env.cpanel.example](.env.cpanel.example) to `.env` and fill values.
4. From `backend/` run:
  - `composer install --no-dev --optimize-autoloader`
  - `php artisan key:generate`
  - `php artisan migrate --force`
  - `php artisan storage:link`
  - `php artisan config:cache`
5. Ensure writable permissions for:
  - `storage/`
  - `bootstrap/cache/`
6. Set frontend production API URL to your API host:
  - `VITE_API_BASE_URL=https://api.yourdomain.com/api`
