MongoDB Seed Script

Quick start

1. Copy `server/.env.example` to `server/.env` and edit values as needed.
2. From the `server/` directory install dependencies:

   npm install

3. Run the seed script:

   npm run seed

4. Verify the seeded data:

   npm run check

What it does

- Connects to the MongoDB instance specified by `MONGODB_URI`.
- Clears `users`, `expenses`, `income`, `assets`, and `budgets` collections.
- Inserts sample documents for an admin user and sample transactions/assets/budgets.

Notes

- Passwords are hashed with `bcrypt`.
- Modify `seed/seed.js` to customize or extend sample data.
 - Use `npm run check` to confirm all collections have documents.
