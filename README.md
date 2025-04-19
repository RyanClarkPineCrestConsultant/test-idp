# Test SAML Identity Provider

A simple SAML IdP for testing authentication flows.

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Vercel Deployment Instructions

### Environment Variables Setup

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `SAML_ISSUER` | `https://your-app-name.vercel.app` | The issuer URI for your SAML assertions |
| `SAML_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----` | Your private key with newlines replaced by `\n` |
| `SAML_CERTIFICATE` | `-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----` | Your certificate with newlines replaced by `\n` |

**Important:** Do NOT create these as "Plain Text" environment variables referencing non-existent secrets.

### Option 1: Use the Vercel UI

1. Go to Project → Settings → Environment Variables
2. Add each variable individually, pasting the full contents directly
3. Make sure to select "Production" (and optionally "Preview" and "Development")
4. Click "Save"

### Option 2: Use Vercel CLI

Run the following commands:

```bash
vercel env add SAML_ISSUER
vercel env add SAML_PRIVATE_KEY
vercel env add SAML_CERTIFICATE
```

Follow the prompts to paste the value for each variable.

## Local Development

For local development, copy the `.env.example` file to `.env.local` and update the values accordingly:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your SAML configuration.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
