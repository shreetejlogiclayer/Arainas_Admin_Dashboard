# ARAINA Admin Dashboard

An isolated React admin console for the existing ARAINA portal. The frontend follows the main Araina app's React/Vite/Tailwind structure. The browser talks only to this app; its Node server proxies admin API requests to the existing Express/Prisma backend. MySQL credentials stay in the backend environment.

## Project structure

- `src/pages` contains login, overview, member/order list, customer order summaries, and detail screens.
- `src/components` contains the shared admin shell, tables, status, pagination, and feedback UI.
- `src/lib/api.js` contains the API client and shared display formatters.
- `server.mjs` serves the production Vite build and proxies `/api/admin` requests.
- Vite proxies `/api` to the backend during local development.

## Configure admin access

1. Configure and start the existing backend as usual. Its default port is **5001** (`PORT` can override it), and it uses the existing `DATABASE_URL`.
2. From the backend directory, run `npm run admin:provision` in an interactive terminal. Enter an optional mobile number (or leave it blank for email-only login), then enter and confirm the password at its masked prompt. The command provisions `admin@arainas.com` with the `manager` role and stores only a bcrypt password hash.
3. In the backend environment set a long random `SESSION_SECRET`. Do not put backend secrets or `DATABASE_URL` in this project. The admin API checks the account's database role for login and on every request.

## Run locally

Install dependencies once from `admin-dashboard`:

```sh
npm install
```

For development with Vite's hot reload:

```sh
npm run dev
```

## Production deployment

```sh
npm ci
npm run build
npm start
```

Use Node.js 22.12 or newer. Set `NODE_ENV=production`, configure `ADMIN_API_URL` to the backend's base URL (for example, `https://api.example.com`), and let the hosting platform provide `PORT`. The dashboard server listens on `0.0.0.0`, serves the production build, and proxies admin requests to `/api/admin` on that backend. Put the dashboard behind HTTPS; do not put `DATABASE_URL`, backend secrets, or admin passwords in this project. The backend must be configured and database migrations applied before enabling dashboard access. `/health` is available for service health checks.

For local use, start the backend on port 5001, then run `npm run dev`. Open <http://localhost:5173>. Vite proxies `/api` to `http://localhost:5001` by default; set `ADMIN_API_URL` to override it. The dashboard refreshes overview and order data every 20 seconds. Sign in with `admin@arainas.com` and the password entered in the provisioning command. For email-only accounts, the required database mobile field is populated with a generated internal identifier; it is not used as a login. It does not add or migrate database tables. Order totals are displayed as recorded order amounts; payment status is distinct and is not treated as paid revenue.

The **Customer orders** section summarizes each customer’s order count and most recent order date. Search by customer name or mobile number and filter orders by an inclusive date range. Excel downloads include all matching customers, not just the visible page.

The **Settings** section is available to Admin-role accounts, which can change their own password or the Manager password after confirming their own password. Manager accounts do not have Settings access or self-service password changes here. New passwords must be at least 10 characters.

Admin 1 and Admin 2 can update the executive rate for each of the five Mega Box options from **Pricing**. Changes apply to new orders and are refreshed automatically in open customer order forms; existing orders retain their recorded prices. Managers cannot access pricing controls.

Admin-role accounts can permanently delete customer members from the member list or member profile. Deletion removes the member and related account data, including orders and stored profile photos, after explicit confirmation. Manager and Admin accounts cannot be deleted through this action.

Admin-role accounts can edit a customer's name, email, mobile numbers, and account status from the member list or profile. Changes are saved to the database and reflected immediately in the dashboard.

Each order has an **Open parcel PDF** action in the orders table and order detail. It opens a 4 × 6 inch parcel summary in a new browser tab using the sender details from the Arainas company configuration and the recipient, buyer, address, and item snapshots saved with that order.

After an order's parcel summary is opened from a table, its table action is marked complete for all admin accounts and remains disabled. The order detail page can still open the summary again.
