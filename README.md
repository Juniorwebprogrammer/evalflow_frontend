# evalflow_frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Sign-in with Vexxen

EvalFlow has no passwords of its own: people sign in with their **Vexxen** account (popup from `@vexxen/auth`), and plans are bought in the Vexxen catalog.

| Variable | What for |
| --- | --- |
| `NEXT_PUBLIC_VEXXEN_CLIENT_ID` | EvalFlow's client in Vexxen (`vexxen_f873382b`). Its api key only lives in the backend. |
| `NEXT_PUBLIC_VEXXEN_BASE_URL` | Vexxen (`http://localhost:3000` locally). This app's origin must be allowed in that client. |

- **Sign in** (`/login`, `/login/<company>` for the branded version): the popup gives the Vexxen tokens to `POST /api/auth/vexxen`, which exchanges them with the backend (`Auth/vexxen`). Members get the `ef_jwt` + `ef_refresh` cookies (httpOnly; `ef_refresh` is the Vexxen refresh token). People without a company get the onboarding: choose a plan in Vexxen (14-day trial) → create the company (`/api/onboarding/register-owner`). Meanwhile their Vexxen tokens wait in `ef_vx_access` / `ef_vx_refresh` (15 minutes).
- **Session renewal**: `src/proxy.ts` renews the JWT (backend `Auth/refresh`, which renews at Vexxen) when it's missing or about to expire, before the request reaches the page or route handler. If Vexxen ends the session (password changed, account deleted), the cookies are dropped and the user goes back to `/login`.
- **Invitations**: `/accept-invite?token=` shows the company and the invited email; accepting is signing in with Vexxen with that email.
- **Plan notices**: `PlanStatusBanner` (owner and HR) shows trial ending, canceled plan, failed payment or read-only (backend `403 PLAN_INACTIVE`).
- Name, email, password and two-step verification are managed in Vexxen (links from the profile).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result (Vexxen uses port 3000).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
