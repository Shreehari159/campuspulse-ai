# CampusPulse AI — Deployment Guide & DevOps Architecture

## 1. Environment Configuration
The platform operates as a full-stack Node.js / Express and Vite application.
Required environment variables:
- `GEMINI_API_KEY`: Server-side API key for Google GenAI models (`gemini-3.8-flash`).
- `APP_URL`: Public base URL for the deployed service.
- `PORT`: Server port (default 3000).
- `NODE_ENV`: `development` or `production`.

## 2. Monorepo & Build Pipeline
- Build command: `npm run build` generates the production client assets into `dist/`.
- Development command: `npm run dev` starts the Express + Vite server with Hot Module Replacement and API routing.
- Production startup: `node server.ts` or `npm start` serves the optimized bundle and REST API endpoints.

## 3. High Availability & Data Protection
- Production databases should utilize managed PostgreSQL with automated daily snapshot backups, Point-In-Time-Recovery (PITR), and read replicas for analytical queries.
- Object storage (S3-compatible) stores encrypted exports and institutional asset logos.
