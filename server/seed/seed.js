/*
  MongoDB seed script for Finance Manager
  - Usage:
      1. cd server && npm install
      2. npm run seed
      3. Use the credentials displayed to login
*/

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'finance_manager';

async function createSeedData(db) {
  // Create one user
  const userEmail = process.env.SEED_USER_EMAIL || 'user@test.com';
  const userPassword = process.env.SEED_USER_PASSWORD || 'Password123!';
  const userName = process.env.SEED_USER_NAME || 'Test User';

  console.log('Creating user in MongoDB...');
  
  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(userPassword, saltRounds);
  
  // Create user
  const user = {
    _id: new ObjectId(),
    email: userEmail,
    name: userName,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const userId = user._id.toString();
  console.log(`User created with ID: ${userId}`);

  // Sample expense data for the user
  const expenses = [
    {
      _id: new ObjectId(),
      userId: userId,
      amount: 50.0,
      category: 'Food',
      description: 'Lunch',
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
      tags: ['food'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Sample income data
  const income = [
    {
      _id: new ObjectId(),
      userId: userId,
      amount: 3000.0,
      source: 'Monthly Salary',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Sample asset data
  const assets = [
    {
      _id: new ObjectId(),
      userId: userId,
      name: 'Savings',
      type: 'Cash',
      purchasePrice: 5000,
      currentValue: 5000,
      purchaseDate: new Date().toISOString().slice(0, 10),
      description: 'Emergency fund',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Sample budget data
  const budgets = [
    {
      _id: new ObjectId(),
      userId: userId,
      category: 'Food',
      amount: 500,
      month: new Date().toISOString().slice(0, 7), // YYYY-MM
      updatedAt: new Date(),
    },
  ];

  return { user, userEmail, userPassword, expenses, income, assets, budgets };
}

async function seed() {
  const client = new MongoClient(uri);
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(dbName);

    const { user, userEmail, userPassword, expenses, income, assets, budgets } = await createSeedData(db);

    // Clear existing collections
    await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('expenses').deleteMany({}),
      db.collection('income').deleteMany({}),
      db.collection('assets').deleteMany({}),
      db.collection('budgets').deleteMany({}),
    ]);

    // Insert data
    const [uRes, eRes, iRes, aRes, bRes] = await Promise.all([
      db.collection('users').insertOne(user),
      db.collection('expenses').insertMany(expenses),
      db.collection('income').insertMany(income),
      db.collection('assets').insertMany(assets),
      db.collection('budgets').insertMany(budgets),
    ]);

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`   Users: ${uRes.insertedId ? 1 : 0}`);
    console.log(`   Expenses: ${eRes.insertedCount}`);
    console.log(`   Income: ${iRes.insertedCount}`);
    console.log(`   Assets: ${aRes.insertedCount}`);
    console.log(`   Budgets: ${bRes.insertedCount}`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: ${userPassword}\n`);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
