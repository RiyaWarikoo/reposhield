# FAQ & Troubleshooting

Running a complex application with webhooks, vector databases, and background jobs locally can sometimes be tricky. Here are solutions to the most common issues you might face while developing or deploying Reposhield.

---

##  Webhooks & External API Issues

### Q: I opened a Pull Request, but nothing happened. No review was posted.
**Troubleshooting steps:**
1. **Check ngrok**: Is your ngrok tunnel running? Did the URL expire or change?
2. **Check GitHub App**: Go to your GitHub App settings. Ensure the Webhook URL matches your *current* ngrok URL (e.g., `https://<your-id>.ngrok-free.app/api/webhooks/github`).
3. **Check GitHub Logs**: In your GitHub App settings, go to "Advanced". Look at the "Recent Deliveries" tab. If there is a red `X`, click it to see the exact error response from your local server.
4. **Check Inngest**: Open the Inngest Dev Server UI (`http://127.0.0.1:8288`). See if the `github/pr.review` event was received and if the function started executing.

### Q: I upgraded to PRO via Polar.sh, but my dashboard still says FREE.
**A:** This means the Polar webhook failed to reach your server. 
1. Check your `POLAR_WEBHOOK_SECRET` in `.env` to ensure it matches the Polar dashboard.
2. Ensure your ngrok URL is properly configured in the Polar Webhook settings.
3. **Quick Fix**: Click the **Sync Status** button on the Subscription dashboard. This manually forces a check against the Polar API, bypassing the webhook entirely.

---

##  AI, Vector Search & RAG Issues

### Q: Inngest throws an `AI_RetryError` or "Quota Exceeded".
**A:** This means you have hit the rate limit for your Google Gemini API key. 
- Because we use Inngest, the system will automatically try to retry the job later using exponential backoff. No PR reviews are lost!
- To fix it permanently, you may need to add a billing account to your Google AI Studio account, or wait until your quota resets.

### Q: The AI review doesn't seem to understand the context of my project.
**A:** This usually means the repository wasn't fully indexed, or the Vector Database is empty. Ensure the `github/repo.index` Inngest job ran successfully when you first linked the repository on the dashboard.

### Q: I get a "Dimension Mismatch" error from Pinecone.
**A:** Your Pinecone index was created with the wrong dimensions. The Gemini Embedding model (`text-embedding-004`) outputs vectors with exactly **768 dimensions**. Ensure your Pinecone index is explicitly set to 768 dimensions and uses the `cosine` metric.

### Q: The PR is too large and the AI throws a "Token Limit Reached" error.
**A:** Currently, Reposhield imposes a soft limit on massive PRs (e.g., changing 10,000 lines of code) to prevent massive billing spikes. If a PR is too large, the system will gracefully fail and add a comment to the PR suggesting the developer break the changes into smaller, reviewable chunks.

---

##  Database & Prisma Issues

### Q: I get a "PrismaClientInitializationError" or "Can't reach database server".
**A:** Your `DATABASE_URL` in `.env` is incorrect, or your Postgres server isn't running. Double-check your connection string. If you are using Neon.tech, ensure your IP address isn't being blocked by their firewall rules.

### Q: Console Warning: `SECURITY WARNING: The SSL modes 'prefer', 'require'... are treated as aliases for 'verify-full'`
**A:** This is a known warning with the Prisma/Postgres driver. To fix it, append `?sslmode=verify-full` to the very end of your `DATABASE_URL` in your `.env` file.

### Q: I added a new column to `schema.prisma` but TypeScript is throwing errors.
**A:** You forgot to regenerate the client. Whenever you touch the `.prisma` file, you **must** run:
```bash
bunx prisma generate
```
This rebuilds the hidden `node_modules/.prisma/client` folder with your new types.

---

##  Authentication Issues

### Q: Better Auth throws "Invalid Origin" or redirects to `localhost:3000` when logging in via ngrok.
**A:** Better Auth requires you to explicitly trust external origins. Ensure your `auth.ts` file includes your ngrok URL in the `trustedOrigins` array, or set the `BETTER_AUTH_URL` environment variable to your ngrok URL while developing locally.

### Q: Next.js throws a "Suspense Boundary Required" error.
**A:** Next.js requires hooks like `useSearchParams()` to be wrapped in a React `<Suspense>` boundary. If you see this error, ensure the component reading the URL params is wrapped:
```tsx
<Suspense fallback={<Spinner />}>
  <YourComponent />
</Suspense>
```
