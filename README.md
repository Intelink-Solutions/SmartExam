# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Localhost (XAMPP + Laravel API)

Use XAMPP Apache for the backend and Vite for the frontend:

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
