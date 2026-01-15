Finance Manager Node Server

Scripts

- start: Start server (production)
- dev: Start server with nodemon (development)
- build: No build step required (prints a message)
- seed: Populate MongoDB with sample data
- check: Verify seeded data counts

Usage

1. Install dependencies:

   npm install

2. Run server:

   npm start
   # or
   npm run dev

3. Seed database:

   npm run seed
   npm run check

Configuration

- Create `.env` in `server/` (copy from `.env.example`).
- Env vars: `PORT`, `MONGODB_URI`, `MONGODB_DB`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.
