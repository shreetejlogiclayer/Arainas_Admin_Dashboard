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

For production, build and start the dashboard server:

```sh
npm run build
npm start
```

Open <http://localhost:4173>. The dashboard proxy targets `http://localhost:5001` by default. For a different backend URL, set `ADMIN_API_URL` for the Vite or dashboard server process. The dashboard refreshes overview and order data every 20 seconds. Sign in with `admin@arainas.com` and the password entered in the provisioning command. For email-only accounts, the required database mobile field is populated with a generated internal identifier; it is not used as a login. It does not add or migrate database tables. Order totals are displayed as recorded order amounts; payment status is distinct and is not treated as paid revenue.

The **Customer orders** section summarizes each customer’s order count and most recent order date. Search by customer name or mobile number and filter orders by an inclusive date range. Excel downloads include all matching customers, not just the visible page.

Each order has an **Open parcel PDF** action in the orders table and order detail. It opens a 4 × 6 inch parcel summary in a new browser tab using the sender details from the Arainas company configuration and the recipient, buyer, address, and item snapshots saved with that order.
