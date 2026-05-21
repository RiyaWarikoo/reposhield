# Local Installation & Setup Guide

Reposhield is a highly distributed system. To run it on your local machine, you'll need to run a few services concurrently since the application relies heavily on external webhooks and background workers.

---

##  Prerequisites
Before cloning the repository, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Bun** (We use Bun as our primary package manager and test runner for speed)
- **PostgreSQL** (You can run this locally via Docker, or use a cloud provider like Supabase/Neon.tech)
- **ngrok** (Required for exposing your `localhost` to GitHub's webhook dispatcher)

---

## 1. Install Dependencies
Clone the repository and install all required packages using Bun:
```bash
git clone https://github.com/Armaan42/reposhield.git
cd reposhield
bun install
```

## 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Open `.env` and carefully configure the following essential keys:
- `DATABASE_URL`: Your Postgres connection string. (e.g., `postgresql://user:password@localhost:5432/reposhield`)
- `BETTER_AUTH_SECRET`: A random 32-character string. Generate one using `openssl rand -base64 32`.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: Create an **OAuth App** in your GitHub Developer Settings to handle user logins.
- `GITHUB_WEBHOOK_SECRET`: A secure string used to validate incoming PR events.
- `GOOGLE_GENERATIVE_AI_API_KEY`: Get this from Google AI Studio.
- `PINECONE_DB_API_KEY`: Create a free index on Pinecone.
- `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET`: Get these from your Polar.sh dashboard (ensure you are in Sandbox mode for local testing).

## 3. Database Initialization
Generate the Prisma client (which creates the strict TypeScript types) and push the schema directly to your database:
```bash
bunx prisma generate
bunx prisma db push
```

---

## 4. Booting the Application
Because Reposhield is an event-driven system, you must run **4 separate terminal windows** to run everything locally.

### Terminal 1: Next.js Frontend & API
```bash
bun run dev
```
Runs the web app on `http://localhost:3000`.

### Terminal 2: Inngest Background Worker
```bash
npx inngest-cli@latest dev
```
Starts the local Inngest Dev Server on `http://localhost:8288`. 
*Note: Inngest automatically detects your Next.js app running on port 3000 and registers the functions found in `/inngest/functions`.*

### Terminal 3: Webhook Tunnel (ngrok)
```bash
ngrok http 3000
```
This gives you a public URL (e.g., `https://abc-123.ngrok-free.app`). 

** CRITICAL NGROK STEPS:** 
1. Copy the ngrok URL and paste it into your GitHub Webhook URL setting (append `/api/webhooks/github`).
2. Update the `NEXT_PUBLIC_APP_BASE_URL` in your `.env` file to match this ngrok URL. If you skip this, GitHub OAuth redirects will fail.

### Terminal 4: Database GUI (Optional but highly recommended)
```bash
bunx prisma studio
```
Starts a visual database editor on `http://localhost:5555`. This is incredibly useful for verifying that AI Reviews are actually being saved to the database.

---

##  Troubleshooting

- **"Better Auth Redirect Mismatch"**: If you get an error logging in with GitHub, ensure your GitHub OAuth App's *Authorization callback URL* exactly matches your `BETTER_AUTH_URL` + `/api/auth/callback/github`.
- **"Inngest App Not Found"**: If the Inngest UI (`localhost:8288`) says "Waiting for apps", ensure you have `INNGEST_DEV=1` in your `.env` and restart your Next.js server.
- **"Webhook returns 500 error"**: Check your local Next.js terminal. This usually means your `GITHUB_WEBHOOK_SECRET` in GitHub doesn't match the one in your `.env`, causing the cryptographic signature validation to fail.
