# StorePulse - Store Rating Application

StorePulse is a production-grade Store Rating Web Application. The platform supports robust role-based authentication and allows users to explore stores, submit ratings, and manage businesses via personalized role-based dashboards.

## Features

* **System Administrator:** Oversee system users, create stores, modify store owners, and monitor overall statistics.
* **Store Owner:** Access an analytics dashboard showing their overall store ratings and listing specific customer feedback.
* **Normal User:** Browse stores, utilize search algorithms, and securely rate and critique shops.

## Tech Stack
The project features a separation of concerns, heavily prioritizing modern web architecture:

- **Database:** SQLite (Default via Prisma ORM local database) / PostgreSQL (Optional Docker setup).
- **Backend:** Express.js + Node.js + TypeScript + Zod (Strict server-side validation).
- **Frontend:** React.js (Vite) + Vanilla CSS (A premium dark-mode presentation styled with glassmorphism and animated interfaces).

## Demo Login Credentials

The project's database comes pre-seeded with active users to demonstrate the functionality of all three application roles. You can log into the application using the credentials below:

### 1. System Administrator
- **Email:** `admin@storepulse.com`
- **Password:** `Admin@123`

### 2. Normal User
- **Email:** `alice@example.com`
- **Password:** `User@123`

### 3. Store Owner
- **Email:** `owner@example.com`
- **Password:** `Owner@123`

*(Note: If you encounter an "Invalid Credentials" message on a fresh clone, ensure `npm run seed` was executed in the backend directory.)*

## Project Structure

* `/backend` - The heart of the API holding Prisma schema, auth middleware, explicit routing rules, and the seed script (`seed.ts`).
* `/frontend` - The UI consisting of React layouts, pages for specific views (e.g. `OwnerDashboard.tsx`, `AdminDashboard.tsx`), and secure `axios` interceptors.

## Development Verification
- Automated type-checking is enforced via TypeScript (`tsc --noEmit`).
- Data verification strictly enforced by backend Zod validation schemas minimizing injection logic paths.
