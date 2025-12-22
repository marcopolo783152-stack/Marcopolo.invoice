
# Invoice System

This is a production-ready, enterprise-grade invoice management system built with Next.js, React, Firebase, and Tailwind CSS. It features robust printing, PDF export, returns/credit notes, address book, Excel export, and strict security.

## Features
- Next.js (App Router, TypeScript)
- Firebase Auth & Firestore (with Security Rules)
- Role-based access (Admin/User)
- Business dashboard with analytics
- Invoice and return/credit note system
- Address book/customer directory
- Excel (.xlsx) export (admin only)
- Pixel-perfect print & PDF (no iframes/hacks)
- Clean, modern UI (Tailwind CSS)
- Vercel compatible

## Setup
1. Clone the repo and install dependencies:
	```sh
	npm install
	```
2. Configure Firebase:
	- Add your Firebase config to `.env.local` (see template)
	- Add your Admin SDK credentials to `.env` (see template)
	- Enable Auth (Email/Password) and Firestore in Firebase Console
	- Deploy Firestore security rules:
	  ```sh
	  firebase deploy --only firestore:rules
	  ```
3. Start the dev server:
	```sh
	npm run dev
	```

## Deployment
- Deploy to Vercel for best results. All environment variables must be set in Vercel dashboard.

## Security
- All permissions are enforced via Firestore Security Rules.
- No secrets are exposed client-side.
- Admin/user roles are strictly enforced.

## Printing & PDF
- Print and PDF use the same React component for pixel-perfect output.
- No iframes, no localStorage hacks, no CSS loss.

## Excel Export
- Admins can export the address book to Excel (.xlsx) with no duplicates, in the required column order.

---

For any issues, see the `.github/copilot-instructions.md` for project guidelines.
