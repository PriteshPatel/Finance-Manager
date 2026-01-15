/*
	MongoDB seed verification script
	- Usage:
			1. Ensure `server/.env` has MONGODB_URI and MONGODB_DB
			2. cd server && npm run check
*/

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'finance_manager';

async function check() {
	const client = new MongoClient(uri);
	try {
		console.log('Connecting to MongoDB...');
		await client.connect();
		const db = client.db(dbName);

		const collections = ['users', 'expenses', 'income', 'assets', 'budgets'];
		const results = {};

		for (const name of collections) {
			const count = await db.collection(name).countDocuments();
			results[name] = count;
		}

		console.log('Collection document counts:');
		for (const [name, count] of Object.entries(results)) {
			console.log(` - ${name}: ${count}`);
		}

		const hasData = Object.values(results).every((c) => c > 0);
		if (!hasData) {
			console.error('One or more collections are empty. Seed may not have completed.');
			process.exitCode = 1;
			return;
		}

		console.log('Verification OK: All collections have data.');
	} catch (err) {
		console.error('Verification failed:', err);
		process.exitCode = 1;
	} finally {
		await client.close();
	}
}

check();