# Local Testing Guide

Testing Reposhield locally requires simulating GitHub webhooks so that the AI pipeline triggers without needing to constantly push real code. Follow this guide to test the background workers and AI integration safely.

## Prerequisites
Ensure your local environment is fully running:
1. Next.js Dev Server (`bun run dev`)
2. Inngest CLI (`npx inngest-cli@latest dev`)
3. Ngrok tunnel (`ngrok http 3000`)

## Simulating a Webhook
Instead of creating real Pull Requests to test your code, you can use tools like Postman, cURL, or the GitHub CLI to send a mock webhook directly to your local endpoint.

### Using Postman / cURL
Send a `POST` request to your ngrok URL: `https://YOUR_NGROK_URL.ngrok-free.app/api/webhooks/github`

**Required Headers:**
- `Content-Type: application/json`
- `X-GitHub-Event: pull_request`
- `X-Hub-Signature-256`: (If you have signature validation enabled locally, you will need to generate a valid hash. For rapid local testing, you can temporarily disable the `verifySignature` check in `route.ts`).

**Mock Payload Body:**
```json
{
  "action": "opened",
  "pull_request": {
    "number": 1,
    "title": "Test PR",
    "html_url": "https://github.com/owner/repo/pull/1"
  },
  "repository": {
    "id": 12345678,
    "full_name": "owner/repo",
    "owner": {
      "login": "owner"
    }
  }
}