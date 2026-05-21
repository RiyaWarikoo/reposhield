# Usage Guide

This guide walks you through the day-to-day usage of Reposhield from the perspective of a developer or team lead. It covers everything from initial onboarding to reading advanced AI metrics.

---

## 1. Connecting Your Account

Reposhield relies exclusively on OAuth for a seamless and secure login experience.

1. Visit the Reposhield homepage.
2. Click **Sign in with GitHub**.
3. Authorize the application. **Better Auth** securely handles your session cookies - no passwords are required.

---

## 2. Linking a Repository

Before Reposhield can act as your automated senior developer, it needs permission to see your code.

1. Navigate to the **Dashboard** (`/dashboard`).
2. Click the **Add Repository** button in the top right.
3. You will be redirected to GitHub to install the **Reposhield GitHub App**.
4. Select the specific repositories you wish to grant access to (we recommend starting with one test repository).
5. Once installed, you will be redirected back to the Dashboard. The **Indexing Worker** will silently download the codebase and generate Vector AI embeddings in the background.

---

## 3. The Automated Review Workflow

Reposhield is designed to be invisible. You do not need to click any buttons on the dashboard to get a code review.

1. Create a new branch and push code to your linked repository.
2. Open a **Pull Request** on GitHub.
3. _That's it._ GitHub instantly sends a webhook to Reposhield.
4. Within 1-2 minutes, the Reposhield AI will automatically post a comment on your PR thread.

### How to read the AI Review

The generated Markdown comment will always follow a strict structure:

- **Summary**: A 2-sentence explanation of what the PR actually does (useful for non-technical managers).
- **Critical Alerts (If Any)**: Red text highlighting immediate security vulnerabilities (e.g., exposed API keys, SQL injections).
- **Code Suggestions**: Snippets of your code with direct, actionable improvements.
- **Verdict**: A final `LGTM` (Looks Good To Me) or `Needs Revisions`.

---

## 4. Checking Developer Insights

As your team opens PRs, Reposhield tracks the results to provide gamified analytics.

1. Go to the **Insights** tab in the left sidebar.
2. **The Contribution Graph**: View a 7-day or 30-day trend chart (powered by Recharts). This visualizes your team's code review frequency.
3. **The Badging Engine**: Did you fix a nasty memory leak? Did you secure an API route? The AI automatically parses its own reviews and awards you dynamic badges:
   - _Production Hazard Prevented_
   - (Warning) Performance Optimizer
   - (Success) Clean Code Champion

---

## 5. Managing Your Subscription

Reposhield limits Free users to **5 repositories** and **5 reviews per repository** to prevent AI credit abuse.

1. If you hit your limit, the AI will stop reviewing PRs.
2. Click the **Subscription** tab on the dashboard.
3. Click **Upgrade to Pro**.
4. You will be securely redirected to a **Polar.sh** checkout page.
5. Upon successful payment, Polar sends a webhook to Reposhield, instantly upgrading your account.
6. **Troubleshooting**: If you paid but your dashboard still says "FREE", click the **Sync Status** button. This manually pings the Polar API to force an immediate refresh.
